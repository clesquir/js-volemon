import { Constants } from '/lib/constants.js';

var incrementShape = function(increment) {
	var listOfShapes = Constants.PLAYER_LIST_OF_SHAPES,
		index = listOfShapes.indexOf(this.shape);

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
	'click [data-action="shape-change-up"]': function(e) {
		incrementShape.call(this, -1);
	},

	'click [data-action="shape-change-down"]': function(e) {
		incrementShape.call(this, 1);
	}
});
