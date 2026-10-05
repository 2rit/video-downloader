# Video Downloader — Deploy Ready

## Option 1: Render
1. Put this project in a GitHub repository.
2. On Render choose **New → Web Service**.
3. Connect the repository.
4. Choose **Docker**.
5. Deploy.

The included `Dockerfile` installs Node.js, FFmpeg and yt-dlp.

Health check:
`/health`

## Option 2: Any Docker host

```bash
docker build -t video-downloader .
docker run -p 3000:3000 video-downloader
```

Open:
`http://localhost:3000`

## Important
Use this service only for content you are authorized to download and where the source platform's terms permit downloading.

## Production limitations
Free hosting can have sleep/cold-start limits, bandwidth limits and request timeouts. Large video files can also consume server bandwidth quickly. For a public service with many users, object storage and a queue are recommended rather than streaming every file through one web server.
