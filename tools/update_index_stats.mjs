#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const INDEX = path.join(ROOT, 'index.html');
const SPEC_DIR = path.join(ROOT, 'assets', 'data', 'spec_subjects');
const EXAM_DIR = path.join(ROOT, 'assets', 'data', 'exam_bank');
const CONTENT_DEPTH_DIR = path.join(ROOT, 'assets', 'data', 'content_depth');
const BASE_EXAM_ROWS = 1910;
const BASE_SPECIAL = { directions: 6, topics: 52, questions: 3078 };
const BASE_HERO = { subjectsFloor: 35, questionsFloor: 14500 };
const CHECK_MODE = process.argv.includes('--check');

const gradeDisplay = {
  1: { topics:'80+ тем', subjects:'Математика · Русский · Лит. чтение · Окружающий мир' },
  2: { topics:'55+ тем', subjects:'Математика · Русский · Лит. чтение · Английский · Окружающий мир' },
  3: { topics:'45+ тем', subjects:'Математика · Русский · Лит. чтение · Английский · Окружающий мир' },
  4: { topics:'65+ тем', subjects:'Математика · Русский · Лит. чтение · Английский · Окружающий мир' },
  5: { topics:'80+ тем', subjects:'Математика · Русский · Английский · История · Литература · Биология · География' },
  6: { topics:'75+ тем', subjects:'Математика · Русский · Английский · История · Литература · Биология · География' },
  7: { topics:'75+ тем', subjects:'Алгебра · Геометрия · Физика · Русский · Английский и ещё 7 предметов' },
  8: { topics:'85+ тем', subjects:'Алгебра · Геометрия · Физика · Химия · Биология и ещё 8 предметов' },
  9: { topics:'85+ тем · 6 экзаменов ОГЭ', subjects:'Алгебра · Геометрия · Физика · Химия · Биология и ещё 8 предметов + ОГЭ' },
  10: { topics:'65+ тем', subjects:'Алгебра · Геометрия · Физика · Русский · История и ещё 10 предметов' },
  11: { topics:'110+ тем · 8 экзаменов ЕГЭ', subjects:'Алгебра · Геометрия · Физика · Химия · Биология и ещё 8 предметов' }
};

function pluralRu(n, one, few, many){
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
function roundDown(value, step){ return Math.floor(value / step) * step; }
function prettyNumber(value){ return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
function countSpecialSubjects(){
  if (!fs.existsSync(SPEC_DIR)) return { ...BASE_SPECIAL };
  const files = fs.readdirSync(SPEC_DIR).filter((file) => file.endsWith('.json'));
  let topics = 0;
  let questions = 0;
  for (const file of files) {
    const json = JSON.parse(fs.readFileSync(path.join(SPEC_DIR, file), 'utf8'));
    const list = Array.isArray(json.topics) ? json.topics : Array.isArray(json.tops) ? json.tops : Array.isArray(json.sections) ? json.sections : [];
    topics += list.length;
    for (const topic of list) questions += Array.isArray(topic.questions) ? topic.questions.length : 0;
  }
  return { directions: files.length, topics, questions };
}


function countQuestionLikeRows(value){
  let count = 0;
  function walk(node){
    if (!node) return;
    if (Array.isArray(node)) { for (const item of node) walk(item); return; }
    if (typeof node !== 'object') return;
    if (typeof node.q === 'string' && (typeof node.a === 'string' || typeof node.answer === 'string')) count++;
    for (const child of Object.values(node)) walk(child);
  }
  walk(value);
  return count;
}
function countContentDepthRows(){
  if (!fs.existsSync(CONTENT_DEPTH_DIR)) return { rows:0, files:0 };
  const files = fs.readdirSync(CONTENT_DEPTH_DIR).filter((file) => file.endsWith('.json') && file !== 'textbook_bindings.json' && file !== 'manifest.json');
  let rows = 0;
  for (const file of files) {
    const json = JSON.parse(fs.readFileSync(path.join(CONTENT_DEPTH_DIR, file), 'utf8'));
    rows += Number(json.item_count || 0) || countQuestionLikeRows(json);
  }
  return { rows, files:files.length };
}

function countExamRows(){
  if (!fs.existsSync(EXAM_DIR)) return { rows: BASE_EXAM_ROWS, banks: 0, variants: 0 };
  const files = fs.readdirSync(EXAM_DIR).filter((file) => /_2026_foundation\.json$/.test(file));
  let rows = 0;
  let variants = 0;
  for (const file of files) {
    const json = JSON.parse(fs.readFileSync(path.join(EXAM_DIR, file), 'utf8'));
    rows += Number(json.item_count || (Array.isArray(json.items) ? json.items.length : 0)) || 0;
    variants += Array.isArray(json.variants) ? json.variants.length : 0;
  }
  return { rows, banks: files.length, variants };
}

function updateGradeCards(html){
  let next = html;
  for (const [grade, data] of Object.entries(gradeDisplay)) {
    const href = `grade${grade}_v2.html`;
    const cardRe = new RegExp(
      `(<a class="card [^"]+" href="${href}">[\\s\\S]*?<div class="cs">)([\\s\\S]*?)(<\/div>)(<div class="daily-mini">[\\s\\S]*?<\/div>)?(<div class="cf"><span class="ct">)([\\s\\S]*?)(<\/span><span class="ca">→<\/span><\/div><\/a>)`
    );
    next = next.replace(cardRe, `$1${data.subjects}$3$4$5${data.topics}$7`);
  }
  return next;
}

const spec = countSpecialSubjects();
const exam = countExamRows();
const contentDepth = countContentDepthRows();
const subjectsFloor = Math.max(BASE_HERO.subjectsFloor, BASE_HERO.subjectsFloor + Math.max(0, spec.directions - BASE_SPECIAL.directions) + Math.max(0, exam.banks - 10));
const questionsFloor = Math.max(25000, roundDown(BASE_HERO.questionsFloor + Math.max(0, spec.questions - BASE_SPECIAL.questions) + Math.max(0, exam.rows - BASE_EXAM_ROWS) + contentDepth.rows, 1000));
const directionsWord = pluralRu(spec.directions, 'направление', 'направления', 'направлений');
const topicsWord = pluralRu(spec.topics, 'тема', 'темы', 'тем');

const originalHtml = fs.readFileSync(INDEX, 'utf8');
let html = originalHtml;
html = html.replace(/<div class="stat-n">[^<]*<\/div><div class="stat-l">Предметов<\/div>/, `<div class="stat-n">${subjectsFloor}+</div><div class="stat-l">Предметов</div>`);
html = html.replace(/<div class="stat-n">[^<]*<\/div><div class="stat-l">Задач<\/div>/, `<div class="stat-n">${prettyNumber(questionsFloor)}+</div><div class="stat-l">Задач</div>`);
html = updateGradeCards(html);
html = html.replace(/\d+ направлени[а-яё]+ · \d+ тем[а-яё]* · тренировки и диагностика/, `${spec.directions} ${directionsWord} · ${spec.topics} ${topicsWord} · тренировки и диагностика`);

const report = { ok: html === originalHtml, updated:'index.html', mode: CHECK_MODE ? 'check' : 'write', grades:Object.keys(gradeDisplay).length, subjectsFloor, questionsFloor, specialSubjects:spec, examBank:exam, contentDepth };
if (CHECK_MODE) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.ok ? 0 : 1);
} else {
  fs.writeFileSync(INDEX, html);
  console.log(JSON.stringify({ ...report, ok:true }, null, 2));
  process.exit(0);
}
