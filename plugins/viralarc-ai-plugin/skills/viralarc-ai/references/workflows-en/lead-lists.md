# Lead List: capture, qualify, follow up, and export

## How people use the UI

Open **Lead List**, create a list with a name, optional emoji, and description,
then select it. People can add rows manually, edit names and scores inline,
change statuses/tags, write notes, filter by status, and select rows for deletion.
Opening an entry shows original posts, notes, and its activity timeline.

**Preferences** has separate tabs:

| Tab | Settings |
| --- | --- |
| Displayed columns | Show/hide and reorder the list's columns. |
| Status chips | Names, colors, default status, and which statuses count in aggregate stats. |
| Tags | Available tags and defaults. |
| Sharing | Enable/copy/open a public link; eligible organization users can choose organization view/edit sharing. |

People also add entries from Topic Patrol results, Reply History, post commenters,
and mention projects. These preserve different source and interaction context.
Capturing a useful result never requires sending a reply first.

## ChatGPT workflow

1. Read `list_lead_lists` and `get_lead_list` to resolve the actual destination
   and its options. Create with `create_lead_list`. Read all relevant pages of
   `list_lead_list_entries` before claiming complete coverage or choosing rows.
2. Choose the right capture operation:

| Source | Tool and required context |
| --- | --- |
| A social handle | `add_lead_list_entry` with the actual platform and handle. |
| A returned Topic Patrol or monitoring post | `add_topic_result_to_lead_list` with the list, owned project, account, actual post, and reason. |
| Selected reply-history records | `import_reply_history_to_lead_list` using eligible `threads_auto_reply_log_id` values as `replyHistoryIds`; a pending draft ID is not a reply-log ID. |
| Commenters on an owned post | `start_comment_export` with the account/post/platform and explicit `includeNested` choice. |
| A reviewed project mention | `capture_mention_lead` with the current project entry revision and fingerprint. |

3. Use `get_lead_list_entry_timeline` to understand previous sources and
   interactions. Use `update_lead_list_entry` for supported display name, score,
   status, tags, and notes. Use real option IDs; omitted values preserve settings,
   while explicit empty/null values can clear supported fields.
4. Use `update_lead_list` to change supported names, descriptions, status/tag
   definitions and defaults, or column preferences. Preserve existing IDs and
   options still used by entries. The UI's organization-sharing permissions and
   status aggregate-count setting are not exposed as these tool arguments.
5. Public sharing uses the separate `set_lead_list_public_sharing` action and
   requires the user's intent to publish access. Use `delete_lead_list_entries`
   for selected rows or `delete_lead_list` for an intended list deletion; linked
   projects and other service checks may prevent deletion.
6. Use `export_lead_list_csv` for a download link. Export is distinct from a
   comment-import job. Track imports with `get_comment_export`; cancelling via
   `cancel_comment_export` leaves already imported entries in place.

A stored post can justify sales follow-up, customer support, or reputation
monitoring. Explain the reason using observed facts. Editable scores and a
displayed AI-crisis indicator are different fields; do not claim a manual
capture has set a crisis marker without a confirmed result.

Example: “Save these search results to the rental list, tag the relevant leads,
add notes explaining why they fit, then give me a CSV download.”
