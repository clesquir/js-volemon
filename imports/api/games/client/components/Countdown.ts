import GameData from "../../data/GameData";
import ServerNormalizedTime from "../ServerNormalizedTime";
import MainScene from "../scene/MainScene";
import GameConfiguration from "../../configuration/GameConfiguration";

export default class Countdown {
	scene: MainScene;
	gameData: GameData;
	gameConfiguration: GameConfiguration;
	serverNormalizedTime: ServerNormalizedTime;

	countdownText: Phaser.GameObjects.Text;
	countdownTimer: Phaser.Time.TimerEvent;
	lastCountdownText: string = '';

	constructor(
		scene: MainScene,
		gameData: GameData,
		gameConfiguration: GameConfiguration,
		serverNormalizedTime: ServerNormalizedTime
	) {
		this.scene = scene;
		this.gameData = gameData;
		this.gameConfiguration = gameConfiguration;
		this.serverNormalizedTime = serverNormalizedTime;

		this.init();
	}

	start(onFinished: () => void) {
		let timerDuration = 3;

		if (this.gameData.numberMaximumPoints() > 1 && this.gameData.isMatchPoint()) {
			//Add one second to show text
			timerDuration = 4;
		}

		//Calculate what's left
		let timerLeft = timerDuration - (this.serverNormalizedTime.getServerTimestamp() - this.gameData.lastPointAt) / 1000;
		if (timerLeft > timerDuration) {
			timerLeft = timerDuration;
		}

		if (timerLeft > 0) {
			this.countdownTimer = this.scene.time.delayedCall(
				timerLeft * 1000,
				() => {
					this.countdownText.text = '';
					onFinished();
				},
				[],
				this
			);
		} else {
			onFinished();
		}
	}

	update() {
		if (this.countdownTimer && this.countdownTimer.getProgress() < 1) {
			let countdownText = Math.ceil(
				(this.countdownTimer.delay - this.countdownTimer.elapsed) / 1000
			).toString();
			let scaleTo = 7;

			if (countdownText === '4' && this.gameData.numberMaximumPoints() > 1 && this.gameData.isMatchPoint()) {
				countdownText = 'MATCH POINT';
				scaleTo = 3;

				if (this.gameData.isDeucePoint()) {
					countdownText = 'DEUCE';
				}
			}

			if (countdownText !== this.lastCountdownText) {
				this.countdownText.setText(countdownText);
				this.countdownText.setScale(1);
				this.countdownText.setAlpha(1);

				//Zoom numbers
				this.scene.tweens.add({
					targets: this.countdownText,
					duration: 500,
					scaleX: scaleTo,
					scaleY: scaleTo,
					alpha: 0
				});
			}

			this.lastCountdownText = countdownText;
		}
	}

	private init() {
		this.countdownText = this.scene.add.text(
			this.gameConfiguration.width() / 2,
			this.gameConfiguration.height() / 2,
			'',
			{fontFamily: "'Oxygen Mono', sans-serif", fontSize: 75, color: '#363636', align: 'center'}
		);
		this.countdownText.setOrigin(0.5);
	}
}
