import {ALL_BONUSES} from '/imports/api/games/bonusConstants';
import {ONE_VS_ONE_GAME_MODE} from '/imports/api/games/constants';
import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import Environment from '/imports/api/games/client/dev/Environment';

import './environment.html';

/** @type {Environment}|null */
let environment = null;
const netEnabled = new ReactiveVar(true);
const groundHitEnabled = new ReactiveVar(false);
const ballHitCountEnabled = new ReactiveVar(false);
const matchPointEnabled = new ReactiveVar(false);
const deucePointEnabled = new ReactiveVar(false);

Template.environment.rendered = function() {
	Session.set('dev.environment.currentMode', ONE_VS_ONE_GAME_MODE);
	Session.set('dev.environment.hasNet', netEnabled.get());
	environment = new Environment();
	environment.start();
};

Template.environment.destroyed = function() {
	if (environment) {
		environment.stop();
	}
};

Template.environment.helpers({
	bonuses: function() {
		return ALL_BONUSES;
	},
	modeIsSelected: function(mode) {
		return Session.get('dev.environment.currentMode') === mode;
	},
	netEnabled: function() {
		return netEnabled.get();
	},
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

	'click [data-action="create-bonus"]': function() {
		environment.createBonus($('#bonus-class')[0].value);
	},

	'click [data-action="change-mode"]': function(e) {
		Session.set('dev.environment.currentMode', $(e.currentTarget).attr('data-mode-id'));

		environment.stop();
		environment = new Environment();
		environment.start();
	},

	'click [data-action="enable-disable-has-net"]': function() {
		if (groundHitEnabled.get()) {
			environment.disableGroundHit();
		} else {
			environment.enableGroundHit();
		}

		groundHitEnabled.set(!groundHitEnabled.get());
	},

	'click [data-action="enable-disable-ground-hit"]': function() {
		netEnabled.set(!netEnabled.get());
		Session.set('dev.environment.hasNet', netEnabled.get());

		environment.stop();
		environment = new Environment();
		environment.start();
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
