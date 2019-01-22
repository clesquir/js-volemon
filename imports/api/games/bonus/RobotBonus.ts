import MonsterBonus from './MonsterBonus';
import Bonuses from "../client/components/Bonuses";

export default class RobotBonus extends MonsterBonus {
	atlasFrame: string = 'robot';
	description: string = 'Add a CPU in your team';
	durationMilliseconds: number = 30000;

	robotId: string = null;

	check(bonuses: Bonuses, currentTimestamp: number): boolean {
		//@todo Bonus
		if (bonuses.robotHasBeenKilled.call(bonuses, this.robotId)) {
			return false;
		}

		return this.check(bonuses, currentTimestamp);
	}

	beforeActivation(payload) {
		this.robotId = 'robot-' + Random.id(5);
	}

	beforeActivationData() {
		const beforeActivationData = super.beforeActivationData();

		beforeActivationData.robotId = this.robotId;

		return beforeActivationData;
	}

	reassignBeforeActivationData(beforeActivationData) {
		this.robotId = beforeActivationData.robotId;
	}

	start(bonuses: Bonuses) {
		//@todo Bonus
		bonuses.createRobotFromActivatorPlayerKey.call(bonuses, this.activatorPlayerKey, this.robotId);
	}

	stop(bonuses: Bonuses) {
		//@todo Bonus
		bonuses.removeRobot.call(bonuses, this.robotId);

		this.deactivate();
	}

	shouldBeRemovedWhenKilling(): boolean {
		return false;
	}
};
