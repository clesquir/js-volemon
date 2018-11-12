import MonsterBonus from '/imports/api/games/bonus/MonsterBonus.js';

export default class RobotBonus extends MonsterBonus {
	constructor(...args) {
		super(...args);
		this.durationMilliseconds = 30000;
		this.robotId = null;
		this.atlasFrame = 'robot';
		this.description = 'Add a CPU in your team';
	}

	check(currentTimestamp) {
		if (this.game.robotHasBeenKilled.call(this.game, this.robotId)) {
			return false;
		}

		return super.check(currentTimestamp);
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

	start() {
		this.game.createRobotFromActivatorPlayerKey.call(this.game, this.activatorPlayerKey, this.robotId);
	}

	stop() {
		this.game.removeRobot.call(this.game, this.robotId);

		this.deactivate();
	}

	shouldBeRemovedWhenKilling() {
		return false;
	}
};
