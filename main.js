var Room = require('Room');
var Utils = require('Utils');

module.exports.loop = function() {

    //delete Memory.rooms; 


    var room = Game.spawns.Spawn1.room;

    room.init();
    room.updateCounters();

    Utils.updateMemory();
    Utils.report(room);

};