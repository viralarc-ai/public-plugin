# 自動化總覽、回覆紀錄與發送佇列

## 使用者在介面中的操作

「自動化總覽」依帳號與平台整理專案，並區分海巡及留言自動化。使用者可搜尋
專案、檢查執行或暫停狀態與統計、開啟設定、暫停或恢復單一專案或帳號群組，
以及刪除指定專案。暫停改變持續執行，不會撤回已排程或已發布的回覆。

「回覆紀錄」分為先前回覆、等待人工審核與正在排程。使用者可查看原文及回覆、
修改並發送或略過待審草稿，以及選取符合資格的紀錄加入客戶名單。排程回覆
可透過佇列控制取消或要求立即發送。

## ChatGPT 工作流程

1. 用 `list_projects` 與 `get_project` 確認專案。以 `get_automation_status`
   查執行狀態及有限範圍的發送紀錄，`get_automation_insights` 查快取指標，
   並閱讀資料涵蓋範圍。
2. 依類型使用 `pause_topic_tracking` / `resume_topic_tracking` 或
   `pause_comment_automation` / `resume_comment_automation`。要求整組操作時，
   列出可存取的專案並逐項回報，不要說成一次不可分割的群組變更。
3. 用對應專案設定操作編輯，保留無關設定。確定刪除時才使用
   `delete_topic_tracking` 或 `delete_comment_automation`。將定期工作移交
   ChatGPT 時，閱讀[統籌執行](orchestration.md)，避免無意間同時執行兩套排程。
4. 用 `list_reply_history` 的 `kind` 選擇 pending、scheduled 或 replied。
   發送選定草稿用 `send_topic_reply`，可提供修改後文字；不需要的草稿用
   `skip_topic_reply` 拒絕。這些操作使用實際待審回覆 ID，不是貼文或紀錄 ID。
5. 使用 `cancel_scheduled_reply` 或 `send_scheduled_reply_now` 前，先讀取
   `list_scheduled_replies`，將排程項目的實際 ID 作為 `replyId`。立即發送
   仍受連接、點數、重複與速率檢查限制，也可能繼續排程。取消無法撤回已
   發布的回覆。
6. 發布結果不明時，用回傳的執行 ID 查詢 `get_agent_action_status`，不要因
   結果未知而自動再次發送。

自助式 Threads 排程回覆會保留媒體與發送保護。Instagram／Facebook 純文字
留言支援原生立即發送，但既有排程器不支援其自動佇列發送。確定尚未發布的
失敗可允許重試，無法確認的發布可能持續保留發送鎖，直到查明。依紀錄回報。

將選定的已發送紀錄收錄時，使用 `import_reply_history_to_lead_list`，詳見
[客戶名單](lead-lists.md)。

範例：「暫停租屋海巡，檢視待審草稿，發送這則修改後的回覆，並取消我選的
兩則排程回覆。」
