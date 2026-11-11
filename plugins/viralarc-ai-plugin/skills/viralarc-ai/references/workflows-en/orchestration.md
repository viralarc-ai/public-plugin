# Let ChatGPT orchestrate Topic Patrol

First establish the account, objective, keywords, time window, exclusions, and
whether the user wants replies, monitoring only, or both. Read existing projects
with `list_projects` and `get_project` when the user names a saved workflow. Check
`get_automation_capabilities` for the selected account. The ad hoc search tools
in these workflows currently support Threads.

| Work normally handled by ViralArc | How ChatGPT handles it |
| --- | --- |
| Configure a topic in the UI | Collect the user's objective in chat; reuse a saved project or pass explicit search criteria. |
| Cron chooses when to search | Run when asked, or through a user-requested ChatGPT scheduled task with this plugin connected. |
| Search and filter the posts | Call the search tools, inspect real results, and decide which next step fits the objective. |
| Review results and reply drafts in the UI | Present source links, explain selections, and refine drafts in conversation. |
| Capture qualified people | Add selected results to a lead list after the search returns, independently of replying. |
| Summarize a run | Report findings, saved leads, draft/send outcomes, and anything requiring attention. |

When the user wants ChatGPT to take over an existing project's scheduled runs,
use `pause_topic_tracking` or `update_topic_tracking` with
`automationEnabled: false`. Create new saved projects with
`automationEnabled: false` when ChatGPT will own their execution. Searches can
still use a paused project's settings. Setting `automationMode: "no-comment"`
alone does not transfer scheduling: an enabled no-comment project can still run
in ViralArc's background lead-capture workflow.

This transfers the search-and-decision loop to ChatGPT. ViralArc still performs
authenticated searches, persistence, publishing, duplicate checks, and quota
enforcement. Replies queued by the publishing service retain their delivery
schedule; pausing a project does not cancel them. Inspect
`list_scheduled_replies` and cancel only when the user requests cancellation.

For recurring work, use a ChatGPT surface with scheduled tasks and plugin access
enabled. Test one run first, then save the account/project/list IDs, objective,
cadence and timezone, search budget, reply policy, and reporting rules in the
task instructions. Follow the host's scheduling and permission flow. A normal
chat request by itself does not establish recurring execution. See
[ChatGPT scheduled tasks](https://learn.chatgpt.com/docs/automations).

At each run, reuse saved lead records and reply history to identify already
handled posts. Search snapshots and action receipts expire after 24 hours;
retain durable follow-up context in the lead list or the scheduled task's
supported context. Do not depend on an old execution ID for long-term memory.
Keep quiet on unchanged monitoring results unless the user requests a regular
digest; surface new findings, important changes, failures, or required action.

## Access, errors, and recovery

The `mcp:all` grant exposes tools available to the user; it does not bypass
ownership, plan limits, provider limitations, or credits. Billing tools provide
readable summaries and history, not authority to purchase or change subscriptions.
CreatorOS-only and administrative operations are outside this MCP connection.

Use an action's `executionId` with `get_agent_action_status` after timeouts or
unknown results. A claimed/running receipt is not success. A failed receipt can
explain a supported retry; a publication whose outcome remains unknown must not
be sent again automatically. Refresh grants eventually expire or are revoked;
when the host requires reconnection, guide the user through OAuth again.
