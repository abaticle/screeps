var Room = require('Room');
var Population = require('Population');
var Buildings = require('Buildings');
var Utils = require('Utils');

function loop() {
    
    Utils.updateMemory();
    
    // delete Memory.rooms; 

    let room = Game.spawns.Spawn1.room;

    room.init(); 
    room.updateCounters();
    room.updateOptimizer();
    
    let population = new Population(room);
    
    population.init();
    population.optimize();
    population.createCreeps();
    population.runCreeps();

    let buildings = new Buildings(room);

    buildings.init();
    buildings.updateCounters();
    buildings.createBuildings();
    buildings.runTower();
    

    Utils.report(room);
   // console.log(JSON.stringify(Game.spawns.Spawn1.createUpgrader(800)))
   
    function test(role) {
        
        let energy = 200; //room.energyAvailable;
        
        let body = population.getBestCreepBody({
            role: role
        }, energy)    
        console.log(energy + " " + role +  " > " + JSON.stringify(body));   
    }
    
    /*test("CreepBuilder");
    test("CreepCarrier");
    test("CreepMiner");
    test("CreepRepairer");*/
   
   
};


module.exports.loop = loop;