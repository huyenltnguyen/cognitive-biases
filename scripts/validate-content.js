/**
 * Content validation script for lesson markdown files.
 *
 * Usage:
 *   node scripts/validate-content.js          — report errors
 *   node scripts/validate-content.js --fix    — also auto-fix missing closing ---
 *
 * Exit code 1 if any errors are found (after --fix, only unfixable errors count).
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { load as loadYaml } from 'js-yaml';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONTENT_DIR = join(__dirname, '../src/content');
const FIX_MODE = process.argv.includes('--fix');

const VALID_LESSON_TYPES = new Set([
  'reading',
  'exercise',
  'exercise-ungraded',
  'long-exercise',
  'bridge',
]);

const REQUIRED_FIELDS = [
  'id',
  'title',
  'part',
  'module',
  'lesson_number',
  'lesson_type',
  'estimated_minutes',
  'gate_required',
  'order_index',
];

// ── helpers ──────────────────────────────────────────────────────────────────

function walkMd(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...walkMd(full));
    } else if (entry.match(/^lesson-\d+\.md$/)) {
      results.push(full);
    }
  }
  return results;
}

function label(filePath) {
  return relative(CONTENT_DIR, filePath);
}

// ── validation ────────────────────────────────────────────────────────────────

function validateFile(filePath) {
  const errors = [];
  const fixes = [];

  let raw = readFileSync(filePath, 'utf8');

  // Strip leading newlines that some editors prepend
  const normalized = raw.replace(/^\n+/, '');

  // Count opening/closing --- delimiters
  const delimiterMatches = [...normalized.matchAll(/^---\s*$/gm)];

  if (delimiterMatches.length < 1) {
    errors.push('Missing opening --- frontmatter delimiter');
    return { errors, fixes };
  }

  if (delimiterMatches.length < 2) {
    if (FIX_MODE) {
      const fixed = raw.trimEnd() + '\n---\n';
      writeFileSync(filePath, fixed, 'utf8');
      fixes.push('Added missing closing --- delimiter');
      raw = fixed;
    } else {
      errors.push('Missing closing --- frontmatter delimiter (run --fix to auto-append it)');
      return { errors, fixes };
    }
  }

  // Re-read after potential fix
  const source = raw.replace(/^\n+/, '');
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);

  if (!match) {
    errors.push('Could not extract frontmatter block — check delimiter placement');
    return { errors, fixes };
  }

  let data;
  try {
    data = loadYaml(match[1]) ?? {};
  } catch (e) {
    errors.push(`YAML parse error: ${e.message}`);
    return { errors, fixes };
  }

  if (typeof data !== 'object' || data === null) {
    errors.push('Frontmatter did not produce a YAML object');
    return { errors, fixes };
  }

  // Required fields
  for (const field of REQUIRED_FIELDS) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // lesson_type value
  if (data.lesson_type !== undefined && !VALID_LESSON_TYPES.has(data.lesson_type)) {
    errors.push(
      `Invalid lesson_type "${data.lesson_type}" — must be one of: ${[...VALID_LESSON_TYPES].join(', ')}`
    );
  }

  // Exercise lessons must have an exercise block with a kind
  if (
    data.lesson_type === 'exercise' ||
    data.lesson_type === 'exercise-ungraded' ||
    data.lesson_type === 'long-exercise'
  ) {
    if (!data.exercise) errors.push('Exercise lesson is missing exercise block');
    if (data.exercise && typeof data.exercise === 'object' && !Array.isArray(data.exercise)) {
      if (!data.exercise.kind) errors.push('Exercise lesson is missing exercise.kind');
    }
  }

  return { errors, fixes };
}

// ── main ──────────────────────────────────────────────────────────────────────

const files = walkMd(CONTENT_DIR);
let totalErrors = 0;
let totalFixes = 0;

for (const filePath of files.sort()) {
  const { errors, fixes } = validateFile(filePath);

  if (fixes.length > 0) {
    totalFixes += fixes.length;
    for (const fix of fixes) {
      console.log(`  fixed  ${label(filePath)}: ${fix}`);
    }
  }

  if (errors.length > 0) {
    totalErrors += errors.length;
    for (const err of errors) {
      console.error(`  error  ${label(filePath)}: ${err}`);
    }
  }
}

console.log('');
if (totalFixes > 0) console.log(`Auto-fixed ${totalFixes} issue(s).`);
if (totalErrors === 0) {
  console.log('All content files are valid.');
} else {
  console.error(`Found ${totalErrors} error(s) in content files.`);
  process.exit(1);
}
