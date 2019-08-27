import GameData from "../../data/GameData";
import MainScene from "../scene/MainScene";
import GameConfiguration from "../../configuration/GameConfiguration";
import NormalizedTime from "../../../../lib/normalizedTime/NormalizedTime";

export default class Countdown {
	scene: MainScene;
	gameData: GameData;
	gameConfiguration: GameConfiguration;
	normalizedTime: NormalizedTime;

	countdownText: Phaser.Text;
	countdownTimer: Phaser.Timer;
	lastCountdownText: string = '';

	constructor(
		scene: MainScene,
		gameData: GameData,
		gameConfiguration: GameConfiguration,
		normalizedTime: NormalizedTime
	) {
		this.scene = scene;
		this.gameData = gameData;
		this.gameConfiguration = gameConfiguration;
		this.normalizedTime = normalizedTime;

		this.init();
	}

	start(onFinished: () => void) {
		let timerDuration = 3;

		if (this.gameData.numberMaximumPoints() > 1 && this.gameData.isMatchPoint()) {
			//Add one second to show text
			timerDuration = 4;
		}

		//Calculate what's left
		let timerLeft = timerDuration - (this.normalizedTime.getTime() - this.gameData.lastPointAt) / 1000;
		if (timerLeft > timerDuration) {
			timerLeft = timerDuration;
		}

		if (timerLeft > 0) {
			if (this.countdownTimer) {
				this.countdownTimer.stop(true);
			}

			this.countdownTimer = this.scene.game.time.create();

			this.countdownTimer.add(
				Phaser.Timer.SECOND * timerLeft,
				() => {
					this.countdownText.text = '';
					this.countdownTimer.stop();
					onFinished();
				},
				this
			);

			this.countdownTimer.start();
		} else {
			onFinished();
		}
	}

	update() {
		if (this.countdownTimer && this.countdownTimer.running) {
			let countdownText = Math.ceil(this.countdownTimer.duration / 1000).toString();
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
				this.countdownText.scale.setTo(1);
				this.countdownText.alpha = 1;

				//Zoom numbers
				this.scene.game.add
					.tween(this.countdownText.scale)
					.to({x: scaleTo, y: scaleTo}, 500)
					.start();
				this.scene.game.add
					.tween(this.countdownText)
					.to({alpha: 0}, 500)
					.start();
			}

			this.lastCountdownText = countdownText;
		}
	}

	private init() {
		this.countdownText = this.scene.game.add.text(
			this.gameConfiguration.width() / 2,
			this.gameConfiguration.height() / 2,
			'',
			{
				font: "75px 'Oxygen Mono', sans-serif",
				fill: '#363636',
				align: 'center'
			}
		);
		this.countdownText.smoothed = true;
		this.countdownText.anchor.setTo(0.5);
	}
}
