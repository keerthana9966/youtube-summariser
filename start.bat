@echo off
title YouTube Summarizer AI
echo Starting YouTube Summarizer AI...
cd /d "%~dp0"

if exist backend\venv\Scripts\python.exe (
    set PYTHON=backend\venv\Scripts\python.exe
) else (
    set PYTHON=python
)

%PYTHON% run.py
pause
