let CreepBase = require("CreepBase");

module.exports = {

    updateMemory: function(creep) {

        let currentAction = creep.memory.action;

        if (creep.ticksToLive < 50 || currentAction === "retiring") { 
            creep.memory.action = "retiring";
        } else {
            if (creep.carry.energy === 0 && creep.room.energyAvailable > ( creep.room.energyCapacityAvailable * 0.5)  ) {
                creep.memory.action = "harvesting";
            } else {
                creep.memory.action = "upgrading";
            }
        }

        return creep.memory.action;
    },




    /** @param {Creep} creep **/
    run: function(creep) {

        switch (this.updateMemory(creep)) {
            
            case "retiring":
                CreepBase.retire(creep);
                break;   
                
            case "harvesting":
                let source = CreepBase.getBestSourceUpgrader(creep);

                if (source !== undefined) {
                    if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(source);
                    }
                }

                break;

            case "upgrading":
                if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
                break;
        }


        //Prevent creep from staying on construction site
        if (creep.pos.lookFor(LOOK_CONSTRUCTION_SITES).length > 0) {
            let dir = Math.floor(Math.random() * 7);
            let res = creep.move(dir);
        }
    }
};