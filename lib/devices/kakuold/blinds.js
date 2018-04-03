'use strict';

const Kaku = require('./kaku');
const util = require('homey-rfdriver').util;

module.exports = RFDevice => class Blinds extends Kaku(RFDevice) {

	onRFInit() {
		super.onRFInit();
		this.sendToggleTimeout = {};
	}

	parseIncomingData(data) {
		data = super.parseIncomingData(data);

		// We asumme that every signal means up or down depending on the state and there are no other signals
		data.windowcoverings_state = Number(data.state) ? 'up' : 'down';

		// If the rotated setting is set we invert the up/down axis of all incoming data
		if (this.getSetting('rotated') === '180') {
			if (data.windowcoverings_state === 'up' || data.windowcoverings_state === 'down') {
				data.windowcoverings_state = data.windowcoverings_state === 'up' ? 'down' : 'up';
			}
		}

		if (this.stateTransition && this.stateTransition === data.windowcoverings_state) {
			data.windowcoverings_state = 'idle';
		} else {
			data.direction = data.windowcoverings_state;
		}

		return data;
	}

	setCapabilityValue(capability, value) {
		if (
			capability === 'windowcoverings_state' &&
			this.hasCapability(capability)
		) {
			clearTimeout(this.sendToggleTimeout[capability]);
			this.stateTransition = null;
			if (value !== 'idle') {
				this.lastDirection = value;
				this.stateTransition = value;
				this.sendToggleTimeout[capability] = setTimeout(() => {
					this.stateTransition = null;
				}, 120000);
			}
		}
		return super.setCapabilityValue(capability, value);
	}

	parseOutgoingData(data) {
		if (data.windowcoverings_state === 'idle') {
			if (this.stateTransition) {
				data.state = this.stateTransition === (this.getSetting('rotated') === '180' ? 'down' : 'up') ? 1 : 0;
			} else {
				this.stateTransition = this.lastDirection || 'up';
				data.windowcoverings_state = this.stateTransition;
			}
		}
		if (!this.isPairInstance && this.getSetting('rotated') === '180') {
			if (data.windowcoverings_state === 'up' || data.windowcoverings_state === 'down') {
				const virtualDirection = data.windowcoverings_state === 'up' ? 'down' : 'up';
				data = Object.assign({}, data, { windowcoverings_state: virtualDirection });
			}
		}
		if (!data.windowcoverings_state) {
			data.windowcoverings_state = data.state ? 'up' : 'down';
		} else if (data.windowcoverings_state !== 'idle') {
			data.state = data.windowcoverings_state === 'up' ? 1 : 0;
		}
		delete data.windowcoverings_state;
		return data;
	}
};
