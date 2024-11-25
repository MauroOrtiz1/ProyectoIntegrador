// src/config/aws.js
const path = require('path');
const dotenv = require('dotenv');
const AWS = require('aws-sdk');

dotenv.config({ path: path.join(__dirname, '../../.env') });

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

module.exports = {
  dynamoDB: new AWS.DynamoDB.DocumentClient(),
  s3: new AWS.S3(),
  BUCKET_NAME: process.env.BUCKET_NAME,
};
