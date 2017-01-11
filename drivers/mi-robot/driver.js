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

    Homey.log ("Xiaomi Mi Robot - init done")

	callback (null, true);
}

module.exports.pair = function( socket ) {
    socket.on('list_devices', function( data, callback ) {

        var device_data = {
            name: "Mi Robot",
            data: {
                address : data.address,
                start   : data.start,
                pause   : data.pause,
                home    : data.home,
                find    : data.find
            }
        }

        callback( null, [ device_data ] );

    });

    socket.on('get_devices', function (data, callback) {

        var address = data.address;
        var start   = data.start;
        var pause   = data.pause;
        var home    = data.home;
        var find    = data.find;

		Homey.log ( "Xiaomi Mi Robot - got get_devices from front-end with address" + address );

		socket.emit ('continue', null);

	});

    socket.on('disconnect', function() {
        Homey.log ("User aborted pairing, or pairing is finished");
    });

    socket.on('test-connection', function( data, callback ) {
        var address = data.address;
        var pause   = data.pause;

        sendCommand(pause, address, callback);

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

// FLOW ACTION HANDLERS
Homey.manager('flow').on('action.startCleaning', function( callback, args ) {
    sendCommand(devices[args.device.id].settings.start, devices[args.device.id].settings.address, callback);
});

Homey.manager('flow').on('action.stopCleaning', function( callback, args ) {
    sendCommand(devices[args.device.id].settings.pause, devices[args.device.id].settings.address, callback);
});

Homey.manager('flow').on('action.startCleaning', function( callback, args ) {
    sendCommand(devices[args.device.id].settings.home, devices[args.device.id].settings.address, callback);
});

Homey.manager('flow').on('action.startCleaning', function( callback, args ) {
    sendCommand(devices[args.device.id].settings.find, devices[args.device.id].settings.address, callback);
});

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

}
