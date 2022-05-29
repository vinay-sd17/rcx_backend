import {S3} from 'aws-sdk';
import {Logger} from '@nestjs/common';
import * as fs from "fs";

var path = require('path');

export class FileService {
  async upload(file, originalFileName) {
    let bucketS3 = process.env.AWS_BUCKET_NAME + '/blobs';
    return await this.uploadS3(file.buffer, bucketS3, originalFileName);
  }

  async listMatchingFiles(file) {
    const s3 = this.getS3();
    let bucketS3 = process.env.AWS_BUCKET_NAME;
    var options = {
      Bucket: bucketS3,
      Prefix: 'blobs/' + file,
    };
    let files = [];
    var filesList = await s3.listObjectsV2(options).promise();
    if (filesList && filesList.Contents && filesList.Contents.length > 0) {
      filesList.Contents.forEach(f => {
        files.push(f.Key);
      });
    }
    return files;
  }

  async download(file, path) {
    const downloadPath = path + '/' + file;
    var options = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: file,
    };
    const result: any = await this.getS3()
        .getObject(options)
        .promise();
    let dir = path + '/' + file;
    this.ensureDirectoryExistence(dir);
    fs.writeFileSync(downloadPath, result.Body);
    await fs.createReadStream(downloadPath);
  }

  async uploadS3(file, bucket, name) {
    const s3 = this.getS3();
    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: file,
    };
    return new Promise((resolve, reject) => {
      s3.upload(params, (err, data) => {
        if (err) {
          Logger.error(err);
          reject(err.message);
        }
        resolve(data);
      });
    });
  }

  getS3() {
    return new S3({
      apiVersion: '2006-03-01',
      signatureVersion: 'v4',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }

  ensureDirectoryExistence(filePath) {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
      return true;
    }
    this.ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
  }
}
