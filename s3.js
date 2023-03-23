require("dotenv").config();
const fs = require("fs");
const sharp = require("sharp");
const S3 = require("aws-sdk/clients/s3");

const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const bucket = process.env.AWS_BUCKET_NAME;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

const uploadImage = async (filePath, isCompress = false) => {
  fs.readFile(filePath, async (err, data) => {
    let body = data;
    if (err) {
      console.log(err);
      throw err;
    } else {
      if (isCompress) {
        body = await sharp(body).resize(1000).png({ quality: 90 }).toBuffer();
      }

      const uploadParams = {
        Bucket: bucket,
        ACL: "public-read",
        Body: body,
        Key: filePath,
      };
      const data = await s3.upload(uploadParams).promise();
      fs.unlinkSync(filePath);
      console.log(data);
      return;
    }
  });
};

module.exports = {
  uploadImage,
};
