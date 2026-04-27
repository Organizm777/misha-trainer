# wave89y — validate workflow fix

## Симптом

GitHub продолжал слать письмо о падении **Validate question banks** с общим `Process completed with exit code 1`, хотя предыдущие фиксы касались уже в основном Lighthouse/email-noise и desktop/input-регрессий.

## Реальная причина

Падал не Lighthouse workflow, а **validate-questions.yml**.

После предыдущих правок `lighthouse-budget.yml` перестал содержать advisory-запуски части UX/pedagogy-аудитов (`wave89e` → `wave89n`).

Но существующие hard-gate-аудиты по-прежнему содержали cross-workflow assertions вида:

- `validate workflow should run ...`
- `lighthouse workflow should run ...`

Из-за этого `validate-questions.yml` падал уже на `tools/audit_onboarding_wave89e.mjs`, а затем упал бы и на других таких же аудитах.

## Что исправлено

1. В `lighthouse-budget.yml` возвращены advisory-steps для:
   - `audit_onboarding_wave89e.mjs`
   - `audit_hamburger_wave89f.mjs`
   - `audit_minimal_footer_wave89g.mjs`
   - `audit_skeleton_loading_wave89h.mjs`
   - `audit_subject_color_groups_wave89i.mjs`
   - `audit_parent_dashboard_wave89j.mjs`
   - `audit_weak_device_adaptive_wave89k.mjs`
   - `audit_spaced_repetition_sm2_wave89l.mjs`
   - `audit_adaptive_difficulty_wave89m.mjs`
   - `audit_learning_path_wave89n.mjs`

2. В `validate-questions.yml` добавлен ранний preflight:
   - `node tools/audit_workflow_parity_wave89y.mjs`

3. `actions/checkout` и `actions/setup-node` в обоих workflow обновлены до `@v5`, чтобы убрать runner-warning про старые `@v4` Node 20 actions на странице validate workflow.

## Что это даёт

- `Validate question banks` больше не должен падать из-за сломанной связи между двумя workflow.
- Если parity снова сломается, job упадёт сразу на явном preflight-аудите с понятным отчётом, а не где-то в середине цепочки с общим exit code 1.
