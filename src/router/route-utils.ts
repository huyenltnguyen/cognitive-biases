export function buildLessonPath(lessonId: string): string {
  return `/course/${lessonId}`;
}

export function parseLessonIdParam(params: Record<string, string | undefined>): string {
  return params['lessonId'] ?? '';
}
