const { S3Client } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT || "http://localhost:9000",
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
});

console.log("S3 endpoint :", process.env.S3_ENDPOINT);
console.log("S3 region :", process.env.S3_REGION);
console.log(
  "S3 access key correspond au root user :",
  process.env.S3_ACCESS_KEY === process.env.MINIO_ROOT_USER,
);

module.exports = s3Client;
