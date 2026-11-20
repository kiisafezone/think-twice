import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const SHOULD_FAIL = process.argv.includes('--fail');
const IGNORE_DIRS = new Set(['node_modules', '.next', '.git', 'dist', 'build', '.vercel', 'coverage']);
const TARGET_EXTS = new Set(['.ts', '.tsx', '.css']);

const RULES = [
  // Unfinished Features
  { id: 'UNFINISHED_TAG', severity: 'HIGH', type: 'Unfinished', regex: /\/\/\s*(TODO|FIXME|HACK|XXX|WIP)\b.*|\/\*\s*(TODO|FIXME|WIP)\b[\s\S]*?\*\//gi, desc: 'Komentar penanda pekerjaan belum selesai' },
  { id: 'EMPTY_FUNCTION', severity: 'HIGH', type: 'Unfinished', regex: /(?:=>\s*\{\s*\}|\)\s*\{\s*\})/g, desc: 'Fungsi atau handler kosong tanpa implementasi' },
  { id: 'NOT_IMPLEMENTED', severity: 'HIGH', type: 'Unfinished', regex: /throw new Error\(['"`].*(not implemented\vert{}todo\vert{}wip).*['"`]\)/gi, desc: 'Stub error belum diimplementasikan' },
  { id: 'DEAD_HANDLER', severity: 'MEDIUM', type: 'Unfinished', regex: /onClick=\{?\(\)\s*=>\s*\{\s*(?:console\.log\(.*\))?\s*\}\}?/g, desc: 'Event handler UI kosong atau hanya console.log' },
  { id: 'HARDCODED_MOCK', severity: 'MEDIUM', type: 'Unfinished', regex: /\b(mockData|dummyData|placeholderData|fakeData)\b/g, desc: 'Kemungkinan data mock/dummy masih tertinggal' },

  // TypeScript Bugs & Anti-Patterns
  { id: 'TS_SUPPRESS', severity: 'HIGH', type: 'Bug Risk', regex: /@ts-(ignore|nocheck|expect-error)/g, desc: 'Type-safety dimatikan paksa (menyembunyikan bug tipe data)' },
  { id: 'EXPLICIT_ANY', severity: 'MEDIUM', type: 'Bug Risk', regex: /:\s*any\b|as\s+any\b/g, desc: 'Penggunaan tipe `any` berisiko memicu runtime error' },
  { id: 'EMPTY_CATCH', severity: 'HIGH', type: 'Bug Risk', regex: /catch\s*\([^)]*\)\s*\{\s*\}/g, desc: 'Error ditelan diam-diam (empty catch block)' },
  { id: 'NON_NULL_ASSERT', severity: 'LOW', type: 'Bug Risk', regex: /[a-zA-Z0-9_)\]]+!\.[a-zA-Z0-9_]+/g, desc: 'Non-null assertion (!.) berisiko TypeError saat runtime' },

  // CSS Bugs & Unfinished Styles
  { id: 'CSS_IMPORTANT', severity: 'LOW', type: 'CSS Smell', regex: /!important/g, desc: 'Override !important berisiko konflik specificity' },
  { id: 'CSS_EMPTY_RULE', severity: 'MEDIUM', type: 'Unfinished', regex: /[^{}]+{\s*}/g, desc: 'Selector CSS kosong tanpa properti' },
  { id: 'CSS_DEBUG_OUTLINE', severity: 'HIGH', type: 'Unfinished', regex: /(border|outline)\s*:\s*1px\s+solid\s+(red|magenta|lime|cyan)/gi, desc: 'Sisa garis bantu debugging CSS tertinggal' }
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (TARGET_EXTS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

const findings = [];
const files = walk(ROOT_DIR);

for (const file of files) {
  const relPath = path.relative(ROOT_DIR, file);
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    for (const rule of RULES) {
      if (rule.regex.test(line)) {
        findings.push({
          severity: rule.severity,
          type: rule.type,
          id: rule.id,
          file: `${relPath}:${idx + 1}`,
          desc: rule.desc,
          snippet: line.trim().slice(0, 100)
        });
      }
      rule.regex.lastIndex = 0;
    }
  });
}

console.log(`Scanned ${files.length} files (.ts, .tsx, .css). Found ${findings.length} potential issues.\n`);

if (findings.length > 0) {
  console.table(findings);
} else {
  console.log('No bugs or unfinished tags detected.');
}

if (SHOULD_FAIL && findings.length > 0) {
  console.error(`\n[AUDIT FAILED] Ditemukan ${findings.length} temuan dan flag --fail aktif.`);
  process.exit(1);
}
