import BigBallBonus from '/imports/api/games/bonus/BigBallBonus.js';
import BigJumpMonsterBonus from '/imports/api/games/bonus/BigJumpMonsterBonus.js';
import BigMonsterBonus from '/imports/api/games/bonus/BigMonsterBonus.js';
import BonusRepellentMonsterBonus from '/imports/api/games/bonus/BonusRepellentMonsterBonus.js';
import BounceMonsterBonus from '/imports/api/games/bonus/BounceMonsterBonus.js';
import CloakedMonsterBonus from '/imports/api/games/bonus/CloakedMonsterBonus.js';
import CloudBonus from '/imports/api/games/bonus/CloudBonus.js';
import DrunkMonsterBonus from '/imports/api/games/bonus/DrunkMonsterBonus.js';
import FastMonsterBonus from '/imports/api/games/bonus/FastMonsterBonus.js';
import FreezeMonsterBonus from '/imports/api/games/bonus/FreezeMonsterBonus.js';
import HighGravity from '/imports/api/games/bonus/HighGravity.js';
import InstantDeathBonus from '/imports/api/games/bonus/InstantDeathBonus.js';
import InvincibleMonsterBonus from '/imports/api/games/bonus/InvincibleMonsterBonus.js';
import InvisibleBallBonus from '/imports/api/games/bonus/InvisibleBallBonus.js';
import InvisibleMonsterBonus from '/imports/api/games/bonus/InvisibleMonsterBonus.js';
import InvisibleOpponentMonsterBonus from '/imports/api/games/bonus/InvisibleOpponentMonsterBonus.js';
import NoJumpMonsterBonus from '/imports/api/games/bonus/NoJumpMonsterBonus.js';
import NothingBonus from '/imports/api/games/bonus/NothingBonus.js';
import RandomBonus from '/imports/api/games/bonus/RandomBonus.js';
import ReverseMoveMonsterBonus from '/imports/api/games/bonus/ReverseMoveMonsterBonus.js';
import ShapeShiftMonsterBonus from '/imports/api/games/bonus/ShapeShiftMonsterBonus.js';
import SlowMonsterBonus from '/imports/api/games/bonus/SlowMonsterBonus.js';
import SmallBallBonus from '/imports/api/games/bonus/SmallBallBonus.js';
import SmallMonsterBonus from '/imports/api/games/bonus/SmallMonsterBonus.js';
import SmokeBombBonus from '/imports/api/games/bonus/SmokeBombBonus.js';
import UnfreezeMonsterBonus from '/imports/api/games/bonus/UnfreezeMonsterBonus.js';
import CardSwitcher from '/imports/lib/client/CardSwitcher.js';
import {onMobileAndTablet} from '/imports/lib/utils.js';
import {Template} from 'meteor/templating';
import './help.html';

require('jquery-lazy');

let cardSwitcher;

Template.help.onRendered(function() {
	cardSwitcher = new CardSwitcher(
		'.help-swiper-container',
		{
			'help-controls': HelpViews.viewHelpControls,
			'help-bonuses': HelpViews.viewHelpBonuses,
			'help-reactions': HelpViews.viewHelpReactions,
		}
	);
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
			new HighGravity(),
			new NothingBonus(),
			new SmallMonsterBonus(),
			new BigMonsterBonus(),
			new ReverseMoveMonsterBonus(),
			new SlowMonsterBonus(),
			new FastMonsterBonus(),
			new NoJumpMonsterBonus(),
			new BigJumpMonsterBonus(),
			new BounceMonsterBonus(),
			new FreezeMonsterBonus(),
			new UnfreezeMonsterBonus(),
			new InvisibleMonsterBonus(),
			new InvisibleOpponentMonsterBonus(),
			new CloakedMonsterBonus(),
			new ShapeShiftMonsterBonus(),
			new InvincibleMonsterBonus(),
			new BonusRepellentMonsterBonus(),
			new DrunkMonsterBonus(),
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
				if (textureAtlasFrames[frame].filename === bonus.atlasFrame) {
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

class HelpViews {
	static viewHelpControls() {
		const helpContents = document.getElementById('help-contents');

		if (!$(helpContents).is('.help-controls-shown')) {
			HelpViews.removeShownClasses(helpContents);
			$(helpContents).addClass('help-controls-shown');
		}
	}

	static viewHelpBonuses() {
		const helpContents = document.getElementById('help-contents');

		if (!$(helpContents).is('.help-bonuses-shown')) {
			HelpViews.removeShownClasses(helpContents);
			$(helpContents).addClass('help-bonuses-shown');
		}
	}

	static viewHelpReactions() {
		const helpContents = document.getElementById('help-contents');

		if (!$(helpContents).is('.help-reactions-shown')) {
			HelpViews.removeShownClasses(helpContents);
			$(helpContents).addClass('help-reactions-shown');
		}
	}

	static removeShownClasses(helpContents) {
		$(helpContents).removeClass('help-controls-shown');
		$(helpContents).removeClass('help-bonuses-shown');
		$(helpContents).removeClass('help-reactions-shown');
	}
}
