const { google } = require("googleapis");
const fs = require("fs");
const cron = require("node-cron");

const s3 = require("../s3");

let SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
];

const imageUploadFromDriveToS3 = async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: SCOPES,
  });
  const authClientObject = await auth.getClient();
  const googleDriveInstance = google.drive({
    version: "v3",
    auth: authClientObject,
  });
  const folderId = process.env.DRIVE_FOLDER_ID;
  const files = await googleDriveInstance.files.list({
    auth,
    folderId,
    q: "mimeType contains 'image/png' and trashed = false",
  });
  await files.data.files.forEach(async (file) => {
    let isCompress = false;
    const dest = fs.createWriteStream("uploads/" + file.name);
    const res = await googleDriveInstance.files.get(
      { auth, fileId: file.id, alt: "media" },
      { responseType: "stream" }
    );

    res.data.pipe(dest).on("finish", async () => {
      const fileSize = fs.statSync(dest.path).size;
      if (fileSize >= 2 * 1024 * 1024) {
        isCompress = true;
      }
      await s3.uploadImage(dest.path, isCompress);
    });
  });
};

const imageUploadFromDriveToS3Scheduler = function () {
  cron.schedule(
    process.env.IMAGE_UPDATE_SCHEDULER_TIME,
    async () => {
      try {
        console.log("file upload started");
        await imageUploadFromDriveToS3();
        console.log("file upload finished");
      } catch (error) {
        console.log("imageUploadFromDriveToS3Scheduler", error);
      }
    },
    {
      timezone: "Asia/Kolkata",
    }
  );
};

module.exports = { imageUploadFromDriveToS3Scheduler };
