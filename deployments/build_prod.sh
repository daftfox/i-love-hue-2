#!/usr/bin/env bash

cd i-love-hue-two-client
npm run build
cp -r src/assets dist/assets

cd ../i-love-hue-two-server
npm run build
cp  package.json dist/server/package.json
