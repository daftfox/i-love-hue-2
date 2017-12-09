#!/usr/bin/env bash

cd i-love-you-two-client
npm run build

cd ../i-love-you-two-server
tsc
