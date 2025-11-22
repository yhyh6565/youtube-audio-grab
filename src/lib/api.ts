/**
 * API Client for YouTube Audio Extractor Backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface VideoInfo {
  title: string;
  thumbnail_url: string;
  duration: number;
  channel: string;
  warning?: 'long_video' | null;
}

export interface PreviewData {
  thumbnail_url: string;
  suggested_filename: string;
  original_title: string;
  duration: number;
}

export interface ProgressEvent {
  step: 'validating' | 'downloading' | 'extracting_thumbnail' | 'embedding' | 'complete' | 'error';
  progress: number;
  message: string;
  session_id?: string;
  preview?: PreviewData;
  error_detail?: string;
}

/**
 * Fetch video info preview
 */
export async function previewVideo(youtubeUrl: string): Promise<VideoInfo> {
  try {
    const response = await fetch(`${API_BASE_URL}/preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ youtube_url: youtubeUrl }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '영상을 불러올 수 없습니다');
    }

    const data = await response.json();
    return data.video_info;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('서버 연결에 실패했습니다');
  }
}

/**
 * Extract audio with SSE stream
 */
export function extractAudio(
  youtubeUrl: string,
  onProgress: (event: ProgressEvent) => void,
  onError: (error: Error) => void,
  onComplete: (preview: PreviewData, sessionId: string) => void
): () => void {
  const eventSource = new EventSource(
    `${API_BASE_URL}/extract?youtube_url=${encodeURIComponent(youtubeUrl)}`
  );

  eventSource.onmessage = (event) => {
    try {
      const data: ProgressEvent = JSON.parse(event.data);
      onProgress(data);

      if (data.step === 'complete' && data.preview && data.session_id) {
        eventSource.close();
        onComplete(data.preview, data.session_id);
      } else if (data.step === 'error') {
        eventSource.close();
        onError(new Error(data.message || '처리 중 오류가 발생했습니다'));
      }
    } catch (error) {
      console.error('Failed to parse SSE message:', error);
    }
  };

  eventSource.onerror = () => {
    eventSource.close();
    onError(new Error('서버 연결이 끊어졌습니다'));
  };

  // Return cleanup function
  return () => {
    eventSource.close();
  };
}

/**
 * Download MP3 file
 */
export async function downloadFile(sessionId: string, filename?: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session_id: sessionId, filename }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '다운로드에 실패했습니다');
    }

    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get('Content-Disposition');
    let downloadFilename = filename ? `${filename}.mp3` : 'audio.mp3';

    if (contentDisposition) {
      const matches = /filename="(.+)"/.exec(contentDisposition);
      if (matches && matches[1]) {
        downloadFilename = matches[1];
      }
    }

    // Download file
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('다운로드 중 오류가 발생했습니다');
  }
}

/**
 * Format duration from seconds to MM:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
