let CreepBase = require("CreepBase");

module.exports = {


    sources: [
        "containers", 
        "storages",
        "extensions",
        "spawns"
    ],

    updateMemory: function(creep) {

        let currentAction = creep.memory.action;

        if (creep.ticksToLive < 50 || currentAction === "retiring") { 
            creep.memory.action = "retiring";
        } else {
            if (creep.carry.energy === 0) {
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

                let flag = CreepBase.getEnergyFlag(creep, true);

                if (flag) {
                    if (!creep.pos.isEqualTo(flag.pos)) {
                        creep.moveTo(flag);
                    } else {
                        creep.pickup(flag.pos.findInRange(FIND_DROPPED_RESOURCES,1)[0]);
                    }
                } else {

                    let source = CreepBase.getSource(creep, this.sources);

                    if (source !== undefined) {
                        if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(source);
                        }
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
        } else {
            if (creep.pos.isEqualTo(CreepBase.getEnergyFlag(creep).pos)){
                dir = Math.floor(Math.random() * 7);
                res = creep.move(dir);
            }
        }
    }
};