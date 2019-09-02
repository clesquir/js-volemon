import Event from '../../../lib/events/Event';

export default class TournamentFinished implements Event {
	tournamentId: string;

	constructor(tournamentId: string) {
		this.tournamentId = tournamentId;
	}

	static getClassName(): string {
		return 'TournamentFinished';
	}

	getClassName(): string {
		return TournamentFinished.getClassName();
	}
}
