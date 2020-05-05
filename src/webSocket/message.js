'use strict';

const actionHandlers = {

};

const parseMessage = ({ action = null, data = null } = {}) => {
	if (!action) {
		return null;
	}

	return actionHandlers[action](data);
};

module.exports = {
	parseMessage,
};