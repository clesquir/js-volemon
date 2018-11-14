import './multipleBonusSelectSwitch.html';
import {ALL_BONUSES_FOR_RANDOM} from '/imports/api/games/bonusConstants';
import BonusFactory from '/imports/api/games/BonusFactory.js';
import {ALL_BONUSES} from '/imports/api/games/bonusConstants.js';

let textureAtlasFrames = [];

Template.multipleBonusSelectSwitch.onRendered(function() {
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

Template.multipleBonusSelectSwitch.helpers({
	isSelected: function(isOn, option, values) {
		return isOn && Array.isArray(values) && values.indexOf(option) !== -1;
	},

	options: function(hasRandom) {
		$.ajax({
			url: '/assets/bonus/texture-atlas.json',
			async: false
		}).done(function(json) {
			textureAtlasFrames = json.frames;
		});

		let bonusClassNames = ALL_BONUSES_FOR_RANDOM;
		if (hasRandom) {
			bonusClassNames = ALL_BONUSES;
		}

		const options = [];
		for (let bonusClassName of bonusClassNames) {
			const bonus = BonusFactory.fromClassName(bonusClassName, null);

			let x = 0;
			let y = 0;
			for (let frame in textureAtlasFrames) {
				if (textureAtlasFrames[frame].filename === bonus.atlasFrame) {
					x = textureAtlasFrames[frame].frame.x - 3;
					y = textureAtlasFrames[frame].frame.y - 3;
					break;
				}
			}

			options.push(
				{
					id: bonusClassName,
					style: 'background-position: ' + -x + 'px ' + -y + 'px;',
					description: bonus.description
				}
			);
		}

		return options;
	}
});

Template.multipleBonusSelectSwitch.events({
	'click [data-checkbox-action=enable-multiple-bonus-select-switch]': function(e) {
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
