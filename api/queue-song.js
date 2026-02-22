const { google } = require("googleapis");
const path = require("path");

const QUEUE_FOLDER_ID = process.env.GOOGLE_DRIVE_QUEUE_FOLDER_ID || "1cTp1M9V7vNEQuVyYifUW01Gwgu2uw1Vv";

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { videoId } = req.body || {};
  if (!videoId) {
    return res.status(400).json({ error: "Missing Video ID" });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(process.cwd(), "service-account.json"),
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });

    const drive = google.drive({ version: "v3", auth });

    await drive.files.create({
      requestBody: {
        name: `${videoId}.txt`,
        parents: [QUEUE_FOLDER_ID],
        mimeType: "text/plain",
      },
      media: {
        mimeType: "text/plain",
        body: videoId,
      },
      fields: "id",
      supportsAllDrives: true,
    });

    return res.status(200).json({ success: true, message: "Added to home server queue" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to queue song" });
  }
};
