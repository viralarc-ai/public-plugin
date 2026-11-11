import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { buildPlugin, validateUploadUrls } from "../scripts/build-plugin.mjs";

const sourceDirectory = fileURLToPath(new URL("../plugins/viralarc-ai-plugin/", import.meta.url));

function withBuild(target, appId, inspect, options = {}) {
  const outputDirectory = mkdtempSync(join(tmpdir(), "viralarc-plugin-test-"));
  try {
    const pluginName = target === "chatgpt-private" ? "dev-build-test-only" : undefined;
    const archive = buildPlugin(target, { appId, pluginName, outputDirectory, ...options });
    const destination = join(outputDirectory, "extracted");
    const unpack = spawnSync("unzip", ["-q", archive, "-d", destination], { encoding: "utf8" });
    assert.equal(unpack.status, 0, unpack.stderr);
    inspect(destination, archive);
  } finally {
    rmSync(outputDirectory, { recursive: true, force: true });
  }
}

function readJson(directory, file) {
  return JSON.parse(readFileSync(join(directory, file), "utf8"));
}

test("skill archive contains exactly the bundled skills and all supporting files", () => {
  withBuild("skill", undefined, (directory, archive) => {
    assert.match(archive, /viralarc-ai-plugin-skill-\d+\.\d+\.\d+\.zip$/);
    const skillsDirectory = join(sourceDirectory, "skills");
    const sourceFiles = readdirSync(skillsDirectory, { recursive: true })
      .filter((path) => !path.endsWith(".DS_Store"))
      .sort();
    assert.deepEqual(readdirSync(directory, { recursive: true }).sort(), sourceFiles);
    for (const path of sourceFiles) {
      if (statSync(join(skillsDirectory, path)).isFile()) {
        assert.deepEqual(
          readFileSync(join(directory, path)),
          readFileSync(join(skillsDirectory, path)),
          path,
        );
      }
    }
    assert.ok(readFileSync(join(directory, "viralarc-ai/SKILL.md"), "utf8").startsWith("---\n"));
  });
});

test("Codex archive connects directly through MCP and retains Claude support", () => {
  withBuild("codex", undefined, (directory) => {
    const manifest = readJson(directory, "plugin.json");
    const native = readJson(directory, ".codex-plugin/plugin.json");
    const portableMcp = readJson(directory, "mcp.json");
    const nativeMcp = readJson(directory, ".mcp.json");
    assert.equal(native.mcpServers, "./.mcp.json");
    assert.equal(native.version, manifest.version);
    assert.equal(readJson(directory, ".claude-plugin/plugin.json").version, manifest.version);
    assert.equal(native.apps, undefined);
    assert.equal(manifest.extensions["com.openai"].apps, undefined);
    assert.ok(!readdirSync(directory).includes(".app.json"));
    assert.deepEqual(nativeMcp.mcpServers["viralarc-ai"], {
      type: "http",
      url: portableMcp.mcpServers["viralarc-ai"].url,
    });
    assert.equal(portableMcp.mcpServers["viralarc-ai"].extensions["com.openai"].auth.client.mode, "cimd");
  });
});

test("Claude archive includes native directory metadata and the shared skills", () => {
  withBuild("claude", undefined, (directory) => {
    const manifest = readJson(directory, ".claude-plugin/plugin.json");
    const source = readJson(sourceDirectory, "plugin.json");
    assert.equal(manifest.name, source.name);
    assert.equal(manifest.version, source.version);
    assert.equal(manifest.displayName, "ViralArc AI");
    assert.equal(manifest.license, "MIT");
    assert.match(readFileSync(join(directory, "LICENSE"), "utf8"), /MIT License/);
    assert.equal(manifest.privacyPolicyUrl, "https://viralarc.ai/privacy-policy");
    assert.equal(manifest.termsOfServiceUrl, "https://viralarc.ai/terms-of-service");
    assert.ok(readFileSync(join(directory, manifest.icon)).length);
    assert.deepEqual(readJson(directory, ".mcp.json").mcpServers["viralarc-ai"], {
      type: "http", url: "https://ai.kani.tw/mcp",
    });
    assert.ok(readFileSync(join(directory, "skills/viralarc-ai/SKILL.md"), "utf8").startsWith("---\n"));
    for (const excluded of [".codex-plugin", ".app.json", ".env", "chatgpt-app.json", "plugin.json", "mcp.json"]) {
      assert.ok(!readdirSync(directory).includes(excluded));
    }
  });
});

test("distributable ChatGPT archive uses the public endpoint without an account-specific App", () => {
  withBuild("chatgpt", undefined, (directory) => {
    assert.deepEqual(readdirSync(directory).sort(), [
      "LICENSE", "README.md", "TESTING.md", "assets", "mcp.json", "plugin.json", "skills",
    ]);
    const manifest = readJson(directory, "plugin.json");
    assert.equal(manifest.name, "viralarc-ai-plugin");
    assert.equal(manifest.extensions["com.openai"].interface.displayName, "ViralArc AI");
    assert.equal(manifest.extensions["com.openai"].apps, undefined);
    const server = readJson(directory, "mcp.json").mcpServers["viralarc-ai"];
    assert.equal(server.url, "https://ai.kani.tw/mcp");
    assert.equal(server.extensions["com.openai"].auth.client.mode, "cimd");
    assert.deepEqual(server.extensions["com.openai"].auth.baseScopes, ["mcp:all", "offline_access"]);
    assert.ok(readFileSync(join(directory, manifest.extensions["com.openai"].interface.logo)).length);
    for (const path of ["plugin.json", "mcp.json"]) {
      const contents = readFileSync(join(directory, path), "utf8");
      assert.doesNotMatch(contents, /asdk_app_|connector_|templated_apps_|dev-[a-f0-9]{32}/);
    }
  });
});

