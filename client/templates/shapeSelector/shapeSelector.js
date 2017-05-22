import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';
import {PLAYER_LIST_OF_SHAPES} from '/imports/api/games/shapeConstants.js';

const incrementShape = function(increment) {
	const listOfShapes = PLAYER_LIST_OF_SHAPES;
	let index = listOfShapes.indexOf(this.shape);

	index = index + increment;

	if (index < 0) {
		index = listOfShapes.length - 1;
	}

	if (index > listOfShapes.length - 1) {
		index = 0;
	}

	let shape = listOfShapes[index];

	Meteor.call('updatePlayerShape', Session.get('game'), shape);
};

Template.shapeSelector.events({
	'click [data-action="shape-change-up"]': function() {
		incrementShape.call(this, -1);
	},

	'click [data-action="shape-change-down"]': function() {
		incrementShape.call(this, 1);
	}
});
