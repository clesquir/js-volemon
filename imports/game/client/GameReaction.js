import {Meteor} from 'meteor/meteor';

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
			this.showReaction(data.isHost, data.reactionIcon, data.reactionText);
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

	toggleSelectorDisplay(chatButton) {
		const reactionSelector = document.getElementById('reaction-selector');

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
		const reactionSelector = document.getElementById('reaction-selector');
		$(reactionSelector).hide();
		const chatButton = document.getElementById('chat-button');
		$(chatButton).removeClass('reaction-selector-opened');

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
		this.stream.emit('reaction-' + this.gameId, {isHost: isHost, reactionIcon: reactionIcon, reactionText: reactionText});
		this.showReaction(isHost, reactionIcon, reactionText);
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
			Meteor.clearTimeout(this.hostTimeout);
		} else {
			Meteor.clearTimeout(this.clientTimeout);
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
			this.hostTimeout = timeout;
		} else {
			this.clientTimeout = timeout;
		}
	}

	stop() {
		$(document).off('keypress');
		this.stream.off('reaction-' + this.gameId);
	}

}
