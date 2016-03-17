#!/bin/bash

npm run docs
httpster -d ./apidocs &
open http://localhost:3333
nodemon -w lib/ -x "npm run docs" -e js
