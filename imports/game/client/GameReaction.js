import {Meteor} from 'meteor/meteor';
import {isGamePlayer} from '/imports/api/games/utils.js';

export default class GameReaction {

	/**
	 * @param {string} gameId
	 * @param {Stream} stream
	 * @param {GameData} gameData
	 * @param {GameInitiator} gameInitiator
	 */
	constructor(gameId, stream, gameData, gameInitiator) {
		this.gameId = gameId;
		this.stream = stream;
		this.gameData = gameData;
		this.gameInitiator = gameInitiator;

		this.cheerFn = {};
	}

	init() {
		this.stream.on('reaction-' + this.gameId, (data) => {
			this.showReaction(data.isHost, data.reactionIcon, data.reactionText);
		});

		this.stream.on('cheer-' + this.gameId, (data) => {
			this.showCheer(data.forHost);
		});

		$(document).on(
			'keypress',
			require('lodash.throttle')(
				(e) => {
					const keyMap = String.fromCharCode(e.which);

					if (!this.gameData.isUserViewer() && $.isNumeric(keyMap)) {
						this.onReactionSelection($(`div[data-reaction-key-map="${keyMap}"]:first`), this.gameData.isUserHost());
					}
				},
				2200,
				{trailing: false}
			)
		);
	}

	toggleSelectorDisplay() {
		const reactionSelector = document.getElementById('reaction-selector');
		const chatButton = document.getElementById('chat-button');

		if ($(reactionSelector).is(":visible")) {
			$(reactionSelector).hide();
			$(chatButton).removeClass('reaction-selector-opened');
		} else {
			$(reactionSelector).show();
			$(chatButton).addClass('reaction-selector-opened');
		}
	}

	/**
	 * @param {Element} reactionButton
	 * @param {boolean} isUserHost
	 */
	onReactionSelection(reactionButton, isUserHost) {
		this.emitReaction(
			isUserHost,
			reactionButton.attr('data-reaction-icon'),
			reactionButton.attr('data-reaction-text')
		);
	}

	/**
	 * @param {boolean} isHost
	 * @param {string} reactionIcon
	 * @param {string} reactionText
	 */
	emitReaction(isHost, reactionIcon, reactionText) {
		this.stream.emit(
			'reaction-' + this.gameId,
			{
				isHost: isHost,
				reactionIcon: reactionIcon,
				reactionText: reactionText
			}
		);
		this.showReaction(isHost, reactionIcon, reactionText);
	}

	cheerPlayer(forHost) {
		if (!isGamePlayer(this.gameId)) {
			//Delay emittion, both sides use same timer
			if (!this.emitCheerFn) {
				this.emitCheerFn = require('lodash.throttle')(
					(forHost) => {
						this.stream.emit('cheer-' + this.gameId, {forHost: forHost});
						this.showCheer(forHost);
					},
					5000,
					{trailing: false}
				);
			}
			this.emitCheerFn(forHost);
		}
	}

	/**
	 * @param {boolean} isHost
	 * @param {string} reactionIcon
	 * @param {string} reactionText
	 */
	showReaction(isHost, reactionIcon, reactionText) {
		let selector = '#reaction-from-client .received-reaction-item';
		if (isHost) {
			selector = '#reaction-from-host .received-reaction-item';
			Meteor.clearTimeout(this.hostReactionTimeout);
		} else {
			Meteor.clearTimeout(this.clientReactionTimeout);
		}

		const reactionListItem = $(selector).first();
		reactionListItem.removeClass('reaction-shown');
		reactionListItem.addClass('reaction-shown');
		reactionListItem.empty();

		if (reactionText === undefined) {
			reactionListItem.append('<div class="reaction-list-item"><div class="reaction-icon reaction-icon-' + reactionIcon + '"></div></div>');
		} else {
			reactionListItem.append('<div class="reaction-list-item reaction-list-item-text"><div class="reaction-text">' + reactionText + '</div></div>');
		}

		const timeout = Meteor.setTimeout(() => {
			reactionListItem.removeClass('reaction-shown');
		}, 2000);

		if (isHost) {
			this.hostReactionTimeout = timeout;
		} else {
			this.clientReactionTimeout = timeout;
		}
	}

	showCheer(forHost) {
		//Delay reception, each side uses different timers
		if (!this.cheerFn[forHost]) {
			this.cheerFn[forHost] = require('lodash.throttle')(
				() => {
					this.gameInitiator.currentGame.cheer(forHost);

					let cheerElement;
					if (forHost) {
						cheerElement = document.getElementById('cheer-host');
						Meteor.clearTimeout(this.cheerHostTimeout);
					} else {
						cheerElement = document.getElementById('cheer-client');
						Meteor.clearTimeout(this.cheerClientTimeout);
					}

					$(cheerElement).removeClass('cheer-activated');
					$(cheerElement).addClass('cheer-activated');

					const timeout = Meteor.setTimeout(() => {
						$(cheerElement).removeClass('cheer-activated');
					}, 1000);

					if (forHost) {
						this.cheerHostTimeout = timeout;
					} else {
						this.cheerClientTimeout = timeout;
					}
				},
				5000,
				{trailing: false}
			);
		}
		this.cheerFn[forHost]();
	}

	stop() {
		$(document).off('keypress');
		this.stream.off('cheer-' + this.gameId);
		this.stream.off('reaction-' + this.gameId);
	}

}
