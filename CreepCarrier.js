let CreepBase = require("CreepBase");

var roleCarrier = {
    
    targets: [
        "towers+", 
        "extensions", 
        "spawns", 
        "towers",
        "containers",
        "storages"
    ],

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
                let source = CreepBase.getBestSourceCarrier(creep);

                if (source !== undefined) {
                    if (creep.pickup(source) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(source)
                    }
                }
                break;                
                
            case "refilling":           

                let target = CreepBase.getTarget(creep, this.targets);
                        
                if (target != undefined) {

                    if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }

                } else {
                    let flag = CreepBase.getEnergyFlag(creep);

                    if (flag) {
                        if (!creep.pos.isEqualTo(flag.pos)) {
                            creep.moveTo(flag);
                        } else {
                            creep.drop(RESOURCE_ENERGY);
                        }
                    }
                }
                break;
        }
    }
};

module.exports = roleCarrier;