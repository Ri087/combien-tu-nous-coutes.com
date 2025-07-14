#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { program } from "commander";
import dotenv from "dotenv";
import ora from "ora";
import { z } from "zod";

dotenv.config();

const MESSAGES_DIR = path.join("lib", "i18n", "messages");
const STATE_DIR = ".translations";
const STATE_FILE = "translation-state.json";

const DEFAULT_LOCALE_REGEX = /DEFAULT_LOCALE\s*:\s*"([^"]*)"/;
const SUPPORTED_LOCALES_REGEX = /SUPPORTED_LOCALES\s*=\s*\[(.*?)\]/;
const STRING_VALUES_REGEX = /"([^"]*)"/g;

const TranslationSchema = z.object({
  translatedText: z.string().min(1),
});

function getProjectConfig() {
  try {
    const configPath = path.join(process.cwd(), "constants", "project.ts");
    const content = fs.readFileSync(configPath, "utf8");

    const defaultMatch = content.match(DEFAULT_LOCALE_REGEX);
    const localesMatch = content.match(SUPPORTED_LOCALES_REGEX);

    const DEFAULT_LOCALE = defaultMatch?.[1] || "en-US";
    let SUPPORTED_LOCALES = ["en-US", "fr-FR"];

    if (localesMatch?.[1]) {
      const matches = localesMatch[1].match(STRING_VALUES_REGEX);
      if (matches) {
        SUPPORTED_LOCALES = matches.map((m) => m.replace(/"/g, ""));
      }
    }

    return { DEFAULT_LOCALE, SUPPORTED_LOCALES };
  } catch {
    return {
      DEFAULT_LOCALE: "en-US",
      SUPPORTED_LOCALES: ["en-US", "fr-FR"],
    };
  }
}

// Flatten nested object
function flatten(obj, prefix = "") {
  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.assign(result, flatten(value, newKey));
    } else {
      result[newKey] = String(value);
    }
  }

  return result;
}

// Unflatten to nested object
function unflatten(flat) {
  const result = {};

  for (const [key, value] of Object.entries(flat)) {
    const keys = key.split(".");
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys.at(-1)] = value;
  }

  return result;
}

// Load translation state
function loadState() {
  try {
    const statePath = path.join(STATE_DIR, STATE_FILE);
    if (fs.existsSync(statePath)) {
      return JSON.parse(fs.readFileSync(statePath, "utf8")).locales || {};
    }
  } catch {
    // Ignore errors
  }
  return {};
}

// Save translation state
function saveState(locales) {
  const statePath = path.join(STATE_DIR, STATE_FILE);

  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true });
  }

  fs.writeFileSync(
    statePath,
    JSON.stringify(
      {
        locales,
        lastUpdated: new Date().toISOString(),
      },
      null,
      2
    )
  );
}

// Translate text with AI
async function translateText(text, from, to, fast = false) {
  if (!text) {
    return "";
  }

  try {
    const model = fast ? openai("gpt-4o-mini") : openai("gpt-4o");
    const sourceLang = from.split("-")[0];
    const targetLang = to.split("-")[0];

    const result = await generateObject({
      model,
      schema: TranslationSchema,
      system:
        "You are a professional translator. Keep placeholders like {name} unchanged. Be concise.",
      prompt: `Translate from ${sourceLang} to ${targetLang}: "${text}"`,
    });

    return result.object.translatedText;
  } catch {
    return text; // Fallback to original
  }
}

// Get keys that need translation
function getKeysToTranslate(source, target, state, force) {
  const sourceKeys = Object.keys(source);
  const needsTranslation = [];

  for (const key of sourceKeys) {
    const needsUpdate =
      !(key in target) || // Missing in target
      force || // Force mode
      state[key] !== source[key]; // Changed since last time

    if (needsUpdate) {
      needsTranslation.push(key);
    }
  }

  return needsTranslation;
}

// Load source and target files
function loadTranslationFiles(sourceLocale, targetLocale) {
  const sourcePath = path.join(
    process.cwd(),
    MESSAGES_DIR,
    `${sourceLocale}.json`
  );
  const targetPath = path.join(
    process.cwd(),
    MESSAGES_DIR,
    `${targetLocale}.json`
  );

  // Load source
  const sourceContent = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  const sourceFlat = flatten(sourceContent);

  // Load target
  let targetFlat = {};
  if (fs.existsSync(targetPath)) {
    try {
      const targetContent = JSON.parse(fs.readFileSync(targetPath, "utf8"));
      targetFlat = flatten(targetContent);
    } catch {
      // Invalid JSON, start fresh
    }
  }

  return { sourceFlat, targetFlat, targetPath };
}

// Process a single chunk
async function processChunk(
  chunk,
  sourceFlat,
  sourceLocale,
  targetLocale,
  options
) {
  const chunkPromises = chunk.map(async (key) => {
    const translation = await translateText(
      sourceFlat[key],
      sourceLocale,
      targetLocale,
      options.fast
    );
    return { key, translation };
  });

  return await Promise.all(chunkPromises);
}

