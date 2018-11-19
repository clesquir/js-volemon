import './multipleSelectSwitch.html';

Template.multipleSelectSwitch.onRendered(function() {
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

Template.multipleSelectSwitch.helpers({
	fieldIsReadOnly: function(isOn, isReadOnly) {
		if (isReadOnly) {
			return true;
		}

		return !isOn;
	},

	isSelected: function(isOn, option, values) {
		return isOn && Array.isArray(values) && values.indexOf(option) !== -1;
	}
});

Template.multipleSelectSwitch.events({
	'click [data-checkbox-action=enable-multiple-select-switch]': function(e) {
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
