import Ai from '/imports/api/games/client/dev/Ai.js';
import {Template} from 'meteor/templating';

import './ai.html';

/** @type {Ai}|null */
let ai = null;
let started = new ReactiveVar(false);
const genomesFromExisting = new ReactiveVar(true);
const firstPlayerHumanEnabled = new ReactiveVar(false);
const firstPlayerMachineLearningEnabled = new ReactiveVar(false);
const firstPlayerLearningEnabled = new ReactiveVar(false);
const secondPlayerHumanEnabled = new ReactiveVar(false);
const secondPlayerMachineLearningEnabled = new ReactiveVar(false);
const secondPlayerLearningEnabled = new ReactiveVar(false);
const rendererEnabled = new ReactiveVar(false);
const fullSpeedEnabled = new ReactiveVar(true);
const jumpEnabled = new ReactiveVar(true);

Template.ai.rendered = function() {
	ai = new Ai();
	enableGenomesFromExisting();
	enableFirstPlayerHuman();
	enableFirstPlayerMachineLearning();
	enableFirstPlayerLearning();
	enableSecondPlayerHuman();
	enableSecondPlayerMachineLearning();
	enableSecondPlayerLearning();
	enableRenderer();
	enableFullSpeed();
	enableAiToJump();
};

Template.ai.destroyed = function() {
	if (ai) {
		ai.stop();
	}
	started.set(false);
};

Template.ai.helpers({
	started: function() {
		return started.get();
	},
	genomesFromExisting: function() {
		return genomesFromExisting.get();
	},
	firstPlayerHumanEnabled: function() {
		return firstPlayerHumanEnabled.get();
	},
	firstPlayerMachineLearningEnabled: function() {
		return firstPlayerMachineLearningEnabled.get();
	},
	firstPlayerLearningEnabled: function() {
		return firstPlayerLearningEnabled.get();
	},
	secondPlayerHumanEnabled: function() {
		return secondPlayerHumanEnabled.get();
	},
	secondPlayerMachineLearningEnabled: function() {
		return secondPlayerMachineLearningEnabled.get();
	},
	secondPlayerLearningEnabled: function() {
		return secondPlayerLearningEnabled.get();
	},
	rendererEnabled: function() {
		return rendererEnabled.get();
	},
	fullSpeedEnabled: function() {
		return fullSpeedEnabled.get();
	},
	jumpEnabled: function() {
		return jumpEnabled.get();
	}
});

Template.ai.events({
	'click [data-action="start-game"]': function() {
		ai.start();
		started.set(true);
	},
	'click [data-action="start-genomes-from-existing"]': function() {
		genomesFromExisting.set(!genomesFromExisting.get());

		enableGenomesFromExisting();
	},
	'click [data-action="enable-first-player-human"]': function() {
		firstPlayerHumanEnabled.set(!firstPlayerHumanEnabled.get());

		enableFirstPlayerHuman();
	},
	'click [data-action="enable-first-player-machine-learning"]': function() {
		firstPlayerMachineLearningEnabled.set(!firstPlayerMachineLearningEnabled.get());

		enableFirstPlayerMachineLearning();
	},
	'click [data-action="enable-first-player-learning"]': function() {
		firstPlayerLearningEnabled.set(!firstPlayerLearningEnabled.get());

		enableFirstPlayerLearning();
	},
	'click [data-action="enable-second-player-human"]': function() {
		secondPlayerHumanEnabled.set(!secondPlayerHumanEnabled.get());

		enableSecondPlayerHuman();
	},
	'click [data-action="enable-second-player-machine-learning"]': function() {
		secondPlayerMachineLearningEnabled.set(!secondPlayerMachineLearningEnabled.get());

		enableSecondPlayerMachineLearning();
	},
	'click [data-action="enable-second-player-learning"]': function() {
		secondPlayerLearningEnabled.set(!secondPlayerLearningEnabled.get());

		enableSecondPlayerLearning();
	},
	'click [data-action="enable-renderer"]': function() {
		rendererEnabled.set(!rendererEnabled.get());

		enableRenderer();
	},
	'click [data-action="speed-up-game"]': function() {
		fullSpeedEnabled.set(!fullSpeedEnabled.get());

		enableFullSpeed();
	},
	'click [data-action="allow-ai-to-jump"]': function() {
		jumpEnabled.set(!jumpEnabled.get());

		enableAiToJump();
	}
});

const enableGenomesFromExisting = function() {
	ai.enableGenomesFromExisting(genomesFromExisting.get());
};

const enableFirstPlayerHuman = function() {
	ai.enableFirstPlayerHuman(firstPlayerHumanEnabled.get());

	if (firstPlayerHumanEnabled.get() && secondPlayerHumanEnabled.get()) {
		secondPlayerHumanEnabled.set(!secondPlayerHumanEnabled.get());

		ai.enableSecondPlayerHuman(secondPlayerHumanEnabled.get());
	}
};

const enableFirstPlayerMachineLearning = function() {
	ai.enableFirstPlayerMachineLearning(firstPlayerMachineLearningEnabled.get());
};

const enableFirstPlayerLearning = function() {
	ai.enableFirstPlayerLearning(firstPlayerLearningEnabled.get());
};

const enableSecondPlayerHuman = function() {
	ai.enableSecondPlayerHuman(secondPlayerHumanEnabled.get());

	if (firstPlayerHumanEnabled.get() && secondPlayerHumanEnabled.get()) {
		firstPlayerHumanEnabled.set(!firstPlayerHumanEnabled.get());

		ai.enableFirstPlayerHuman(firstPlayerHumanEnabled.get());
	}
};

const enableSecondPlayerMachineLearning = function() {
	ai.enableSecondPlayerMachineLearning(secondPlayerMachineLearningEnabled.get());
};

const enableSecondPlayerLearning = function() {
	ai.enableSecondPlayerLearning(secondPlayerLearningEnabled.get());
};

const enableRenderer = function() {
	if (rendererEnabled.get()) {
		ai.renderer = 0;
	} else {
		ai.renderer = 3;
	}

	if (started.get()) {
		ai.stop();
		ai.start();
	}
};

const enableFullSpeed = function() {
	if (fullSpeedEnabled.get()) {
		ai.speedUpGame();
	} else {
		ai.normalGameSpeed();
	}
};

const enableAiToJump = function() {
	ai.enableAiToJump(jumpEnabled.get());
};
