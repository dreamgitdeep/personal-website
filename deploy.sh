#!/usr/bin/env bash
# Simple deployment script for Unix-like shells
# Usage:
#   ./deploy.sh "发布更新"

MSG=${1:-"deploy: update site"}

echo "Staging all changes..."
git add -A

echo "Committing with message: $MSG"
git commit -m "$MSG"

echo "Pushing to origin main..."
git push origin main

echo "Done. Changes pushed to remote."