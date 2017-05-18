import * as Moment from 'meteor/momentjs:moment';
import {TYPE_MS, TYPE_TIMES} from '/imports/api/achievements/constants.js';

export const formatAchievementNumber = function(type, number) {
	switch (type) {
		case TYPE_MS:
			return Moment.moment(number).format('mm:ss');
			break;
		case TYPE_TIMES:
			return number + 'x';
			break;
	}

	return number;
};
