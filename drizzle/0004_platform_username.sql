ALTER TABLE "complaints"
  ADD COLUMN IF NOT EXISTS "platform_username" text;
