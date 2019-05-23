import {Meteor} from 'meteor/meteor';
import Stream from "../../../lib/stream/Stream";
import ClientGameInitiator from "./ClientGameInitiator";
import {isGamePlayer} from "../utils";

export default class GameCheer {
	gameId: string;
	stream: Stream;
	gameInitiator: ClientGameInitiator;

	private cheerFn: {[id: number]: Function} = {};
	private readonly cheerActivatingTime: number = 1000;
	private readonly cheerDisablingTime: number = 500;
	private readonly cheerThrottleTime: number = 5000;
	private emitCheerFn: Function;

	private cheerHostActivating: number;
	private cheerClientActivating: number;
	private cheerHostReanabling: number;
	private cheerClientReanabling: number;

	constructor(gameId: string, stream: Stream, gameInitiator: ClientGameInitiator) {
		this.gameId = gameId;
		this.stream = stream;
		this.gameInitiator = gameInitiator;
	}

	init() {
		this.stream.on('cheer-' + this.gameId, (data: {forHost: boolean}) => {
			this.showCheer(data.forHost, this.disableCheerFromEmission);
		});
	}

	stop() {
		this.stream.off('cheer-' + this.gameId);
	}

	cheerPlayer(forHost: boolean) {
		if (!isGamePlayer(this.gameId)) {
			//Delay emission, both sides use same timer
			if (!this.emitCheerFn) {
				this.emitCheerFn = require('lodash.throttle')(
					(forHost: boolean) => {
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

	private showCheer(forHost: boolean, disableCheerCallback: Function) {
		const cheerFnIndex = forHost ? 1 : 0;

		//Delay reception, each side uses different timers
		if (!this.cheerFn[cheerFnIndex]) {
			this.cheerFn[cheerFnIndex] = require('lodash.throttle')(
				(forHost: boolean, disableCheerCallback: Function) => {
					if (!this.gameInitiator || !this.gameInitiator.mainScene) {
						return;
					}

					this.gameInitiator.mainScene.cheer(forHost);

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

		this.cheerFn[cheerFnIndex](forHost, disableCheerCallback);
	}

	disableCheerFromEmission(forHost: boolean) {
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

	disableCheerFromCurrentViewer(forHost: boolean) {
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

	private cheerElement(forHost: boolean) {
		if (forHost) {
			return document.getElementById('cheer-host');
		} else {
			return document.getElementById('cheer-client');
		}
	}

	private addDisabledCheerAfterTimeout(element: Element) {
		Meteor.setTimeout(() => {
			$(element).addClass('cheer-disabled');
		}, this.cheerDisablingTime);
	}

	private reenableCheerAfterTimeout(element: Element) {
		return Meteor.setTimeout(() => {
			$(element).removeClass('cheer-disabled');
		}, this.cheerThrottleTime);
	}
}
