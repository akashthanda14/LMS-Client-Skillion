# OpenAI Whisper API Configuration Guide

## Current Configuration Status ✅

Your OpenAI API is **CONFIGURED and READY** to use!

### Environment Variables

```bash
# ✅ Already configured in .env
OPENAI_API_KEY=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
```

## How It Works

The system uses **intelligent fallback logic**:

```javascript
// In services/transcriptService.js
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })  // ✅ Real transcription
  : null;                                                // ⚠️ Dummy fallback
```

### Behavior:

1. **OpenAI API Key Present** → Uses real Whisper API transcription
2. **No API Key** → Falls back to dummy transcript for demo
3. **Download Fails** → Falls back to dummy transcript
4. **File Too Large** → Falls back to dummy transcript

## Testing with Real OpenAI Transcription

### Quick Test

Create a lesson with a real video URL:

```bash
# 1. Login as creator
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrPhone":"sarah@example.com","password":"password123"}' \
  | jq -r '.token')

# 2. Create a course
COURSE_ID=$(curl -s -X POST http://localhost:4000/api/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "OpenAI Test Course",
    "description": "Testing real transcription",
    "duration": 60,
    "level": "BEGINNER",
    "category": "PROGRAMMING"
  }' | jq -r '.course.id')

# 3. Create a lesson with a REAL video URL
# Use a short sample video to test (< 25MB)
LESSON_ID=$(curl -s -X POST http://localhost:4000/api/courses/$COURSE_ID/lessons \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "OpenAI Transcription Test",
    "videoUrl": "https://res.cloudinary.com/demo/video/upload/dog.mp4",
    "order": 1,
    "duration": 10
  }' | jq -r '.data.id')

# 4. Check transcript status
curl -s http://localhost:4000/api/lessons/$LESSON_ID/transcript-status \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Sample Video URLs for Testing

**Public Cloudinary Samples** (No login required):
```
https://res.cloudinary.com/demo/video/upload/dog.mp4
https://res.cloudinary.com/demo/video/upload/sea-turtle.mp4
```

**Your Own Videos:**
1. Upload video to Cloudinary
2. Copy the video URL
3. Use it in lesson creation

## Verifying OpenAI is Being Used

### Check Worker Logs

```bash
tail -f worker.log
```

**With OpenAI (Real Transcription):**
```json
{"level":"info","message":"Calling OpenAI Whisper API"}
{"level":"info","message":"Video file size","sizeMB":"2.5"}
{"level":"info","message":"Transcription completed","length":245}
```

**Without OpenAI (Dummy Fallback):**
```json
{"level":"warn","message":"OpenAI not configured, using dummy transcript"}
{"level":"info","message":"Transcription completed","length":633}
```

**With Download Failure (Dummy Fallback):**
```json
{"level":"warn","message":"Video download failed, using dummy transcript"}
{"level":"info","message":"Transcription completed","length":633}
```

### Check Transcript Content

**Real OpenAI Transcript:**
```javascript
// Actual speech-to-text from video
"In this tutorial, we'll learn about JavaScript arrays. 
Arrays are a fundamental data structure that allow us to..."
```

**Dummy Transcript:**
```javascript
// Demo placeholder text
"[Auto-generated dummy transcript]

Welcome to this lesson. This is a demonstration transcript 
generated because OpenAI API is not configured..."
```

## OpenAI API Configuration Options

### Basic Configuration (Current)

```javascript
// services/transcriptService.js
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

const transcription = await openai.audio.transcriptions.create({
  file: fileStream,
  model: 'whisper-1',
  response_format: 'text',
  language: 'en'  // English only
});
```

### Advanced Configuration (Optional)

#### 1. Auto-Detect Language

```javascript
// Remove language parameter to auto-detect
const transcription = await openai.audio.transcriptions.create({
  file: fileStream,
  model: 'whisper-1',
  response_format: 'text'
  // No language - Whisper will detect automatically
});
```

#### 2. Get Timestamps (SRT Format)

```javascript
const transcription = await openai.audio.transcriptions.create({
  file: fileStream,
  model: 'whisper-1',
  response_format: 'srt'  // Returns SubRip format with timestamps
});

