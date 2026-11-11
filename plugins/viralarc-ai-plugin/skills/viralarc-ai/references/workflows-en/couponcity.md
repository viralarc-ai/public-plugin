# CouponCity: campaigns, channels and redemption

## How people use the UI

Open **CouponCity**, select a coupon or create one. No connected social account
is required. **Coupon content** holds the title, description, terms, claim mode,
claim dates, validity, waiting period, deadline, and redemption options. **Style**
controls colors, font and uploaded images. **Sharing & results** contains the
published Shortlink URL, channel tracking codes, clicks, claims and redemptions.
**Staff access** is available to the owner. The scanner accepts a camera scan or
pasted customer redemption code.

Keep these states separate: local unsaved editor content, the saved draft with
its revision, and the immutable published version. Saving a draft does not
publish it. Republishing changes the public offer for future claims; previously
issued claims retain their original version, options and expiry. Closing stops
new claims while issued claims remain redeemable until expiry.

## Campaign workflow

1. Call `list_coupons`, follow its cursor, and select an actual accessible coupon.
   Use `get_coupon` to read the saved revision and published version. For brand
   context, use the existing business-profile tools when appropriate.
2. Create with `create_coupon_draft`, or save an intended complete definition
   with `update_coupon_draft`. Preserve option IDs, unrelated settings and owned
   images. Image uploads/removal remain in the native UI; never invent storage
   paths. If the built-in editor has unsaved changes, have the user save or
   discard them there before a direct saved-state write.
3. Set an IANA time zone and UTC ISO timestamps. Signed-in members can claim
   once per coupon. Anonymous repeatable mode allows separate single-use claims
   without sign-in and requires zero waiting days. Validity starts at claim time;
   a global deadline can shorten it. Once any claim exists, that deadline is locked.
4. Publish or republish with `publish_coupon` only when requested, using the
   current revision and intended definition. Return the server's canonical
   Shortlink URL. Use `close_coupon` for an explicit stop-claiming request.

Do not invent delete/archive operations; they are not exposed by this workflow.
A stale revision requires a new read rather than overwriting newer work.

## Channels, staff and reports

- Owners can use `list_coupon_tracking_codes`, `create_coupon_tracking_code`
  and `rename_coupon_tracking_code` on the existing published coupon. Return the
  supplied tracked URL; renaming does not change its code or destination.
- A user may explicitly include that URL in a social reply, comment automation,
  or another supported marketing workflow. Creating/publishing a coupon alone
  does not authorize sending messages or publishing social content.
- Owners use `list_coupon_staff`, `set_coupon_staff` and `revoke_coupon_staff`
  for registered users. Editors may edit/publish and read reports. Redeemers may
  inspect/redeem customer codes. These roles do not imply one another.
- Use `get_coupon_report` for totals and channel/option comparisons. Its history
  is at most the 25 latest redemptions. Claims/redemptions in repeatable mode are
  not unique-person counts. Tracking click totals and conversion counts describe
  their respective recorded events, not guaranteed causal attribution.

## Redemption workflow

Use `inspect_coupon_redemption` with the customer's current supplied code. It
returns the options from the issued version and does not consume the claim.
Redeem with `redeem_coupon` only after an explicit redemption request and a
chosen returned option ID. The caller must be an owner or assigned redeemer.
Never create customer claims, mint their QR codes, or assume inspection redeemed
anything. The native page handles claiming, QR generation and camera capture.

For expired/replaced QR codes, ask the customer to display a fresh code. An
already-used claim must not be redeemed again. After an uncertain redemption,
read `get_agent_action_status` using the execution ID before any retry. A repeated
logical operation should retain its MCP idempotency key when the host supports
it; a new key does not make it safe to repeat an uncertain redemption.
