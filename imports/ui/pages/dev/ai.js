import Ai from '/imports/api/games/client/dev/Ai.js';
import {Template} from 'meteor/templating';

import './ai.html';

/** @type {Ai}|null */
let ai = null;

Template.ai.rendered = function() {
	ai = new Ai();
	ai.start();
};

Template.ai.destroyed = function() {
	if (ai) {
		ai.stop();
	}
};

Template.ai.events({
	'click [data-action="get-host-genomes"]': function() {
		const genomes = $('#ai-genomes');
		genomes.val(ai.getHostGenomes());
	},
	'click [data-action="load-host-genomes"]': function() {
		const genomes = $('#ai-genomes');
		ai.loadHostGenomes(genomes.val());
	},
	'click [data-action="get-client-genomes"]': function() {
		const genomes = $('#ai-genomes');
		genomes.val(ai.getClientGenomes());
	},
	'click [data-action="load-client-genomes"]': function() {
		const genomes = $('#ai-genomes');
		ai.loadClientGenomes(genomes.val());
	}
});
