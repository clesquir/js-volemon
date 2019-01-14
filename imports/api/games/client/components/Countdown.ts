import GameData from "../../data/GameData";
import ServerNormalizedTime from "../ServerNormalizedTime";

export default class Countdown {
	gameData: GameData;
	serverNormalizedTime: ServerNormalizedTime;

	constructor(
		gameData: GameData,
		serverNormalizedTime: ServerNormalizedTime
	) {
		this.gameData = gameData;
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
			//@todo Countdown
			// this.countdownTimer = this.engine.createTimer(timerLeft, () => {
				// this.countdownText.text = '';
				// this.countdownTimer.stop();
				onFinished();
			// }, this);
			// 	this.countdownTimer.start();
		} else {
			onFinished();
		}
	}

	update() {
		//@todo Countdown
		// if (this.countdownTimer && this.engine.isTimerRunning(this.countdownTimer)) {
		// 	let countdownText = Math.ceil(this.engine.getTimerRemainingDuration(this.countdownTimer) / 1000),
		// 		scaleTo = 7;
		//
		// 	if (countdownText === 4 && this.gameData.numberMaximumPoints() > 1 && this.gameData.isMatchPoint()) {
		// 		countdownText = 'MATCH POINT';
		// 		scaleTo = 3;
		//
		// 		if (this.gameData.isDeucePoint()) {
		// 			countdownText = 'DEUCE';
		// 		}
		// 	}
		//
		// 	countdownText = this.engine.updateText(this.countdownText, countdownText);
		//
		// 	//Zoom numbers
		// 	if (countdownText !== this.lastCountdownNumber) {
		// 		this.engine.animateScale(this.countdownText, scaleTo, scaleTo, 1, 1, 500);
		// 		this.engine.animateSetOpacity(this.countdownText, 0, 1, 500);
		// 	}
		//
		// 	this.lastCountdownNumber = countdownText;
		// }
	}

	private init() {
		//@todo Countdown
		// this.countdownText = this.engine.addText(this.engine.getCenterX(), this.engine.getCenterY(), '', {
		// 	font: "75px 'Oxygen Mono', sans-serif",
		// 	fill: '#363636',
		// 	align: 'center'
		// });
	}
}