test("distributable ChatGPT build rejects attempts to insert private App identities", () => {
  assert.throws(
    () => buildPlugin("chatgpt", { appId: "asdk_app_build_test_only" }),
    /not distributable builds/,
  );
  assert.throws(
    () => buildPlugin("chatgpt", { pluginName: "dev-build-test-only" }),
    /not distributable builds/,
  );
});

test("public upload URL validation identifies malformed listing, MCP, and OAuth fields", () => {
  const manifest = readJson(sourceDirectory, "plugin.json");
  const mcp = readJson(sourceDirectory, "mcp.json");
  assert.doesNotThrow(() => validateUploadUrls(manifest, mcp));

  const badListing = structuredClone(manifest);
  badListing.extensions["com.openai"].interface.websiteURL = "/relative-site";
  assert.throws(() => validateUploadUrls(badListing, mcp), /interface.websiteURL/);

  const badServer = structuredClone(mcp);
  badServer.mcpServers["viralarc-ai"].url = "http://localhost:8080/mcp";
  assert.throws(() => validateUploadUrls(manifest, badServer), /mcpServers.viralarc-ai.url/);

  const badOAuth = structuredClone(mcp);
  badOAuth.mcpServers["viralarc-ai"].extensions["com.openai"].auth.tokenUrl = "not-a-url";
  assert.throws(() => validateUploadUrls(manifest, badOAuth), /auth.tokenUrl/);
});

test("Private update archive requires the registered App and contains no raw MCP declaration", () => {
  // This synthetic ID is confined to a temporary archive and is never distributed.
  withBuild("chatgpt-private", "asdk_app_build_test_only", (directory) => {
    const files = readdirSync(directory);
    assert.deepEqual(files.sort(), [
      ".app.json",
      ".codex-plugin",
      "skills",
    ]);
    const native = readJson(directory, ".codex-plugin/plugin.json");
    assert.equal(native.apps, "./.app.json");
    assert.equal(native.mcpServers, undefined);
    assert.equal(native.name, "dev-build-test-only");
    const source = readJson(sourceDirectory, "plugin.json");
    assert.equal(native.version, source.version);
    assert.deepEqual(readJson(directory, ".app.json"), {
      apps: { "dev-build-test-only": { id: "asdk_app_build_test_only" } },
    });
    assert.ok(readFileSync(join(directory, "skills/viralarc-ai/SKILL.md"), "utf8").startsWith("---\n"));
    const presentation = readJson(
      sourceDirectory,
      "chatgpt-app.json",
    );
    assert.deepEqual(native.interface, presentation.interface);
    assert.deepEqual(native.author, presentation.author);
    assert.equal(native.description, presentation.description);
  });
});

test("Private update build rejects missing IDs, plugin IDs, URLs, and malformed app IDs", () => {
  for (const appId of [
    undefined,
    "",
    "plugin_asdk_app_test",
    "https://chatgpt.com/plugins/test",
    "asdk_app_",
    "asdk_app_a/b",
  ]) {
    assert.throws(() => buildPlugin("chatgpt-private", { appId }), /registered App ID/);
  }
});

test("Private updates preserve the existing internal name and ViralArc AI display name", () => {
  const pluginName = "dev-build-test-only";
  withBuild("chatgpt-private", "asdk_app_build_test_only", (directory) => {
    const native = readJson(directory, ".codex-plugin/plugin.json");
    assert.equal(native.name, pluginName);
    assert.equal(native.interface.displayName, "ViralArc AI");
    assert.deepEqual(readJson(directory, ".app.json"), {
      apps: { [pluginName]: { id: "asdk_app_build_test_only" } },
    });
  }, { pluginName });
});

test("build rejects unknown targets and ignored App IDs", () => {
  assert.throws(() => buildPlugin("web"), /Choose a build target/);
  assert.throws(() => buildPlugin("codex", { appId: "asdk_app_build_test_only" }), /only apply/);
  assert.throws(
    () => buildPlugin("chatgpt-private", { appId: "asdk_app_build_test_only" }),
    /existing internal plugin name/,
  );
});

test("successive builds preserve target isolation and shared skill contents", () => {
  withBuild("codex", undefined, (codexDirectory) => {
    withBuild("chatgpt-private", "connector_build_test_only", (chatgptDirectory) => {
      assert.equal(
        readFileSync(join(codexDirectory, "skills/viralarc-ai/SKILL.md"), "utf8"),
        readFileSync(join(chatgptDirectory, "skills/viralarc-ai/SKILL.md"), "utf8"),
      );
      assert.equal(
        readJson(codexDirectory, "plugin.json").extensions["com.openai"].interface.displayName,
        readJson(chatgptDirectory, ".codex-plugin/plugin.json").interface.displayName,
      );
    });
  });
});
