export default interface NormalizedTime {
	init();

	stop();

	getTime(): number;

	getOffset(): number;
}
