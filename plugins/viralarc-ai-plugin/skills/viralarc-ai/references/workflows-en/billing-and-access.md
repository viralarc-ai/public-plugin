# Billing, credits, permissions, and support

## How people use Settings

**Settings** separates General, Subscription, Payment history, Plan entitlements,
Connections, Connected apps, External access, Contracts, and Support.
Subscription shows the current plan, renewal/trial state, scheduled plan changes,
and cancellation controls. Cancellation asks for a reason. Cancelling a scheduled
plan change is different from cancelling the subscription. Plan selection and
checkout run through the billing overlay; account top-ups use a payment checkout.
People complete payment and billing decisions in these UI flows.

## ChatGPT workflow

1. Use `get_billing_summary` to read subscription, effective plan/entitlements,
   and remaining credits. A purchased-credit balance and regular-credit balance
   are distinct; preserve missing/unavailable fields and the actual plan IDs.
2. For a feature question, combine the summary with the selected account's
   `get_automation_capabilities`. A connection problem, unsupported provider,
   plan restriction, and credit shortage require different next steps.
3. Use `list_payment_history` for successful payments. Amounts in `amount_cents`
   are currency minor units. This result is not an invoice list, refund history,
   failed-payment log, or complete credit ledger.
4. Direct requests to buy, top up, change/cancel plans, handle invoices, or manage
   contracts to the appropriate Settings/checkout UI. This MCP catalog has no
   billing mutation tools; do not claim a payment or subscription change.
5. For supported product guidance, use `listSupportDocuments` and
   `getSupportDocument`. Explain the returned feature-specific error and next
   step. For missing billing records or unresolved service failures, direct the
   user to Support rather than guessing the cause or promising an upgrade fixes it.

The OAuth scope `mcp:all` permits available tools on the user's behalf, subject
to normal ownership, entitlements, provider constraints, and credits. It does
not grant administrative powers. Never ask the user to paste payment details,
sign-in tokens, provider secrets, or refresh tokens into chat.

Example: “Check my plan, remaining credits, and latest three successful payments,
then explain whether this Instagram account can use link tracking.”
