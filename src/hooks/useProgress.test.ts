import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProgress } from './useProgress';
import { resetProgress } from '../utils/storage';

// Mock storage module for isolation
const storedData: Record<string, string> = {};
const mockLocalStorage = {
  getItem: vi.fn((key: string) => storedData[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    storedData[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete storedData[key];
  }),
  clear: vi.fn(() => {
    Object.keys(storedData).forEach((k) => delete storedData[k]);
  }),
  length: 0,
  key: vi.fn(() => null),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: false,
});

describe('useProgress', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
    resetProgress();
  });

  it('should return initial progress state when localStorage is empty', () => {
    const { result } = renderHook(() => useProgress());
    expect(result.current.progress.course_id).toBe('cognitive-biases');
    expect(result.current.progress.version).toBe(1);
    expect(result.current.progress.lesson_progress).toEqual({});
  });

  it('should mark a lesson as completed', () => {
    const { result } = renderHook(() => useProgress());
    act(() => {
      result.current.completeLesson('lesson-001', 1);
    });
    expect(result.current.progress.lesson_progress['lesson-001']?.status).toBe('completed');
    expect(result.current.progress.lesson_progress['lesson-001']?.last_score).toBe(1);
  });

  it('should increment attempts on each completeLesson call', () => {
    const { result } = renderHook(() => useProgress());
    act(() => {
      result.current.completeLesson('lesson-001', 0.5);
    });
    act(() => {
      result.current.completeLesson('lesson-001', 1);
    });
    expect(result.current.progress.lesson_progress['lesson-001']?.attempts).toBe(2);
  });

  it('should mark a non-gated lesson as completed when visited', () => {
    const { result } = renderHook(() => useProgress());
    act(() => {
      result.current.markInProgress('lesson-002');
    });
    expect(result.current.progress.lesson_progress['lesson-002']?.status).toBe('completed');
  });

  it('should not overwrite completed status when marking lesson visited', () => {
    const { result } = renderHook(() => useProgress());
    act(() => {
      result.current.completeLesson('lesson-001', 1);
    });
    act(() => {
      result.current.markInProgress('lesson-001');
    });
    expect(result.current.progress.lesson_progress['lesson-001']?.status).toBe('completed');
  });

  it('should not auto-complete gated lessons when visited', () => {
    const { result } = renderHook(() => useProgress());
    act(() => {
      result.current.markInProgress('lesson-gated', true);
    });
    expect(result.current.progress.lesson_progress['lesson-gated']).toBeUndefined();
  });

  it('should reset course progress', () => {
    const { result } = renderHook(() => useProgress());
    act(() => {
      result.current.completeLesson('lesson-001', 1);
    });
    act(() => {
      result.current.resetCourse();
    });
    expect(result.current.progress.lesson_progress).toEqual({});
  });

  it('should persist progress to localStorage', () => {
    const { result } = renderHook(() => useProgress());
    act(() => {
      result.current.completeLesson('lesson-001', 1);
    });
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
    const [key, value] = mockLocalStorage.setItem.mock.calls[0] as [string, string];
    expect(key).toBe('cognitive-biases.progress.v1');
    expect(JSON.parse(value).lesson_progress['lesson-001'].status).toBe('completed');
  });
});