import MonsterBonus from './MonsterBonus';
import Bonuses from "../client/components/Bonuses";
import {BonusBeforeActivationData} from "./data/BonusBeforeActivationData";
import {BonusPayloadData} from "./data/BonusPayloadData";

export default class RobotBonus extends MonsterBonus {
	atlasFrame: string = 'robot';
	description: string = 'Add a CPU in your team';
	durationMilliseconds: number = 30000;

	robotId: string = null;

	check(bonuses: Bonuses, currentTimestamp: number): boolean {
		if (bonuses.players.robotHasBeenKilled(this.robotId)) {
			return false;
		}

		return super.check(bonuses, currentTimestamp);
	}

	beforeActivation(bonuses: Bonuses, payload: BonusPayloadData) {
		this.robotId = 'robot-' + Random.id(5);
	}

	beforeActivationData(): BonusBeforeActivationData {
		const beforeActivationData = super.beforeActivationData();

		beforeActivationData.robotId = this.robotId;

		return beforeActivationData;
	}

	reassignBeforeActivationData(beforeActivationData: BonusBeforeActivationData) {
		this.robotId = beforeActivationData.robotId;
	}

	start(bonuses: Bonuses) {
		bonuses.createRobot.call(bonuses, this.activatorPlayerKey, this.robotId);
	}

	stop(bonuses: Bonuses) {
		bonuses.removeRobot.call(bonuses, this.robotId);

		this.deactivate();
	}

	shouldBeRemovedWhenKilling(): boolean {
		return false;
	}
};
