# verno

Българска платформа за жалби и решения — базирана на altyapı от [tepkimvar](https://tepkimvar.com).

## Stack

- TanStack Start + React 19 + Nitro
- PostgreSQL + Drizzle ORM
- Better Auth (email, OAuth, OTP)
- S3/MinIO storage
- AI complaint bot (fal.ai / OpenRouter)

## Локална разработка

```bash
cp .env.example .env
# Попълнете DATABASE_URL и другите задължителни променливи

npm install
npm run db:migrate
npm run dev
```

## Основни функции (altyapı)

- **Жалби** — писане, модерация, отговори от марки, ескалации
- **Марки** — директория, профили, корпоративен панел
- **Роли** — `super_admin`, `admin`, `brand`, `user`, `moderator`
- **Complaint bot** — AI генериране на синтетични жалби (по подразбиране скрити)
- **Auth** — регистрация, email OTP, телефон OTP, OAuth

## Език

UI текстовете ще бъдат на български. Görünüm sayfaları Tailwind kodları ile ayrıca güncellenecek.
