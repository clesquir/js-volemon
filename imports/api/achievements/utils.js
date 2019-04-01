import {TYPE_MS, TYPE_TIMES} from '/imports/api/achievements/constants.js';
import moment from 'moment';

export const formatAchievementNumber = function(type, number) {
	switch (type) {
		case TYPE_MS:
			return moment(number).format('mm:ss');
		case TYPE_TIMES:
			return number + 'x';
	}

	return number;
};
