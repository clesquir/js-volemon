import {Meteor} from 'meteor/meteor';
import {Games} from '/imports/api/games/games.js';

Meteor.startup(function() {
	/**
	 * Migration for updating game
	 */
	Games.update({viewers: 0}, {$set: {viewers: []}}, {multi: true});
});
