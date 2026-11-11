# ViralArc AI plugin


ViralArc AI connects Claude to your ViralArc account through OAuth. Use it to
search and filter Threads posts, prepare replies, manage requested automations,
maintain lead lists, create forms, and run CouponCity campaigns. Operations use
your existing platform permissions, subscription features, credits and limits.

## Install in Claude Code

The plugin is published from this repository’s `main` branch.

```sh
claude plugin marketplace add viralarc-ai/public-plugin
claude plugin install viralarc-ai-plugin@viralarc-ai
```

Start a new Claude Code session, open `/mcp`, select the ViralArc server and
complete the ViralArc sign-in and consent flow. Then ask Claude to show your
connected ViralArc profile and available workflows. Forms and CouponCity work
without a connected social account.

Try asking Claude to search Threads for a topic and prepare a reply, review your
automations and scheduled replies, or create a CouponCity offer as a draft.
Review returned targets and results when requesting publication or redemption.

## Data and permissions

The plugin sends tool arguments and the identifiers needed for your requested
operations to `https://ai.kani.tw/mcp`. ViralArc processes authorized account data,
post content, lead-list/form records and coupon configuration as needed for those
operations. Its hosted services use configured AI providers and the social
platforms connected to your account. Tool results return to Claude. Search and
mutation requests may consume ViralArc credits or affect the selected account.

Connect through the host's OAuth flow. Manage or revoke the connection in
ViralArc's account settings. Each execution enforces the signed-in user's access.
ViralArc's published policies describe data processing, retention and deletion.
For support, email official@viralarc-ai.com. The package files and skill
instructions use the MIT license included in this folder.

[Privacy policy](https://viralarc.ai/privacy-policy) ·
[Terms of service](https://viralarc.ai/terms-of-service)

Shared skills, branding, and MCP configuration for independent ViralArc users.
Each user signs in to their own ViralArc account; permissions, credits, and rate
limits are enforced by the services.

## Build targets

Run from the `public-plugin` repository root with Node.js and `zip` installed:

```sh
npm run build:plugin -- codex
npm run build:plugin -- claude
npm run build:plugin -- chatgpt
npm run build:plugin -- skill
```

| Target | Audience | Connection |
| --- | --- | --- |
| `claude` | Claude Code and Claude directory package | Native manifest, skills and OAuth-enabled remote MCP. |
| `codex` | Users installing in Codex or Claude Code | Direct remote MCP; portable and native manifests. |
| `chatgpt` | Remote MCP source for OpenAI's With MCP submission flow | Public endpoint and OAuth discovery; no private App ID or account-specific name. |
| `chatgpt-private` | Owner updating skills on one existing registered App | Native App manifest and the configured App binding; not for other users to download. |
| `skill` | Users importing the bundled skills separately | Skill directories and their references only; requires a separately connected ViralArc MCP server. |

ZIPs are created at the repository root with the target and shared version in
the filename, for example `viralarc-ai-plugin-chatgpt-1.0.6.zip`. Every build
starts in a fresh temporary directory; files from other targets cannot survive
from a previous archive.

The `skill` target creates `viralarc-ai-plugin-skill-1.0.6.zip` with
`viralarc-ai/SKILL.md` and all supporting files directly under the skill's folder.
It excludes plugin manifests, MCP configuration, and private App settings.

## Test with other users

Read [TESTING.md](TESTING.md) before distributing an archive. For ChatGPT web,
independent testers can add `https://ai.kani.tw/mcp` through Add custom MCP server,
choose OAuth/CIMD, and authorize their own ViralArc account. This tests MCP and
OAuth without needing the publisher's private App.

A source ZIP is not an approved public ChatGPT App. Importing raw MCP source
may be desktop-only even when the endpoint is HTTPS. For a directory install
with browser OAuth onboarding, complete OpenAI's remote MCP review and publish
through With MCP. The portal creates its own registered App binding; it must
not be replaced with the publisher's private App ID.

Do not upload the distributable package as a new version of a generated custom
App. Its internal identity differs. Use the direct MCP package as a new plugin
in supported desktop clients, or use the documented browser setup before
publication. The private update target is only for the exact App it references.

The `chatgpt` target never loads `.env` or accepts `--app-id` / `--plugin-name`.
It includes portable `plugin.json`, `mcp.json`, skills, assets, and tester docs.
It excludes `.app.json`, App-owned metadata, legacy native manifests, credentials,
and developer-specific plugin names. The stable source identifier remains
`viralarc-ai-plugin`; the display name is **ViralArc AI**.

## Private App maintenance

This target preserves the owner's existing App identity and presentation:

```sh
npm run build:plugin -- chatgpt-private
```

Only this target loads the repository's Git-ignored `.env`:

```dotenv
VIRALARC_CHATGPT_APP_ID=<actual registered App ID>
VIRALARC_CHATGPT_PLUGIN_NAME=<exact existing internal plugin name>
```

The App ID must start with `asdk_app_`, `connector_`, or `templated_apps_`.
Copy the internal plugin name from its actual manifest, not its display name.
Explicit `--app-id` and `--plugin-name` override exported environment variables,
which override `.env`. This file is never packaged. Never distribute this
owner-specific archive as a general installer.

`chatgpt-app.json` stores the existing App's presentation for this maintenance
path. It is not used by distributable builds. The package version must be newer
than the App's current release when preparing a new update.

## Shared source and verification

- `plugin.json`: shared version, source identity, and public listing metadata.
- `mcp.json`: production endpoint and OAuth/CIMD configuration.
- `skills/viralarc-ai/`: setup, branded terms, and English/Traditional Chinese
  feature workflow references.
- `assets/icon.png`: existing square ViralArc icon.
- Native Codex and Claude manifests remain available for direct source installs;
  the build regenerates them from the shared metadata.

```sh
npm run test:plugin-build
```

The ChatGPT build validates packaged website, MCP, and OAuth endpoint URLs before
creating the archive. Archive tests verify private/public isolation, MCP configuration, shared skills,
and preservation of private App metadata. They do not establish that an
independent tester's installation or OAuth flow has passed. `npm run build -- <target>` is an alias for the plugin builder.

The server is `https://ai.kani.tw/mcp` and the issuer is
`https://viralarc.ai/api/oauth`. The scopes are `mcp:all` and `offline_access`.
Deploy Landing's compatibility changes before testing Codex/Claude identities,
loopback callbacks, discovery aliases, and refresh. No new signing keys or
manually shared user credentials are needed.

## Public review preparation

The ChatGPT source ZIP is structurally compatible with remote MCP submission,
but is not a completed submission. Publisher verification, a verified support
page, policy coverage, intended countries and commerce declarations, five
positive and three negative review cases, an actual demo recording, and secure
reviewer access still need preparation and verification. Unknown facts and
unrun results are not declared as complete in the manifest.

Author-supplied App bindings are prohibited in public uploads. Keep the binding
generated by the portal in the saved submission; do not insert a private App
reference into the author upload. Submit for review and publish only when the
materials and connection checks are complete.

Official references:
[package format](https://developers.openai.com/plugins/build/plugins),
[remote MCP submission](https://developers.openai.com/plugins/deploy/submission),
[import and App access restrictions](https://learn.chatgpt.com/docs/enterprise/plugin-management).

## CouponCity support

CouponCity tools require Landing and AI deployments using models 51.19.0 or newer.
The connection still uses the existing OAuth setup and `mcp:all` scope.
The shared skills include English and Traditional Chinese CouponCity workflows.
Live tool availability remains authoritative until the services are deployed.
