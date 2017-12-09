#!/bin/bash

rsync -arve "ssh $SSH_OPTIONS" --no-perms --no-owner --no-group --delete --exclude '.git' i-love-hue-two-server/dist/server/ root@$DEPLOY_HOST:/var/i-love-hue-two-server/
rsync -arve "ssh $SSH_OPTIONS" --no-perms --no-owner --no-group --delete --exclude '.git' i-love-hue-two-client/dist/ root@$DEPLOY_HOST:/var/www/html/i-love-hue-two