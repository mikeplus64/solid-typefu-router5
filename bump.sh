#!/usr/bin/env bash
npm run prepare
git add dist
git commit dist -m "build"
npm version "$@"
