let CreepBase = require("CreepBase");

module.exports = {


    updateMemory: function(creep) {

        let currentAction = creep.memory.action;

        if (creep.ticksToLive < 50 || currentAction === "retiring") { 
            creep.memory.action = "retiring";
        } else {        
            if(creep.memory.action == "building" && creep.carry.energy == 0) {
                creep.memory.action = "harvesting";
            }
            if(creep.memory.action !== "building" && creep.carry.energy == creep.carryCapacity) {
                creep.memory.action = "building";
            }
        }

        if(creep.memory.action == undefined) {
            creep.memory.action == "harvesting";
        }


        /*let currentAction = creep.memory.action;

        if (creep.ticksToLive < 50 || currentAction === "retiring" || creep.room.memory.others.constructionSites.length === 0) { 
            creep.memory.action = "retiring";
        } else {
            if (creep.carry.energy < creep.carryCapacity && (creep.room.energyAvailable > ( creep.room.energyCapacityAvailable * 0.5))) {
                creep.memory.action = "harvesting";
            } else {
                creep.memory.action = "building";
            }
        }*/

        return creep.memory.action;
    },

    run: function(creep) {        
        switch (this.updateMemory(creep)) {            
            
            case "retiring":
                CreepBase.retire(creep);
                break;            

            case "harvesting":                
                let source = CreepBase.getBestSourceBuilder(creep);

                if (source !== undefined) {
                    if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(source);
                    }
                }
                break;

            case "building":
                let target = CreepBase.getBestTargetBuilder(creep)
                
                if (target !== undefined) {
                    if (creep.build(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }                    
                } else {
                    creep.memory.action = "retiring";
                }
                break;
        }


        //Prevent creep from staying on construction site
        if (creep.pos.lookFor(LOOK_CONSTRUCTION_SITES).length > 0) {
            var dir = Math.floor(Math.random() * 7);
            res = creep.move(dir);
        }
    }
};
