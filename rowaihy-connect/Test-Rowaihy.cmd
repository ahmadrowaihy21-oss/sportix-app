@echo off
cd /d "%~dp0"
node --test test/*.test.mjs
pause
