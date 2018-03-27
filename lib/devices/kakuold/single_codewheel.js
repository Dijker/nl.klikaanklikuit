'use strict';

const Kaku = require('./kaku');
const util = require('homey-rfdriver').util;

module.exports = RFDevice => class SingleCodewheel extends Kaku(RFDevice) {
	generateData() {
		const data = {
			address: `00${this.generateRandomBitString(2)}`,
			channel: '00',
			unit: this.generateRandomBitString(2),
			undef: [0, 1, 1],
			state: 0,
		};
		data.codewheelIndexes = [
			parseInt(data.address, 2) * 3 + parseInt(data.unit, 2),
		];
		data.id = `${data.address}:${data.channel}:${data.unit}`;
		return data;
	}
};
