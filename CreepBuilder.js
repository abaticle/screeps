var roleBuilder = {

    countUpgaders: function() {
        return _.filter(Game.creeps, creep => {
            return creep.memory.action === "upgrading";
        }).length;
    },


    /** @param {Creep} creep **/
    run: function(creep) {

        if (creep.ticksToLive < 100) {
            creep.memory.action = "retiring";
        } else {
            if (creep.carry.energy == 0) {
                creep.memory.action = "harvesting";
            } else {
                var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
    
                if (targets.length > 0) {
                    creep.memory.action = "building";
                } else {
                    creep.memory.action = "upgrading";
                }
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
                var closestSpawn = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                    filter: function(structure) {
                        return structure.energy > 0 && (
                            structure.structureType === STRUCTURE_EXTENSION ||
                            structure.structureType === STRUCTURE_SPAWN
                        );
                    }
                });
                
                
                if (creep.room.energyAvailable < 100) {
                    creep.moveTo(closestSpawn);
                } else {
                    if (closestSpawn) {
                        if (creep.withdraw(closestSpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(closestSpawn);
                        }
                    }
                }
                break;


            case "building":
                var targets = creep.room.find(FIND_CONSTRUCTION_SITES);

                if (targets.length) {
                    if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0]);
                    }
                }
                break;


            case "upgrading":
                if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                } else {
                    //if (creep.pos.getRangeTo(creep.room.controller.pos.x, creep.room.controller.pos.y) > )
                    creep.moveTo(creep.room.controller);
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

module.exports = roleBuilder;