import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = join(repoRoot, "plugins", "viralarc-ai-plugin");
const appIdPattern = /^(?:asdk_app_|connector_|templated_apps_)[A-Za-z0-9][A-Za-z0-9_-]*$/;

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

export function validateUploadUrls(manifest, mcp) {
  const validate = (value, field) => {
    let url;
    try {
      url = new URL(value);
    } catch {
      throw new Error(`${field} must be an absolute HTTPS URL.`);
    }
    if (typeof value !== "string" || value.trim() !== value ||
      url.protocol !== "https:" || url.username || url.password || url.hash) {
      throw new Error(`${field} must be an absolute HTTPS URL without credentials or a fragment.`);
    }
  };
  const listing = manifest.extensions["com.openai"].interface;
  for (const field of ["websiteURL", "supportURL", "privacyPolicyURL", "termsOfServiceURL"]) {
    if (listing[field] !== undefined) validate(listing[field], `interface.${field}`);
  }
  for (const field of ["homepage", "repository"]) {
    if (manifest[field] !== undefined) validate(manifest[field], field);
  }
  for (const [name, server] of Object.entries(mcp.mcpServers)) {
    validate(server.url, `mcpServers.${name}.url`);
    const auth = server.extensions?.["com.openai"]?.auth;
    for (const field of ["authorizationUrl", "tokenUrl", "registrationUrl", "authorizationServerBase", "resource"]) {
      if (auth?.[field] !== undefined) validate(auth[field], `mcpServers.${name}.auth.${field}`);
    }
  }
}

export function buildPlugin(target, { appId, pluginName, outputDirectory = repoRoot } = {}) {
  if (!["codex", "claude", "chatgpt", "chatgpt-private", "skill"].includes(target)) {
    throw new Error('Choose a build target: "codex", "claude", "chatgpt", "chatgpt-private", or "skill".');
  }
  const privateUpdate = target === "chatgpt-private";
  const skillsOnly = target === "skill";
  if (privateUpdate && (typeof appId !== "string" || !appIdPattern.test(appId))) {
    throw new Error(
      "A private update requires a registered App ID. Pass --app-id or set VIRALARC_CHATGPT_APP_ID. " +
      "Use an asdk_app_, connector_, or templated_apps_ ID, not a plugin ID or URL.",
    );
  }
  if (!privateUpdate && (appId !== undefined || pluginName !== undefined)) {
    throw new Error("Private App IDs and plugin names only apply to chatgpt-private, not distributable builds.");
  }
  if (privateUpdate && pluginName === undefined) {
    throw new Error(
      "ChatGPT updates require the existing internal plugin name. " +
      "Set VIRALARC_CHATGPT_PLUGIN_NAME or pass --plugin-name.",
    );
  }
  if (pluginName !== undefined) {
    if (typeof pluginName !== "string" || pluginName.length > 64 ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pluginName)) {
      throw new Error("Use the existing plugin's internal name for --plugin-name, not its display name.");
    }
  }

  const manifest = JSON.parse(readFileSync(join(sourceDir, "plugin.json"), "utf8"));
  const archiveName = manifest.name;
  if (pluginName !== undefined) manifest.name = pluginName;
  const openai = manifest.extensions["com.openai"];
  const identity = Object.fromEntries(
    ["name", "version", "description", "author", "homepage", "repository", "keywords", "license"]
      .filter((key) => manifest[key] !== undefined)
      .map((key) => [key, manifest[key]]),
  );
  const claudeManifest = {
    ...identity,
    displayName: openai.interface.displayName,
    icon: openai.interface.logo,
    privacyPolicyUrl: openai.interface.privacyPolicyURL,
    termsOfServiceUrl: openai.interface.termsOfServiceURL,
  };
  let nativeManifest = {
    ...identity,
    skills: "./skills/",
    interface: openai.interface,
    extensions: { "com.openai": { onboardingSkill: openai.onboardingSkill } },
  };
  const output = resolve(outputDirectory);
  const archivePath = join(output, `${archiveName}-${target}-${manifest.version}.zip`);
  const temporaryDir = mkdtempSync(join(tmpdir(), "viralarc-plugin-"));
  const stagingDir = join(temporaryDir, "plugin");

  try {
    mkdirSync(stagingDir);
    const directories = privateUpdate || skillsOnly ? ["skills"] : ["skills", "assets"];
    for (const directory of directories) {
      cpSync(join(sourceDir, directory), join(stagingDir, directory), {
        recursive: true,
        filter: (path) => !path.endsWith(".DS_Store"),
      });
    }
    if (target === "codex" || privateUpdate) mkdirSync(join(stagingDir, ".codex-plugin"));

    if (privateUpdate) {
      // Registered Apps own their presentation and generated manifest format.
      // Overlay skills without replacing that metadata with a portable package.
      nativeManifest = {
        ...JSON.parse(readFileSync(join(sourceDir, "chatgpt-app.json"), "utf8")),
        name: pluginName,
        version: manifest.version,
        apps: "./.app.json",
        skills: "./skills/",
        extensions: { "com.openai": { onboardingSkill: openai.onboardingSkill } },
      };
      writeJson(join(stagingDir, ".app.json"), {
        apps: { [pluginName]: { id: appId } },
      });
    } else if (!skillsOnly) {
      copyFileSync(join(sourceDir, "README.md"), join(stagingDir, "README.md"));
      copyFileSync(join(sourceDir, "TESTING.md"), join(stagingDir, "TESTING.md"));
      if (existsSync(join(sourceDir, "LICENSE"))) {
        copyFileSync(join(sourceDir, "LICENSE"), join(stagingDir, "LICENSE"));
      }
      delete openai.apps;
      const mcp = JSON.parse(readFileSync(join(sourceDir, "mcp.json"), "utf8"));
      if (target === "chatgpt") validateUploadUrls(manifest, mcp);
      if (target !== "claude") writeJson(join(stagingDir, "mcp.json"), mcp);
      if (target === "codex" || target === "claude") {
        nativeManifest.mcpServers = "./.mcp.json";
        writeJson(join(stagingDir, ".mcp.json"), {
          mcpServers: Object.fromEntries(
            Object.entries(mcp.mcpServers).map(([name, server]) => {
              if (server.type !== "streamable-http" || typeof server.url !== "string") {
                throw new Error(`Unsupported native MCP transport for ${name}.`);
              }
              return [name, { type: "http", url: server.url }];
            }),
          ),
        });
        mkdirSync(join(stagingDir, ".claude-plugin"));
        writeJson(join(stagingDir, ".claude-plugin", "plugin.json"), claudeManifest);
      }
      if (target !== "claude") writeJson(join(stagingDir, "plugin.json"), manifest);
    }

    if (target === "codex" || privateUpdate) {
      writeJson(join(stagingDir, ".codex-plugin", "plugin.json"), nativeManifest);
    }

    // Create a fresh archive so a prior target's entries cannot survive a rebuild.
    const temporaryArchive = join(temporaryDir, "plugin.zip");
    const result = spawnSync("zip", ["-qr", temporaryArchive, "."], {
      cwd: skillsOnly ? join(stagingDir, "skills") : stagingDir,
      encoding: "utf8",
    });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`Plugin packaging failed: ${result.stderr}`);
    mkdirSync(output, { recursive: true });
    copyFileSync(temporaryArchive, archivePath);
    return archivePath;
  } finally {
    rmSync(temporaryDir, { recursive: true, force: true });
  }
}

