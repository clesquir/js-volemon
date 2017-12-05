import {Meteor} from 'meteor/meteor';
import {isGamePlayer} from '/imports/api/games/utils.js';

export default class GameCheer {
	/**
	 * @param {string} gameId
	 * @param {Stream} stream
	 * @param {GameInitiator} gameInitiator
	 */
	constructor(gameId, stream, gameInitiator) {
		this.gameId = gameId;
		this.stream = stream;
		this.gameInitiator = gameInitiator;

		this.cheerFn = {};
		this.cheerActivatingTime = 1000;
		this.cheerDisablingTime = 500;
		this.cheerThrottleTime = 5000;
	}

	init() {
		this.stream.on('cheer-' + this.gameId, (data) => {
			this.showCheer(data.forHost, this.disableCheerFromEmission);
		});
	}

	cheerPlayer(forHost) {
		if (!isGamePlayer(this.gameId)) {
			//Delay emission, both sides use same timer
			if (!this.emitCheerFn) {
				this.emitCheerFn = require('lodash.throttle')(
					(forHost) => {
						this.stream.emit('cheer-' + this.gameId, {forHost: forHost});
						this.showCheer(forHost, this.disableCheerFromCurrentViewer);
					},
					this.cheerThrottleTime,
					{trailing: false}
				);
			}
			this.emitCheerFn(forHost);
		}
	}

	showCheer(forHost, disableCheerCallback) {
		//Delay reception, each side uses different timers
		if (!this.cheerFn[forHost]) {
			this.cheerFn[forHost] = require('lodash.throttle')(
				(forHost, disableCheerCallback) => {
					if (!this.gameInitiator) {
						return;
					}

					this.gameInitiator.currentGame.cheer(forHost);

					if (forHost) {
						Meteor.clearTimeout(this.cheerHostActivating);
					} else {
						Meteor.clearTimeout(this.cheerClientActivating);
					}

					let cheerElement = this.cheerElement(forHost);
					$(cheerElement).removeClass('cheer-disabled');
					$(cheerElement).removeClass('cheer-activated');
					$(cheerElement).addClass('cheer-activated');

					const timeout = Meteor.setTimeout(() => {
						let cheerElement = this.cheerElement(forHost);

						$(cheerElement).removeClass('cheer-activated');

						disableCheerCallback.call(this, forHost);
					}, this.cheerActivatingTime);

					if (forHost) {
						this.cheerHostActivating = timeout;
					} else {
						this.cheerClientActivating = timeout;
					}
				},
				this.cheerThrottleTime,
				{trailing: false}
			);
		}

		this.cheerFn[forHost](forHost, disableCheerCallback);
	}

	disableCheerFromEmission(forHost) {
		if (forHost) {
			Meteor.clearTimeout(this.cheerHostReanabling);
		} else {
			Meteor.clearTimeout(this.cheerClientReanabling);
		}

		let activatedCheerElement = this.cheerElement(forHost);

		this.addDisabledCheerAfterTimeout(activatedCheerElement);
		const timeout = this.reenableCheerAfterTimeout(activatedCheerElement);

		if (forHost) {
			this.cheerHostReanabling = timeout;
		} else {
			this.cheerClientReanabling = timeout;
		}
	}

	disableCheerFromCurrentViewer(forHost) {
		Meteor.clearTimeout(this.cheerHostReanabling);
		Meteor.clearTimeout(this.cheerClientReanabling);

		let activatedCheerElement = this.cheerElement(forHost);
		let oppositeCheerElement = this.cheerElement(!forHost);

		this.addDisabledCheerAfterTimeout(activatedCheerElement);
		const timeoutActivated = this.reenableCheerAfterTimeout(activatedCheerElement);

		this.addDisabledCheerAfterTimeout(oppositeCheerElement);
		const timeoutOpposite = this.reenableCheerAfterTimeout(oppositeCheerElement);

		if (forHost) {
			this.cheerHostReanabling = timeoutActivated;
			this.cheerClientReanabling = timeoutOpposite;
		} else {
			this.cheerClientReanabling = timeoutActivated;
			this.cheerHostReanabling = timeoutOpposite;
		}
	}

	cheerElement(forHost) {
		if (forHost) {
			return document.getElementById('cheer-host');
		} else {
			return document.getElementById('cheer-client');
		}
	}

	addDisabledCheerAfterTimeout(element) {
		Meteor.setTimeout(() => {
			$(element).addClass('cheer-disabled');
		}, this.cheerDisablingTime);
	}

	reenableCheerAfterTimeout(element) {
		return Meteor.setTimeout(() => {
			$(element).removeClass('cheer-disabled');
		}, this.cheerThrottleTime);
	}

	stop() {
		this.stream.off('cheer-' + this.gameId);
	}
}
