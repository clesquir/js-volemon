import {ONE_VS_COMPUTER_GAME_MODE} from '/imports/api/games/constants.js';
import {Games} from '/imports/api/games/games.js';
import {PLAYER_DEFAULT_SHAPE} from '/imports/api/games/shapeConstants.js';
import {Meteor} from 'meteor/meteor';

Meteor.startup(function() {
	Games.update(
		{gameMode: ONE_VS_COMPUTER_GAME_MODE, 'players.id': {$ne: 'CPU'}},
		{$push: {players: {id: 'CPU', name: 'CPU', selectedShape: PLAYER_DEFAULT_SHAPE, shape: PLAYER_DEFAULT_SHAPE}}},
		{multi: true}
	);
});
