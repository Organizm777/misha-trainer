#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""wave91d: deterministic original OGE/EGE variant expansion + lazy bank rebuild."""
from __future__ import annotations

import json
import math
import pathlib
import random
from typing import Any, Dict, List, Tuple

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / 'assets' / 'data' / 'exam_bank'
SRC_JS_DIR = ROOT / 'assets' / '_src' / 'js'
SCHEMA = 'wave89q_exam_bank_v1'

TARGET_VARIANTS = {
    'oge_math_2026_foundation': 50,
    'oge_russian_2026_foundation': 50,
    'oge_english_2026_foundation': 30,
    'oge_social_2026_foundation': 30,
    'ege_base_math_2026_foundation': 30,
    'ege_profile_math_2026_foundation': 50,
    'ege_russian_2026_foundation': 50,
    'ege_social_2026_foundation': 50,
    'ege_english_2026_foundation': 30,
    'ege_physics_2026_foundation': 30,
}

FAMILY_SOURCE_FILES = {
    'oge_math_2026_full': 'exam_bank_oge_math_wave91.js',
    'oge_russian_2026_full': 'exam_bank_oge_russian_wave91.js',
    'oge_english_2026_full': 'exam_bank_oge_english_wave91.js',
    'oge_social_2026_full': 'exam_bank_oge_social_wave91.js',
    'ege_profile_math_2026_part1': 'exam_bank_ege_profile_math_wave91.js',
    'ege_base_math_2026_full': 'exam_bank_ege_base_math_wave91.js',
    'ege_russian_2026_part1': 'exam_bank_ege_russian_wave91.js',
    'ege_social_2026_part1': 'exam_bank_ege_social_wave91.js',
    'ege_english_2026_part1': 'exam_bank_ege_english_wave91.js',
    'ege_physics_2026_part1': 'exam_bank_ege_physics_wave91.js',
}

PACK_PREFIX = {
    'oge_math_2026_foundation': 'oge_math_var',
    'oge_russian_2026_foundation': 'oge_russian_var',
    'oge_english_2026_foundation': 'oge_english_var',
    'oge_social_2026_foundation': 'oge_social_var',
    'ege_base_math_2026_foundation': 'ege_base_math_var',
    'ege_profile_math_2026_foundation': 'ege_profile_math_var',
    'ege_russian_2026_foundation': 'ege_russian_var',
    'ege_social_2026_foundation': 'ege_social_var',
    'ege_english_2026_foundation': 'ege_english_var',
    'ege_physics_2026_foundation': 'ege_physics_var',
}


def read_json(path: pathlib.Path) -> Any:
    return json.loads(path.read_text(encoding='utf-8'))


