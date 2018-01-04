import BigBallBonus from '/imports/api/games/bonus/BigBallBonus.js';
import BigJumpMonsterBonus from '/imports/api/games/bonus/BigJumpMonsterBonus.js';
import BigMonsterBonus from '/imports/api/games/bonus/BigMonsterBonus.js';
import BounceMonsterBonus from '/imports/api/games/bonus/BounceMonsterBonus.js';
import CloakedMonsterBonus from '/imports/api/games/bonus/CloakedMonsterBonus.js';
import CloudBonus from '/imports/api/games/bonus/CloudBonus.js';
import DrunkMonsterBonus from '/imports/api/games/bonus/DrunkMonsterBonus.js';
import FastMonsterBonus from '/imports/api/games/bonus/FastMonsterBonus.js';
import FreezeMonsterBonus from '/imports/api/games/bonus/FreezeMonsterBonus.js';
import InstantDeathBonus from '/imports/api/games/bonus/InstantDeathBonus.js';
import InvincibleMonsterBonus from '/imports/api/games/bonus/InvincibleMonsterBonus.js';
import InvisibleBallBonus from '/imports/api/games/bonus/InvisibleBallBonus.js';
import InvisibleMonsterBonus from '/imports/api/games/bonus/InvisibleMonsterBonus.js';
import InvisibleOpponentMonsterBonus from '/imports/api/games/bonus/InvisibleOpponentMonsterBonus.js';
import NoJumpMonsterBonus from '/imports/api/games/bonus/NoJumpMonsterBonus.js';
import RandomBonus from '/imports/api/games/bonus/RandomBonus.js';
import ReverseMoveMonsterBonus from '/imports/api/games/bonus/ReverseMoveMonsterBonus.js';
import ShapeShiftMonsterBonus from '/imports/api/games/bonus/ShapeShiftMonsterBonus.js';
import SlowMonsterBonus from '/imports/api/games/bonus/SlowMonsterBonus.js';
import SmallBallBonus from '/imports/api/games/bonus/SmallBallBonus.js';
import SmallMonsterBonus from '/imports/api/games/bonus/SmallMonsterBonus.js';
import SmokeBombBonus from '/imports/api/games/bonus/SmokeBombBonus.js';
import CardSwitcher from '/imports/lib/client/CardSwitcher.js';
import {onMobileAndTablet} from '/imports/lib/utils.js';
import {Template} from 'meteor/templating';
require('jquery-lazy');

import './help.html';

let cardSwitcher;

Template.help.onRendered(function() {
	cardSwitcher = new CardSwitcher('.help-swiper-container', highlightSelectorContentMenuOnSwipe);
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
			new BigJumpMonsterBonus(),
			new BounceMonsterBonus(),
			new FreezeMonsterBonus(),
			new InvisibleMonsterBonus(),
			new InvisibleOpponentMonsterBonus(),
			new CloakedMonsterBonus(),
			new ShapeShiftMonsterBonus(),
			new DrunkMonsterBonus(),
			new InvincibleMonsterBonus(),
			new InstantDeathBonus(),
		];
		const helpList = [];
		let textureAtlasFrames = [];
		$.ajax({
			url: '/assets/bonus/texture-atlas.json',
			async: false
		}).done(function(json) {
			textureAtlasFrames = json.frames;
		});

		for (let bonus of bonuses) {
			let x = 0;
			let y = 0;
			for (let frame in textureAtlasFrames) {
				if (frame === bonus.atlasFrame) {
					x = textureAtlasFrames[frame].frame.x;
					y = textureAtlasFrames[frame].frame.y;
					break;
				}
			}

			helpList.push(
				{
					backgroundPosition: -x + 'px ' + -y + 'px',
					description: bonus.description
				}
			);
		}

		return helpList;
	}
});

Template.help.events({
	'click [data-action=view-help-controls]': function(e) {
		cardSwitcher.slideTo(0);
	},

	'click [data-action=view-help-bonuses]': function(e) {
		cardSwitcher.slideTo(1);
	},

	'click [data-action=view-help-reactions]': function(e) {
		cardSwitcher.slideTo(2);
	}
});

const highlightSelectorContentMenuOnSwipe = function() {
	switch ($(this.slides[this.activeIndex]).attr('data-slide')) {
		case 'help-controls':
			viewHelpControls();
			break;
		case 'help-bonuses':
			viewHelpBonuses();
			break;
		case 'help-reactions':
			viewHelpReactions();
			break;
	}
};

const viewHelpControls = function() {
	const helpContents = document.getElementById('help-contents');

	if (!$(helpContents).is('.help-controls-shown')) {
		removeShownClasses(helpContents);
		$(helpContents).addClass('help-controls-shown');
	}
};

const viewHelpBonuses = function() {
	const helpContents = document.getElementById('help-contents');

	if (!$(helpContents).is('.help-bonuses-shown')) {
		removeShownClasses(helpContents);
		$(helpContents).addClass('help-bonuses-shown');
	}
};

const viewHelpReactions = function() {
	const helpContents = document.getElementById('help-contents');

	if (!$(helpContents).is('.help-reactions-shown')) {
		removeShownClasses(helpContents);
		$(helpContents).addClass('help-reactions-shown');
	}
};

const removeShownClasses = function(homeContents) {
	$(homeContents).removeClass('help-controls-shown');
	$(homeContents).removeClass('help-bonuses-shown');
	$(homeContents).removeClass('help-reactions-shown');
};
