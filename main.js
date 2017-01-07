var Room = require("Room");
var Population = require("Population");
var Buildings = require("Buildings");
var Utils = require("Utils");
var profiler = require("Profiler");

function loop() {
    
    Utils.updateMemory();
      
    // delete Memory.rooms; 
     
    for (var name in Game.rooms) { 
        
        let room = Game.rooms[name];

        if (room.controller.my !== true) {
            continue;
        }

        room.initMemory(); 
        room.updateMemoryBuildings();
        room.updateMemoryCreepsCurrent(); 
        room.updateMemoryCreepsTarget(30);
        room.updateMemoryOthers();

        //room._getBestUpgradersConfig();  //TEST !!!
        
        
        let population = new Population(room);
        population.optimize();
        population.createCreeps();
        population.runCreeps();



        

        let buildings = new Buildings(room);
        buildings.createBuildings();
        buildings.runBuildings();


        
        Utils.report(room, 50);
        Utils.record(room, 50);     
    Utils.displayRecords(room, 50);

    }
    
};


module.exports.loop = loop;