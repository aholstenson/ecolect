'use strict';

const addHours = require('date-fns/addHours');
const addMinutes = require('date-fns/addMinutes');
const addSeconds = require('date-fns/addSeconds');

const setHours = require('date-fns/setHours');
const setMinutes = require('date-fns/setMinutes');
const setSeconds = require('date-fns/setSeconds');

const startOfHour = require('date-fns/startOfHour');
const startOfMinute = require('date-fns/startOfMinute');

const currentTime = require('./currentTime');
const DateValue = require('./date-value');

/**
 * Create a time in a 12-hour clock, which will guess the AM or PM.
 */
module.exports.time12h = function(hour, minute, second) {
	if(hour < 0 || hour > 24) return null;
	if(minute < 0 || minute > 60) return null;
	if(second < 0 || second > 60) return null;

	return {
		hour: hour,
		minute: minute,
		second: second,
		meridiem: hour === 0 || hour > 12 ? 'fixed' : 'auto'
	};
};

/**
 * Create a time in 24-hour clock, which will not guess AM or PM.
 */
module.exports.time24h = function(hour, minute, second) {
	if(hour < 0 || hour > 24) return null;
	if(minute < 0 || minute > 60) return null;
	if(second < 0 || second > 60) return null;

	return {
		hour: hour,
		minute: minute,
		second: second,
		meridiem: 'fixed'
	};
};

/**
 * Switch the given time to PM.
 */
module.exports.toPM = function(time) {
	time.meridiem = 'pm';
	return time;
};

/**
 * Switch the given time to AM.
 */
module.exports.toAM = function(time) {
	time.meridiem = 'am';
	return time;
};

module.exports.map = function(r, e, now, result) {
	result = result || new DateValue(e.language);

	let current = currentTime(e);
	let time = current;
	if(! now) {
		now = current;
	}

	if(typeof r.relativeHours !== 'undefined') {
		result.period = 'hour';

		time = addHours(time, r.relativeHours);
	} else if(typeof r.hour !== 'undefined') {
		result.period = 'hour';

		if(r.hour > 12) {
			// Always force fixed meridiem when hours are > 12
			r.meridiem = 'fixed';
		}

		// Hours are a bit special and require some special meridiem handling
		let hourToSet;
		if(r.meridiem === 'auto') {
			// Automatic meridiem
			const hour12 = now.getHours() % 12 || 12;
			if(r.hour < hour12 || (now.getHours() > 12 && r.hour ===  12)) {
				// Requested time is before the current hour - adjust forward in time
				hourToSet = r.hour + 12;
			} else {
				hourToSet = now.getHours() <= 12 ? r.hour : (r.hour + 12);
			}
		} else if(r.meridiem === 'am') {
			// AM meridiem - time set is hours directly
			hourToSet = r.hour === 12 ? 0 : r.hour;
		} else if(r.meridiem === 'pm') {
			// PM meridiem - time to set is hours + 12
			hourToSet = r.hour === 12 ? 12 : (r.hour + 12);
		} else {
			// Assume fixed meridiem
			hourToSet = r.hour;
		}

		// TODO: Move time ahead by a day?
		time = setHours(time, hourToSet);

		time = startOfHour(time);
	}

	if(typeof r.relativeMinutes !== 'undefined') {
		result.period = 'minute';

		time = addMinutes(time, r.relativeMinutes);
	} else if(typeof r.minute !== 'undefined') {
		result.period = 'minute';

		if(r.minute < time.getMinutes() && ! r.past) {
			// The given minute is before the current minute - assume next hour
			time = setMinutes(addHours(time, 1), r.minute);
		} else {
			// Treat as same hour
			time = setMinutes(time, r.minute);
		}

		time = startOfMinute(time);
	}

	if(typeof r.relativeSeconds !== 'undefined') {
		result.period = 'second';

		time = addSeconds(time, r.relativeSeconds);
	} else if(typeof r.second !== 'undefined') {
		result.period = 'second';

		if(r.second < time.getSeconds() && ! r.past) {
			// The given second is before the current second - assume next minute
			time = setSeconds(addMinutes(time, 1), r.second);
		} else {
			// Treat as same minute
			time = setSeconds(time, r.second);
		}
	}

	result.hour = time.getHours();
	result.minute = time.getMinutes();
	result.second = time.getSeconds();
	result.precision = r.precision || result.precision || 'normal';

	return result;
};
