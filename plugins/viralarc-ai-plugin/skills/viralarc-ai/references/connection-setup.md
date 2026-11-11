# Connect ViralArc AI

The MCP server URL is `https://ai.kani.tw/mcp`. Connecting grants access to the
ViralArc data and actions available to the signed-in user. The OAuth scope is
`mcp:all`; `offline_access` lets the host refresh its connection.

The host opens the ViralArc sign-in and consent page. Never ask the user to paste
a password or token into chat. An installed skill is only instructions; it does
not prove that its MCP connection is enabled, authenticated, or available here.

## Codex

After updating the plugin, restart Codex or open a new session. Open its MCP
server settings, find the plugin's `viralarc-ai` server, and select Authenticate.
Use `/mcp` where supported to inspect the server's status. Use the actual server
identifier shown by the host; a plugin may namespace it.

If the plugin's server is missing or cannot authenticate, the user can register
the endpoint separately in Codex's MCP settings. For the Codex CLI, the commands
are:

```sh
codex mcp add viralarc-ai --url https://ai.kani.tw/mcp
codex mcp login viralarc-ai --scopes mcp:all,offline_access
```

These commands change the user's local MCP configuration. Run them only when
the user has asked to configure the connection. Avoid creating a duplicate if
the plugin connection already works. Restart the session after configuration.

## Claude Code

Update the plugin, start a new session, and open `/mcp`. Select the ViralArc
server and authenticate. If the bundled connector is missing or its sign-in
button does not work, the user can add it separately:

```sh
claude mcp add --transport http --scope user viralarc-ai https://ai.kani.tw/mcp
```

Then open `/mcp` in Claude Code and complete authentication. Run configuration
commands only when asked; check existing registrations first. If a broken
plugin registration conflicts with the separately added connector, disable the
broken connection in the host. Do not assume a second registration shares the
first registration's OAuth tokens.

## Claude web, Desktop, and Cowork

Open Customize → Connectors → Add → Custom → Web (some versions call this
Add custom connector). Enter the MCP server URL, choose Sign in now and
Use Claude's published identity, then complete ViralArc sign-in and consent.
On managed workspaces an owner may need to make the connector available first.
Enable the connector for the conversation and start a new session if necessary.
Do this through Connectors if the plugin's own connector button is unavailable.

## ChatGPT web

A raw desktop plugin ZIP is not a registered cloud MCP connection. In ChatGPT's
Plugins interface, add a custom MCP server using the server URL, choose OAuth
with CIMD, and finish creating and connecting it. If using a published ViralArc
plugin, use its Connect action. Workspace policy may restrict custom servers.
Installing an imported skill alone cannot create the cloud connection.

## Verify the connection

Once tools are available, call `get_connected_profile` and
`list_connected_accounts`. Report the profile and connected accounts actually
returned. If authentication still fails, report the host's error and ask for
non-secret diagnostics; do not repeatedly reconnect or claim success.

Connections created before the OAuth compatibility update may need a fresh
authorization to obtain a refresh token. No manually supplied client secret or
API key is required for Codex or Claude's published client identity.
