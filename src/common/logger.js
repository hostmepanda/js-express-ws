'use strict';

class Logger {
	name;

	constructor (name) {
		this.name = name;
	}

	info (payload) {
		const dateAndTime = Date.now();
		const { marker = '', data = '' } = payload;
		console.log(`[${this.name}] ${dateAndTime}: ${marker}`, data);
	}
}


module.exports = {
	Logger,
};
