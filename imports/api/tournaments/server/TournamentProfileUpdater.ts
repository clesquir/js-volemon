import {getUTCTimeStamp} from '../../../lib/utils';
import {DEFAULT_TOURNAMENT_PROFILE_DATA, INITIAL_ELO_RATING} from '../../profiles/constants';
import ProfileUpdater from '../../profiles/server/ProfileUpdater';
import {TournamentEloScores} from '../tournamentEloScores';
import {TournamentProfiles} from '../tournamentProfiles';

export default class TournamentProfileUpdater extends ProfileUpdater {
	tournamentId: string;

	constructor(tournamentId: string) {
		super();
		this.tournamentId = tournamentId;
	}

	updateElo(userId: string, eloRating: number, eloRatingLastChange: number) {
		if (userId !== 'CPU') {
			const profile = this.findOrCreate(userId);

			TournamentProfiles.update(
				{_id: profile._id},
				{$set: {eloRating: eloRating, eloRatingLastChange: eloRatingLastChange}}
			);
		}
	}

	increateNumberOfWin(userId: string) {
		if (userId !== 'CPU') {
			const profile = this.findOrCreate(userId);

			TournamentProfiles.update(
				{_id: profile._id},
				{$set: {numberOfWin: profile.numberOfWin + 1}}
			);
		}
	}

	increateNumberOfLost(userId: string) {
		if (userId !== 'CPU') {
			const profile = this.findOrCreate(userId);

			TournamentProfiles.update(
				{_id: profile._id},
				{$set: {numberOfLost: profile.numberOfLost + 1}}
			);
		}
	}

	increateNumberOfShutouts(userId: string) {
		if (userId !== 'CPU') {
			const profile = this.findOrCreate(userId);

			TournamentProfiles.update(
				{_id: profile._id},
				{$set: {numberOfShutouts: profile.numberOfShutouts + 1}}
			);
		}
	}

	increateNumberOfShutoutLosses(userId: string) {
		if (userId !== 'CPU') {
			const profile = this.findOrCreate(userId);

			TournamentProfiles.update(
				{_id: profile._id},
				{$set: {numberOfShutoutLosses: profile.numberOfShutoutLosses + 1}}
			);
		}
	}

	protected findProfile(userId: string) {
		return TournamentProfiles.findOne({
			userId: userId,
			tournamentId: this.tournamentId
		});
	}

	protected defaultProfileData(userId: string): Object {
		return Object.assign(
			{
				userId: userId,
				tournamentId: this.tournamentId
			},
			DEFAULT_TOURNAMENT_PROFILE_DATA
		);
	}

	protected createInitialProfile(userId: string) {
		TournamentProfiles.insert(this.defaultProfileData(userId));
	}

	protected createInitialEloScore(userId: string) {
		TournamentEloScores.insert({
			timestamp: getUTCTimeStamp(),
			userId: userId,
			tournamentId: this.tournamentId,
			eloRating: INITIAL_ELO_RATING
		});
	}
}
