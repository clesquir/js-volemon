import {getUTCTimeStamp} from '../../../lib/utils';
import {DEFAULT_PROFILE_DATA, INITIAL_ELO_RATING} from '../../profiles/constants';
import ProfileUpdater from '../../profiles/server/ProfileUpdater';
import {TournamentEloScores} from '../tournamentEloScores';
import {TournamentProfiles} from '../tournamentProfiles';

export default class TournamentProfileUpdater extends ProfileUpdater {
	tournamentId: string;

	constructor(tournamentId: string) {
		super();
		this.tournamentId = tournamentId;
	}

	findOrCreate(userId: string) {
		if (userId === 'CPU') {
			return this.defaultProfileData(userId);
		}

		let profile = TournamentProfiles.findOne({
			userId: userId,
			tournamentId: this.tournamentId
		});

		if (!profile) {
			TournamentProfiles.insert(this.defaultProfileData(userId));

			profile = TournamentProfiles.findOne({
				userId: userId,
				tournamentId: this.tournamentId
			});

			TournamentEloScores.insert({
				timestamp: getUTCTimeStamp(),
				userId: userId,
				tournamentId: this.tournamentId,
				eloRating: INITIAL_ELO_RATING
			});
		}

		return profile;
	}

	update(userId: string, data) {
		const profile = this.findOrCreate(userId);

		if (data.userId !== 'CPU') {
			TournamentProfiles.update({_id: profile._id}, {$set: data});
		}
	}

	protected defaultProfileData(userId: string) {
		return Object.assign(
			{
				userId: userId,
				tournamentId: this.tournamentId
			},
			DEFAULT_PROFILE_DATA
		);
	}
}
