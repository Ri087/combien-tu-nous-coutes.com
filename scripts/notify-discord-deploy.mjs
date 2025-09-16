import { execFileSync } from "node:child_process";

function runGit(args) {
  try {
    return execFileSync("git", args, { encoding: "utf8" }).trim();
  } catch (err) {
    console.warn(`git ${args.join(" ")} failed:`, err.message);
    return null;
  }
}

const webhook = process.env.DISCORD_WEBHOOK_URL?.trim();
if (!webhook) {
  console.warn("DISCORD_WEBHOOK_URL is not set. Skipping notification.");
  process.exit(0);
}

let projectName = "Vercel Project";
let deploymentUrl;
let deploymentCreatedAt;
let deploymentId;
let vercelDeploymentPageUrl;
let productionUrl;

const token = process.env.VERCEL_TOKEN?.trim();
const projectId = process.env.VERCEL_PROJECT_ID?.trim();
const orgId = process.env.VERCEL_ORG_ID?.trim();
const githubRunId = process.env.GITHUB_RUN_ID?.trim();

// Gather git metadata
const commitSha = runGit(["rev-parse", "HEAD"]);
const shortSha = runGit(["rev-parse", "--short", "HEAD"]);
const branchName = runGit(["symbolic-ref", "-q", "--short", "HEAD"]);
const tagName = runGit(["describe", "--tags", "--exact-match"]);
const refName = branchName || tagName || "";
const originUrl = runGit(["remote", "get-url", "origin"]);

// Build repo HTTP URL from origin URL
let repoHttpUrl;
if (originUrl) {
  if (originUrl.startsWith("git@github.com:")) {
    // SSH format: git@github.com:org/repo.git -> https://github.com/org/repo
    const match = originUrl.match(/^git@github\.com:(.+?)(?:\.git)?$/);
    if (match) {
      repoHttpUrl = `https://github.com/${match[1]}`;
    } else {
      console.warn("Could not parse SSH origin URL:", originUrl);
    }
  } else if (originUrl.startsWith("https://github.com/")) {
    // HTTPS format: strip trailing .git
    repoHttpUrl = originUrl.replace(/\.git$/, "");
  } else {
    console.warn("Unsupported origin URL format:", originUrl);
  }
}

// Build commit URL
const commitUrl =
  repoHttpUrl && commitSha ? `${repoHttpUrl}/commit/${commitSha}` : undefined;

if (token && projectId) {
  try {
    const projectRes = await fetch(
      `https://api.vercel.com/v9/projects/${encodeURIComponent(projectId)}${orgId ? `?teamId=${encodeURIComponent(orgId)}` : ""}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (projectRes.ok) {
      const data = await projectRes.json();
      if (data?.name) {
        projectName = data.name;
      }
    } else {
      console.warn(
        "Failed to fetch project info from Vercel API:",
        projectRes.status
      );
    }
  } catch (err) {
    console.warn("Failed to fetch project info from Vercel API:", err.message);
  }

  try {
    const deploymentsRes = await fetch(
      `https://api.vercel.com/v13/deployments?projectId=${encodeURIComponent(projectId)}&target=production&limit=1${orgId ? `&teamId=${encodeURIComponent(orgId)}` : ""}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (deploymentsRes.ok) {
      const deploymentsData = await deploymentsRes.json();
      if (deploymentsData?.deployments?.[0]) {
        const deployment = deploymentsData.deployments[0];
        deploymentUrl = `https://${deployment.url}`;
        deploymentCreatedAt = new Date(deployment.createdAt).toISOString();
        deploymentId = deployment.uid || deployment.id;
        if (deploymentId) {
          vercelDeploymentPageUrl = `https://vercel.com/deployments/${deploymentId}`;
        }
      }
    } else {
      console.warn(
        "Failed to fetch deployment info from Vercel API:",
        deploymentsRes.status
      );
    }
  } catch (err) {
    console.warn(
      "Failed to fetch deployment info from Vercel API:",
      err.message
    );
  }

  // Try to discover the production alias domain
  if (!productionUrl && token && deploymentId) {
    try {
      const detailRes = await fetch(
        `https://api.vercel.com/v13/deployments/${encodeURIComponent(deploymentId)}${orgId ? `?teamId=${encodeURIComponent(orgId)}` : ""}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (detailRes.ok) {
        const detail = await detailRes.json();
        const aliases = detail.aliases || detail.alias || [];
        const firstAlias = Array.isArray(aliases) ? aliases[0] : undefined;
        if (firstAlias) {
          productionUrl = `https://${firstAlias}`;
        }
      }
    } catch {
      /* ignore */
    }
  }
  if (!productionUrl && token && deploymentId) {
    try {
      const aliasRes = await fetch(
        `https://api.vercel.com/v11/deployments/${encodeURIComponent(deploymentId)}/aliases${orgId ? `?teamId=${encodeURIComponent(orgId)}` : ""}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (aliasRes.ok) {
        const aliasData = await aliasRes.json();
        const first =
          aliasData?.aliases?.[0]?.alias || aliasData?.aliases?.[0]?.domain;
        if (first) {
          productionUrl = `https://${first}`;
        }
      }
    } catch {
      /* ignore */
    }
  }
  if (!productionUrl && process.env.PRODUCTION_URL) {
    productionUrl = process.env.PRODUCTION_URL.trim();
  }
  if (!productionUrl && deploymentUrl) {
    productionUrl = deploymentUrl;
  }
} else {
  console.warn(
    "VERCEL_TOKEN or VERCEL_PROJECT_ID is not set. Using fallback project name."
  );
}

// Build workflow run URL
const runUrl =
  githubRunId && repoHttpUrl
    ? `${repoHttpUrl}/actions/runs/${githubRunId}`
    : undefined;

const fields = [];

fields.push({ name: "Project", value: projectName, inline: true });
fields.push({ name: "Environment", value: "production", inline: true });

if (deploymentUrl) {
  fields.push({
    name: "Deployment URL",
    value: deploymentUrl,
    inline: false,
  });
}

if (shortSha) {
  const commitValue = commitUrl ? `[${shortSha}](${commitUrl})` : shortSha;
  fields.push({ name: "Commit", value: commitValue, inline: true });
}

if (refName) {
  fields.push({ name: "Ref", value: refName, inline: true });
}

fields.push({
  name: "Deployed At",
  value: deploymentCreatedAt || new Date().toISOString(),
  inline: false,
});

if (runUrl) {
  fields.push({
    name: "Workflow Run",
    value: `[View Run](${runUrl})`,
    inline: false,
  });
}

if (vercelDeploymentPageUrl) {
  fields.push({
    name: "Vercel Deployment Page",
    value: `[Open in Vercel](${vercelDeploymentPageUrl})`,
    inline: false,
  });
}
if (productionUrl) {
  fields.push({
    name: "Production URL",
    value: `[Visit Site](${productionUrl})`,
    inline: false,
  });
}

const payload = {
  embeds: [
    {
      title: "🚀 Deployment Successful",
      description: `🎉 Project "${projectName}" has been successfully deployed to production.`,
      color: 3_066_993,
      fields,
    },
  ],
};

try {
  await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
} catch (err) {
  console.error("Failed to post Discord webhook:", err);
}

process.exit(0);
