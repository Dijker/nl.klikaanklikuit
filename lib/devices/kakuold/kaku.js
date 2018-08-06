'use strict';

const util = require('homey-rfdriver').util;
const DefaultDevice = require('../DefaultDevice');
const { dataToPayload: dataToPayloadNew } = require('../kaku/kaku');

const globalIdList = new Set();

//THIS IS KAKUOLD
module.exports = RFDevice => class Kaku extends DefaultDevice(RFDevice) {

	onRFInit() {
		if (!this.isPairInstance) {
			globalIdList.add(this.getData().id);
		}
		this.clearFromEmptySendObject = ['onoff'];
		return super.onRFInit();
	}

	static codewheelsToData(codewheelIndexes) {
		if (codewheelIndexes.length === 2) {
			const address = codewheelIndexes[0]
				.toString(2)
				.padStart(4, 0)
				.split('')
				.reverse()
				.join('');
			const unitWithChannel = codewheelIndexes[1]
				.toString(2)
				.padStart(4, 0)
				.split('')
				.reverse()
				.join('');
			const data = {
				address: address,
				channel: unitWithChannel.substr(2, 2),
				unit: unitWithChannel.substr(0, 2),
				undef: [0, 1, 1],
				state: 0,
			};
			data.id = `${data.address}:${data.channel}:${data.unit}`;
			return data;
		} else if (codewheelIndexes.length === 1) {
			const data = {
				address: Math.floor(codewheelIndexes[0] / 3)
					.toString(2)
					.padStart(4, 0)
					.split('')
					.reverse()
					.join(''),
				channel: '00',
				unit: Math.floor(codewheelIndexes[0] % 3)
					.toString(2)
					.padStart(2, 0)
					.split('')
					.reverse()
					.join(''),
				undef: [0, 1, 1],
				state: 0,
			};
			data.id = `${data.address}:${data.channel}:${data.unit}`;
			return data;
		}
		return null;
	}

	static generateData() {
		const data = {
			address: util.generateRandomBitString(4),
			channel: util.generateRandomBitString(2),
			unit: util.generateRandomBitString(2),
			undef: [0, 1, 1],
			state: 0,
		};
		data.id = `${data.address}:${data.channel}:${data.unit}`;
		if (globalIdList.has(data.id) && globalIdList.size < 200) {
			return this.generateData();
		}
		data.codewheelIndexes = [
			parseInt(data.address, 2),
			parseInt(data.channel + data.unit, 2),
		];
		return data;
	}

	static payloadToData(payload) { // Convert received data to usable variables
		if (
			payload &&
			payload.length === 12 &&
			(
				payload.indexOf(2) === -1 ||
				(
					payload.slice(0, 4).indexOf(2) === -1 &&
					payload.slice(4, 8).indexOf(0) === -1 &&
					payload.slice(4, 8).indexOf(1) === -1 &&
					payload.slice(8, 12).indexOf(2) === -1
				)
			)
		) {
			const data = {
				address: util.bitArrayToString(payload.slice(0, 4)),
				channel: util.bitArrayToString(payload.slice(6, 8)),
				unit: util.bitArrayToString(payload.slice(4, 6)),
				group: 0,
				undef: payload.slice(8, 11),
				state: payload[11],
				onoff: Boolean(Number(payload[11]))
			};
			if (data.channel === '22') {
				data.channel = '00';
				data.unit = '00';
				data.group = 1;
			}
			data.id = `${data.address}:${data.channel}:${data.unit}`;
			return data;
		}
		return null;
	}

	static dataToPayload(...args) {
		return dataToPayload(...args);
	}
};

const dataToPayload = function(data) {
	// test for kakuold signal
	if (
		data &&
		data.address && data.address.length === 4 &&
		data.channel && data.channel.length === 2 &&
		data.unit && data.unit.length === 2 &&
		data.undef && data.undef.length === 3 &&
		typeof data.state !== 'undefined'
	) {
		console.log('Using old signal in kakuold');
		const address = util.bitStringToBitArray(data.address);
		const channel = Number(data.group) ? [2, 2] : data.channel.split('').map(Number);
		const unit = Number(data.group) ? [2, 2] : data.unit.split('').map(Number);
		return address.concat(
			unit,
			channel,
			data.undef,
			Number(typeof data.onoff === 'boolean' ? data.onoff : data.state)
		);
	} else if (
		data &&
		data.address && data.address.length == 26
	) {
		// new signal so call the other class' function
		console.log('Using new signal in kaku');
		return dataToPayloadNew(data);
	}
	// No valid data for either signal so return null.
	return null;
}

module.exports.dataToPayload = dataToPayload;
