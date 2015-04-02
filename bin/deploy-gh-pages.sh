#!/bin/bash

set -e
npm run build
cd out
git init
git config user.name "Travis CI"
git config user.email "lee@leebyron.com"
git add .
git commit -m "Deploy to GitHub Pages"
git push --force --quiet "https://${GH_TOKEN}@github.com/leebyron/spec-md.git" master:gh-pages > /dev/null 2>&1
