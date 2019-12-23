'use strict';

const Homey = require('homey');
const util = require('homey-rfdriver').util;
const DimmerDevice = require('../../lib/devices/kaku/dimmer.js');

// To extend from another class change the line below to
// module.exports = RFDevice => class ACM250Device extends MyGenericDevice(RFDevice) {
// and define MyGenericDevice like so
// module.exports = RFDevice => class MyGenericDevice extends RFDevice {
module.exports = RFDevice => class ACM250LDDevice extends DimmerDevice(RFDevice) {

    onRFInit() {
        super.onRFInit();

        // Init your device here
    }

    // Intercept the data to check if the timeout should be applied.
    parseOutgoingData(data) {
        if (data.onoff && this.timeOut > 0) {
            if (this.offTimer) clearTimeout(this.offTimer);
            this.offTimer = setTimeout(() => {
                this.setCapabilityValue('onoff', false);
            }, this.timeOut);
        }

        if (!data.onoff && this.offTimer) clearTimeout(this.offTimer);
        return data;
    }

    async onSettings(oldSettingsObj, newSettingsObj, changedKeysArr) {
        if (newSettingsObj.hasOwnProperty('timeout')) {
            this.timeOut = Number.parseInt(newSettingsObj.timeout) * MINUTE_MS;
        }
        return true;
    }

};
