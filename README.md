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
 * YAHOO_WEATHER_APP_ID
 * YAHOO_WEATHER_CONSUMER_KEY
 * YAHOO_WEATHER_CONSUMER_SECRET

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

## Apply backup from production

```
ssh root@volemon.cloudalto.net
docker exec -it mongodb bash -c 'mongodump -d meteor -o /dump'
docker cp mongodb:/dump ~/dump/
exit
scp -r root@volemon.cloudalto.net:dump/ ~/
mongorestore -h 127.0.0.1 --port 3001 --drop -d meteor ~/dump/dump/meteor
```

## Remove one user

```
db.users.remove({userId: "userId"})
db.userprofiles.remove({userId: "userId"})
db.userconfigurations.remove({userId: "userId"})
db.userreactions.remove({userId: "userId"})
db.userkeymaps.remove({userId: "userId"})
db.userachievements.remove({userId: "userId"})
db.eloscores.remove({userId: "userId"})
db.teameloscores.remove({userId: "userId"})
db.tournamenteloscores.remove({userId: "userId"})
db.profiles.remove({userId: "userId"})
db.tournamentprofiles.remove({userId: "userId"})
db.players.remove({userId: "userId"})
```
