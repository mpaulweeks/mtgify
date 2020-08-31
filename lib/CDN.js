'use strict'

const fs = require('fs')
const { Storage } = require('@google-cloud/storage');

/**
 * Expecting the following environment variables:
 */

// Creates a client
const storage = new Storage();

function getBucket() {
  return storage.bucket('mtgify.org');
}

async function uploadFile(filePath) {
  console.log(`uploading:`, filePath);

  // Uploads a local file to the bucket
  try {
    await getBucket().upload(filePath, {
      // Support for HTTP requests made with `Accept-Encoding: gzip`
      gzip: true,
      destination: filePath,
    });
    console.log('success');
  } catch (err) {
    console.log(err);
  }
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
      if (fileTypes && !fileTypes.includes(fileType)) {
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

function uploadFilesSync(fileNames) {
  const datas = []
  function getNext(fileIndex) {
    if (fileIndex < fileNames.length) {
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
