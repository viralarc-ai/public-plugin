# Post Manager: posts, history, and individual replies

## How people use the UI

Select the account, open **Post Manager**, and pick a post from the sidebar.
Search the local post list to locate a caption, then inspect the post and its
comment thread. **Load more** retrieves older post history or another comment
page. Post refresh and reading already loaded data are different operations.
People can write or generate a reply, edit the text, attach supported media,
and send to the selected target. Batch replies and future-comment automation
have their own setup controls; see [comment automation](comment-automation.md).

## ChatGPT workflow

1. Resolve the account with `list_connected_accounts`, then call
   `list_account_posts` with its actual platform. These reads support Threads,
   Instagram, and Facebook and return cached owned posts.
2. Read another cached page with `nextCursor` as `cursor`. When
   `needsHistoryLoad` is true, pass `historyCursor` to `load_more_account_posts`,
   then pass that action's `nextCursor` to `list_account_posts.cursor`. Null
   resumes the first page. Use `refresh_account_posts` when a refresh is wanted.
3. Select the actual post, then use `get_post_comments`. Use its returned `after`
   cursor for the next page and keep nested comments associated with their
   actual parents. An empty cached page does not establish complete history.
4. For one inspected comment, use `reply_to_post_comment` with the account,
   platform, post, and comment IDs and the user's text. This precise comment
   action currently supports text. For a direct Threads post reply, including
   supported already uploaded media, use `reply_to_threads_post`.
5. Report the receipt: sent, queued, blocked, failed, or uncertain. A post ID,
   comment ID, and queued-reply ID are different identifiers.

## Import commenters into a lead list

The UI's comment export lets people select or create a destination list and
choose whether to include nested replies. In chat, use `start_comment_export`
with `leadListId`, `accountId`, `platform`, `postId`, and `includeNested`.
The job fetches comments itself; reading every comment first is unnecessary
when the request is simply to import commenters. Inspect `get_comment_export`
using its returned job ID, report partial failures, and use
`cancel_comment_export` only when cancellation is requested. Already imported
entries remain. See [lead lists](lead-lists.md) for follow-up and CSV export.

Example: “Find my latest giveaway post, import its commenters and nested replies
into a new campaign list, and show me any import failures.”
