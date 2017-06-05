"use strict";

var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var MiHome = require('/lib/mihomepacket');

var connected = false;
var commands = {};
var message = '';
var counter = 9;
var packet;

var robots = {};

/* HELPER FUNCTIONS */
function initDevice(device_data) {
    module.exports.getSettings(device_data, function (err, settings) {
        robots[device_data.id].settings = settings;
    });
    token = robots[device_data.id].settings.token;
    Homey.log(token)
    packet = new MiHome.Packet(self.str2hex(token));
}

/* SELF */
var self = {
    init: function (devices_data, callback) {
        devices_data.forEach(function(device_data) {
            initDevice(device_data);
    	});

        Homey.log ("Xiaomi Mi Robot - Init done");

    	callback (null, true);
    },
    pair: function (socket) {
        socket.on('disconnect', function() {
            Homey.log ("User aborted pairing, or pairing is finished");
        });

        socket.on('test-connection', function( data, callback ) {
            var address = data.address;
            var token   = data.token;

            try {
                packet = new MiHome.Packet(self.str2hex(token));
                packet.setHelo();
                packet.setPlainData('{"id":4966,"method":"find_me","params":[""]}');
                var cmdraw = packet.getRaw();

                server.send(cmdraw, 0, cmdraw.length, 54321, address, function (err) {
                    if (err) Homey.log('Cannot send command: ' + err);
                    Homey.log('Command send succesfully');
                    callback(null, "Command send succesfully");
                });

                callback( null, true );
            } catch (err) {
                Homey.log('Cannot send command_: ' + err);
                callback(err, null);
            }

        });

        socket.on('add_device', function( device_data, callback ){
            initDevice( device_data );
            callback( null, true );
        });
    },
    deleted: function (device_data, callback) {
        delete robots[device_data.id];
        callback( null, true );
    },
    settings: function (device_data, newSettingsObj, oldSettingsObj, changedKeysArr, callback) {
        Homey.log ('Mi Robot changed settings: ' + JSON.stringify(device_data) + ' / ' + JSON.stringify(newSettingsObj) + ' / old = ' + JSON.stringify(oldSettingsObj));

        try {
            changedKeysArr.forEach(function (key) {
                robots[device_data.id].settings[key] = newSettingsObj[key]
            })
            callback(null, true)
        } catch (error) {
            callback(error)
        }
    },
    sendCommand: function(command, address, callback) {
        try {
            message = command;
            packet.setHelo();
            var cmdraw = packet.getRaw();
            var PORT = 54321;
            server.send(cmdraw, 0, cmdraw.length, PORT, address, function (err) {
                if (err) Homey.log('Cannot send command: ' + err);
                Homey.log('Command send succesfully');
                callback(null, "Command send succesfully");
            });
        } catch (err) {
            Homey.log('Cannot send command: ' + err);
            callback(err, false);
        }
    },
    str2hex: function(str) {
        str = str.replace(/\s/g, '');
        var buf = new Buffer(str.length / 2);

        for (var i = 0; i < str.length / 2; i++) {
            buf[i] = parseInt(str[i * 2] + str[i * 2 + 1], 16);
        }
        return buf;
    }
}

module.exports = self


// FLOW ACTION HANDLERS
Homey.manager('flow').on('action.start', function( callback, args ) {
    sendCommand('"method":"app_start"', devices[args.device.id].settings.address, callback);
});

Homey.manager('flow').on('action.pause', function( callback, args ) {
    sendCommand('"method":"app_pause"', devices[args.device.id].settings.address, callback);
});

Homey.manager('flow').on('action.gohome', function( callback, args ) {
    sendCommand('"method":"app_charge"', devices[args.device.id].settings.address, callback);
});

Homey.manager('flow').on('action.find', function( callback, args ) {
    sendCommand('"method":"find_me","params":[""]', devices[args.device.id].settings.address, callback);
});
