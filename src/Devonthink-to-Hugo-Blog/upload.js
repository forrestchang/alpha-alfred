const app = Application.currentApplication()
app.includeStandardAdditions = true

app.doShellScript('sh ~/Dropbox/personal-site/blog/update.sh')
app.displayNotification('Uploaded to GitHub.', { withTitle: 'Success' })
