'use strict'

const fs = require('fs')
const AWS = require('aws-sdk')

/**
 * Expecting the following environment variables:
 *
 * export AWS_ACCESS_KEY_ID='AKID'
 * export AWS_SECRET_ACCESS_KEY='SECRET'
 */

AWS.config.region = 'us-east-1'
const s3bucket = new AWS.S3({params: {Bucket: 'mtgify.org'}})

function uploadFile(filePath) {
  return new Promise((resolve, reject) => {
    const body = fs.createReadStream(filePath)
    const params = {Key: filePath, Body: body}
    s3bucket.upload(params)
      .on('httpUploadProgress', evt => {
        console.log('upload progress:', evt)
      })
      .send((err, data) => {
        if (err) {
          console.log('upload failures:', err)
          reject(err)
        } else {
          console.log('upload success:', data)
          resolve(data)
        }
      })
  })
}

function listFolder(folderPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(folderPath, (err, files) => {
      const fileNames = []
      files.forEach(file => {
        fileNames.push(file)
      })
      resolve(fileNames)
    })
  })
}

function uploadFolder(folderPath, fileTypes) {
  return listFolder(folderPath).then(fileNames => {
    const promises = []
    fileNames.forEach(fileName => {
      const fileType = fileName.split('.').pop()
      if (fileTypes && !fileTypes.includes(fileType)){
        return;
      }
      promises.push(new Promise((resolve, reject) => {
        const filePath = folderPath + '/' + fileName
        uploadFile(filePath).then(resolve).catch(reject)
      }))
    })
    return Promise.all(promises)
  })
}

function uploadFilesSync(fileNames){
  const datas = []
  function getNext(fileIndex) {
    if (fileIndex < fileNames.length){
      return uploadFile(fileNames[fileIndex])
        .then(data => {
          datas.push(data)
          return getNext(fileIndex + 1)
        })
    } else {
      return new Promise((resolve, reject) => resolve(datas))
    }
  }
  return getNext(0)
}

module.exports = {
  uploadFile,
  uploadFolder,
  uploadFilesSync,
}
