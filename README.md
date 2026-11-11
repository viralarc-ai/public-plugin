# ViralArc AI plugin

Standalone source repository for the ViralArc AI plugin, shared skills and remote
MCP configuration for Claude, Codex and ChatGPT.

## Build

Requires Node.js 22.13 or newer and the `zip` command.

```sh
npm run build -- claude
npm run build -- codex
npm run build -- chatgpt
npm run build -- skill
```

Archives are written to the repository root and ignored by Git. Each target uses
the same version, skills and public MCP endpoint. Public builds exclude private
App bindings and environment files.

## Validate

```sh
npm run test:plugin-build
npm run validate:plugin:claude
```

See [the plugin README](plugins/viralarc-ai-plugin/README.md) for installation,
OAuth, supported workflows, data handling and build targets.

The package files and bundled skill instructions are licensed under MIT. Hosted
ViralArc services remain subject to their published terms and privacy policy.
