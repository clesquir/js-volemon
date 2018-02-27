import {Meteor} from 'meteor/meteor';
const he = require('he');

export default class GameReaction {
	/**
	 * @param {string} gameId
	 * @param {Stream} stream
	 * @param {GameData} gameData
	 */
	constructor(gameId, stream, gameData) {
		this.gameId = gameId;
		this.stream = stream;
		this.gameData = gameData;
	}

	init() {
		this.stream.on('reaction-' + this.gameId, (data) => {
			this.triggerReaction(data.isHost, data.reactionIcon, data.reactionText);
		});

		$(document).on(
			'keypress',
			require('lodash.throttle')(
				(e) => {
					const keymap = String.fromCharCode(e.which);

					if (!this.gameData.isUserViewer() && $.isNumeric(keymap)) {
						this.onReactionSelection($(`div[data-reaction-keymap="${keymap}"]:first`), this.gameData.isUserHost());
					}
				},
				700,
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
		this.triggerReaction(isHost, reactionIcon, reactionText);
	}

	/**
	 * @param {boolean} isHost
	 * @param {string} reactionIcon
	 * @param {string} reactionText
	 */
	triggerReaction(isHost, reactionIcon, reactionText) {
		let selector = '#reaction-from-client .received-reaction-item';
		if (isHost) {
			selector = '#reaction-from-host .received-reaction-item';
			Meteor.clearTimeout(this.hostReactionTimeout);
		} else {
			Meteor.clearTimeout(this.clientReactionTimeout);
		}

		const reactionListItem = $(selector).first();
		if (reactionListItem.is('.reaction-shown')) {
			reactionListItem.removeClass('reaction-shown');

			Meteor.setTimeout(() => {
				this.showReaction(reactionListItem, isHost, reactionIcon, reactionText);
			}, 200);
		} else {
			this.showReaction(reactionListItem, isHost, reactionIcon, reactionText);
		}
	}

	showReaction(reactionListItem, isHost, reactionIcon, reactionText) {
		reactionListItem.addClass('reaction-shown');
		reactionListItem.empty();

		if (reactionText === undefined) {
			reactionListItem.append(
				'<div class="reaction-list-item">' +
				'<div class="reaction-icon reaction-icon-' + reactionIcon + '">' +
				'</div>' +
				'</div>'
			);
		} else {
			reactionListItem.append(
				'<div class="reaction-list-item reaction-list-item-text">' +
				'<div class="reaction-text">' +
				he.encode(reactionText) +
				'</div>' +
				'</div>'
			);
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

	stop() {
		$(document).off('keypress');
		this.stream.off('reaction-' + this.gameId);
	}
}
