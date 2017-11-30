# js-volemon

HTML5 multiplayer version of the Volemon (or Slime Volley) game implemented with the following technologies:
 * Meteor (www.meteor.com)
 * Phaser (www.phaser.io)
 * Socket.io (https://socket.io/)
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
```

Edit the package.json to modify the ip address in scripts.meteor-dev. Then: 
```
npm run meteor-dev
```

## To play

Open a browser with your ip address at port 3000 (e.g.: 192.168.200.23:3000).

Have fun!
