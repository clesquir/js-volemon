import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import Environment from '/imports/api/games/client/dev/Environment';

import './environment.html';

/** @type {Environment}|null */
let environment = null;
const groundHitEnabled = new ReactiveVar(true);
const ballHitCountEnabled = new ReactiveVar(true);
const matchPointEnabled = new ReactiveVar(false);
const deucePointEnabled = new ReactiveVar(false);

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
	ballHitCountEnabled: function() {
		return ballHitCountEnabled.get();
	},
	matchPointEnabled: function() {
		return matchPointEnabled.get();
	},
	deucePointEnabled: function() {
		return deucePointEnabled.get();
	}
});

Template.environment.events({
	'click [data-action="kill-player"]': function() {
		environment.killPlayer();
	},

	'click [data-action="revive-player"]': function() {
		environment.revivePlayer();
	},

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

	'click [data-action="enable-ball-hit-count"]': function() {
		if (ballHitCountEnabled.get()) {
			environment.disableBallHitCount();
		} else {
			environment.enableBallHitCount();
		}

		ballHitCountEnabled.set(!ballHitCountEnabled.get());
	},

	'click [data-action="enable-match-point"]': function() {
		if (matchPointEnabled.get()) {
			environment.disableMatchPoint();
		} else {
			environment.enableMatchPoint();
		}

		matchPointEnabled.set(!matchPointEnabled.get());
	},

	'click [data-action="enable-deuce-point"]': function() {
		if (deucePointEnabled.get()) {
			environment.disableDeucePoint();
		} else {
			environment.enableDeucePoint();
		}

		deucePointEnabled.set(!deucePointEnabled.get());
	}
});
