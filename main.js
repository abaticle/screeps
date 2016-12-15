var Room = require('Room');
var Population = require('Population');
var Buildings = require('Buildings');
var Utils = require('Utils');
var Profiler = require('Profiler');


let profile = false;


function loop() {
    
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
    buildings.runTower();
    
    Utils.updateMemory();
    Utils.report(room);

};


if (profile) {
    
    Profiler.enable();
    
    module.exports.loop = function() {
        Profiler.wrap(function() {
            loop();
        });
    }
} else {
    module.exports.loop = loop;
}