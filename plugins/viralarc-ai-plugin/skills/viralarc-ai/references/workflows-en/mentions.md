# Mentions: filtered views, review, replies, and capture

## How people use the UI

Select a Threads account and open **Mentions**. **All mentions** is a built-in
view; people create custom mention projects for particular rules. Opening or
refreshing the feed syncs account mentions, then processes a custom project's
rules. Its tabs separate pending, needs-review, and processed entries.

| Project setting | Meaning |
| --- | --- |
| Name | The custom view's label. |
| Entry type | Root posts, direct replies, nested replies, or unknown reply depth. |
| Media type | Text, image, video, carousel, or unknown. |
| Keywords | Match mention text or root-post text; contains, exact, or regex matching; all/any/excluded words and case sensitivity. |
| Publication time | Start and end bounds. |
| Linked lead list | Destination for explicit capture; linking alone adds nobody. |
| Safe reply | Use a native browser composer handoff rather than an API send. |

The reply-settings side panel stores named reply choices with relative weights,
text/media, and optional linked-list tags. Text-only choices can use a separate
weighted random image pool. Preparing a choice does not send it or apply tags.

## ChatGPT workflow

1. Use `list_mentions`/`get_mention` for synced account data. Call `sync_mentions`
   when recent or older ingestion is requested; reuse the returned cursor for
   the next page. Reads alone do not request a sync.
2. Use `create_mention_project` or `update_mention_project` for the requested
   filters. Read `get_project` first; edits require the current rules revision.
   All mentions is virtual and must not be created or deleted as a project.
3. Call `process_mention_project` after sync when evaluation is requested.
   Inspect `list_mention_project_entries` and `get_mention_project_entry` for
   progress and per-entry results. Do not start another job just to check it.
4. For review, call `review_mention` with approved/rejected and the current
   `rulesRevision` and `contentFingerprint`. Review itself does not send or
   capture. Use `capture_mention_lead` to save the author to the linked list,
   optionally setting actual status/tag IDs. Capture and replying are separate.
5. For templates use `update_mention_reply_settings` at the current reply
   revision. Omit `randomImages` to preserve its pool; an empty array clears it.
   Use `prepare_mention_reply` with exactly one of explicit content, a template
   option, or random selection; template/random choices need `configRevision`.
   Reuse the chosen draft across retries instead of drawing again.
6. Use `send_mention_reply` for an explicitly requested send. Safe reply returns
   a handoff requiring the user's click; ordinary sends may be queued. Neither
   is a confirmed publication. Use `reconcile_mention_reply` for uncertainty or
   `link_mention_reply` for a real existing reply that the server can verify.

Only use `confirm_mention_reply_unsent` after the user explicitly confirms it was
not sent. Manual “replied” confirmation has server-enforced eligibility after a
successful verification at least ten minutes after handoff; never invent that
receipt. `undo_mention_reply_confirmation` undoes manual confirmation only.
An actual reply receipt or lead-capture receipt can complete handling; a queued
send or composer handoff alone does not.

Example: “Collect Threads mentions about delivery delays, exclude our own ads,
save approved authors to the support list, and prepare replies for review.”
