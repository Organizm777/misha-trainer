#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'assets/_src/js/bundle_special_subjects.js');
const DIR = path.join(ROOT, 'assets/data/spec_subjects');
const WAVE = 'wave91b';
const DATA_VERSION = '91b';
const ORDER = [
  'fashion_design', 'architecture', 'graphic_design', 'interior_design', 'design_entrance',
  'diplomacy', 'construction', 'procurement', 'management', 'gkh', 'psychology'
];
function readJSON(file){ return JSON.parse(fs.readFileSync(file, 'utf8')); }
function metaFromData(id){
  const data = readJSON(path.join(DIR, `${id}.json`));
  const topics = Array.isArray(data.tops) ? data.tops : Array.isArray(data.topics) ? data.topics : Array.isArray(data.sections) ? data.sections : [];
  const tops = topics.map((topic) => ({
    id: topic.id,
    nm: topic.nm,
    questionCount: Array.isArray(topic.questions) ? topic.questions.length : 0
  }));
  return {
    id: data.id,
    nm: data.nm,
    icon: data.icon,
    desc: data.desc,
    cl: data.cl,
    bg: data.bg,
    tops,
    questionCount: tops.reduce((sum, topic) => sum + topic.questionCount, 0)
  };
}
function replaceConst(source, name, value){
  const re = new RegExp(`const ${name} = .*?;\\n`);
  if (!re.test(source)) throw new Error(`Missing const ${name}`);
  return source.replace(re, `const ${name} = ${JSON.stringify(value)};\n`);
}

const ids = fs.readdirSync(DIR).filter((file) => file.endsWith('.json')).map((file) => path.basename(file, '.json'));
const ordered = [...ORDER.filter((id) => ids.includes(id)), ...ids.filter((id) => !ORDER.includes(id)).sort()];
const subjects = ordered.map(metaFromData);
const manifest = {
  version: WAVE,
  subjects: subjects.length,
  topics: subjects.reduce((sum, subject) => sum + subject.tops.length, 0),
  totalQuestions: subjects.reduce((sum, subject) => sum + subject.questionCount, 0),
  counts: Object.fromEntries(subjects.map((subject) => [subject.id, subject.questionCount]))
};

let src = fs.readFileSync(SRC, 'utf8');
src = src.replace(/const VERSION = '[^']+';/, `const VERSION = '${WAVE}';`);
src = src.replace(/const DATA_VERSION = '[^']+';/, `const DATA_VERSION = '${DATA_VERSION}';`);
src = replaceConst(src, 'SPEC_MANIFEST', manifest);
src = replaceConst(src, 'SPEC_SUBJECTS', subjects);
src = src.replace(/newSubjects: \[[^\]]*\]\.filter\(function\(id\)\{ return !!subjectById\(id\); \}\)/, "newSubjects: ['fashion_design','architecture','graphic_design','interior_design','design_entrance'].filter(function(id){ return !!subjectById(id); })");
fs.writeFileSync(SRC, src);

console.log(JSON.stringify({ synced: true, wave: WAVE, ordered, manifest }, null, 2));
