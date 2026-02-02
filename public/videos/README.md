# Demo Videos

This folder contains demo videos for the landing page.

## Adding Your Demo Video

### Option 1: Local MP4 Video (Self-Hosted)

1. **Record your demo video** using one of these methods:
   - Loom (easiest) - see `docs/demo-video-README.md`
   - Automated script: `npx tsx scripts/record-demo.ts`
   - Manual recording with OBS Studio

2. **Export as MP4** with these settings:
   - Resolution: 1920x1080 (or 1280x720 for smaller file)
   - Format: MP4 (H.264)
   - Frame rate: 30fps
   - Bitrate: 5-10 Mbps

3. **Optimize file size** (optional but recommended):
   ```bash
   # Using FFmpeg to compress
   ffmpeg -i demo-original.mp4 -vcodec libx264 -crf 28 demo.mp4

   # This reduces file size by ~70% with minimal quality loss
   ```

4. **Place the video here**:
   ```
   public/videos/demo.mp4
   ```

5. **Update the component** (if needed):
   Edit `components/landing/VideoDemo.tsx`:
   ```typescript
   const VIDEO_CONFIG = {
     source: 'local',
     localVideo: '/videos/demo.mp4',
     duration: '1:30'
   }
   ```

6. **Done!** The video will appear on the homepage at http://localhost:3000

---

### Option 2: YouTube Embed

1. **Upload to YouTube**:
   - Go to [YouTube Studio](https://studio.youtube.com)
   - Upload your demo video
   - Set title: "AI Architect Accelerator Demo"
   - Add description and tags
   - Set visibility (Public or Unlisted)

2. **Get the Video ID**:
   From the URL: `youtube.com/watch?v=dQw4w9WgXcQ`
   The video ID is: `dQw4w9WgXcQ`

3. **Update the component**:
   Edit `components/landing/VideoDemo.tsx`:
   ```typescript
   const VIDEO_CONFIG = {
     source: 'youtube',
     youtubeVideoId: 'dQw4w9WgXcQ', // Your video ID
     duration: '1:30'
   }
   ```

4. **Done!** The YouTube video will embed on the homepage

---

## File Size Recommendations

### For Local Videos

| Quality | Resolution | File Size (90 sec) | Use Case |
|---------|-----------|-------------------|----------|
| **High** | 1920x1080 | 50-80 MB | Desktop, broadband |
| **Medium** | 1280x720 | 20-30 MB | Recommended ✅ |
| **Low** | 854x480 | 10-15 MB | Mobile, slow connections |

**Recommended**: 1280x720 at ~25 MB for best balance of quality and load time.

### Compression Tips

```bash
# Compress to target file size (~25 MB)
ffmpeg -i input.mp4 -b:v 2000k -maxrate 2500k -bufsize 5000k output.mp4

# Or use constant quality (CRF 23-28 is good)
ffmpeg -i input.mp4 -vcodec libx264 -crf 25 output.mp4
```

---

## Custom Thumbnail (Optional)

To add a custom thumbnail image (shown before video plays):

1. Create a thumbnail image (1280x720 pixels)
2. Place it in: `public/images/video-thumbnail.jpg`
3. Update component:
   ```typescript
   const VIDEO_CONFIG = {
     thumbnail: '/images/video-thumbnail.jpg'
   }
   ```

---

## Testing

### Local Testing

```bash
# Start dev server
npm run dev

# Visit homepage
open http://localhost:3000
```

### Check Video Loading

1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Look for `demo.mp4` - should load successfully
5. Click play button - video should play smoothly

### Test Performance

- Video should start playing within 2-3 seconds
- No buffering on good connection
- Mobile responsive (scales correctly)

---

## Git & Version Control

### Should You Commit Videos?

**For small videos (<25 MB)**: OK to commit
**For large videos (>25 MB)**: Use Git LFS or host externally

#### Option 1: Commit to Git (Small Files)

```bash
git add public/videos/demo.mp4
git commit -m "feat: add demo video to landing page"
git push
```

#### Option 2: Use Git LFS (Large Files)

```bash
# Install Git LFS
git lfs install

# Track video files
git lfs track "*.mp4"

# Commit .gitattributes
git add .gitattributes
git commit -m "chore: track videos with Git LFS"

# Add and commit video
git add public/videos/demo.mp4
git commit -m "feat: add demo video to landing page"
git push
```

#### Option 3: External Hosting (Best for Large Files)

Host on:
- YouTube (free, unlimited)
- Cloudflare Stream ($1/month for 1000 minutes)
- AWS S3 + CloudFront (pay per GB)
- Vimeo ($7/month)

---

## Troubleshooting

### Video Doesn't Play

**Check:**
- File exists at `public/videos/demo.mp4`
- File format is MP4 (H.264)
- Browser supports video playback
- No console errors in DevTools

**Fix:**
```bash
# Verify file exists
ls -lh public/videos/demo.mp4

# Check file format
ffprobe public/videos/demo.mp4
```

### Video Too Large / Slow Loading

**Solution: Compress the video**
```bash
# Reduce file size by 70%
ffmpeg -i demo.mp4 -vcodec libx264 -crf 28 demo-compressed.mp4
```

### Video Quality Issues

**Solution: Increase bitrate**
```bash
# Higher quality (larger file)
ffmpeg -i input.mp4 -b:v 4000k output.mp4
```

---

## Need Help?

See full demo creation guide: `docs/demo-video-README.md`

Questions? Open an issue on GitHub.
