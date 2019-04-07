tell application "Google Chrome"
  set tab_link to (get URL of active tab of first window)
  set tab_title to (get title of active tab of first window)
  set md_link to ("[" & tab_title & "]" & "(" & tab_link & ")")
  set the clipboard to md_link
  display notification md_link with title "成功复制当前标签页链接到剪贴板"
end tell
