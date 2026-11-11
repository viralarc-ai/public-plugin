# 貼文管理：貼文、歷史紀錄與單則回覆

## 使用者在介面中的操作

選擇社群帳號，進入「貼文管理」，再從側欄選取貼文。可搜尋已載入的貼文列表
來找文案，並查看貼文及其留言串。「載入更多」會取得較早的貼文紀錄或下一頁
留言。重新整理與閱讀已載入的資料是不同操作。使用者可以撰寫或產生回覆、
修改文字、加入支援的媒體，再發送至指定對象。批次回覆與未來留言的自動化
各有設定入口，詳見[留言自動化](comment-automation.md)。

## ChatGPT 工作流程

1. 用 `list_connected_accounts` 確認帳號，再以實際平台呼叫
   `list_account_posts`。這些讀取支援 Threads、Instagram 與 Facebook，
   回傳已快取的自有貼文。
2. 將 `nextCursor` 傳為 `cursor` 以讀取下一頁快取。當 `needsHistoryLoad`
   為 true，將 `historyCursor` 傳入 `load_more_account_posts`，再把該操作
   的 `nextCursor` 傳入 `list_account_posts.cursor`；值為 null 時從第一頁
   讀取。需要重新整理時，使用 `refresh_account_posts`。
3. 選定實際貼文，再使用 `get_post_comments`。下一頁沿用回傳的 `after`
   游標，並保留巢狀留言與上層留言的關係。快取頁面沒有資料不代表歷史完整。
4. 回覆已檢視的單一留言時，用 `reply_to_post_comment` 提供帳號、平台、
   貼文、留言 ID 與使用者的文字。這個單則留言操作目前支援純文字。若要
   直接回覆 Threads 貼文，包含支援且已上傳的媒體，使用
   `reply_to_threads_post`。
5. 依紀錄回報已發送、正在排程、遭限制、失敗或尚未確認。貼文 ID、留言 ID
   與排程回覆 ID 是不同的識別資訊。

## 將留言者匯入客戶名單

介面中的留言匯出可選擇或建立目標名單，並決定是否包含巢狀回覆。對話中使用
`start_comment_export`，提供 `leadListId`、`accountId`、`platform`、
`postId` 與 `includeNested`。工作本身會讀取留言；若使用者只要求匯入留言者，
不必先逐頁讀完所有留言。用回傳的工作 ID 查詢 `get_comment_export`，如實
回報部分失敗，並僅在使用者要求時使用 `cancel_comment_export`。已匯入的
項目會保留。後續追蹤與 CSV 匯出請見[客戶名單](lead-lists.md)。

範例：「找到我最新的抽獎貼文，將留言者和巢狀回覆的作者匯入新的活動名單，
並告訴我哪些項目匯入失敗。」
