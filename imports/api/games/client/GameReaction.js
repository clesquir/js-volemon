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
		this.reactionTimeout = {};
	}

	init() {
		this.stream.on('reaction-' + this.gameId, (data) => {
			this.triggerReaction(data.playerKey, data.reactionIcon, data.reactionText);
		});

		$(document).on(
			'keypress',
			require('lodash.throttle')(
				(e) => {
					const keymap = String.fromCharCode(e.which);

					if (!this.gameData.isUserViewer() && $.isNumeric(keymap)) {
						this.onReactionSelection($(`div[data-reaction-keymap="${keymap}"]:first`));
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
	 */
	onReactionSelection(reactionButton) {
		this.emitReaction(
			this.gameData.getCurrentPlayerKey(),
			reactionButton.attr('data-reaction-icon'),
			reactionButton.attr('data-reaction-text')
		);
	}

	/**
	 * @param {boolean} playerKey
	 * @param {string} reactionIcon
	 * @param {string} reactionText
	 */
	emitReaction(playerKey, reactionIcon, reactionText) {
		this.stream.emit(
			'reaction-' + this.gameId,
			{
				playerKey: playerKey,
				reactionIcon: reactionIcon,
				reactionText: reactionText
			}
		);
		this.triggerReaction(playerKey, reactionIcon, reactionText);
	}

	/**
	 * @param {boolean} playerKey
	 * @param {string} reactionIcon
	 * @param {string} reactionText
	 */
	triggerReaction(playerKey, reactionIcon, reactionText) {
		const reactionListItem = $(`#reaction-from-${playerKey} .received-reaction-item`).first();

		Meteor.clearTimeout(this.reactionTimeout[playerKey]);

		if (reactionListItem.is('.reaction-shown')) {
			reactionListItem.removeClass('reaction-shown');

			Meteor.setTimeout(() => {
				this.showReaction(reactionListItem, playerKey, reactionIcon, reactionText);
			}, 200);
		} else {
			this.showReaction(reactionListItem, playerKey, reactionIcon, reactionText);
		}
	}

	showReaction(reactionListItem, playerKey, reactionIcon, reactionText) {
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

		this.reactionTimeout[playerKey] = Meteor.setTimeout(() => {
			reactionListItem.removeClass('reaction-shown');
		}, 2000);
	}

	stop() {
		$(document).off('keypress');
		this.stream.off('reaction-' + this.gameId);
	}
}
