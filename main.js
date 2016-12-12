var Room = require('Room');
var Population = require('Population');
var Buildings = require('Buildings');
var Utils = require('Utils');

module.exports.loop = function() {

    // delete Memory.rooms; 

    let room = Game.spawns.Spawn1.room;


    room.init();
    room.updateCounters();


    let population = new Population(room);

    population.init();
    population.createCreeps();
    population.runCreeps();

    let buildings = new Buildings(room);

    buildings.init();
    buildings.updateCounters();
    buildings.createBuildings();


};