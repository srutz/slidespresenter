#!/bin/sh

npm run build && \
  ssh 217.160.244.47 "rm -rf sites/reactslides1.stepanrutz.com/*" && \
  scp -r dist/* 217.160.244.47:sites/reactslides1.stepanrutz.com
