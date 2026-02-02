# Creating the Demo Video

Quick guide to create a professional demo video for AI Architect Accelerator.

## 🎬 Quick Start (Easiest)

### Option 1: Use Loom (5 minutes)

1. Install [Loom extension](https://www.loom.com/)
2. Open http://localhost:3000
3. Click Loom → Record screen
4. Follow the script in `demo-video-script.md`
5. Stop recording → Loom auto-edits
6. Share link or download MP4

**Best for**: Quick demos, social media sharing

---

### Option 2: Automated Recording (10 minutes)

```bash
# Make sure app is running
npm run dev

# In another terminal, run the recording script
npx tsx scripts/record-demo.ts

# Output: demos/aicelerate-demo-{timestamp}.webm
```

**What it does**:
- Opens browser automatically
- Navigates through key pages
- Smooth scrolls and highlights
- Records everything

**Then**:
- Add voiceover in iMovie/DaVinci Resolve
- Add text overlays from script
- Export MP4

**Best for**: Consistent, repeatable demos

---

### Option 3: Manual Recording (30 minutes)

**Tools needed**:
- OBS Studio (free) or QuickTime
- Microphone
- Script: `docs/demo-video-script.md`

**Steps**:

1. **Setup OBS Studio**
   ```
   Sources:
   - Display Capture (your screen)
   - Audio Input (microphone)

   Settings:
   - Resolution: 1920x1080
   - FPS: 30
   - Format: MP4
   ```

2. **Prepare browser**
   ```bash
   - Use incognito window
   - Zoom: 125%
   - Hide bookmarks bar
   - Close other tabs
   ```

3. **Record**
   - Read script naturally
   - Navigate through pages
   - Pause between scenes
   - Stop recording

4. **Edit** (optional)
   - Trim beginning/end
   - Add text overlays
   - Adjust audio levels

**Best for**: Full control, professional quality

---

## 📝 What to Show

### Scene 1: Homepage (3 seconds)
- Hero section
- Value proposition

### Scene 2: Curriculum (5 seconds)
- Scroll through 12 weeks
- Highlight enhanced weeks (1, 7, 11, 12)

### Scene 3: Week 1 Content (8 seconds)
- Show simple explanation
- Show TypeScript code example
- Show cost metrics: "$0.003 per 1k tokens"
- Show best practices

### Scene 4: Domain Agents (5 seconds)
- Show domain cards (HR, Healthcare, Legal, Finance)
- Click into HR Agents
- Show Wisq Harper metrics: "94% accuracy"

### Scene 5: Interview Prep (4 seconds)
- Show system design framework
- Show practice problems

### Scene 6: CTA (5 seconds)
- GitHub repo
- "Star the repo" + "Start learning"

---

## 🎤 Voiceover Options

### Option A: Record yourself
```bash
# Record in Audacity or Voice Memos
# Tips:
- Speak clearly and slowly
- Use script word-for-word
- Record in quiet room
- Use decent microphone
```

### Option B: AI-generated voice (ElevenLabs)

```bash
# Install ElevenLabs
npm install -g elevenlabs

# Generate voiceover
elevenlabs text-to-speech \
  --text "$(cat docs/demo-video-script.md | grep '^\[' -A 1)" \
  --voice "Adam" \
  --output demos/voiceover.mp3
```

**Recommended voices**:
- **Adam**: Professional, tech-friendly (best choice)
- **Antoni**: Warm, engaging
- **Josh**: Energetic, younger audience

---

## 🎨 Text Overlays

Add these text callouts in your video editor:

**Scene 2** (Curriculum):
- "38 comprehensive lessons"
- "60+ code examples"
- "Real cost metrics"

**Scene 3** (Week 1):
- "$0.003 per 1,000 tokens"
- "Production-ready TypeScript"

**Scene 4** (Domains):
- "94% accuracy on SHRM-CP exam"
- "80% automation rate"

**Scene 6** (CTA):
- "github.com/mandadapu/aicelerate"
- "⭐ Star the repo"
- "100% Free & Open Source"

---

## 📹 Export Settings

### For YouTube
```
Format: MP4 (H.264)
Resolution: 1920x1080
Frame rate: 30fps
Bitrate: 10 Mbps
Audio: AAC 192 kbps
```

### For Twitter/X
```
Format: MP4
Resolution: 1280x720
Max duration: 2:20
Max size: 512MB
```

### For Instagram
```
Format: MP4
Resolution: 1080x1080 (square)
Duration: 60 seconds
```

---

## 📤 Publishing Checklist

- [ ] Video recorded and edited
- [ ] Voiceover clear and audible
- [ ] Text overlays added
- [ ] Background music (optional, low volume)
- [ ] Exported in correct format
- [ ] Uploaded to YouTube
- [ ] Added to README.md
- [ ] Shared on Twitter/LinkedIn
- [ ] Posted to Product Hunt (if launching)

---

## 🎬 Full Production Timeline

**Total time**: 2-6 hours depending on method

| Task | Time | Method |
|------|------|--------|
| Script review | 15 min | Read docs/demo-video-script.md |
| Screen recording | 30 min | Automated script or manual |
| Voiceover | 30 min | Record yourself or AI |
| Video editing | 1-2 hrs | DaVinci Resolve or iMovie |
| Text overlays | 30 min | Add callouts and metrics |
| Export & upload | 30 min | YouTube, social media |

---

## 🚀 One-Command Demo (Advanced)

If you have FFmpeg and ElevenLabs set up:

```bash
# Run the full demo pipeline
npm run demo:create

# This will:
# 1. Record screen with Playwright
# 2. Generate AI voiceover
# 3. Combine video + audio with FFmpeg
# 4. Export final MP4
```

---

## 📊 Analytics to Track

After publishing:
- YouTube views, watch time, CTR
- GitHub stars increase
- Website traffic from video
- Social media engagement

---

## 💡 Tips for Success

1. **Keep it under 90 seconds** - Attention spans are short
2. **Show, don't tell** - More visuals, less talking
3. **Hook in first 5 seconds** - Grab attention immediately
4. **Clear CTA** - Make it obvious what to do next
5. **High quality audio** - Bad audio kills good video
6. **Consistent branding** - Use same colors/fonts throughout

---

## 🆘 Troubleshooting

**Recording script fails**:
```bash
# Make sure app is running
npm run dev

# Install Playwright browsers
npx playwright install chromium
```

**Video file too large**:
```bash
# Compress with FFmpeg
ffmpeg -i demos/large-video.mp4 -vcodec libx264 -crf 28 demos/compressed.mp4
```

**Audio out of sync**:
- Use fixed frame rate (30fps)
- Don't drop frames during recording
- Sync in video editor manually

---

## 📚 Resources

- **Video editing tutorials**: [DaVinci Resolve Basics](https://www.youtube.com/watch?v=UguJiz9AYM8)
- **Voiceover tips**: [How to Record Professional Voiceover](https://www.youtube.com/watch?v=T3W7XgRDRMQ)
- **OBS Studio guide**: [OBS Studio Tutorial](https://obsproject.com/wiki/)
- **ElevenLabs**: [AI Voice Generation](https://elevenlabs.io/)

---

**Questions?** Open an issue on GitHub or check the full script in `docs/demo-video-script.md`
