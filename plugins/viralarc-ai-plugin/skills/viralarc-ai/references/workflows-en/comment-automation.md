# Comment automation and comment-to-DM

## How people set it up

In **Post Manager**, select an owned post. **Batch Reply** handles selected
existing comments. **Auto Reply** or **Auto Reply & DM** opens configuration for
future comments. Creating an automation and sending to existing comments are
separate choices, even when the UI offers both in one setup.

### Threads

Choose **Batch Generate** for comment-specific AI replies or **Unified Reply**
for fixed content. Set the prompt/content, optional keyword restrictions where
offered, and the destination lead list. The editor can incorporate the account's
Business Profile. For an immediate batch, inspect and select eligible comments;
for ongoing handling, save the bot. Existing bots can be updated or paused.

### Instagram and Facebook

The builder separates these settings:

| Setting | Decision to capture |
| --- | --- |
| Trigger | Any comment or specified keywords. |
| Public reply | Whether to reply under the post; configure one or more reply templates. |
| DM | Whether to send a private message; configure its message and optional links/button labels. |
| Link tracking | Track configured DM links; retain existing link identities when editing. |
| Lead list | Which list should receive captured commenters. |
| Automation | Handle future comments or leave ongoing automation off. |
| Existing comments | Whether to send now, and the exact comments selected. |
| Instagram follow gate | Where supported, initial message, confirmation method/keyword, and message for people who are not following. |

The Instagram follow gate requires a supported Zernio connection. Check account
capabilities before offering it; native accounts do not silently use Zernio.
The builder retains a legacy follow-up setting, but automatic follow-up delivery
has no implementation. Do not promise it; manual batches reject `followUp: true`.

## ChatGPT workflow

1. Resolve the account and owned post; use `get_post_comments` to inspect a batch
   the user wants to select. Read `get_automation_capabilities` and any existing
   project with `get_project` before configuring it.
2. For future comments, use `create_comment_automation` with the platform-specific
   settings. For an edit, prefer `update_comment_automation` with `patch` and the
   existing `platform`. Preserve omitted public/DM settings, links, templates,
   and follow gates. A full `configuration` is a replacement-style editor input;
   never send both forms.
3. For an existing-comment batch, use `reply_to_existing_post_comments` with
   inspected `commentIds` and the inspected page's `after` cursor. Continue with
   `nextCursor` only within the requested scope. Threads AI generation may
   return drafts for review; do not call those drafts sent.
4. For one comment use `reply_to_post_comment` instead. Report public replies,
   DMs, skipped duplicates, and failed items from actual results. A private
   follow-gate step must not be reported as a final link delivery.
5. Use `pause_comment_automation` or `resume_comment_automation` for ongoing
   execution. Use `copy_comment_automation` to copy a saved setup to an owned
   account/post. Supply `replaceProjectId` only for an intended replacement;
   copied tracking links are distinct from the original's.

Show the intended trigger, public reply, DM, destination list, and whether this
affects current comments, future comments, or both before resolving ambiguity.
For imported commenters and CSV downloads, read [lead lists](lead-lists.md).

Example: “On this Instagram post, privately send the guide to people who comment
GUIDE, keep the public reply short, track the link, and add them to my guide list.
Apply it to future comments and these five existing comments.”
