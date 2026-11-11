# Test ViralArc AI on your own account

Every tester connects their own ViralArc account through OAuth. No API key,
shared token, developer App ID, or access to the publisher's ChatGPT account is
needed to connect to the server.

## ChatGPT web: connect the server directly

Before public directory publication, use ChatGPT's custom MCP connection flow:

1. Open ChatGPT → Plugins → ＋ → Add custom MCP server.
2. Name it ViralArc AI and enter `https://ai.kani.tw/mcp`.
3. Choose OAuth and CIMD if the client registration method is shown. If scopes
   are requested, use `mcp:all offline_access`. No client secret is needed.
4. Select Create as a plugin, then complete ViralArc sign-in and consent using
   your own account. Workspace policy can restrict custom connections.
5. Start a new conversation with this connection enabled. Ask:
   “Which ViralArc profile and social accounts am I connected to?”
6. After more than five minutes, ask again in the same connection. It should
   refresh without repeating consent. Record any connection or refresh error.

This tests the MCP connection and OAuth. It does not install this repository's
bundled skills into your newly created App. Testing the combined skill-and-tool
workflow on the web requires an appropriately shared or published plugin, or
an App-specific skill update prepared for your own connection.

Do not upload a generic source ZIP through Upload new version on the generated
custom App. That is an update of an existing identity and rejects other package
names. The publisher's private App update ZIP is not a distributable installer.

The `chatgpt` ZIP contains remote MCP source for OpenAI's With MCP submission
flow. It is not an approved public App. Importing raw MCP source may produce a
desktop-only plugin even though the server is hosted. A ZIP cannot grant access
to someone else's private registered App or override that host restriction.

## Codex and Claude Code: install the direct MCP package

Use the `codex` ZIP, which includes native Codex and Claude plugin manifests.
Install it as a new plugin in the client's supported plugin/marketplace flow.
Do not update an unrelated or automatically generated plugin with this archive.
Restart or start a new session, then authenticate the ViralArc server from the
host's MCP settings. In Claude Code, use `/mcp`.

If a bundled connector's sign-in control fails, use the separately registered
MCP flow in the packaged connection setup guide. Avoid duplicate registrations
when the existing connection already works. Never paste tokens into chat.

## Checks for every tester

- Confirm the reported profile is your own and lists only accounts you can use.
- Run a read-only account or post query before testing mutations.
- Verify refresh after the five-minute access token expires.
- Test drafts before sending anything. Sending, deleting, running paid searches,
  or enabling automation should only happen when you explicitly request it.
- Report the host, plugin version, setup path, time, and non-secret error text.
  Keep credentials and social account data out of shared screenshots.

The publisher must deploy the OAuth compatibility changes to the environment
behind the URL being tested. Packaging changes do not deploy the services.

Official guidance:
[Connect and test](https://developers.openai.com/plugins/deploy/connect-chatgpt),
[public submission](https://developers.openai.com/plugins/deploy/submission),
[import restrictions](https://learn.chatgpt.com/docs/enterprise/plugin-management).
