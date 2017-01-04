let CreepBase = require("CreepBase");

module.exports = {


    updateMemory: function(creep) {

        let currentAction = creep.memory.action;

        if (creep.ticksToLive < 50 || currentAction === "retiring") { 
            creep.memory.action = "retiring";
        } else {
            if (creep.carry.energy < creep.carry.energyCapacity || (creep.room.energyAvailable < 150 && creep.carry.energy === 0))   {
                creep.memory.action = "harvesting";
            } else {
                creep.memory.action = "repairing";
            }
        }

        return creep.memory.action;
    },    
    
    run: function(creep) {
        switch (this.updateMemory(creep)) {

            case "retiring":
                CreepBase.retire(creep);
                break;   
                
            case "harvesting":
                let source = CreepBase.getBestSourceRepairer(creep);
               
                if (source !== undefined) {
                    if (creep.pickup(source) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(source)
                    }
                }
                break;       
                

            case "repairing":
                let target = CreepBase.getBestTargetRepairer(creep);
               
                if (target !== undefined) {
                    if (creep.repair(target) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(target)
                    }
                }
                break;
                
        }

        if (creep.pos.lookFor(LOOK_CONSTRUCTION_SITES).length > 0) {
            let dir = Math.floor(Math.random() * 7);
            let res = creep.move(dir);
        }
    }
};

