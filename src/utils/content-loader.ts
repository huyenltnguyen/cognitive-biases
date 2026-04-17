import { load as loadYaml } from 'js-yaml';
import type { Course, Module, Part, LessonNode } from '../types/content';
import { validateFrontmatter } from './frontmatter-validators';

function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  // Strip leading newlines that file tooling may prepend before the opening ---
  const normalized = raw.replace(/^\n+/, '');
  const match = normalized.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
  if (!match) return { data: {}, content: normalized };
  try {
    const data = (loadYaml(match[1]) ?? {}) as Record<string, unknown>;
    return { data, content: match[2] };
  } catch {
    return { data: {}, content: normalized };
  }
}

const moduleFiles = import.meta.glob('../content/part-*/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

let _course: Course | null = null;

export function getCourse(): Course {
  if (_course) return _course;

  const lessons: LessonNode[] = [];
  const lessonIds = new Set<string>();

  for (const [path, rawContent] of Object.entries(moduleFiles)) {
    const { data, content } = parseFrontmatter(rawContent);
    // Let validateFrontmatter throw on invalid data so the build fails loudly.
    const frontmatter = validateFrontmatter(data, path);
    if (lessonIds.has(frontmatter.id)) {
      throw new Error(`[${path}] duplicate lesson id "${frontmatter.id}" found in content`);
    }
    lessonIds.add(frontmatter.id);
    lessons.push({
      id: frontmatter.id,
      frontmatter,
      body_markdown: content,
    });
  }

  lessons.sort((a, b) => a.frontmatter.order_index - b.frontmatter.order_index);

  const partsMap = new Map<number, Map<number, LessonNode[]>>();

  for (const lesson of lessons) {
    const { part, module } = lesson.frontmatter;
    if (!partsMap.has(part)) {
      partsMap.set(part, new Map());
    }
    const modulesMap = partsMap.get(part)!;
    if (!modulesMap.has(module)) {
      modulesMap.set(module, []);
    }
    modulesMap.get(module)!.push(lesson);
  }

  const parts: Part[] = [];

  for (const [partNum, modulesMap] of [...partsMap.entries()].sort(([a], [b]) => a - b)) {
    const modules: Module[] = [];

    for (const [modNum, modLessons] of [...modulesMap.entries()].sort(([a], [b]) => a - b)) {
      const firstLesson = modLessons[0];
      modules.push({
        id: `part-${partNum}-module-${modNum}`,
        part: partNum,
        module: modNum,
        title:
          firstLesson?.frontmatter.tags?.find((t) => t.startsWith('module:'))?.slice(7) ??
          `Module ${modNum}`,
        takeaway: firstLesson?.frontmatter.takeaway ?? '',
        lessons: modLessons,
      });
    }

    const firstModule = modules[0];
    const firstLessonOfPart = firstModule?.lessons[0];
    const partTitle =
      firstLessonOfPart?.frontmatter.tags?.find((t) => t.startsWith('part:'))?.slice(5) ??
      `Part ${partNum}`;

    parts.push({
      id: `part-${partNum}`,
      part: partNum,
      title: partTitle,
      modules,
    });
  }

  _course = {
    id: 'cognitive-biases',
    title: 'Cognitive Biases Course',
    parts,
  };

  return _course;
}

export function resetCourseCache(): void {
  _course = null;
}

export function getAllLessons(): LessonNode[] {
  const course = getCourse();
  return course.parts.flatMap((p) => p.modules.flatMap((m) => m.lessons));
}

export function getLessonById(id: string): LessonNode | undefined {
  return getAllLessons().find((l) => l.id === id);
}

export function getAdjacentLessons(lessonId: string): {
  prev: LessonNode | null;
  next: LessonNode | null;
} {
  const all = getAllLessons();
  const idx = all.findIndex((l) => l.id === lessonId);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}
