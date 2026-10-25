const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");

const presigner = require("@aws-sdk/s3-request-presigner");
const s3Client = require("../config/S3");

const BUCKET = process.env.S3_BUCKET || "fleettrack-documents";
const URL_TTL = 15 * 60;

const uploadPdf = async ({ key, buffer }) => {
  if (!key || !Buffer.isBuffer(buffer)) {
    throw new Error("Une clé S3 et un Buffer PDF sont obligatoires");
  }

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: "application/pdf",
    }),
  );

  return {
    bucket: BUCKET,
    s3Key: key,
    sizeBytes: buffer.length,
  };
};

const genererUrlTelechargement = async (key) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  return presigner.getSignedUrl(s3Client, command, {
    expiresIn: URL_TTL,
  });
};

module.exports = {
  uploadPdf,
  genererUrlTelechargement,
};
