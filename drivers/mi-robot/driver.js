"use strict";

var dgram = require('dgram');
var devices = {};

module.exports.init = function( devices_data, callback ) {

    devices_data.forEach(function initdevice(device) {

        devices[device.id] = device;

	    module.exports.getSettings(device, function(err, settings) {
		    devices[device.id].settings = settings;
		});

	});

    Homey.log ("Xiaomi Mi Robot - Init done");

	callback (null, true);
}

module.exports.pair = function( socket ) {

    socket.on('disconnect', function() {
        Homey.log ("User aborted pairing, or pairing is finished");
    });

    socket.on('test-connection', function( data, callback ) {
        var address = data.address;
        var find   = data.find;

        sendCommand(find, address, callback);

        callback( null, true );
    });
}

module.exports.deleted = function( device_data, callback ) {
    delete devices[ device_data.id ];
    callback( null, true );
}

module.exports.settings = function( device_data, newSettingsObj, oldSettingsObj, changedKeysArr, callback ) {

    Homey.log ('Xiaomi Mi Robot changed settings: ' + JSON.stringify(device_data) + ' / ' + JSON.stringify(newSettingsObj) + ' / old = ' + JSON.stringify(oldSettingsObj));

    try {
        changedKeysArr.forEach(function (key) {
            devices[device_data.id].settings[key] = newSettingsObj[key]
        })
        callback(null, true)
    } catch (error) {
        callback(error)
    }
}

// FUNCTIONS
function sendCommand (command, address, callback) {
    var PORT = 54321;
    var message = new Buffer(command, 'hex');
    var client = dgram.createSocket('udp4');

    client.send(message, 0, message.length, PORT, address, function(err, bytes) {
        if (err) throw err;
        Homey.log('Command sent to ' + address +':'+ PORT);
        client.close();
    });

    callback(null, true)

}

// FLOW ACTION HANDLERS
Homey.manager('flow').on('action.startCleaning', function( callback, args ) {
    sendCommand(devices[args.device.id].settings.start, devices[args.device.id].settings.address, callback);
});

Homey.manager('flow').on('action.stopCleaning', function( callback, args ) {
    sendCommand(devices[args.device.id].settings.pause, devices[args.device.id].settings.address, callback);
});

Homey.manager('flow').on('action.goHomeMiRobot', function( callback, args ) {
    sendCommand(devices[args.device.id].settings.home, devices[args.device.id].settings.address, callback);
});

Homey.manager('flow').on('action.findMiRobot', function( callback, args ) {
    sendCommand(devices[args.device.id].settings.find, devices[args.device.id].settings.address, callback);
});
