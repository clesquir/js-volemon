import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import Environment from '/imports/api/games/client/dev/Environment.js';

import './environment.html';

/** @type {Environment}|null */
let environment = null;
const groundHitEnabled = new ReactiveVar(true);
const playerJumpCanOnEnabled = new ReactiveVar(false);
const opponentMoveEnabled = new ReactiveVar(false);

Template.environment.rendered = function() {
	environment = new Environment();
	environment.start();
};

Template.environment.destroyed = function() {
	if (environment) {
		environment.stop();
	}
};

Template.environment.helpers({
	groundHitEnabled: function() {
		return groundHitEnabled.get();
	},
	playerJumpCanOnEnabled: function() {
		return playerJumpCanOnEnabled.get();
	},
	opponentMoveEnabled: function() {
		return opponentMoveEnabled.get();
	}
});

Template.environment.events({
	'click [data-action="create-random-bonus"]': function() {
		environment.createRandomBonus();
	},

	'click [data-action="enable-disable-ground-hit"]': function() {
		if (groundHitEnabled.get()) {
			environment.disableGroundHit();
		} else {
			environment.enableGroundHit();
		}

		groundHitEnabled.set(!groundHitEnabled.get());
	},

	'click [data-action="enable-disable-player-can-jump-on"]': function() {
		if (playerJumpCanOnEnabled.get()) {
			environment.disablePlayerCanJumpOnPlayer();
		} else {
			environment.enablePlayerCanJumpOnPlayer();
		}

		playerJumpCanOnEnabled.set(!playerJumpCanOnEnabled.get());
	},

	'click [data-action="enable-randomly-opponent-move"]': function() {
		if (opponentMoveEnabled.get()) {
			environment.disableOpponentMoveEnabled();
		} else {
			environment.enableOpponentMoveEnabled();
		}

		opponentMoveEnabled.set(!opponentMoveEnabled.get());
	}
});