function main() {
  const { values, positionals } = parseArgs({
    options: {
      "app-id": { type: "string" },
      "plugin-name": { type: "string" },
      help: { type: "boolean", short: "h" },
    },
    allowPositionals: true,
  });
  if (values.help) {
    console.log("Usage: npm run build:plugin -- <codex|claude|chatgpt|chatgpt-private|skill>");
    console.log("codex: direct MCP download, with Claude compatibility.");
    console.log("claude: native Claude plugin with remote MCP, skills and directory metadata.");
    console.log("chatgpt: portable remote MCP source for distribution/submission; no private App binding.");
    console.log("chatgpt-private: owner-only App skill update; reads .env or --app-id and --plugin-name.");
    console.log("skill: standalone ZIP of the plugin's skill directories and supporting files.");
    console.log("ZIPs are written to the repo root. Read TESTING.md for browser tester setup.");
    return;
  }
  if (positionals.length !== 1) throw new Error("Provide exactly one build target; use --help for options.");
  const target = positionals[0];
  const envPath = join(repoRoot, ".env");
  if (target === "chatgpt-private" && existsSync(envPath)) process.loadEnvFile(envPath);
  const appId = values["app-id"] || (
    target === "chatgpt-private" ? process.env.VIRALARC_CHATGPT_APP_ID : undefined
  );
  const pluginName = values["plugin-name"] || (
    target === "chatgpt-private" ? process.env.VIRALARC_CHATGPT_PLUGIN_NAME : undefined
  );
  console.log(`Created ${buildPlugin(target, { appId, pluginName })}`);
  if (target === "chatgpt") {
    console.log("This source ZIP is not a published App. Browser testers must add the MCP URL themselves");
    console.log("until a public remote plugin is approved and published. See the packaged TESTING.md.");
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
