# Workflow 2: Reputation Monitoring — monitor, assess, and follow up

## How people configure tracking-only work

In Topic Patrol, choose **No Comment**, then enable **Automatically add to a
lead list** and choose the destination and qualification reason. No Comment
controls replies; the automation switch controls background runs. The separate
Keyword Tracking screen is not a prerequisite for this workflow.

When ChatGPT takes over, pause the saved project and follow
[orchestration](orchestration.md). Keep inclusion criteria about the brand or
issue even when a post would be unsuitable for a reply. A list can represent
support follow-up or reputation risks as well as sales prospects.

## ChatGPT workflow

Goal: understand what people are saying about a brand, product, competitor, or
issue. Keep relevant complaints, risks, questions, and praise even when posting
a public reply would be inappropriate. Tracking and saving a finding are
independent of engaging with its author.

ViralArc's tracking-only behavior is called `no-comment`: background execution
can search and capture qualified authors without generating or sending replies.
ChatGPT can perform the equivalent discovery, assessment, and capture steps
directly, with the following monitoring-specific choices.

1. **Define the monitoring brief.** Agree on brands and aliases, products,
   issues, date range, exclusions, what counts as an important change, and the
   destination list for findings. Set a reporting cadence if recurring checks
   are requested. Keep an associated saved project paused when ChatGPT owns
   the runs.
2. **Search broadly before assessing sentiment.** Call `search_threads_posts`
   with the account, keywords, order, and date range, omitting both `criteria`
   and `projectId` to disable its reply-suitability filter. Read saved project
   context separately. That filter asks whether a post is worth replying to;
   using it as the monitoring gate could discard relevant criticism or other
   posts that should be observed without a reply.
3. **Assess actual results in ChatGPT.** Read retained pages with
   `get_threads_search_results`, including `alreadyReplied` posts where relevant:
   an earlier interaction does not make a discussion irrelevant to monitoring.
   Check brand/topic relevance, then summarize sentiment, the issue, evidence,
   and urgency. Distinguish a question, routine complaint, potential crisis,
   and strong praise. Identify uncertain interpretations and avoid inventing
   reach, intent, or facts about the author. This assessment is separate from
   the search tool's relevance score; an unfiltered result has not passed an AI
   sentiment check. State the search's bounds and truncation.
4. **Save findings after results come back.** Use
   `add_topic_result_to_lead_list` for selected posts, supplying the destination
   list, associated owned project, account, actual post ID, and a concise reason
   such as “Customer reports repeated delivery failures; needs support follow-up.”
   A lead list can serve as the follow-up queue for monitoring findings as well
   as sales opportunities. No public reply is needed. For project-free,
   handle-only capture, use `add_lead_list_entry`. After reading the saved entry
   and list's available statuses/tags, use `update_lead_list_entry` for supported
   notes and follow-up fields. Do not claim a structured crisis flag was saved
   unless the tool result confirms it.
5. **Brief the user and decide on engagement separately.** Present the source
   links, issue summaries, saved findings, and recommended next steps. Highlight
   urgent items in the ChatGPT report. Monitoring does not automatically send
   replies or contact another person. If the user requests a response, draft it
   in chat and use the reply tools under the requested sending policy.
6. **Repeat and compare when scheduled.** Use prior lead records and their
   timelines to distinguish new posts from previously reviewed findings. Report
   meaningful changes or a requested digest. Reuse the current run's execution
   for pagination; do not repeat searches merely to inspect their results.

Example request: “Every weekday morning, check Threads for discussion of our
brand and delivery issues. Save relevant complaints and strong praise to my
brand-monitoring list. Tell me about new urgent findings; do not post replies.”

These workflows apply to the user's accessible self-service accounts and
projects. A separate enterprise review board or campaign task is not controlled
by the normal-agent tools merely because it also uses the term reputation monitoring.
