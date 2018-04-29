import {getRandomInt} from '/imports/lib/utils.js';
import {Meteor} from "meteor/meteor";

export default class TipsUpdater {
	currentTipIndex = 0;
	currentTip = new ReactiveVar(false);

	start() {
		this.currentTipIndex = getRandomInt(0, this.numberOfTips() - 1);
		this.shuffledTips = _.chain(this.tips()).shuffle().value();
		this.currentTip.set(this.shuffledTips[this.currentTipIndex]);
		this.interval = Meteor.setInterval(() => {
			this.updateCurrentTip();
		}, 10000);
	}

	stop() {
		Meteor.clearInterval(this.interval);
	}

	updateCurrentTip() {
		this.currentTipIndex++;
		if (this.currentTipIndex >= this.numberOfTips()) {
			this.currentTipIndex = 0;
		}

		this.currentTip.set(this.shuffledTips[this.currentTipIndex]);
	}

	numberOfTips() {
		return this.tips().length;
	}

	tips() {
		return [
			'A drop shot at the net can be deadly',
			'Every shape has their strengths and weaknesses',
			'Mastering the player shape is the key',
			'Loosing can be a way to unlock achievements',
			'Squeezing the ball against the wall can create a powerful shot',
			'Winning against a higher score player can be tough but it worths it',
			'Participating to all tournaments is a way to unlock achievement',
			'Rage quitting is forfeiting',
			'Random bonus can help you in a dangerous situation',
			'Some bonuses cancel other ones',
			'Some specific bonus combinations unlock achievements',
			'Waiting can be the best offensive',
			'Drop shot at the net works only against some people',
			`Following the monsters' eyes can help you locate an invisible ball`,
			`Being a small monster can help you avoid maluses`,
			`Stabilizing the ball can help you when paused`,
			`Big monster bonus can help you stabilize the auto-jump and the high-jump maluses`,
			`Things can get a little out of hand with the fast monster bonus`,
			`You can throw maluses on the enemy when on bonus repellent`,
			`Smashing the ball on a bonus is unpredictable`,
			`The only way to get an invincible bonus is through a random`,
			`The "empty" bonus can be a good weapon`,
			`Doing something suicidal can unlock achievements`,
			`Activating a smoke bomb at the net can fool the enemy`,
		];
	}
}
