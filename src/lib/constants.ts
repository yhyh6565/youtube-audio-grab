/**
 * Application constants
 */

// Progress thresholds (must match backend settings)
export const PROGRESS = {
  VALIDATION_START: 0,
  VALIDATION_END: 15,
  DOWNLOAD_START: 15,
  DOWNLOAD_END: 70,
  THUMBNAIL_START: 70,
  THUMBNAIL_END: 85,
  EMBEDDING_START: 85,
  EMBEDDING_END: 100,
} as const;

// Extraction step configuration
export interface ExtractionStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed';
}

export const getExtractionSteps = (progress: number): ExtractionStep[] => [
  {
    id: '1',
    label: '영상 정보 확인',
    status: progress > PROGRESS.VALIDATION_START ? 'completed' : 'pending',
  },
  {
    id: '2',
    label: '음원 다운로드',
    status:
      progress > PROGRESS.DOWNLOAD_END
        ? 'completed'
        : progress > PROGRESS.DOWNLOAD_START
        ? 'processing'
        : 'pending',
  },
  {
    id: '3',
    label: '썸네일 추출',
    status:
      progress > PROGRESS.THUMBNAIL_END
        ? 'completed'
        : progress > PROGRESS.THUMBNAIL_START
        ? 'processing'
        : 'pending',
  },
  {
    id: '4',
    label: '커버 이미지 삽입',
    status:
      progress === PROGRESS.EMBEDDING_END
        ? 'completed'
        : progress > PROGRESS.EMBEDDING_START
        ? 'processing'
        : 'pending',
  },
];

// Video duration warning threshold (30 minutes in seconds)
export const LONG_VIDEO_WARNING_SECONDS = 1800;

// App step types
export type AppStep = 'input' | 'preview' | 'extracting' | 'ready' | 'complete';
