#!/bin/bash

npm run docs
./node_modules/httpster/bin/httpster -d ./apidocs &
open http://localhost:3333
./node_modules/nodemon/bin/nodemon.js -w ./docs/JSDOC.md -w lib/ -x "npm run docs" -e js