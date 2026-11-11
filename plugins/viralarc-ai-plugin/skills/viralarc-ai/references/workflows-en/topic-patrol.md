# Workflow 1: Normal Topic Patrol — discover and engage

## How people configure this in ViralArc

Open **Topic Patrol**, select the social account, then add or edit a topic.
The editor collects the post type to find, **Why I'm finding posts / What I want
to say**, and **Your role**. **Rules** adds exclusions or conditional reply
instructions. Manual tracking lets people search, inspect results, generate a
reply, edit it, and send it individually.

| Setting | What to establish in chat |
| --- | --- |
| Topic and keywords | Audience, situation, and actual search phrases. Ad hoc search accepts up to five keywords per call. |
| Reply objective and role | Purpose, voice, and the identity represented by the reply. |
| Rules | When to exclude a post or apply different reply instructions. |
| Create Automation Project | Whether ViralArc should run this in the background. Keep it off when ChatGPT owns execution. |
| Send Mode | Auto Send, Manual Review, or No Comment; separate from whether scheduled execution is enabled. |
| Daily reply cap | Requested cap within the supported 1–40 range and applicable account limits. |
| Search time range | How far back to search. Preserve the user's time window. |
| LINE integration | Result summaries and highly relevant results are separate notification choices. Connect LINE in Accounts first. |
| Automatically add to a lead list | Destination list and qualification reason. Capture is independent of replying. |

Use `create_topic_tracking` or `update_topic_tracking` for saved configuration.
Read before patching. Creating a project does not start a ChatGPT schedule.
Read [orchestration](orchestration.md) when ChatGPT takes over recurring runs.

## ChatGPT workflow

Goal: find posts where an interaction can meet the user's objective, such as
helping prospective customers, offering a relevant service, or joining a useful
discussion. Normal tracking can prepare replies for review or send according to
the user's explicit instructions.

1. **Set the search and interaction intent.** Establish what posts to find,
   who the user represents, what their reply should achieve, and what to exclude.
   Reuse the relevant Business Profile when available. A saved project is
   optional for ad hoc work.
2. **Search and filter in one call.** Use `search_threads_posts` with `keywords`
   and `criteria`: `topic`, `requirements`, and optional `persona` and
   `advancedRules`. Alternatively, supply `projectId` to use saved settings, or
   use `search_topic_tracking_now` to run the saved project's keywords and
   settings. Search consumes existing credits; it does not send replies.
3. **Inspect the returned posts.** Read retained result pages using
   `get_threads_search_results` and the returned `executionId`. Explain which
   posts fit and preserve source text and links. The relevance scores 0, 1, and
   2 describe suitability for this interaction, not sentiment or crisis severity.
   To refine the selection, use `filter_threads_posts` on IDs from the snapshot
   instead of repeating the paid search. Report truncation and partial coverage.
4. **Add useful results to a lead list.** After results return, select or create
   the requested destination using `list_lead_lists` and `create_lead_list`.
   For source-linked capture, call `add_topic_result_to_lead_list` with
   `leadListId`, `accountId`, the associated owned `projectId`, the actual
   `postId`, and a short `reason`. This saves the author and original-post
   context without requiring a reply. If the user wants that context for an ad
   hoc search, create a paused Topic Patrol project first. For a simple
   handle-only addition, `add_lead_list_entry` works without a project.
5. **Draft and send as requested.** For a passing result associated with a
   project, use `prepare_topic_reply` to generate or save a pending draft, then
   `send_topic_reply` when sending is requested. For a direct reply to one actual
   post, use `reply_to_threads_post`; no saved project is required. ChatGPT can
   present and revise the text in chat. Apply any standing sending instructions
   only within their stated scope; search or lead capture does not authorize a
   reply by itself.
6. **Close the loop.** Report which posts were selected, which authors were
   saved, and which replies are drafts, sent, queued, or uncertain. Use receipts
   and `get_agent_action_status` to reconcile uncertain writes before another
   attempt. On a scheduled run, follow the same steps within the saved budget
   and interaction policy.

Example request: “Find recent Threads posts from people looking for a rental in
Taipei. Exclude agent ads and people who have already found a place. Add useful
results to my renter lead list and draft helpful replies for me to review.”
