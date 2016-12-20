var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
    
    
        if (creep.ticksToLive < 50) {
            creep.memory.action = "retiring";
        } else {
            if (creep.carry.energy == 0) {
                creep.memory.action = "harvesting";
            } else {
                creep.memory.action = "upgrading";
            }
        }

        switch (creep.memory.action) {
            
            case "retiring":
                var closestSpawn = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                    filter: function(structure) {
                        return structure.structureType === STRUCTURE_SPAWN;
                    }
                });
                
                if (closestSpawn) {
                    creep.moveTo(closestSpawn);
                    closestSpawn.recycleCreep(creep);
                }
                break;
                
            case "harvesting":
                var closestSpawn = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: function(structure) {
                        if (structure.structureType == STRUCTURE_CONTAINER &&
                            _.sum(structure.store) > 0) {
                           
                            return true;
                        }                        
                        
                        if ( structure.energy > 0 && (
                            structure.structureType === STRUCTURE_EXTENSION ||
                            structure.structureType === STRUCTURE_SPAWN
                        )) {
                            return true;
                        }

                        
                        return false;
                    }
                });
                
                /*if (creep.room.energyAvailable < 150) {
                    creep.moveTo(closestSpawn);
                } else {*/
                    if (closestSpawn) {
                        if (creep.withdraw(closestSpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(closestSpawn);
                        }
                    }
                //}
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

module.exports = roleUpgrader;