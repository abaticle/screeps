let CreepBase = require("CreepBase");

var roleHauler = {
    

    updateMemory: function(creep) { 

        let currentAction = creep.memory.action;

        if (creep.ticksToLive < 50 || currentAction === "retiring") { 
            creep.memory.action = "retiring";
        } else {
            if (creep.carry.energy === 0)   {
                creep.memory.action = "harvesting";
            } else {
                creep.memory.action = "refilling";
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
                let source = CreepBase.getBestSourceHauler(creep);

                if (source !== undefined) {
                    if (creep.pickup(source) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(source)
                    }
                }
                break;                
                
            case "refilling":                
                let target = CreepBase.getBestTargetHauler(creep);
                        
                if (target != undefined) {
                    if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                }
                break;
        }
    }
};

module.exports = roleHauler;