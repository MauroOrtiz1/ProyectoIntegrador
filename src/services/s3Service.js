//src/services/s3Service.js
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const uploadToS3 = async (file, folder = 'imagenes') => {
  if (!file || !file.buffer || !file.mimetype) {
    throw new Error('Archivo inválido o faltante');
  }

  const bucketName = process.env.BUCKET_NAME;
  if (!bucketName) {
    throw new Error('El nombre del bucket no está configurado en las variables de entorno.');
  }

  const fileKey = `${folder}/${uuidv4()}.${file.originalname.split('.').pop()}`;

  const params = {
    Bucket: bucketName,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const { Location } = await s3.upload(params).promise();
  return Location;
};

const deleteFromS3 = async (key) => {
  const bucketName = process.env.BUCKET_NAME;
  if (!bucketName) {
    throw new Error('El nombre del bucket no está configurado en las variables de entorno.');
  }

  await s3.deleteObject({ Bucket: bucketName, Key: key }).promise();
};

module.exports = { uploadToS3, deleteFromS3 };
