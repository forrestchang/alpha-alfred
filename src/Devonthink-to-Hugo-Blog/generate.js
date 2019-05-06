/**
 * Constants
 */
const devonthink = Application('DEVONthink 3')
const blogPath = '/Users/jiayuan/Dropbox/personal-site/blog/content/post/'

const blogFolder = devonthink.databases.byName('02.Writing').parents.byName('Blog')


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

  // Get title
  const title = record.name()

  const metaData = {
    createdTime,
    updatedTime,
    fileName,
    tags,
    category,
    title
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
---
  `

  return yamlMetaString
}


/**
 * Main
 */

const selectedRecord = devonthink.selection()[0]
const metaData = getMetaData(selectedRecord)

const yamlMetaString = generateYamlMetaString(metaData)
const content = selectedRecord.plainText()
const blogPost = `${yamlMetaString}
${content}
`

writeToFile(metaData.fileName, blogPath, blogPost)
