#!/usr/bin/env bash

cd i-love-hue-two-client
npm run build

cd ../i-love-hue-two-server
tsc
