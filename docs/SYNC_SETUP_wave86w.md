# wave86w: настройка синхронизации между устройствами

Синхронизация работает как thin client поверх существующей резервной копии класса. В сборке нет SDK и секретов: приложение делает REST-запросы к вашему Supabase или Firebase проекту.

## Supabase

1. Создайте таблицу:

```sql
create table if not exists trainer_sync_snapshots (
  id text primary key,
  sync_id text not null,
  grade text not null,
  updated_at timestamptz not null,
  checksum text,
  payload jsonb not null
);
```

2. Настройте RLS под ваш режим доступа. Для приватного семейного проекта можно разрешить доступ только по anon key; для публичного проекта лучше добавить edge-function или авторизацию.
3. В тренажёре откройте класс → «☁️ Синхронизация» и заполните:
   - Supabase URL: `https://xxxx.supabase.co`
   - anon public key
   - таблица: `trainer_sync_snapshots`
   - sync-код: одинаковый на всех устройствах.

## Firebase Firestore REST

1. Включите Firestore.
2. Укажите в UI:
   - Firebase projectId
   - Web API key
   - collection, по умолчанию `trainer_sync`.
3. Chunk создаёт один документ на класс: `{syncId}-grade-{grade}`. Полный snapshot хранится в `payloadJson`.

## Как пользоваться

На первом устройстве нажмите «⬆️ Отправить в облако». На втором устройстве откройте тот же класс, введите те же параметры и нажмите «⬇️ Восстановить из облака». Автосохранение после тренировки можно включить отдельно; восстановление всегда требует подтверждения.

Приватный режим блокирует отправку в облако. Ручное восстановление из облака приватным режимом не блокируется.
