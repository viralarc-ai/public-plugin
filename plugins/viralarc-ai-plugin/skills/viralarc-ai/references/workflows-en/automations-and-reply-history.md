# Automations, Reply History, and delivery queues

## How people use the UI

**Automations** groups projects by account/platform and separates patrol from
reply automation. People search projects, inspect running/paused state and
counters, open settings, pause/resume a project or an account group, and delete
an intended project. A pause changes ongoing execution; it does not withdraw
already queued or published replies.

**Reply History** has separate previous-reply, pending-approval, and scheduled
tabs. People inspect original and reply text, edit/send/skip pending drafts, and
select eligible history records to import into a customer list. Scheduled rows
can be cancelled or requested for immediate delivery through queue controls.

## ChatGPT workflow

1. Resolve projects with `list_projects` and `get_project`. Use
   `get_automation_status` for execution state and bounded delivery logs, and
   `get_automation_insights` for cached metrics. Read their coverage labels.
2. Use `pause_topic_tracking`/`resume_topic_tracking` or
   `pause_comment_automation`/`resume_comment_automation` for the correct type.
   For a requested group operation, enumerate accessible projects and report
   each outcome rather than implying a single atomic group change.
3. Edit through the matching project settings action. Preserve unrelated
   settings. Use `delete_topic_tracking` or `delete_comment_automation` only for
   intended deletion. Read [orchestration](orchestration.md) when moving recurring
   work to ChatGPT; do not leave both schedulers running unintentionally.
4. Use `list_reply_history` with `kind` pending, scheduled, or replied. Send a
   selected draft with `send_topic_reply`, optionally providing edited text;
   use `skip_topic_reply` to reject an unwanted draft. Those actions use the
   actual pending reply ID, not a post ID or log ID.
5. Use `list_scheduled_replies` before `cancel_scheduled_reply` or
   `send_scheduled_reply_now`, then pass the queued row's actual ID as `replyId`.
   Immediate delivery still enforces connection, credit, duplicate, and rate
   checks and can remain queued. Cancellation cannot undo a published reply.
6. Use `get_agent_action_status` for a returned execution ID when publication is
   uncertain. Unknown results must not trigger another automatic send.

Queued self-service Threads replies preserve their media and router protections.
Queued Instagram/Facebook text comments support native send-now, but their
automatic delivery is unavailable in the legacy scheduler. A known unsent
failure can permit retry; an uncertain publication can remain claimed until
reconciled. Report what the receipt establishes.

For capture from selected sent-history records, use
`import_reply_history_to_lead_list`; see [lead lists](lead-lists.md).

Example: “Pause my rental patrol, review its pending drafts, send this edited
reply, and cancel the two queued replies I selected.”
