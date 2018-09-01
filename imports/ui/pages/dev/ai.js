import Ai from '/imports/api/games/client/dev/Ai.js';
import {Template} from 'meteor/templating';

import './ai.html';

/** @type {Ai}|null */
let ai = null;
const firstPlayerHumanEnabled = new ReactiveVar(false);
const secondPlayerMachineLearningEnabled = new ReactiveVar(true);
const fullSpeedEnabled = new ReactiveVar(false);
const jumpEnabled = new ReactiveVar(false);

Template.ai.rendered = function() {
	ai = new Ai();
	ai.start();
};

Template.ai.destroyed = function() {
	if (ai) {
		ai.stop();
	}
};

Template.ai.helpers({
	firstPlayerHumanEnabled: function() {
		return firstPlayerHumanEnabled.get();
	},
	secondPlayerMachineLearningEnabled: function() {
		return secondPlayerMachineLearningEnabled.get();
	},
	fullSpeedEnabled: function() {
		return fullSpeedEnabled.get();
	},
	jumpEnabled: function() {
		return jumpEnabled.get();
	}
});

Template.ai.events({
	'click [data-action="enable-first-player-human"]': function() {
		ai.enableFirstPlayerHuman(!firstPlayerHumanEnabled.get());

		firstPlayerHumanEnabled.set(!firstPlayerHumanEnabled.get());
	},
	'click [data-action="enable-second-player-machine-learning"]': function() {
		ai.enableSecondPlayerMachineLearning(!secondPlayerMachineLearningEnabled.get());

		secondPlayerMachineLearningEnabled.set(!secondPlayerMachineLearningEnabled.get());
	},
	'click [data-action="speed-up-game"]': function() {
		if (fullSpeedEnabled.get()) {
			ai.normalGameSpeed();
		} else {
			ai.speedUpGame();
		}

		fullSpeedEnabled.set(!fullSpeedEnabled.get());
	},
	'click [data-action="allow-ai-to-jump"]': function() {
		ai.enableAiToJump(!jumpEnabled.get());

		jumpEnabled.set(!jumpEnabled.get());
	},
	'click [data-action="get-host-genomes"]': function() {
		const genomes = $('#ai-genomes');
		genomes.val(ai.getHostGenomes());
	},
	'click [data-action="get-client-genomes"]': function() {
		const genomes = $('#ai-genomes');
		genomes.val(ai.getClientGenomes());
	}
});
