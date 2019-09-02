import {UserAchievements} from '../../userAchievements';
import EventPublisher from '../../../../lib/EventPublisher';
import {getUTCTimeStamp} from '../../../../lib/utils';

export default class Listener {
	userId: string = null;
	numberSinceLastReset: number = 0;
	userAchievement: any = null;

	destroy() {
		this.removeListeners();
	}

	addListeners() {
	}

	addListener(eventName: string, listener: Function) {
		EventPublisher.on(eventName, listener, this);
	}

	removeListeners() {
	}

	removeListener(eventName: string, listener: Function) {
		EventPublisher.off(eventName, listener, this);
	}

	incrementNumber(achievementId: string) {
		const userAchievement = this.getUserAchievement(achievementId);

		let number = 1;
		if (userAchievement) {
			number = userAchievement.number + 1;
		}

		this.insertOrUpdateAchievement(userAchievement, achievementId, number);
	}

	updateNumberIfHigher(achievementId: string, number: number) {
		const userAchievement = this.getUserAchievement(achievementId);

		if (!userAchievement) {
			this.insertOrUpdateAchievement(userAchievement, achievementId, number);
		} else if (number > userAchievement.number) {
			this.insertOrUpdateAchievement(userAchievement, achievementId, number);
		}
	}

	incrementNumberIfHigherWithNumberSinceLastReset(achievementId: string) {
		this.numberSinceLastReset = this.numberSinceLastReset + 1;

		this.updateNumberIfHigher(achievementId, this.numberSinceLastReset);
	}

	resetNumberSinceLastReset() {
		this.numberSinceLastReset = 0;
	}

	initNumberSinceLastReset(achievementId: string) {
		const userAchievement = this.getUserAchievement(achievementId);

		this.numberSinceLastReset = 0;
		if (userAchievement) {
			this.numberSinceLastReset = userAchievement.numberSinceLastReset;
		}
	}

	updateNumberSinceLastReset(achievementId: string) {
		const userAchievement = this.getUserAchievement(achievementId);

		if (!userAchievement) {
			this.insertAchievement(achievementId, {numberSinceLastReset: this.numberSinceLastReset});
		} else {
			this.updateAchievement(achievementId, {numberSinceLastReset: this.numberSinceLastReset});
		}
	}

	protected insertOrUpdateAchievement(userAchievement: any, achievementId: string, number: number) {
		if (!userAchievement) {
			this.insertAchievement(achievementId, {number: number});
		} else {
			this.updateAchievement(achievementId, {number: number});
		}
	}

	protected insertAchievement(achievementId: string, data: any) {
		UserAchievements.insert(
			Object.assign(
				{
					userId: this.userId,
					achievementId: achievementId,
					modifiedAt: getUTCTimeStamp()
				},
				data
			)
		);

		//Reinitialize storage
		this.userAchievement = null;
	}

	protected updateAchievement(achievementId: string, data: any) {
		UserAchievements.update(
			{
				userId: this.userId,
				achievementId: achievementId
			},
			{$set:
				Object.assign(
					{
						modifiedAt: getUTCTimeStamp()
					},
					data
				)
			}
		);

		//Reinitialize storage
		this.userAchievement = null;
	}

	protected getUserAchievement(achievementId: string): any {
		if (!this.userAchievement) {
			this.userAchievement = UserAchievements.findOne(
				{
					userId: this.userId,
					achievementId: achievementId
				}
			);
		}

		return this.userAchievement;
	}
}
