'use strict';

const Homey = require('homey');
const util = require('homey-rfdriver').util;
const KakuDevice = require('../../lib/devices/kaku/kaku.js');

const MINUTE_MS = 60*1000;

// To extend from another class change the line below to
// module.exports = RFDevice => class ACM2300HDevice extends MyGenericDevice(RFDevice) {
// and define MyGenericDevice like so
// module.exports = RFDevice => class MyGenericDevice extends RFDevice {
module.exports = RFDevice => class ACM2300HDevice extends KakuDevice(RFDevice) {

    onRFInit() {
        super.onRFInit();

        this.timeOut = Number.parseInt(this.getSetting('timeout')) * MINUTE_MS;
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
