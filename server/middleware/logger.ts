/** biome-ignore-all lint/suspicious/noConsole: Logger */
import chalk from "chalk";

import { env } from "@/env";

import { middleware } from "../trpc";
export const loggerMiddleware = middleware(async (opts) => {
  const { path, type, next } = opts;

  if (env.NODE_ENV !== "development") {
    return next();
  }

  const start = Date.now();
  const requestId = Math.random().toString(36).substring(2, 10);

  console.log(
    chalk.cyan(`[${new Date().toISOString()}]`) +
      chalk.yellow(` #${requestId}`) +
      chalk.green(` → ${type.toUpperCase()} ${path}`) +
      (opts.getRawInput
        ? chalk.grey(` ${JSON.stringify(opts.getRawInput())}`)
        : "")
  );

  const result = await next();

  const durationMs = Date.now() - start;

  let durationColor: (text: string) => string;
  if (durationMs < 100) {
    durationColor = chalk.green;
  } else if (durationMs < 500) {
    durationColor = chalk.yellow;
  } else {
    durationColor = chalk.red;
  }

  if (result.ok) {
    console.log(
      chalk.cyan(`[${new Date().toISOString()}]`) +
        chalk.yellow(` #${requestId}`) +
        chalk.green(` ✓ ${type.toUpperCase()} ${path}`) +
        durationColor(` ${durationMs}ms`)
    );
  } else {
    console.log(
      chalk.cyan(`[${new Date().toISOString()}]`) +
        chalk.yellow(` #${requestId}`) +
        chalk.red(` ✗ ${type.toUpperCase()} ${path}`) +
        durationColor(` ${durationMs}ms`) +
        chalk.red(` Error: ${result.error.message}`)
    );
  }

  return result;
});
