'use strict';

const Homey = require('homey');
const util = require('homey-rfdriver').util;
const SensorDevice = require('../../lib/devices/kaku/sensor.js');

// To extend from another class change the line below to
// module.exports = RFDevice => class AMST606Device extends MyGenericDevice(RFDevice) {
// and define MyGenericDevice like so
// module.exports = RFDevice => class MyGenericDevice extends RFDevice {
module.exports = RFDevice => class AMST606Device extends SensorDevice(RFDevice) {

    onRFInit() {
        super.onRFInit();

        // Init your device here
    }

};
