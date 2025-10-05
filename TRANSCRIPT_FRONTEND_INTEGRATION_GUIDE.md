# Transcript Integration Guide - Frontend

## Overview
This guide provides instructions for integrating video transcripts into the MicroCourses frontend. Transcripts enhance accessibility, improve SEO, and provide a better learning experience.

---

## Table of Contents
1. [Features](#features)
2. [Components](#components)
3. [API Integration](#api-integration)
4. [Implementation Steps](#implementation-steps)
5. [Usage Examples](#usage-examples)
6. [Styling Guide](#styling-guide)

---

## Features

### Core Features
- ✅ Display video transcripts alongside videos
- ✅ Clickable timestamps to jump to specific video moments
- ✅ Search within transcripts
- ✅ Highlight current transcript segment during video playback
- ✅ Download transcript as text file
- ✅ Toggle transcript visibility
- ✅ Responsive design for mobile and desktop

### Accessibility Features
- Screen reader support
- Keyboard navigation
- High contrast mode support
- Font size adjustment

---

## Components

### 1. TranscriptViewer Component

Create a new component for displaying transcripts:

**File:** `/src/components/learn/TranscriptViewer.tsx`

```tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TranscriptSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

interface TranscriptViewerProps {
  transcript: TranscriptSegment[];
  currentTime?: number;
  onSeek?: (time: number) => void;
  videoTitle?: string;
}

export function TranscriptViewer({
  transcript,
  currentTime = 0,
  onSeek,
  videoTitle = 'Video'
}: TranscriptViewerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTranscript, setFilteredTranscript] = useState(transcript);
  const activeSegmentRef = useRef<HTMLDivElement>(null);

  // Filter transcript based on search
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = transcript.filter(segment =>
        segment.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTranscript(filtered);
    } else {
      setFilteredTranscript(transcript);
    }
  }, [searchQuery, transcript]);

  // Auto-scroll to active segment
  useEffect(() => {
    if (activeSegmentRef.current && isExpanded) {
      activeSegmentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentTime, isExpanded]);

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if segment is active
  const isActiveSegment = (segment: TranscriptSegment): boolean => {
    return currentTime >= segment.startTime && currentTime < segment.endTime;
  };

  // Download transcript as text
  const downloadTranscript = () => {
    const text = transcript
      .map(segment => `[${formatTime(segment.startTime)}] ${segment.text}`)
      .join('\n\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${videoTitle.replace(/[^a-z0-9]/gi, '_')}_transcript.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Transcript</h3>
            <span className="text-sm text-gray-500">
              ({transcript.length} segments)
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadTranscript}
              className="text-gray-600 hover:text-gray-900"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search transcript..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Transcript Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="max-h-96 overflow-y-auto p-4 space-y-2"
          >
            {filteredTranscript.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No transcript segments found
              </div>
            ) : (
              filteredTranscript.map((segment) => {
                const isActive = isActiveSegment(segment);
                
                return (
                  <motion.div
                    key={segment.id}
                    ref={isActive ? activeSegmentRef : null}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-100 border-l-4 border-blue-600 shadow-sm'
                        : 'bg-gray-50 hover:bg-gray-100 border-l-4 border-transparent'
                    }`}
                    onClick={() => onSeek && onSeek(segment.startTime)}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`text-xs font-mono font-semibold px-2 py-1 rounded ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {formatTime(segment.startTime)}
                      </span>
                      <p
                        className={`flex-1 text-sm leading-relaxed ${
                          isActive ? 'text-gray-900 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {searchQuery ? (
                          // Highlight search matches
                          segment.text.split(new RegExp(`(${searchQuery})`, 'gi')).map((part, i) =>
                            part.toLowerCase() === searchQuery.toLowerCase() ? (
                              <mark key={i} className="bg-yellow-200 px-1">
                                {part}
                              </mark>
                            ) : (
                              part
                            )
                          )
                        ) : (
                          segment.text
                        )}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

## API Integration

### Fetch Transcript Data

Add transcript API methods to your API client:

**File:** `/src/lib/api.ts`

```typescript
// Add to your API types
export interface TranscriptSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

export interface TranscriptResponse {
  lessonId: string;
  segments: TranscriptSegment[];
  language: string;
  createdAt: string;
}

// Add to your API methods
export const transcriptAPI = {
  // Get transcript for a lesson
  getTranscript: async (lessonId: string): Promise<ApiResponse<TranscriptResponse>> => {
    const response = await api.get(`/lessons/${lessonId}/transcript`);
    return response.data;
  },

  // Generate transcript (for creators)
  generateTranscript: async (lessonId: string, videoUrl: string): Promise<ApiResponse<TranscriptResponse>> => {
    const response = await api.post(`/lessons/${lessonId}/transcript/generate`, {
      videoUrl
    });
    return response.data;
  },

  // Update transcript (for creators)
  updateTranscript: async (
    lessonId: string,
    segments: TranscriptSegment[]
  ): Promise<ApiResponse<TranscriptResponse>> => {
    const response = await api.put(`/lessons/${lessonId}/transcript`, {
      segments
    });
    return response.data;
  }
};
```

---

## Implementation Steps

### Step 1: Integrate into Lesson Page

Update your lesson page to include the transcript viewer:

**File:** `/src/app/learn/[lessonId]/page.tsx`

```tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { TranscriptViewer } from '@/components/learn/TranscriptViewer';
import { transcriptAPI } from '@/lib/api';

export default function LessonPage({ params }: { params: { lessonId: string } }) {
  const [transcript, setTranscript] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch transcript
  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        const response = await transcriptAPI.getTranscript(params.lessonId);
        setTranscript(response.data.segments);
      } catch (error) {
        console.error('Failed to load transcript:', error);
      }
    };
    fetchTranscript();
  }, [params.lessonId]);

  // Update current time from video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    video.addEventListener('timeupdate', updateTime);
    
    return () => video.removeEventListener('timeupdate', updateTime);
  }, []);

  // Handle seeking from transcript
  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Video Player */}
      <div className="lg:col-span-2">
        <video
          ref={videoRef}
          controls
          className="w-full rounded-lg"
          src={lessonData.videoUrl}
        />
      </div>

      {/* Transcript Sidebar */}
      <div className="lg:col-span-1">
        <TranscriptViewer
          transcript={transcript}
          currentTime={currentTime}
          onSeek={handleSeek}
          videoTitle={lessonData.title}
        />
      </div>
    </div>
  );
}
```

---

## Styling Guide

### Custom Styles for Transcripts

Add these styles to your `globals.css`:

```css
/* Transcript Styles */
.transcript-viewer {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.transcript-viewer::-webkit-scrollbar {
  width: 8px;
}

.transcript-viewer::-webkit-scrollbar-track {
  background: #f7fafc;
  border-radius: 4px;
}

.transcript-viewer::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 4px;
}

.transcript-viewer::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

/* Transcript segment animation */
.transcript-segment {
  transition: all 0.2s ease;
}

.transcript-segment:hover {
  transform: translateX(4px);
}

.transcript-segment.active {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0);
  }
}
```

---

## Usage Examples

### Example 1: Basic Transcript Display

```tsx
<TranscriptViewer
  transcript={transcriptData}
  currentTime={videoTime}
  onSeek={handleVideoSeek}
  videoTitle="Introduction to React"
/>
```

### Example 2: With Search Functionality

```tsx
<TranscriptViewer
  transcript={transcriptData}
  currentTime={videoTime}
  onSeek={handleVideoSeek}
  videoTitle="Advanced JavaScript"
/>
```

### Example 3: Mobile Responsive

```tsx
<div className="w-full lg:w-1/3">
  <TranscriptViewer
    transcript={transcriptData}
    currentTime={videoTime}
    onSeek={handleVideoSeek}
    videoTitle="CSS Flexbox Tutorial"
  />
</div>
```

---

## Advanced Features

### 1. Auto-Generated Transcripts

For creators, add an auto-generate button:

```tsx
const handleGenerateTranscript = async () => {
  try {
    setIsGenerating(true);
    const response = await transcriptAPI.generateTranscript(
      lessonId,
      videoUrl
    );
    setTranscript(response.data.segments);
    addToast('Transcript generated successfully!', 'success');
  } catch (error) {
    addToast('Failed to generate transcript', 'error');
  } finally {
    setIsGenerating(false);
  }
};
```

### 2. Transcript Editing (for Creators)

```tsx
const TranscriptEditor = ({ transcript, onSave }) => {
  const [editedTranscript, setEditedTranscript] = useState(transcript);

  const handleSave = async () => {
    await transcriptAPI.updateTranscript(lessonId, editedTranscript);
    onSave(editedTranscript);
  };

  return (
    <div>
      {editedTranscript.map((segment, index) => (
        <div key={segment.id}>
          <input
            value={segment.text}
            onChange={(e) => {
              const updated = [...editedTranscript];
              updated[index].text = e.target.value;
              setEditedTranscript(updated);
            }}
          />
        </div>
      ))}
      <Button onClick={handleSave}>Save Changes</Button>
    </div>
  );
};
```

### 3. Multiple Language Support

```tsx
const [language, setLanguage] = useState('en');

<select value={language} onChange={(e) => setLanguage(e.target.value)}>
  <option value="en">English</option>
  <option value="es">Spanish</option>
  <option value="fr">French</option>
</select>
```

---

## Best Practices

### Performance Optimization
1. **Lazy Loading**: Load transcripts only when needed
2. **Virtualization**: Use virtual scrolling for long transcripts
3. **Debounce Search**: Debounce search input to reduce re-renders

```tsx
import { useMemo } from 'react';
import debounce from 'lodash/debounce';

const debouncedSearch = useMemo(
  () => debounce((query) => setSearchQuery(query), 300),
  []
);
```

### Accessibility
1. Use semantic HTML
2. Add ARIA labels
3. Support keyboard navigation
4. Provide alternative text

```tsx
<button
  aria-label="Seek to timestamp"
  onClick={() => onSeek(segment.startTime)}
>
  {formatTime(segment.startTime)}
</button>
```

---

## Testing Checklist

- [ ] Transcript loads correctly
- [ ] Timestamps are clickable and seek video
- [ ] Active segment highlights during playback
- [ ] Search filters transcript segments
- [ ] Download creates valid text file
- [ ] Expand/collapse works smoothly
- [ ] Mobile responsive design
- [ ] Screen reader compatible
- [ ] Keyboard navigation works

---

## Troubleshooting

### Issue: Transcript Not Loading
**Solution:** Check API endpoint and CORS settings

### Issue: Active Segment Not Highlighting
**Solution:** Ensure `currentTime` prop is updating

### Issue: Search Not Working
**Solution:** Verify search logic and state updates

### Issue: Video Not Seeking
**Solution:** Check `onSeek` callback and video ref

---

## Future Enhancements

1. **AI-Powered Summaries**: Generate lesson summaries from transcripts
2. **Translation**: Auto-translate transcripts to multiple languages
3. **Interactive Quizzes**: Generate quiz questions from transcript content
4. **Note Taking**: Allow learners to add notes linked to transcript timestamps
5. **Speaker Identification**: Identify different speakers in multi-person videos

---

## Related Documentation

- [Video Player Integration Guide](./VIDEO_PLAYER_GUIDE.md)
- [Lesson Management API](./docs/LESSON_MANAGEMENT.md)
- [Accessibility Guidelines](./ACCESSIBILITY_GUIDE.md)

---

## Support

For issues or questions:
- Check the [API Documentation](./docs/API_DOCUMENTATION.md)
- Review the [Component Examples](./docs/COMPONENT_EXAMPLES.md)
- Contact: dev@microcourses.com
