#!/usr/bin/env bash
# Local dev bootstrap — run from repo root: ./scripts/setup-local.sh
set -euo pipefail
cd "$(dirname "$0")/.."

echo "→ Checking Node.js…"
command -v node >/dev/null || { echo "Install Node.js from https://nodejs.org"; exit 1; }
echo "  node $(node -v)"

echo "→ Checking .env…"
if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "  Created .env from .env.example — fill BETTER_AUTH_SECRET and DATABASE_URL"
  exit 1
fi
if grep -q 'BETTER_AUTH_SECRET=""' .env 2>/dev/null; then
  SECRET=$(openssl rand -base64 32)
  if [[ "$(uname)" == "Darwin" ]]; then
    sed -i '' "s|^BETTER_AUTH_SECRET=.*|BETTER_AUTH_SECRET=\"${SECRET}\"|" .env
  else
    sed -i "s|^BETTER_AUTH_SECRET=.*|BETTER_AUTH_SECRET=\"${SECRET}\"|" .env
  fi
  echo "  Generated BETTER_AUTH_SECRET"
fi

grep -q '^EMAIL_DEV_CONSOLE=' .env || echo 'EMAIL_DEV_CONSOLE="true"' >> .env
grep -q '^STORAGE_BACKEND=' .env || echo 'STORAGE_BACKEND="local"' >> .env
grep -q '^STORAGE_LOCAL_PATH=' .env || echo 'STORAGE_LOCAL_PATH="./data/storage"' >> .env
mkdir -p data/storage

echo "→ Installing npm packages…"
npm install

echo "→ Checking PostgreSQL on localhost:5432…"
if ! (echo >/dev/tcp/localhost/5432) 2>/dev/null; then
  echo ""
  echo "  PostgreSQL is not running."
  echo "  Install Postgres.app (easiest on Mac): https://postgresapp.com/downloads.html"
  echo "  After install: open Postgres.app → Initialize → create database 'tepkimvar':"
  echo "    psql postgres -c \"CREATE DATABASE tepkimvar;\""
  echo "  Default URL in .env: postgresql://postgres:postgres@localhost:5432/tepkimvar"
  echo ""
  exit 1
fi

echo "→ Running migrations…"
npm run db:migrate

echo ""
echo "✓ Ready. Start the dev server:"
echo "  npm run dev"
echo "  → http://localhost:8080"
