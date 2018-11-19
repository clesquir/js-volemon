import Ai from '/imports/api/games/client/dev/Ai.js';
import {Template} from 'meteor/templating';

import './ai.html';

/** @type {Ai}|null */
let ai = null;
let started = new ReactiveVar(false);
const genomesFromExisting = new ReactiveVar(true);
const firstPlayerMode = new ReactiveVar('CPU');
const secondPlayerMode = new ReactiveVar('CPU');
const rendererEnabled = new ReactiveVar(false);
const fullSpeedEnabled = new ReactiveVar(true);

Template.ai.rendered = function() {
	ai = new Ai();
	enableGenomesFromExisting();
	setupFirstPlayerMode();
	setupSecondPlayerMode();
	enableRenderer();
	enableFullSpeed();
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
	firstPlayerHuman: function() {
		return firstPlayerMode.get() === 'human';
	},
	firstPlayerCPU: function() {
		return firstPlayerMode.get() === 'CPU';
	},
	firstPlayerMLLearning: function() {
		return firstPlayerMode.get() === 'ML-learning';
	},
	firstPlayerMLNotLearning: function() {
		return firstPlayerMode.get() === 'ML-not-learning';
	},
	secondPlayerHuman: function() {
		return secondPlayerMode.get() === 'human';
	},
	secondPlayerCPU: function() {
		return secondPlayerMode.get() === 'CPU';
	},
	secondPlayerMLLearning: function() {
		return secondPlayerMode.get() === 'ML-learning';
	},
	secondPlayerMLNotLearning: function() {
		return secondPlayerMode.get() === 'ML-not-learning';
	},
	rendererEnabled: function() {
		return rendererEnabled.get();
	},
	fullSpeedEnabled: function() {
		return fullSpeedEnabled.get();
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
	'click [data-action="switch-first-player"]': function() {
		switch (firstPlayerMode.get()) {
			case 'human':
				firstPlayerMode.set('CPU');
				break;
			case 'CPU':
				firstPlayerMode.set('ML-learning');
				break;
			case 'ML-learning':
				firstPlayerMode.set('ML-not-learning');
				break;
			case 'ML-not-learning':
				firstPlayerMode.set('human');
				break;
		}

		setupFirstPlayerMode();
	},
	'click [data-action="switch-second-player"]': function() {
		switch (secondPlayerMode.get()) {
			case 'human':
				secondPlayerMode.set('CPU');
				break;
			case 'CPU':
				secondPlayerMode.set('ML-learning');
				break;
			case 'ML-learning':
				secondPlayerMode.set('ML-not-learning');
				break;
			case 'ML-not-learning':
				secondPlayerMode.set('human');
				break;
		}

		setupSecondPlayerMode();
	},
	'click [data-action="enable-renderer"]': function() {
		rendererEnabled.set(!rendererEnabled.get());

		enableRenderer();
	},
	'click [data-action="speed-up-game"]': function() {
		fullSpeedEnabled.set(!fullSpeedEnabled.get());

		enableFullSpeed();
	}
});

const enableGenomesFromExisting = function() {
	ai.enableGenomesFromExisting(genomesFromExisting.get());
};

const setupFirstPlayerMode = function() {
	switch (firstPlayerMode.get()) {
		case 'human':
			ai.enableFirstPlayerHuman(true);
			ai.enableFirstPlayerMachineLearning(false);
			ai.enableFirstPlayerLearning(false);
			break;
		case 'CPU':
			ai.enableFirstPlayerHuman(false);
			ai.enableFirstPlayerMachineLearning(false);
			ai.enableFirstPlayerLearning(false);
			break;
		case 'ML-learning':
			ai.enableFirstPlayerHuman(false);
			ai.enableFirstPlayerMachineLearning(true);
			ai.enableFirstPlayerLearning(true);
			break;
		case 'ML-not-learning':
			ai.enableFirstPlayerHuman(false);
			ai.enableFirstPlayerMachineLearning(true);
			ai.enableFirstPlayerLearning(false);
			break;
	}
};

const setupSecondPlayerMode = function() {
	switch (secondPlayerMode.get()) {
		case 'human':
			ai.enableSecondPlayerHuman(true);
			ai.enableSecondPlayerMachineLearning(false);
			ai.enableSecondPlayerLearning(false);
			break;
		case 'CPU':
			ai.enableSecondPlayerHuman(false);
			ai.enableSecondPlayerMachineLearning(false);
			ai.enableSecondPlayerLearning(false);
			break;
		case 'ML-learning':
			ai.enableSecondPlayerHuman(false);
			ai.enableSecondPlayerMachineLearning(true);
			ai.enableSecondPlayerLearning(true);
			break;
		case 'ML-not-learning':
			ai.enableSecondPlayerHuman(false);
			ai.enableSecondPlayerMachineLearning(true);
			ai.enableSecondPlayerLearning(false);
			break;
	}
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
