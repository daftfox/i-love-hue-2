#!/usr/bin/env bash

pwd
cd i-love-you-two-client
npm run build

cd ../i-love-you-two-server
tsc
