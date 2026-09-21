#!/bin/zsh
# verno dev sunucusunu 8083'te ayakta tutar; süreç ölürse 3 sn sonra yeniden başlatır.
# Durdurmak icin: kill $(cat /tmp/verno-dev-keepalive.pid)
cd /Users/omer/Desktop/verno || exit 1
LOG=/tmp/verno-dev.log
echo $$ > /tmp/verno-dev-keepalive.pid
while true; do
  echo "[keepalive] $(date '+%F %T') dev sunucusu baslatiliyor" >> "$LOG"
  npm run dev -- --port 8083 --host 0.0.0.0 >> "$LOG" 2>&1
  echo "[keepalive] $(date '+%F %T') sunucu durdu (exit $?), 3 sn sonra tekrar" >> "$LOG"
  sleep 3
done
