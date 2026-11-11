# Performance, Traffic Stage, and link analytics

## How people inspect performance

**Automations** shows project reply/view/like counters. **Traffic Stage**, also
called Watchtower, lets people select a Threads post and inspect real-time
views, likes, replies, shares, and derived engagement indicators. Its 100-hour
curve tab is marked coming soon. Opening a live post view is different from
reading saved automation metrics.

Comment-to-DM setups with tracked links expose **Link analytics**: people choose
the link, data source, and time range, then inspect clicks, estimated visitors,
last access, and available location/referrer/device breakdowns.

## ChatGPT workflow

1. Resolve the intended account/project and whether the question concerns
   delivery activity, automated-reply performance, or link activity.
2. Use `get_automation_status` for bounded execution/delivery history. Use
   `get_automation_insights` for cached Threads/Instagram reply totals and
   tracked-link click metrics. It does not include Facebook automated-reply
   performance in these aggregates. Preserve timestamps, coverage labels, and
   project truncation rather than claiming complete or live coverage.
3. Separate publication counts from engagement metrics, and report unavailable
   data as unavailable. A failed read is not evidence that the count is zero.
4. The normal MCP catalog does not expose Watchtower's live polling/curves or
   all detailed click-chart breakdown controls. Direct the user to the relevant
   UI for those views; do not fabricate a live refresh or a metric tool.

To enable tracking, configure actual links in the comment automation and check
capabilities/entitlements first. Do not replace saved tracked links merely to
view statistics; editing and reading are separate actions.

Example: “Compare cached reply performance for these two automations and show
their tracked-link clicks, with the limits of the available data.”
