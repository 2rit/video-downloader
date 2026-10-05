const express = require("express");
const path = require("path");
const { spawn } = require("child_process");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.get("/health", (req, res) => res.json({ ok: true }));
app.use(express.static(path.join(__dirname, "public")));

function validUrl(value) {
  try {
    const u = new URL(value);
    return ["http:", "https:"].includes(u.protocol);
  } catch {
    return false;
  }
}

app.post("/api/download", (req, res) => {
  const { url, quality = "best" } = req.body || {};

  if (!url || !validUrl(url)) {
    return res.status(400).json({ error: "กรุณาใส่ URL ที่ถูกต้อง" });
  }

  /*
    This endpoint expects yt-dlp to be installed on the server.
    It streams the selected media directly to the user's browser.
    Use only for content you have permission to download and where
    the source platform permits downloading.
  */
  const format =
    quality === "1080"
      ? "bestvideo[height<=1080]+bestaudio/best[height<=1080]"
      : quality === "720"
      ? "bestvideo[height<=720]+bestaudio/best[height<=720]"
      : quality === "480"
      ? "bestvideo[height<=480]+bestaudio/best[height<=480]"
      : "bestvideo+bestaudio/best";

  res.setHeader("Content-Type", "video/mp4");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="video-download.mp4"'
  );

  const child = spawn("yt-dlp", [
    "--no-playlist",
    "--merge-output-format", "mp4",
    "-f", format,
    "-o", "-",
    url
  ]);

  child.stdout.pipe(res);

  let errorText = "";
  child.stderr.on("data", d => {
    errorText += d.toString();
  });

  child.on("error", err => {
    if (!res.headersSent) {
      res.status(500).json({
        error: "เซิร์ฟเวอร์ยังไม่ได้ติดตั้ง yt-dlp",
        detail: err.message
      });
    } else {
      res.destroy(err);
    }
  });

  child.on("close", code => {
    if (code !== 0 && !res.destroyed) {
      if (!res.headersSent) {
        res.status(500).json({ error: "ดาวน์โหลดไม่สำเร็จ", detail: errorText });
      } else {
        res.end();
      }
    }
  });

  req.on("close", () => {
    if (!res.writableEnded) child.kill("SIGTERM");
  });
});

app.listen(PORT, () => {
  console.log(`Video Downloader running at http://localhost:${PORT}`);
});