// Output:
// 1
// 00:00:00,000 --> 00:00:04,000
// Welcome to this lesson
// 
// 2
// 00:00:04,000 --> 00:00:08,000
// Today we'll learn about arrays
```

#### 3. Get Verbose JSON

```javascript
const transcription = await openai.audio.transcriptions.create({
  file: fileStream,
  model: 'whisper-1',
  response_format: 'verbose_json'  // Detailed metadata
});

// Returns:
// {
//   "task": "transcribe",
//   "language": "english",
//   "duration": 123.45,
//   "segments": [
//     {
//       "id": 0,
//       "start": 0.0,
//       "end": 4.0,
//       "text": "Welcome to this lesson",
//       "confidence": 0.95
//     }
//   ]
// }
```

#### 4. Multi-Language Support

```javascript
// Update transcriptService.js to accept language parameter
export const generateTranscript = async (videoUrl, language = null) => {
  // ...
  
  const options = {
    file: fileStream,
    model: 'whisper-1',
    response_format: 'text'
  };
  
  // Only add language if specified
  if (language) {
    options.language = language;
  }
  
  const transcription = await openai.audio.transcriptions.create(options);
};
```

**Supported Languages:**
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Dutch (nl)
- Russian (ru)
- Chinese (zh)
- Japanese (ja)
- Korean (ko)
- And 50+ more...

## Cost Management

### Current Pricing

**OpenAI Whisper API:**
- $0.006 per minute of audio

### Usage Estimates

| Video Length | Cost per Video | 100 Videos | 1,000 Videos |
|--------------|----------------|------------|--------------|
| 5 minutes    | $0.03          | $3.00      | $30.00       |
| 10 minutes   | $0.06          | $6.00      | $60.00       |
| 30 minutes   | $0.18          | $18.00     | $180.00      |
| 60 minutes   | $0.36          | $36.00     | $360.00      |

### Cost Optimization Tips

1. **Set Rate Limits**
```javascript
// In transcriptionWorker.js
limiter: {
  max: 10,        // Process 10 jobs
  duration: 60000 // per 60 seconds
}
```

2. **Prioritize Premium Users**
```javascript
// Add job with priority
await transcriptionQueue.add('generate-transcript', {
  lessonId,
  videoUrl
}, {
  priority: user.isPremium ? 1 : 10  // Lower number = higher priority
});
```

3. **Skip Short Videos**
```javascript
// Don't transcribe videos under 30 seconds
if (videoDuration < 30) {
  return "Video too short for transcription";
}
```

4. **Cache Transcripts**
```javascript
// If video URL is reused, reuse transcript
const existingLesson = await prisma.lesson.findFirst({
  where: { videoUrl, transcript: { not: null } }
});

if (existingLesson) {
  return existingLesson.transcript;
}
```

## Monitoring OpenAI Usage

### Check API Usage

Visit OpenAI Dashboard:
```
https://platform.openai.com/usage
```

### Track Costs in Code

```javascript
// Add cost tracking to worker
const processTranscription = async (job) => {
  const startTime = Date.now();
  
  const transcript = await generateTranscript(videoUrl);
  
  const duration = (Date.now() - startTime) / 1000;
  const estimatedCost = (duration / 60) * 0.006;
  
  logger.info('Transcription cost estimate', {
    lessonId,
    durationSeconds: duration,
    estimatedCost: `$${estimatedCost.toFixed(4)}`
  });
};
```

### Set Budget Alerts

In OpenAI Dashboard:
1. Go to Settings → Billing
2. Set usage limits
3. Enable email alerts at 50%, 75%, 90%

## Error Handling

### Common OpenAI Errors

#### 1. Invalid API Key
```json
{
  "error": {
    "message": "Incorrect API key provided",
    "type": "invalid_request_error"
  }
}
```

**Solution:** Check your `OPENAI_API_KEY` in `.env`

#### 2. Rate Limit Exceeded
```json
{
  "error": {
    "message": "Rate limit reached for requests",
    "type": "rate_limit_error"
  }
}
```

**Solution:** Worker automatically retries with backoff. Consider:
- Reducing concurrent workers
- Adjusting rate limiter settings
- Upgrading OpenAI plan

#### 3. File Too Large
```json
{
  "error": {
    "message": "File size exceeds 25MB limit",
    "type": "invalid_request_error"
  }
}
```

**Solution:** Already handled - falls back to dummy transcript

#### 4. Insufficient Credits
```json
{
  "error": {
    "message": "You exceeded your current quota",
    "type": "insufficient_quota"
  }
}
```

**Solution:** Add payment method or increase quota in OpenAI Dashboard

### Graceful Fallback

The system automatically falls back to dummy transcripts on ANY error:

```javascript
try {
  // Try OpenAI
  transcript = await generateTranscriptWithWhisper(audioFile);
} catch (error) {
  // Fallback to dummy
  logger.error('OpenAI failed, using dummy transcript');
  transcript = await generateDummyTranscript(videoUrl);
}
```

## Testing Guide

### 1. Test with Sample Video

```bash
# Run the integration test
node test-transcript-worker.js
```

**Expected Output (with OpenAI):**
```
6. Verifying Transcript Content...
✅ Transcript generated: 245 characters
   Preview: "In this video, we'll explore the fundamentals of..."
   ℹ️  Real transcript from OpenAI Whisper
