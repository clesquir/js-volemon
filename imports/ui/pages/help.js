require('jquery-lazy');
import {Template} from 'meteor/templating';
import {onMobileAndTablet} from '/imports/lib/utils.js';
import SmallBallBonus from '/imports/api/games/bonus/SmallBallBonus.js';
import BigBallBonus from '/imports/api/games/bonus/BigBallBonus.js';
import InvisibleBallBonus from '/imports/api/games/bonus/InvisibleBallBonus.js';
import SmallMonsterBonus from '/imports/api/games/bonus/SmallMonsterBonus.js';
import BigMonsterBonus from '/imports/api/games/bonus/BigMonsterBonus.js';
import SlowMonsterBonus from '/imports/api/games/bonus/SlowMonsterBonus.js';
import FastMonsterBonus from '/imports/api/games/bonus/FastMonsterBonus.js';
import FreezeMonsterBonus from '/imports/api/games/bonus/FreezeMonsterBonus.js';
import ReverseMoveMonsterBonus from '/imports/api/games/bonus/ReverseMoveMonsterBonus.js';
import InvincibleMonsterBonus from '/imports/api/games/bonus/InvincibleMonsterBonus.js';
import InvisibleMonsterBonus from '/imports/api/games/bonus/InvisibleMonsterBonus.js';
import InvisibleOpponentMonsterBonus from '/imports/api/games/bonus/InvisibleOpponentMonsterBonus.js';
import CloudBonus from '/imports/api/games/bonus/CloudBonus.js';
import NoJumpMonsterBonus from '/imports/api/games/bonus/NoJumpMonsterBonus.js';
import BounceMonsterBonus from '/imports/api/games/bonus/BounceMonsterBonus.js';
import CloakedMonsterBonus from '/imports/api/games/bonus/CloakedMonsterBonus.js';
import ShapeShiftBonus from '/imports/api/games/bonus/ShapeShiftBonus.js';
import SmokeBombBonus from '/imports/api/games/bonus/SmokeBombBonus.js';
import RandomBonus from '/imports/api/games/bonus/RandomBonus.js';

import './help.html';

Template.help.onRendered(function() {
	$('.help-section .lazy').lazy({
		appendScroll: $('.help-section')
	});
});

Template.help.helpers({
	onMobile: function() {
		return onMobileAndTablet();
	},

	bonusesHelpList: function() {
		/** @var {BaseBonus[]} bonuses */
		const bonuses = [
			new RandomBonus(),
			new CloudBonus(),
			new SmokeBombBonus(),
			new SmallBallBonus(),
			new BigBallBonus(),
			new InvisibleBallBonus(),
			new SmallMonsterBonus(),
			new BigMonsterBonus(),
			new ReverseMoveMonsterBonus(),
			new SlowMonsterBonus(),
			new FastMonsterBonus(),
			new NoJumpMonsterBonus(),
			new BounceMonsterBonus(),
			new FreezeMonsterBonus(),
			new InvisibleMonsterBonus(),
			new InvisibleOpponentMonsterBonus(),
			new CloakedMonsterBonus(),
			new ShapeShiftBonus(),
			new InvincibleMonsterBonus(),
		];
		const helpList = [];

		for (let bonus of bonuses) {
			helpList.push(
				{
					borderClass: bonus.spriteBorderKey,
					isLetter: (bonus.letter !== undefined),
					letterSize: bonus.fontSize,
					letter: bonus.letter,
					bonusIconsIndex: bonus.bonusIconsIndex,
					description: bonus.description
				}
			);
		}

		return helpList;
	}
});

Template.help.events({
	'click [data-action=view-help-controls]': function(e) {
		const helpContents = document.getElementById('help-contents');

		if (!$(helpContents).is('.help-controls-shown')) {
			removeShownClasses(helpContents);
			$(helpContents).addClass('help-controls-shown');
		}
	},

	'click [data-action=view-help-bonuses]': function(e) {
		const helpContents = document.getElementById('help-contents');

		if (!$(helpContents).is('.help-bonuses-shown')) {
			removeShownClasses(helpContents);
			$(helpContents).addClass('help-bonuses-shown');
		}
	}
});

const removeShownClasses = function(homeContents) {
	$(homeContents).removeClass('help-controls-shown');
	$(homeContents).removeClass('help-bonuses-shown');
};
