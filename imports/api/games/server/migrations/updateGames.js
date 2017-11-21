import {Meteor} from 'meteor/meteor';
import {Games} from '/imports/api/games/games.js';
import {GAME_FORFEIT_MINIMUM_POINTS, GAME_MAXIMUM_POINTS} from '/imports/api/games/constants.js';

Meteor.startup(function() {
	/**
	 * Migration for updating game
	 */
	Games.update({forfeitMinimumPoints: {$exists: false}}, {$set: {forfeitMinimumPoints: GAME_FORFEIT_MINIMUM_POINTS}}, {multi: true});
	Games.update({maximumPoints: {$exists: false}}, {$set: {maximumPoints: GAME_MAXIMUM_POINTS}}, {multi: true});
});