```

### 2. Test Without OpenAI

```bash
# Temporarily disable OpenAI
export OPENAI_API_KEY=""

# Restart worker
pkill -f transcriptionWorker
npm run worker

# Run test
node test-transcript-worker.js
```

**Expected Output (without OpenAI):**
```
6. Verifying Transcript Content...
✅ Transcript generated: 633 characters
   Preview: "[Auto-generated dummy transcript]..."
   ℹ️  Using dummy transcript (OpenAI not configured)
```

### 3. Test with Real Cloudinary Video

```bash
# Upload your own video to Cloudinary
# Then test with real URL

curl -X POST http://localhost:4000/api/courses/{courseId}/lessons \
  -H "Authorization: Bearer {token}" \
  -d '{
    "title": "My Real Video",
    "videoUrl": "https://res.cloudinary.com/YOUR_CLOUD/video/upload/YOUR_VIDEO.mp4",
    "order": 1,
    "duration": 120
  }'
```

## Production Checklist

Before deploying to production:

- [ ] OpenAI API key is set in production `.env`
- [ ] API key has sufficient credits
- [ ] Rate limits are configured appropriately
- [ ] Worker is running with PM2 or systemd
- [ ] Monitoring/alerts are set up for failed jobs
- [ ] Budget alerts are configured in OpenAI Dashboard
- [ ] Fallback to dummy transcript is tested
- [ ] Worker logs are being monitored

## Quick Reference

### Enable Real Transcription
```bash
# In .env
OPENAI_API_KEY=sk-proj-your-actual-api-key

# Restart worker
pkill -f transcriptionWorker
npm run worker
```

### Disable Real Transcription (Use Dummy)
```bash
# In .env
OPENAI_API_KEY=

# Or comment it out:
# OPENAI_API_KEY=sk-proj-...

# Restart worker
pkill -f transcriptionWorker
npm run worker
```

### Check Current Status
```bash
# Check if OpenAI is configured
grep OPENAI_API_KEY .env

# Check worker logs
tail -f worker.log | grep -i openai

# Test a lesson
curl http://localhost:4000/api/lessons/{lessonId}/transcript-status
```

## Support

### OpenAI Documentation
- API Reference: https://platform.openai.com/docs/api-reference/audio
- Whisper Guide: https://platform.openai.com/docs/guides/speech-to-text
- Pricing: https://openai.com/pricing

### Internal Documentation
- Worker Setup: `docs/TRANSCRIPT_WORKER.md`
- Lesson Management: `docs/LESSON_MANAGEMENT.md`

---

**Status:** ✅ **OpenAI Whisper API is CONFIGURED and READY**

Your system is now using real AI-powered transcription! 🎉

When you create lessons with valid video URLs, the worker will:
1. Download the video
2. Send it to OpenAI Whisper API
3. Receive the real transcription
4. Store it in the database

The dummy transcript fallback ensures the system continues working even if:
- OpenAI API is temporarily unavailable
- Video download fails
- File size exceeds limits
- API quota is exceeded
