'use strict';

const Homey = require('homey');
const util = require('homey-rfdriver').util;
const DimmerDevice = require('../../lib/devices/kaku/dimmer.js');

// To extend from another class change the line below to
// module.exports = RFDevice => class ACD200Device extends MyGenericDevice(RFDevice) {
// and define MyGenericDevice like so
// module.exports = RFDevice => class MyGenericDevice extends RFDevice {
module.exports = RFDevice => class ACD200Device extends DimmerDevice(RFDevice) {

    onRFInit() {
        super.onRFInit();

        // Init your device here
    }

};