// Process chunks with translation
async function processTranslationChunks(
  chunks,
  sourceFlat,
  sourceLocale,
  targetLocale,
  options
) {
  const translationPromises = chunks.map(async (chunk) => {
    const results = await processChunk(
      chunk,
      sourceFlat,
      sourceLocale,
      targetLocale,
      options
    );

    // Small delay between chunks
    if (chunks.length > 1) {
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
    }

    return results;
  });

  const allResults = await Promise.all(translationPromises);
  return allResults.flat();
}

async function handleTranslation(
  keysToTranslate,
  sourceFlat,
  sourceLocale,
  targetLocale,
  options
) {
  if (!options.translate || keysToTranslate.length === 0) {
    return { results: [], translated: 0 };
  }

  const chunkSize = 5;
  const chunks = [];

  for (let i = 0; i < keysToTranslate.length; i += chunkSize) {
    chunks.push(keysToTranslate.slice(i, i + chunkSize));
  }

  const results = await processTranslationChunks(
    chunks,
    sourceFlat,
    sourceLocale,
    targetLocale,
    options
  );

  let translated = 0;
  for (const { key, translation } of results) {
    if (translation !== sourceFlat[key]) {
      translated++;
    }
  }

  return { results, translated };
}

async function syncLocale(sourceLocale, targetLocale, options) {
  const { sourceFlat, targetFlat, targetPath } = loadTranslationFiles(
    sourceLocale,
    targetLocale
  );

  const state = loadState();
  const localeState = state[sourceLocale] || {};

  const keysToTranslate = getKeysToTranslate(
    sourceFlat,
    targetFlat,
    localeState,
    options.force
  );

  let translated = 0;
  let updated = false;

  for (const key of Object.keys(targetFlat)) {
    if (!(key in sourceFlat)) {
      delete targetFlat[key];
      updated = true;
    }
  }

  if (options.translate && keysToTranslate.length > 0) {
    const { results, translated: count } = await handleTranslation(
      keysToTranslate,
      sourceFlat,
      sourceLocale,
      targetLocale,
      options
    );

    for (const { key, translation } of results) {
      targetFlat[key] = translation;
      updated = true;
    }
    translated = count;
  } else {
    for (const key of keysToTranslate) {
      targetFlat[key] = sourceFlat[key];
      updated = true;
    }
  }

  if (updated) {
    const targetContent = unflatten(targetFlat);
    fs.writeFileSync(targetPath, JSON.stringify(targetContent, null, 2));
  }

  state[sourceLocale] = { ...sourceFlat };
  state[targetLocale] = { ...targetFlat };
  saveState(state);

  return { translated, updated };
}

async function processAllLocales(sourceLocale, targetLocales, options) {
  const spinner = ora(`Processing ${targetLocales.length} locales...`).start();

  let totalTranslated = 0;
  let totalUpdated = 0;

  const localePromises = targetLocales.map(async (locale) => {
    try {
      const result = await syncLocale(sourceLocale, locale, options);
      spinner.text = `Processed ${locale} (${result.translated} translations)`;
      return result;
    } catch (error) {
      spinner.warn(`Failed to process ${locale}: ${error.message}`);
      return { translated: 0, updated: false };
    }
  });

  const results = await Promise.all(localePromises);

  for (const result of results) {
    totalTranslated += result.translated;
    if (result.updated) {
      totalUpdated++;
    }
  }

  spinner.succeed(
    `Completed: ${totalTranslated} translations across ${totalUpdated} locales`
  );
}

async function main() {
  program
    .name("translate")
    .description("Simple translation sync tool")
    .version("3.0.0")
    .option("-t, --translate", "Enable AI translation", true)
    .option("--no-translate", "Disable AI translation")
    .option("-f, --force", "Force retranslation of all strings", false)
    .option("--fast", "Use faster model", false)
    .option("-l, --locales <locales>", "Specific locales (comma-separated)")
    .parse();

  const options = program.opts();

  if (
    options.translate &&
    !process.env.OPENAI_API_KEY &&
    !process.env.AI_SDK_API_KEY
  ) {
    throw new Error(
      "No OpenAI API key found. Set OPENAI_API_KEY or AI_SDK_API_KEY environment variable."
    );
  }

  const { DEFAULT_LOCALE, SUPPORTED_LOCALES } = getProjectConfig();

  let targetLocales = SUPPORTED_LOCALES.filter(
    (locale) => locale !== DEFAULT_LOCALE
  );
  if (options.locales) {
    const requested = options.locales.split(",");
    targetLocales = targetLocales.filter((locale) =>
      requested.includes(locale)
    );
  }

  if (targetLocales.length === 0) {
    throw new Error("No target locales to process");
  }

  await processAllLocales(DEFAULT_LOCALE, targetLocales, options);
}

main().catch((error) => {
  process.stderr.write(`Error: ${error.message}\n`);
  process.exit(1);
});
