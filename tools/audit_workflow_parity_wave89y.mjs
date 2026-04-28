#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const VALIDATE_REL = '.github/workflows/validate-questions.yml';
const LIGHTHOUSE_REL = '.github/workflows/lighthouse-budget.yml';
const REQUIRED_PARITY_AUDITS = [
  'node tools/audit_onboarding_wave89e.mjs',
  'node tools/audit_hamburger_wave89f.mjs',
  'node tools/audit_minimal_footer_wave89g.mjs',
  'node tools/audit_skeleton_loading_wave89h.mjs',
  'node tools/audit_subject_color_groups_wave89i.mjs',
  'node tools/audit_parent_dashboard_wave89j.mjs',
  'node tools/audit_weak_device_adaptive_wave89k.mjs',
  'node tools/audit_spaced_repetition_sm2_wave89l.mjs',
  'node tools/audit_adaptive_difficulty_wave89m.mjs',
  'node tools/audit_learning_path_wave89n.mjs',
  'node tools/audit_answer_click_runtime_wave90a.mjs',
  'node tools/audit_exam_mode_navigation_wave90b.mjs',
  'node tools/audit_math_exam_depth_wave90c.mjs',
  'node tools/audit_exam_variant_depth_wave90d.mjs'
];

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const validateWorkflow = read(VALIDATE_REL);
const lighthouseWorkflow = read(LIGHTHOUSE_REL);

const missingInValidate = REQUIRED_PARITY_AUDITS.filter((command) => !validateWorkflow.includes(command));
const missingInLighthouse = REQUIRED_PARITY_AUDITS.filter((command) => !lighthouseWorkflow.includes(command));
const nonAdvisoryInLighthouse = REQUIRED_PARITY_AUDITS.filter((command) => {
  const escaped = escapeRegExp(command);
  const advisoryRegex = new RegExp(`continue-on-error:\\s*true[\\s\\S]{0,240}?${escaped}|${escaped}[\\s\\S]{0,240}?continue-on-error:\\s*true`, 'm');
  return !advisoryRegex.test(lighthouseWorkflow);
});

const validateAuditCommands = validateWorkflow.match(/node tools\/audit_[\w.-]+/g) || [];
const lighthouseAuditCommands = lighthouseWorkflow.match(/node tools\/audit_[\w.-]+/g) || [];

const ok = missingInValidate.length === 0
  && missingInLighthouse.length === 0
  && nonAdvisoryInLighthouse.length === 0;

const result = {
  ok,
  wave: 'wave90d',
  workflows: {
    validate: VALIDATE_REL,
    lighthouse: LIGHTHOUSE_REL
  },
  requiredParityAudits: REQUIRED_PARITY_AUDITS,
  missingInValidate,
  missingInLighthouse,
  nonAdvisoryInLighthouse,
  counts: {
    validateAuditCommands: validateAuditCommands.length,
    lighthouseAuditCommands: lighthouseAuditCommands.length
  },
  note: 'Hard-gates the specific validate↔lighthouse workflow parity that regressed when the Lighthouse workflow stopped carrying the advisory UX/pedagogy/runtime audits required by the existing wave89e–wave90d checks.'
};

console.log(JSON.stringify(result, null, 2));
if (!ok) process.exit(1);
