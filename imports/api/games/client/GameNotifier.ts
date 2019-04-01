import WindowFocus from "../../../lib/WindowFocus";
import NotificationSound from "../../../lib/NotificationSound";
import {UserConfigurations} from "../../users/userConfigurations";
import {Meteor} from 'meteor/meteor';

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

	private userMutedNotifications(): boolean {
		const userConfiguration = UserConfigurations.findOne({userId: Meteor.userId()});

		return userConfiguration && userConfiguration.muteNotifications;
	}

	private showTitleNotification() {
		const title = 'Volemon';
		document.title = '🔔 ' + title;

		WindowFocus.addListenerOnFocus(() => {
			document.title = title;
		}, true);
	}
}
