#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const BASELINES = {
  'assets/_src/js/grade1_data.js': 17406,
  'assets/_src/js/grade2_data.js': 16690,
  'assets/_src/js/grade3_data.js': 27053
};
const CHECKS = [
  {
    file: 'assets/_src/js/grade1_data.js',
    minSize: 30000,
    mustInclude: ["id:'patterns'", "id:'wordproblems'", "id:'sentence'", "id:'animals1'", "id:'weather1'"],
    mustNotInclude: ['ШКО-LA']
  },
  {
    file: 'assets/_src/js/grade2_data.js',
    minSize: 32000,
    mustInclude: ["function clockHourWords", "function clockHalfWords", "id:'division2'", "id:'geometry2'", "id:'alphabet2'", "id:'sentence2'", "id:'weather2'", "id:'safety2'"],
    mustNotInclude: ['половина ${hour+1}-го', 'Самое большое озеро — Байкал']
  },
  {
    file: 'assets/_src/js/grade3_data.js',
    minSize: 42000,
    mustInclude: ["id:'fractions3'", "id:'perimeter3'", "id:'text3'", "id:'earth3'", "id:'health3'", "Сколько океанов сейчас выделяют на Земле?", "Южный океан тоже входит в список океанов Земли."],
    mustNotInclude: ["a:'4',o:['4','3','5','6'],h:'Тихий, Атлантический, Индийский, Северный Ледовитый'", 'Норма: 60-100 ударов']
  }
];

const report = CHECKS.map(check => {
  const abs = path.join(ROOT, check.file);
  const text = fs.readFileSync(abs, 'utf8');
  const size = Buffer.byteLength(text);
  const delta = size - (BASELINES[check.file] || 0);
  const missing = check.mustInclude.filter(token => !text.includes(token));
  const forbidden = check.mustNotInclude.filter(token => text.includes(token));
  return {
    file: check.file,
    size,
    delta,
    minSize: check.minSize,
    sizeOk: size >= check.minSize,
    missing,
    forbidden,
    ok: size >= check.minSize && missing.length === 0 && forbidden.length === 0
  };
});

const output = {
  ok: report.every(item => item.ok),
  files: report
};
console.log(JSON.stringify(output, null, 2));
process.exit(output.ok ? 0 : 1);
