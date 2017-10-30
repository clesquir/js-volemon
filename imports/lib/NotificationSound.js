let audioContext;
const volume = 0.05;

export default class NotificationSound {
	static playConnectSound() {
		const audioContext = this.createAudioContext();
		this.playNote(audioContext, 350, volume, 0.0, 0.1);
		this.playNote(audioContext, 520, volume, 0.1, 0.1);
		this.playNote(audioContext, 700, volume, 0.2, 0.2);
	}

	static playDisconnectSound() {
		const audioContext = this.createAudioContext();
		this.playNote(audioContext, 700, volume, 0.0, 0.1);
		this.playNote(audioContext, 520, volume, 0.1, 0.1);
		this.playNote(audioContext, 350, volume, 0.2, 0.2);
	}

	static createAudioContext() {
		if (!audioContext) {
			audioContext = new (window.AudioContext || window.webkitAudioContext)();
		}

		return audioContext;
	}

	/**
	 * @private
	 * @param audioContext
	 * @param frequency
	 * @param volume
	 * @param noteStart
	 * @param noteDuration
	 */
	static playNote(audioContext, frequency, volume, noteStart, noteDuration) {
		const hp = 1 / frequency / 2;
		if (noteDuration > hp) noteDuration -= noteDuration % hp; else noteDuration = hp;

		const gain = audioContext.createGain();
		gain.connect(audioContext.destination);
		gain.gain.value = volume;
		const oscillator = audioContext.createOscillator();
		oscillator.connect(gain);
		oscillator.type = 'triangle';
		oscillator.frequency.value = frequency;
		oscillator.start(audioContext.currentTime + noteStart);
		oscillator.stop(audioContext.currentTime + noteStart + noteDuration);
	}
}
