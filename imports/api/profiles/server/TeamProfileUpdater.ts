import {Profiles} from "../profiles";
import {INITIAL_ELO_RATING} from "../constants";
import {getUTCTimeStamp} from "../../../lib/utils";
import {TeamEloScores} from "../../games/teameloscores";
import ProfileUpdater from "./ProfileUpdater";

export default class TeamProfileUpdater extends ProfileUpdater {
	getEloRating(userId: string): number {
		const profile = this.findOrCreate(userId);

		return profile.teamEloRating || INITIAL_ELO_RATING;
	}

	updateElo(userId: string, eloRating: number, eloRatingLastChange: number) {
		const profile = this.findOrCreate(userId);

		if (userId !== 'CPU') {
			Profiles.update(
				{_id: profile._id},
				{$set: {teamEloRating: eloRating, teamEloRatingLastChange: eloRatingLastChange}}
			);
		}
	}

	increateNumberOfWin(userId: string) {
		if (userId !== 'CPU') {
			const profile = this.findOrCreate(userId);

			const numberOfWin = profile.numberOfWin + 1;
			const teamNumberOfWin = profile.teamNumberOfWin + 1;
			Profiles.update(
				{_id: profile._id},
				{$set: {
					numberOfWin: numberOfWin,
					teamNumberOfWin: teamNumberOfWin,
				}}
			);
		}
	}

	increateNumberOfLost(userId: string) {
		if (userId !== 'CPU') {
			const profile = this.findOrCreate(userId);

			const numberOfLost = profile.numberOfLost + 1;
			const teamNumberOfLost = profile.teamNumberOfLost + 1;
			Profiles.update(
				{_id: profile._id},
				{$set: {
					numberOfLost: numberOfLost,
					teamNumberOfLost: teamNumberOfLost,
				}}
			);
		}
	}

	increateNumberOfShutouts(userId: string) {
		if (userId !== 'CPU') {
			const profile = this.findOrCreate(userId);

			const numberOfShutouts = profile.numberOfShutouts + 1;
			const teamNumberOfShutouts = profile.teamNumberOfShutouts + 1;
			Profiles.update(
				{_id: profile._id},
				{$set: {
					numberOfShutouts: numberOfShutouts,
					teamNumberOfShutouts: teamNumberOfShutouts,
				}}
			);
		}
	}

	increateNumberOfShutoutLosses(userId: string) {
		if (userId !== 'CPU') {
			const profile = this.findOrCreate(userId);

			const numberOfShutoutLosses = profile.numberOfShutoutLosses + 1;
			const teamNumberOfShutoutLosses = profile.teamNumberOfShutoutLosses + 1;
			Profiles.update(
				{_id: profile._id},
				{$set: {
					numberOfShutoutLosses: numberOfShutoutLosses,
					teamNumberOfShutoutLosses: teamNumberOfShutoutLosses,
				}}
			);
		}
	}

	protected createInitialEloScore(userId: string) {
		TeamEloScores.insert({
			timestamp: getUTCTimeStamp(),
			userId: userId,
			eloRating: INITIAL_ELO_RATING
		});
	}
}
