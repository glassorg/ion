#!/bin/bash

trap "kill 0" SIGINT SIGTERM EXIT

guild build && yarn run watchGrammar &
guild watch &
nodemon -w lib -w ionsrc -w external -w src/test/ionsrc -e js,ts,ion --delay 150ms -x gtest lib &

wait