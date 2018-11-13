import {ALL_BONUSES} from '/imports/api/games/bonusConstants.js';
import BonusFactory from '/imports/api/games/BonusFactory.js';
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
		const bonusClassNames = ALL_BONUSES;
		const helpList = [];
		let textureAtlasFrames = [];
		$.ajax({
			url: '/assets/bonus/texture-atlas.json',
			async: false
		}).done(function(json) {
			textureAtlasFrames = json.frames;
		});

		for (let bonusClassName of bonusClassNames) {
			const bonus = BonusFactory.fromClassName(bonusClassName, null);

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
	},

	'click [data-action=user-change-controls]': function() {
		Session.set('lightbox', 'keymaps');
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