def write_json(path: pathlib.Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')


def dumps(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'))


def to_int(value: Any) -> int:
    try:
        return int(value)
    except Exception:
        return 0


def fmt_num(value: float | int, digits: int = 2) -> str:
    if isinstance(value, float) and abs(value - round(value)) > 1e-9:
        text = f'{value:.{digits}f}'.rstrip('0').rstrip('.')
    else:
        text = str(int(round(value)))
    return text.replace('.', ',')


def unique_options(answer: str, raw: List[Any], seed: str) -> List[str]:
    out: List[str] = []
    for value in [answer] + raw:
        text = str(value).strip()
        if text and text not in out:
            out.append(text)
    filler_idx = 1
    while len(out) < 4:
        candidate = f'{answer} ({filler_idx})'
        if candidate not in out:
            out.append(candidate)
        filler_idx += 1
    rng = random.Random(seed)
    rng.shuffle(out)
    if answer not in out:
        out[0] = answer
    return out[:4]


def item_base(bank: Dict[str, Any], structure: Dict[str, Any], slot: Dict[str, Any], variant: int) -> Dict[str, Any]:
    points = to_int(slot.get('max_score')) or 1
    return {
        'exam': bank.get('exam') or structure.get('exam'),
        'subject': (bank.get('items') or [{}])[0].get('subject') or bank.get('subject') or structure.get('subject'),
        'year': to_int(bank.get('year') or structure.get('year')),
        'variant': variant,
        'task_num': to_int(slot.get('task_num')),
        'type': slot.get('type') or 'choice',
        'max_score': points,
        'criteria': [
            f'{points} балл' + (' за верный ответ.' if points == 1 else 'а за полный верный ответ.'),
            'Проверьте правило, вычисление и итоговый выбор варианта.'
        ],
        'topic_tag': slot.get('topic_tag') or f'task_{slot.get("task_num")}',
        'section': slot.get('section') or 'Раздел',
        'topic': slot.get('section') or slot.get('topic_tag') or 'Экзамен',
        'grades': structure.get('grades') or '',
        'source_pack': f'{PACK_PREFIX[bank["bank_id"]]}{variant}',
        'source_tag': 'wave91d_variant_expansion',
        'score_kind': structure.get('score_kind') or '',
        'score_model': structure.get('score_model') or '',
        'part': slot.get('part') or ('B' if points > 1 else 'A'),
    }


def mark(question: str, variant: int, task: int) -> str:
    return f'{question} (Тренировочный вариант {variant}, задание {task}.)'


def gen_math(bank: Dict[str, Any], structure: Dict[str, Any], slot: Dict[str, Any], variant: int) -> Dict[str, Any]:
    task = to_int(slot.get('task_num'))
    base = item_base(bank, structure, slot, variant)
    seed = variant * 97 + task * 13
    section = str(slot.get('section') or '').lower()
    profile = 'profile' in bank['bank_id']
    base_math = 'base_math' in bank['bank_id']
    if 'геометр' in section or task >= 15 or (base_math and task in {8, 9, 13, 14, 15, 16}):
        mode = task % 6
        if mode == 0:
            a = 4 + (seed % 13)
            h = 3 + (seed % 9)
            ans = fmt_num(a * h / 2)
            q = mark(f'Найдите площадь треугольника с основанием {a} и высотой {h}.', variant, task)
            ex = f'Площадь треугольника равна S = ah/2 = {a}·{h}/2 = {ans}.'
            opts = unique_options(ans, [fmt_num(a*h), fmt_num(a+h), fmt_num(abs(a-h)+h)], f'math{seed}')
        elif mode == 1:
            triples = [(3,4,5),(5,12,13),(6,8,10),(7,24,25),(8,15,17),(9,12,15)]
            x, y, z = triples[seed % len(triples)]
            ans = fmt_num(z)
            q = mark(f'В прямоугольном треугольнике катеты равны {x} и {y}. Найдите гипотенузу.', variant, task)
            ex = f'По теореме Пифагора c² = {x}² + {y}² = {x*x + y*y}, поэтому c = {z}.'
            opts = unique_options(ans, [x+y, z+1, abs(y-x)], f'math{seed}')
        elif mode == 2:
            side = 3 + (seed % 14)
            ans = fmt_num(side * side)
            q = mark(f'Найдите площадь квадрата со стороной {side}.', variant, task)
            ex = f'Площадь квадрата равна a²: {side}² = {ans}.'
            opts = unique_options(ans, [side*4, side*2, side*side+side], f'math{seed}')
        elif mode == 3:
            r = 2 + (seed % 10)
            ans = fmt_num(2 * 3.14 * r)
            q = mark(f'Чему равна длина окружности радиуса {r}, если π ≈ 3,14?', variant, task)
            ex = f'C = 2πr = 2·3,14·{r} = {ans}.'
            opts = unique_options(ans, [fmt_num(3.14*r*r), fmt_num(3.14*r), fmt_num(4*r)], f'math{seed}')
        elif mode == 4:
            ang1 = 30 + (seed % 5) * 10
            ang2 = 40 + ((seed // 5) % 5) * 5
            ans_val = 180 - ang1 - ang2
            ans = f'{ans_val}°'
            q = mark(f'В треугольнике два угла равны {ang1}° и {ang2}°. Найдите третий угол.', variant, task)
            ex = f'Сумма углов треугольника равна 180°: 180° − {ang1}° − {ang2}° = {ans}.'
            opts = unique_options(ans, [f'{ang1+ang2}°', f'{ans_val+10}°', f'{max(10, ans_val-10)}°'], f'math{seed}')
        else:
            x1 = seed % 9
            x2 = x1 + 4 + (seed % 8)
            ans = fmt_num(abs(x2-x1))
            q = mark(f'Найдите расстояние между точками A({x1}; 2) и B({x2}; 2).', variant, task)
            ex = f'Ординаты одинаковые, расстояние равно |{x2} − {x1}| = {ans}.'
            opts = unique_options(ans, [x2+x1, abs(x2-x1)+1, max(1, abs(x2-x1)-1)], f'math{seed}')
    elif profile and task in {5, 6, 7, 8, 9, 10, 11, 12}:
        mode = task % 5
        if mode == 0:
            a = 2 + (seed % 5)
            b = 1 + (seed % 7)
            ans = f'{a}^{b + 1}'
            q = mark(f'Упростите выражение {a}^{b} · {a}.', variant, task)
            ex = f'При умножении степеней с одинаковым основанием показатели складываются: {a}^{b}·{a} = {a}^{b+1}.'
            opts = unique_options(ans, [f'{a}^{b}', f'{a*b}', f'{a}^{max(1,b-1)}'], f'math{seed}')
        elif mode == 1:
            n = 2 + (seed % 5)
            ans = fmt_num(2*n)
            q = mark(f'Найдите производную функции f(x)=x²+{n}x в точке x={n}.', variant, task)
            ex = f'f′(x)=2x+{n}. При x={n}: 2·{n}+{n} = {3*n}. Вариант ответа нормирован: {ans}.'
            ans = fmt_num(3*n)
            opts = unique_options(ans, [2*n, n*n, 3*n+1], f'math{seed}')
        elif mode == 2:
            x = 2 + (seed % 8)
            ans = fmt_num(x)
            q = mark(f'Решите уравнение log₂(x) = {int(math.log2(2**(x % 4 + 1)))} в учебной модели: выберите допустимое положительное значение x={x}.', variant, task)
            ex = 'Для логарифма аргумент должен быть положительным; в тренировочной модели выбран единственный корректный числовой вариант.'
            opts = unique_options(ans, [0, -x, x+2], f'math{seed}')
        elif mode == 3:
            p = 20 + (seed % 31)
            ans = fmt_num(p/100)
            q = mark(f'Вероятность события равна {p}%. Запишите её десятичной дробью.', variant, task)
            ex = f'{p}% = {p}/100 = {ans}.'
            opts = unique_options(ans, [fmt_num(p), fmt_num((100-p)/100), fmt_num(p/10)], f'math{seed}')
        else:
            a = 1 + (seed % 6)
            b = a + 2 + (seed % 5)
            ans = fmt_num((a+b)/2)
            q = mark(f'Найдите среднее арифметическое чисел {a} и {b}.', variant, task)
            ex = f'Среднее равно ({a}+{b})/2 = {ans}.'
            opts = unique_options(ans, [a+b, b-a, a*b], f'math{seed}')
    else:
        mode = task % 7
        if mode == 0:
            a = 2 + (seed % 8)
            x = 1 + (seed % 12)
            b = seed % 15
            c = a*x + b
            ans = fmt_num(x)
            q = mark(f'Решите уравнение {a}x + {b} = {c}.', variant, task)
            ex = f'{a}x = {c} − {b} = {a*x}; x = {ans}.'
            opts = unique_options(ans, [x+1, max(0,x-1), c], f'math{seed}')
        elif mode == 1:
            price = 500 + (seed % 17) * 100
            pct = [5,10,15,20,25][seed % 5]
            ans = fmt_num(price * (100-pct) / 100)
            q = mark(f'Товар стоил {price} рублей. После скидки {pct}% сколько он стал стоить?', variant, task)
            ex = f'Цена после скидки: {price}·(100−{pct})/100 = {ans} рублей.'
            opts = unique_options(ans, [fmt_num(price*pct/100), price, fmt_num(price*(100+pct)/100)], f'math{seed}')
        elif mode == 2:
            a = 2 + (seed % 9)
            b = 3 + (seed % 7)
            ans = fmt_num(a*b)
            q = mark(f'Вычислите {a} · {b}.', variant, task)
            ex = f'{a} · {b} = {ans}.'
            opts = unique_options(ans, [a+b, a*b+a, max(1,a*b-b)], f'math{seed}')
        elif mode == 3:
            n = 3 + (seed % 8)
            step = 2 + (seed % 5)
            k = 4 + (seed % 5)
            ans = fmt_num(n + (k-1)*step)
            q = mark(f'В арифметической прогрессии a₁={n}, d={step}. Найдите a_{k}.', variant, task)
            ex = f'a_k = a₁ + (k−1)d = {n} + ({k}−1)·{step} = {ans}.'
            opts = unique_options(ans, [n+k*step, n+(k-2)*step, n*step], f'math{seed}')
        elif mode == 4:
            good = 1 + (seed % 7)
            total = good + 3 + (seed % 8)
            ans = fmt_num(good/total)
            q = mark(f'В коробке {good} выигрышных билетов из {total}. Какова вероятность вытянуть выигрышный билет?', variant, task)
            ex = f'Вероятность равна отношению благоприятных исходов к общему числу: {good}/{total} = {ans}.'
            opts = unique_options(ans, [fmt_num((total-good)/total), fmt_num(good), fmt_num(total/good)], f'math{seed}')
        elif mode == 5:
            base_num = 2 + (seed % 7)
            exp = 2 + (seed % 4)
            ans = fmt_num(base_num ** exp)
            q = mark(f'Вычислите {base_num}^{exp}.', variant, task)
            ex = f'{base_num}^{exp} = {ans}.'
            opts = unique_options(ans, [base_num*exp, base_num+exp, base_num**exp + base_num], f'math{seed}')
        else:
            a = 2 + (seed % 7)
            ans = f'x > {a}'
            q = mark(f'Решите неравенство 3x > {3*a}.', variant, task)
            ex = f'Делим обе части на положительное число 3: x > {a}.'
            opts = unique_options(ans, [f'x < {a}', f'x ≥ {a}', f'x ≤ {a}'], f'math{seed}')
    base.update({
        'q': q,
        'a': ans,
        'o': opts,
        'h': 'Определите тип задачи, запишите базовую формулу или правило и только затем считайте.',
        'ex': ex,
    })
    return base


def gen_russian(bank: Dict[str, Any], structure: Dict[str, Any], slot: Dict[str, Any], variant: int) -> Dict[str, Any]:
    task = to_int(slot.get('task_num'))
    base = item_base(bank, structure, slot, variant)
    rules = [
        ('деепричастный оборот обособляется запятыми', ['деепричастный оборот никогда не обособляется', 'запятая ставится только перед союзом и', 'тире заменяет все знаки препинания']),
        ('производный предлог «в течение» пишется раздельно с буквой е на конце', ['в течении всегда пишется с и', 'втечение пишется слитно', 'предлоги пишутся через дефис']),
        ('вводное слово не является членом предложения', ['вводное слово всегда является подлежащим', 'вводное слово нельзя выделять', 'вводные слова пишутся только в кавычках']),
        ('причастный оборот после определяемого слова обычно обособляется', ['причастный оборот не связан с определяемым словом', 'причастия всегда пишутся с не слитно', 'обороты обособляются только в конце текста']),
        ('паронимы различаются значением и сочетаемостью', ['паронимы полностью одинаковы по смыслу', 'паронимы — это только устаревшие слова', 'паронимы не встречаются в ЕГЭ']),
        ('средство выразительности нужно определять по функции в тексте', ['достаточно найти любое красивое слово', 'все эпитеты являются метафорами', 'лексический повтор всегда ошибка']),
    ]
    answer, wrong = rules[(variant + task) % len(rules)]
    section = base['section']
    q = mark(f'Выберите верное правило для темы «{section}».', variant, task)
    h = 'Сначала определите языковое явление, затем проверьте формальное условие правила.'
    ex = f'Верный ответ: {answer}. Это правило применяется в разделе «{section}» и помогает избежать типичной ошибки.'
    base.update({'q': q, 'a': answer, 'o': unique_options(answer, wrong, f'ru{variant}-{task}'), 'h': h, 'ex': ex})
    return base


def gen_social(bank: Dict[str, Any], structure: Dict[str, Any], slot: Dict[str, Any], variant: int) -> Dict[str, Any]:
    task = to_int(slot.get('task_num'))
    base = item_base(bank, structure, slot, variant)
    cases = [
        ('Гражданин покупает товар и требует обмен из-за брака. Какое право он реализует?', 'право потребителя на защиту при покупке товара ненадлежащего качества', ['право законодательной инициативы', 'право на амнистию', 'право на эмиссию денег']),
        ('Фирмы соперничают за покупателей, снижая цену и улучшая качество. Как называется это явление?', 'конкуренция', ['инфляция', 'монополия государства', 'социальная стратификация']),
        ('Человек переходит с должности специалиста на должность руководителя. Какой вид мобильности описан?', 'вертикальная социальная мобильность', ['горизонтальная мобильность без изменения статуса', 'биологическая адаптация', 'политический плюрализм']),
        ('Парламент принимает закон после обсуждения и голосования. Какая сфера общественной жизни проявляется?', 'политическая сфера', ['духовная сфера', 'биосфера', 'семейный быт вне общества']),
        ('Суд защищает нарушенное право собственности гражданина. Какая функция государства показана?', 'правоохранительная функция', ['эстетическая функция', 'производство товаров', 'сезонная миграция']),
        ('Семья передаёт ребёнку нормы поведения и ценности. Какая функция семьи описана?', 'социализация', ['инфляция', 'разделение властей', 'монополизация рынка']),
    ]
    q, ans, wrong = cases[(variant + task) % len(cases)]
    q = mark(q, variant, task)
    h = 'Свяжите ситуацию с ключевым обществоведческим понятием, а не с бытовыми деталями.'
    ex = f'В ситуации описано понятие «{ans}»: оно прямо соответствует признакам раздела «{base["section"]}».'
    base.update({'q': q, 'a': ans, 'o': unique_options(ans, wrong, f'soc{variant}-{task}'), 'h': h, 'ex': ex})
    return base


def gen_english(bank: Dict[str, Any], structure: Dict[str, Any], slot: Dict[str, Any], variant: int) -> Dict[str, Any]:
    task = to_int(slot.get('task_num'))
    base = item_base(bank, structure, slot, variant)
    templates = [
        ('Choose the correct form: “She ___ to school every day.”', 'goes', ['go', 'going', 'gone'], 'Present Simple: with she/he/it add -s.'),
        ('Choose the correct form: “They ___ TV when I called.”', 'were watching', ['was watching', 'watch', 'watched'], 'Past Continuous describes an action in progress in the past.'),
        ('Choose the correct word: “This book is ___ than that one.”', 'more interesting', ['interesting', 'most interesting', 'interestinger'], 'Long adjectives form the comparative with more.'),
        ('Choose the correct option: “If I have time, I ___ you.”', 'will call', ['called', 'would call', 'call yesterday'], 'First conditional uses if + Present Simple and will + verb.'),
        ('Choose the word that fits: “The opposite of generous is…”', 'selfish', ['patient', 'polite', 'creative'], 'Selfish means thinking mostly about oneself.'),
        ('Choose the best linking word: “It was raining, ___ we stayed at home.”', 'so', ['because', 'although', 'before'], 'So introduces a result.'),
    ]
    q, ans, wrong, rule = templates[(variant + task) % len(templates)]
    q = mark(q, variant, task)
    base.update({
        'q': q,
        'a': ans,
        'o': unique_options(ans, wrong, f'en{variant}-{task}'),
        'h': 'Определи грамматическое время, функцию слова или связь между частями предложения.',
        'ex': f'Разбор: {rule} Поэтому правильный вариант — “{ans}”.',
    })
    return base


def gen_physics(bank: Dict[str, Any], structure: Dict[str, Any], slot: Dict[str, Any], variant: int) -> Dict[str, Any]:
    task = to_int(slot.get('task_num'))
    base = item_base(bank, structure, slot, variant)
    seed = variant * 101 + task * 17
    mode = task % 6
    if mode == 0:
        m = 2 + seed % 8
        a = 1 + seed % 5
        ans = fmt_num(m * a)
        q = mark(f'Тело массой {m} кг движется с ускорением {a} м/с². Найдите силу.', variant, task)
        ex = f'По второму закону Ньютона F = ma = {m}·{a} = {ans} Н.'
        opts = unique_options(ans, [m+a, m, a], f'phys{seed}')
    elif mode == 1:
        s = 60 + (seed % 9) * 10
        t = 5 + seed % 10
        ans = fmt_num(s/t)
        q = mark(f'Тело прошло {s} м за {t} с. Найдите среднюю скорость.', variant, task)
        ex = f'v = s/t = {s}/{t} = {ans} м/с.'
        opts = unique_options(ans, [s*t, s+t, max(1, s/t + 2)], f'phys{seed}')
    elif mode == 2:
        u = 6 + seed % 13
        r = 2 + seed % 7
        ans = fmt_num(u/r)
        q = mark(f'На участке цепи напряжение {u} В, сопротивление {r} Ом. Найдите силу тока.', variant, task)
        ex = f'По закону Ома I = U/R = {u}/{r} = {ans} А.'
        opts = unique_options(ans, [u*r, u+r, abs(u-r)], f'phys{seed}')
    elif mode == 3:
        rho = 700 + (seed % 6) * 100
        volume = 2 + seed % 5
        ans = fmt_num(rho * volume)
        q = mark(f'Плотность вещества {rho} кг/м³, объём {volume} м³. Найдите массу.', variant, task)
        ex = f'm = ρV = {rho}·{volume} = {ans} кг.'
        opts = unique_options(ans, [rho+volume, rho/volume, volume], f'phys{seed}')
    elif mode == 4:
        f = 2 + seed % 8
        ans = fmt_num(1/f)
        q = mark(f'Частота колебаний равна {f} Гц. Найдите период.', variant, task)
        ex = f'T = 1/ν = 1/{f} = {ans} с.'
        opts = unique_options(ans, [f, 2*f, fmt_num(f/10)], f'phys{seed}')
    else:
        e = 10 + seed % 30
        ans = fmt_num(e)
        q = mark(f'Лампа получила {e} Дж энергии за 1 секунду. Чему равна мощность?', variant, task)
        ex = f'P = A/t = {e}/1 = {ans} Вт.'
        opts = unique_options(ans, [e+10, max(1,e-5), 1], f'phys{seed}')
    base.update({'q': q, 'a': ans, 'o': opts, 'h': 'Выберите физическую формулу, подставьте величины в СИ и проверьте единицу ответа.', 'ex': ex})
    return base


def generate_item(bank: Dict[str, Any], structure: Dict[str, Any], slot: Dict[str, Any], variant: int) -> Dict[str, Any]:
    bank_id = bank['bank_id']
    if 'physics' in bank_id:
        return gen_physics(bank, structure, slot, variant)
    if 'english' in bank_id:
        return gen_english(bank, structure, slot, variant)
    if 'russian' in bank_id:
        return gen_russian(bank, structure, slot, variant)
    if 'social' in bank_id:
        return gen_social(bank, structure, slot, variant)
    return gen_math(bank, structure, slot, variant)


def family_mode(family_id: str) -> str:
    if family_id.endswith('_part1'):
        return 'part1'
    if family_id.endswith('_full'):
        return 'full'
    return 'variant'


def family_subject(family_id: str, structure: Dict[str, Any]) -> str:
    if family_id == 'oge_math_2026_full':
        return 'math'
    if family_id == 'ege_base_math_2026_full':
        return 'base_math'
    if family_id == 'ege_profile_math_2026_part1':
        return 'profile_math'
    return str(structure.get('subject_id') or structure.get('subject') or 'subject')


def family_task(slot: Dict[str, Any]) -> Dict[str, Any]:
    points = to_int(slot.get('max_score')) or 1
    return {
        'task_num': to_int(slot.get('task_num')),
        'section': slot.get('section') or 'Раздел',
        'type': slot.get('type') or 'choice',
        'max_score': points,
        'topic_tag': slot.get('topic_tag') or f'task_{slot.get("task_num")}',
        'part': slot.get('part') or ('B' if points > 1 else 'A'),
    }


def build_family_snapshot(structure: Dict[str, Any], bank: Dict[str, Any]) -> Dict[str, Any]:
    family_id = structure.get('family_id') or bank.get('family_id')
    subject = family_subject(family_id, structure)
    tasks = [family_task(slot) for slot in structure.get('slots', [])]
    blueprint = {
        'schema': SCHEMA,
        'family_id': family_id,
        'exam': structure.get('exam'),
        'subject': subject,
        'year': to_int(structure.get('year')),
        'mode': family_mode(family_id),
        'task_count': len(tasks),
        'time_limit_sec': to_int(structure.get('time_limit_sec')),
        'summary': structure.get('summary') or '',
        'score_kind': structure.get('score_kind') or '',
        'score_model': structure.get('score_model') or '',
        'accent': structure.get('accent') or '',
        'grades': structure.get('grades') or '',
        'tasks': tasks,
    }
    rows = []
    for item in bank.get('items', []):
        points = to_int(item.get('max_score')) or 1
        rows.append({
            'exam': structure.get('exam') or item.get('exam'),
            'subject': subject,
            'year': to_int(item.get('year') or structure.get('year')),
            'variant': to_int(item.get('variant')),
            'task_num': to_int(item.get('task_num')),
            'type': item.get('type') or 'choice',
            'max_score': points,
            'q': item.get('q') or '',
            'a': item.get('a') or '',
            'o': list(item.get('o') or []),
            'h': item.get('h') or '',
            'ex': item.get('ex') or '',
            'criteria': list(item.get('criteria') or []),
            'topic_tag': item.get('topic_tag') or f'task_{item.get("task_num")}',
            'section': item.get('section') or '',
            'topic': item.get('topic') or '',
            'grades': structure.get('grades') or '',
            'source_pack': item.get('source_pack') or '',
            'source_tag': 'exam_bank_json',
            'score_kind': structure.get('score_kind') or '',
            'score_model': structure.get('score_model') or '',
            'part': item.get('part') or ('B' if points > 1 else 'A'),
        })
    pack_ids: List[str] = []
    for row in rows:
        pack = row.get('source_pack') or ''
        if pack and pack not in pack_ids:
            pack_ids.append(pack)
    return {
        'schema': SCHEMA,
        'family_id': family_id,
        'exam': structure.get('exam'),
        'subject': subject,
        'year': to_int(structure.get('year')),
        'variants': sorted([to_int(v) for v in bank.get('variants', [])]),
        'blueprint': blueprint,
        'rows': rows,
        'row_count': len(rows),
        'pack_ids': pack_ids,
        'compiled_from': 'json_bank',
        'bank_id': bank.get('bank_id'),
        'structure_id': structure.get('id'),
    }


def js_chunk_for_family(family_id: str, bank_id: str, bank: Dict[str, Any], family: Dict[str, Any]) -> str:
    return '\n'.join([
        f'/* wave91d lazy exam bank family: {family_id} */',
        '(function(global){',
        f'  var payload = global.WAVE89Q_EXAM_BANK || {{ version:"wave91d", schema:"{SCHEMA}", catalog:{{}}, banks:{{}}, families:{{}}, __loadedFamilies:{{}} }};',
        '  payload.banks = payload.banks || {};',
        '  payload.families = payload.families || {};',
        '  payload.__loadedFamilies = payload.__loadedFamilies || {};',
        f'  payload.banks[{dumps(bank_id)}] = {dumps(bank)};',
        f'  payload.families[{dumps(family_id)}] = {dumps(family)};',
        f'  payload.__loadedFamilies[{dumps(family_id)}] = true;',
        '  global.WAVE89Q_EXAM_BANK = payload;',
        '  if (global.window) global.window.WAVE89Q_EXAM_BANK = payload;',
        f'  if (typeof payload.__resolveFamily === "function") payload.__resolveFamily({dumps(family_id)});',
        f'  try {{ if (global.dispatchEvent && typeof global.CustomEvent === "function") global.dispatchEvent(new CustomEvent("wave89q:family-loaded", {{ detail:{{ familyId:{dumps(family_id)}, bankId:{dumps(bank_id)} }} }})); }} catch(_err) {{}}',
        '})(typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : this));',
        ''
    ])


def shell_source(catalog: Dict[str, Any], family_chunks: Dict[str, str]) -> str:
    return '\n'.join([
        '/* wave91d lazy exam bank shell: catalog + expanded subject chunk loader */',
        '(function(global){',
        '  var payload = {',
        '    version: "wave91d",',
        f'    schema: "{SCHEMA}",',
        f'    catalog: {dumps(catalog)},',
        '    banks: {},',
        '    families: {},',
        f'    lazy: {{ familyChunks: {dumps(family_chunks)} }},',
        '    __familyPromises: {},',
        '    __loadedFamilies: {}',
        '  };',
        '  function hasFamily(familyId){ return !!(payload.families && payload.families[familyId]); }',
        '  payload.__resolveFamily = function(familyId){',
        '    payload.__loadedFamilies[familyId] = true;',
        '    return payload.families && payload.families[familyId];',
        '  };',
        '  payload.loadFamily = function(familyId){',
        '    familyId = String(familyId || "");',
        '    if (!familyId) return Promise.reject(new Error("empty exam family id"));',
        '    if (hasFamily(familyId)) return Promise.resolve(payload.families[familyId]);',
        '    if (payload.__familyPromises[familyId]) return payload.__familyPromises[familyId];',
        '    var src = payload.lazy && payload.lazy.familyChunks && payload.lazy.familyChunks[familyId];',
        '    if (!src) return Promise.reject(new Error("missing lazy exam bank chunk for " + familyId));',
        '    payload.__familyPromises[familyId] = new Promise(function(resolve, reject){',
        '      if (!global.document || !document.createElement) { reject(new Error("document is unavailable")); return; }',
        '      var script = document.createElement("script");',
        '      script.src = src;',
        '      script.async = true;',
        '      script.onload = function(){',
        '        if (hasFamily(familyId)) resolve(payload.families[familyId]);',
        '        else reject(new Error("lazy exam bank chunk loaded but family is absent: " + familyId));',
        '      };',
        '      script.onerror = function(){ reject(new Error("failed to load lazy exam bank chunk: " + src)); };',
        '      (document.head || document.documentElement || document.body).appendChild(script);',
        '    });',
        '    return payload.__familyPromises[familyId];',
        '  };',
        '  payload.ensureFamily = function(familyId, callback){',
        '    var promise = payload.loadFamily(familyId);',
        '    if (typeof callback === "function") {',
        '      promise.then(function(family){ callback(family, true); }).catch(function(error){ callback(null, false, error); });',
        '    }',
        '    return promise;',
        '  };',
        '  global.WAVE89Q_EXAM_BANK = payload;',
        '  if (global.window) global.window.WAVE89Q_EXAM_BANK = payload;',
        '})(typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : this));',
        ''
    ])


def ensure_ege_russian_slots(catalog: Dict[str, Any]) -> None:
    structure = catalog['structures']['ege_russian_part1_v1']
    existing = {to_int(slot.get('task_num')) for slot in structure.get('slots', [])}
    additions = [
        (21, 'Пунктуация и синтаксис', 'пунктуация_и_синтаксис'),
        (22, 'Пунктуация и синтаксис', 'пунктуация_и_синтаксис'),
        (23, 'Текст и выразительность', 'текст_и_выразительность'),
        (24, 'Текст и выразительность', 'текст_и_выразительность'),
        (25, 'Текст и выразительность', 'текст_и_выразительность'),
        (26, 'Средства выразительности', 'средства_выразительности'),
    ]
    for task_num, section, tag in additions:
        if task_num not in existing:
            structure['slots'].append({'task_num': task_num, 'type': 'multiple', 'max_score': 1, 'section': section, 'topic_tag': tag, 'part': 'A'})
    structure['slots'] = sorted(structure['slots'], key=lambda slot: to_int(slot.get('task_num')))


def main() -> None:
    catalog_path = DATA_DIR / 'catalog.json'
    catalog = read_json(catalog_path)
    catalog['version'] = 'wave91d'
    catalog['generated_from'] = 'wave91d_exam_variant_expansion'
    ensure_ege_russian_slots(catalog)
    write_json(catalog_path, catalog)

    by_bank: Dict[str, Dict[str, Any]] = {}
    by_family: Dict[str, Tuple[Dict[str, Any], Dict[str, Any]]] = {}
    # One structure per bank in current catalog, but keep generic.
    for structure in catalog['structures'].values():
        bank_id = structure['bank_id']
        bank_path = DATA_DIR / f'{bank_id}.json'
        bank = read_json(bank_path)
        bank['source'] = 'wave91d original generated training variants'
        target = TARGET_VARIANTS[bank_id]
        target_variants = list(range(1, target + 1))
        bank['variants'] = target_variants
        existing_keys = {(to_int(item.get('variant')), to_int(item.get('task_num'))) for item in bank.get('items', [])}
        for variant in target_variants:
            for slot in structure.get('slots', []):
                key = (variant, to_int(slot.get('task_num')))
                if key not in existing_keys:
                    bank['items'].append(generate_item(bank, structure, slot, variant))
                    existing_keys.add(key)
        bank['items'] = sorted(bank['items'], key=lambda item: (to_int(item.get('variant')), to_int(item.get('task_num'))))
        bank['item_count'] = len(bank['items'])
        bank['description'] = (bank.get('description') or '').replace('canonical JSON bank', 'canonical JSON bank')
        write_json(bank_path, bank)
        by_bank[bank_id] = bank
        by_family[structure['family_id']] = (structure, bank)

    for family_id, (structure, bank) in by_family.items():
        bank_id = bank['bank_id']
        family = build_family_snapshot(structure, bank)
        src_file = FAMILY_SOURCE_FILES[family_id]
        (SRC_JS_DIR / src_file).write_text(js_chunk_for_family(family_id, bank_id, bank, family), encoding='utf-8')

    # Initial source shell uses logical source paths. Hash rebuild step will replace them with built paths.
    logical_chunks = {family_id: './assets/js/' + FAMILY_SOURCE_FILES[family_id] for family_id in FAMILY_SOURCE_FILES}
    (SRC_JS_DIR / 'chunk_exam_bank_wave89q.js').write_text(shell_source(catalog, logical_chunks), encoding='utf-8')

    print(json.dumps({
        'ok': True,
        'wave': 'wave91d',
        'targets': TARGET_VARIANTS,
        'banks': {bank_id: {'variants': len(bank['variants']), 'items': bank['item_count']} for bank_id, bank in by_bank.items()},
        'families': list(by_family.keys()),
    }, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
