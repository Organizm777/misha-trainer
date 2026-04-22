#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const API_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';

function parseArgs(argv){
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) args[key] = true;
    else { args[key] = next; i += 1; }
  }
  return args;
}

function usage(){
  return [
    'Usage:',
    '  ANTHROPIC_API_KEY=... node tools/generate_content_claude.mjs --grade 7 --subject "Физика" --topic "Давление" --count 20 --out tools/generated/grade7_physics_pressure.json',
    '',
    'Required: --grade, --subject, --topic. Optional: --count (default 20), --out, --model.',
    'The script writes a JSON draft only after local validation; review before copying into runtime chunks.'
  ].join('\n');
}

function normalizeText(value){
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function uniqueStrings(values){
  const seen = new Set();
  const out = [];
  for (const value of values || []) {
    const item = normalizeText(value);
    const key = item.toLowerCase().replace(/ё/g, 'е');
    if (!item || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function validateQuestion(item, index){
  const prefix = `question[${index}]`;
  const question = normalizeText(item.question);
  const answer = normalizeText(item.answer);
  const options = uniqueStrings(item.options);
  const hint = normalizeText(item.hint);
  const ex = normalizeText(item.ex);
  const tag = normalizeText(item.tag);
  const errors = [];
  if (!question) errors.push(`${prefix}.question is empty`);
  if (!answer) errors.push(`${prefix}.answer is empty`);
  if (options.length !== 4) errors.push(`${prefix}.options must contain exactly 4 distinct values`);
  if (answer && !options.some(opt => opt.toLowerCase().replace(/ё/g, 'е') === answer.toLowerCase().replace(/ё/g, 'е'))) errors.push(`${prefix}.answer must be present in options`);
  if (!hint) errors.push(`${prefix}.hint is empty`);
  if (ex.length < 40) errors.push(`${prefix}.ex must be a useful explanation`);
  if (!tag) errors.push(`${prefix}.tag is empty`);
  if (errors.length) throw new Error(errors.join('\n'));
  return {
    question,
    answer,
    options,
    hint,
    ex,
    tag,
    color: normalizeText(item.color) || '#2563eb',
    bg: normalizeText(item.bg) || '#dbeafe'
  };
}

function extractJson(text){
  const raw = String(text || '').trim();
  try { return JSON.parse(raw); } catch {}
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return JSON.parse(fenced[1]);
  const first = raw.indexOf('[');
  const last = raw.lastIndexOf(']');
  if (first >= 0 && last > first) return JSON.parse(raw.slice(first, last + 1));
  throw new Error('Model response did not contain a JSON array');
}

function buildPrompt({grade, subject, topic, count}){
  return `Сгенерируй ${count} школьных вопросов для тренажёра.\n\nКласс: ${grade}\nПредмет: ${subject}\nТема: ${topic}\n\nТребования:\n- Верни только JSON-массив без markdown.\n- Каждый элемент: {"question","answer","options","hint","ex","tag","color","bg"}.\n- options: ровно 4 разных варианта; answer обязан дословно входить в options.\n- Первый вариант не обязан быть правильным; порядок перемешай.\n- hint: короткая подсказка без раскрытия ответа.\n- ex: 2–3 предложения с разбором, правилом или формулой.\n- tag: название темы.\n- Язык: русский.\n- Сложность: соответствует классу, без спорных формулировок.\n- Не используй внешние ссылки и не требуй картинки.\n\nJSON-массив:`;
}

async function callClaude({apiKey, model, prompt}){
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: 6000,
      temperature: 0.4,
      messages: [{role: 'user', content: prompt}]
    })
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Claude API ${response.status}: ${body.slice(0, 1000)}`);
  const json = JSON.parse(body);
  return (json.content || []).map(part => part.text || '').join('\n').trim();
}

async function main(){
  const args = parseArgs(process.argv);
  if (args.help || args.h) {
    console.log(usage());
    return;
  }
  const grade = normalizeText(args.grade);
  const subject = normalizeText(args.subject);
  const topic = normalizeText(args.topic);
  const count = Math.max(1, Math.min(60, Number(args.count || 20)));
  const model = normalizeText(args.model) || DEFAULT_MODEL;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!grade || !subject || !topic) throw new Error(usage());
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is required. Use --help for an example.');

  const prompt = buildPrompt({grade, subject, topic, count});
  const text = await callClaude({apiKey, model, prompt});
  const parsed = extractJson(text);
  if (!Array.isArray(parsed)) throw new Error('Expected a JSON array');
  const questions = parsed.map(validateQuestion);
  if (questions.length < count) throw new Error(`Expected ${count} questions, got ${questions.length}`);

  const out = args.out ? path.resolve(String(args.out)) : path.resolve('tools/generated', `grade${grade}_${subject}_${topic}.json`.toLowerCase().replace(/[^a-zа-я0-9]+/giu, '_'));
  await fs.mkdir(path.dirname(out), {recursive: true});
  await fs.writeFile(out, JSON.stringify({
    app: 'trainer3',
    kind: 'content-draft',
    generatedAt: new Date().toISOString(),
    model,
    grade,
    subject,
    topic,
    count: questions.length,
    questions
  }, null, 2) + '\n');
  console.log(`Wrote ${questions.length} validated questions to ${out}`);
}

main().catch(err => {
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
