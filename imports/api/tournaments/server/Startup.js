import TournamentFinish from './TournamentFinish';

export default class Startup {
	static start() {
		const tournamentFinish = new TournamentFinish();
		tournamentFinish.init();
	}
}
