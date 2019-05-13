/**
 * Constants
 */
const devonthink = Application('DEVONthink 3')
const blogPath = '/Users/jiayuan/Dropbox/personal-site/blog/content/post/'


/**
 * Utils
 */

function formatTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (('' + time).length === 10) time = parseInt(time) * 1000
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    let value = formatObj[key]
    if (key === 'a') return ['一', '二', '三', '四', '五', '六', '日'][value - 1]
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}


/**
 * Functions
 */

function writeToFile(filename, path, content) {
  if (!path.endsWith('/')) {
    path = path + '/'
  }
  filePath = path + filename

  contentEncoded = $.NSString.alloc.initWithUTF8String(content);
  contentEncoded.writeToFileAtomicallyEncodingError(filePath, true, $.NSUTF8StringEncoding, null);
}

function getMetaData(record) {

  // Get created time
  const createdTime = formatTime(record.creationDate(), '{y}-{m}-{d}')

  // Get updated time
  const updatedTime = formatTime(record.modificationDate(), '{y}-{m}-{d}')

  // Get file name
  const customMetaData = record.customMetaData()
  let fileName = customMetaData.mdblogfilename
  if (!fileName.endsWith('.md')) {
    fileName = fileName + '.md'
  }

  // Get tags
  const tags = record.tags()

  // Get categories
  const category = customMetaData.mdcategory

  // Get draft info
  const isDraft = customMetaData.mddraft

  // Get title
  const title = record.name()

  const metaData = {
    createdTime,
    updatedTime,
    fileName,
    tags,
    category,
    title,
    isDraft
  }

  return metaData
}

function generateYamlMetaString(metaData) {
  let yamlMetaString = `---
title: ${metaData.title}
date: ${metaData.createdTime}
lastmod: ${metaData.updatedTime}
categories: [${metaData.category}]
tags: [${metaData.tags}]
draft: ${metaData.isDraft === true}
---
  `

  return yamlMetaString
}


function main() {
  const blogPosts = devonthink.databases.byName('02.Writing').parents.byName('Blog').children()

  for (let i = 0; i < blogPosts.length; i++) {
    const selectedRecord = blogPosts[i]

    const metaData = getMetaData(selectedRecord)

    const yamlMetaString = generateYamlMetaString(metaData)
    const content = selectedRecord.plainText()
    const blogPostContent = `${yamlMetaString}
${content}
`
    writeToFile(metaData.fileName, blogPath, blogPostContent)
  }

  const app = Application.currentApplication()
  app.includeStandardAdditions = true

  app.displayNotification(`You have generated ${blogPosts.length} articles.`, { withTitle: 'Success' })

  app.doShellScript('sh ~/Dropbox/personal-site/blog/update.sh')
  app.displayNotification('Uploaded to GitHub.', { withTitle: 'Success' })
}

/**
 * Main
 */
main()

