import './multipleShapeSelectSwitch.html';
import {PLAYER_ALLOWED_LIST_OF_SHAPES, PLAYER_LIST_OF_SHAPES} from '/imports/api/games/shapeConstants.js';

Template.multipleShapeSelectSwitch.onRendered(function() {
	const checkbox = $(`#check-${this.data.id}`);
	const field = $(`#${this.data.id}`);

	if (this.data.isOn) {
		checkbox.prop('checked', true);
	} else {
		field.prop('disabled', true);
		field.val('');
	}

	if (this.data.isReadOnly) {
		field.prop('disabled', true);
	}
});

Template.multipleShapeSelectSwitch.helpers({
	fieldIsReadOnly: function(isOn, isReadOnly) {
		if (isReadOnly) {
			return true;
		}

		return !isOn;
	},

	isSelected: function(isOn, option, values) {
		return isOn && Array.isArray(values) && values.indexOf(option) !== -1;
	},

	options: function(hasRandom) {
		let shapes = PLAYER_LIST_OF_SHAPES;
		if (hasRandom) {
			shapes = PLAYER_ALLOWED_LIST_OF_SHAPES;
		}

		const options = [];
		for (let shape of shapes) {
			options.push({id: shape, name: shape});
		}

		return options;
	}
});

Template.multipleShapeSelectSwitch.events({
	'click [data-checkbox-action=enable-multiple-shape-select-switch]': function(e) {
		if (this.isReadOnly) {
			return;
		}

		const checkbox = $(e.currentTarget);
		const field = $(`#${this.id}`);

		if (checkbox.is(':checked')) {
			field.prop('disabled', false);
		} else {
			field.prop('disabled', true);
			field.val('');
		}
	}
});
