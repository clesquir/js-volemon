# js-volemon

[![Build Status](https://travis-ci.org/clesquir/js-volemon.svg?branch=master)](https://travis-ci.org/clesquir/js-volemon)

HTML5 multiplayer version of the Volemon (or Slime Volley) game implemented with the following technologies:
 * Meteor (www.meteor.com)
 * Phaser (www.phaser.io)
 * Socket.io (https://socket.io/)
 * WebRTC (https://github.com/feross/simple-peer)
 * Machine Learning (https://github.com/cazala/synaptic)
 * Chart.js (www.chartjs.org)
 * Yahoo Weather API (https://developer.yahoo.com/weather/)

## To install

Install meteor (https://www.meteor.com/install):
```
curl https://install.meteor.com/ | sh
```

Clone this repository, go into it, install dependencies and start the meteor server:
```
git clone git@github.com:clesquir/js-volemon.git
cd js-volemon
meteor npm install
meteor npm run get-phaser-typings
```

Copy settings.json to settings-dev.json and modify the following values:
 * smtpUrl
 * SOCKET_URL

Edit package.json to enter your ip address in scripts.meteor-dev. Then: 
```
meteor npm run meteor-dev
```

## To play

Open a browser with your ip address at port 3000 (e.g.: 192.168.200.23:3000).

Have fun!

## To develop

Several dev pages have been developed to better test:

 * AI - Machine Learning: http://localhost:3000/dev/ai
 * Engine: http://localhost:3000/dev/engine
 * Environment: http://localhost:3000/dev/environment
 * Shape: http://localhost:3000/dev/shape
 * Skin: http://localhost:3000/dev/skin
