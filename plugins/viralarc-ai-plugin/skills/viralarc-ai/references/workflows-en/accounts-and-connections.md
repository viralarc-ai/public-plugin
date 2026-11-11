# Accounts, LINE, and connected apps

## Social accounts

In **Accounts**, people see connected platforms, connection health, account
statistics, and account actions. **Add account** opens platform selection and
the platform's sign-in/consent flow. Facebook can require selecting the Pages to
bind. Reconnect an expired or permission-limited account through its reconnect
action. Account limits and per-platform eligibility apply to connection setup.

In chat, start with `get_connected_profile` for the connected ViralArc user and
`list_connected_accounts` for social identities. Select the account named by the
user, or clarify when more than one matches. Call `get_automation_capabilities`
for the actual platform/provider and entitlements. Tools do not expose social
tokens. Connecting, reconnecting, or disconnecting a social account remains a UI
flow; do not invent a connection tool or ask for pasted credentials.

## LINE notifications

The Accounts screen has a separate connected-notification-channel section.
People add FireArc on LINE using the QR/link flow, then send the connection code
to finish linking. They can change the channel language or disconnect it.
Topic Patrol's LINE notification switches require that existing connection.
ChatGPT can explain setup and configure supported project notification choices;
it cannot create a LINE connection or promise to send arbitrary LINE messages.

## OAuth-connected applications

**Settings → Connected apps** lists external clients such as ChatGPT and their
granted permissions. Disconnecting revokes refresh access; an issued access
token can remain usable for up to five minutes. This is separate from Accounts,
which contains the social identities ViralArc operates.

When the host says the plugin needs authorization, reconnect through its OAuth
flow. Do not use **External access** token copy/download as an OAuth workaround.
Disconnecting the plugin and reconnecting a social platform solve different
problems. In **Settings → General**, people can view their ViralArc identity;
the MCP profile is a read of that identity, not a profile-edit action.

Example: “Which Instagram account is connected, does it support the follow
gate, and where do I reconnect it if the authorization has expired?”
