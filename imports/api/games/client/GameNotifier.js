import {Meteor} from 'meteor/meteor';
import {Profiles} from '/imports/api/profiles/profiles.js';
import NotificationSound from '/imports/lib/NotificationSound.js';
import WindowFocus from '/imports/lib/WindowFocus.js';

export default class GameNotifier {
	onClientJoined() {
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

	/**
	 * @private
	 * @returns {boolean}
	 */
	userMutedNotifications() {
		const profile = Profiles.findOne({userId: Meteor.userId()});

		return profile && profile.muteNotifications;
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
