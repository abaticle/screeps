var Room = require('Room');
var Utils = require('Utils');

module.exports.loop = function() {

    //delete Memory.rooms; 

    //instanciate and populate rooms
    var room = new Room(Game.spawns.Spawn1.room);

    Utils.updateMemory();
    Utils.report(room);

};