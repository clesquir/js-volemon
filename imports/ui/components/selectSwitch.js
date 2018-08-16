import './selectSwitch.html';

Template.selectSwitch.onRendered(function() {
	const checkbox = $(`#check-${this.data.id}`);
	const field = $(`#${this.data.id}`);

	if (this.data.isOn) {
		checkbox.prop('checked', true);
	} else {
		field.prop('disabled', true);
		field.val('');
	}
});

Template.selectSwitch.helpers({
	isSelected: function(isOn, option, value) {
		return isOn && option === value;
	}
});

Template.selectSwitch.events({
	'click [data-checkbox-action=enable-select-switch]': function(e) {
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
