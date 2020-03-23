#!/bin/bash

trap "kill 0" SIGINT SIGTERM EXIT

guild build && yarn run watchGrammar &
guild watch &
nodemon -w lib -w ionsrc -e js,ion --delay 150ms -x gtest lib &

wait