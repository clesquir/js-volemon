import Ai from '/imports/api/games/client/dev/Ai.js';
import {Template} from 'meteor/templating';

import './ai.html';

/** @type {Ai}|null */
let ai = null;
const firstPlayerHumanEnabled = new ReactiveVar(false);
const firstPlayerMachineLearningEnabled = new ReactiveVar(false);
const secondPlayerHumanEnabled = new ReactiveVar(false);
const secondPlayerMachineLearningEnabled = new ReactiveVar(true);
const fullSpeedEnabled = new ReactiveVar(false);
const jumpEnabled = new ReactiveVar(true);

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
	firstPlayerMachineLearningEnabled: function() {
		return firstPlayerMachineLearningEnabled.get();
	},
	secondPlayerHumanEnabled: function() {
		return secondPlayerHumanEnabled.get();
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

		if (secondPlayerHumanEnabled.get()) {
			ai.enableSecondPlayerHuman(!secondPlayerHumanEnabled.get());
			secondPlayerHumanEnabled.set(!secondPlayerHumanEnabled);
		}
	},
	'click [data-action="enable-first-player-machine-learning"]': function() {
		ai.enableFirstPlayerMachineLearning(!firstPlayerMachineLearningEnabled.get());

		firstPlayerMachineLearningEnabled.set(!firstPlayerMachineLearningEnabled.get());
	},
	'click [data-action="enable-second-player-human"]': function() {
		ai.enableSecondPlayerHuman(!secondPlayerHumanEnabled.get());

		secondPlayerHumanEnabled.set(!secondPlayerHumanEnabled.get());

		if (firstPlayerHumanEnabled.get()) {
			ai.enableFirstPlayerHuman(!firstPlayerHumanEnabled.get());
			firstPlayerHumanEnabled.set(!firstPlayerHumanEnabled);
		}
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
	}
});
