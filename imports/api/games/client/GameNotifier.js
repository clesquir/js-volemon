import {Meteor} from 'meteor/meteor';
import NotificationSound from '/imports/lib/NotificationSound.js';
import WindowFocus from '/imports/lib/WindowFocus.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';

export default class GameNotifier {
	onMatched() {
		if (!WindowFocus.isFocused()) {
			if (!this.userMutedNotifications()) {
				NotificationSound.playConnectSound();
			}

			this.showTitleNotification();
		}
	}

	onClientLeft() {
		if (!WindowFocus.isFocused()) {
			if (!this.userMutedNotifications()) {
				NotificationSound.playDisconnectSound();
			}

			this.showTitleNotification();
		}
	}

	onGameReady() {
		if (!WindowFocus.isFocused()) {
			if (!this.userMutedNotifications()) {
				NotificationSound.playPlayerReadySound();
			}

			this.showTitleNotification();
		}
	}

	onGameStart() {
		if (!WindowFocus.isFocused()) {
			if (!this.userMutedNotifications()) {
				NotificationSound.playGameStartedSound();
			}

			this.showTitleNotification();
		}
	}

	/**
	 * @private
	 * @returns {boolean}
	 */
	userMutedNotifications() {
		const userConfiguration = UserConfigurations.findOne({userId: Meteor.userId()});

		return userConfiguration && userConfiguration.muteNotifications;
	}

	/**
	 * @private
	 */
	showTitleNotification() {
		const title = 'Volemon';
		document.title = '🔔 ' + title;

		WindowFocus.addListenerOnFocus(() => {
			document.title = title;
		}, true);
	}
}
