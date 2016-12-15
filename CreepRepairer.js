var roleRepairer = {

    run: function(creep) {
        
        
        if (creep.ticksToLive < 100) {
            creep.memory.action = "retiring";
        } else {
            if (creep.carry.energy == 0) {
                creep.memory.action = "harvesting";
            } else {
                creep.memory.action = "repairing";
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
                
                
                if (creep.room.energyAvailable < 150) {
                    creep.moveTo(closestSpawn);
                } else {
                    if (closestSpawn) {
                        if (creep.withdraw(closestSpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(closestSpawn);
                        }
                    }
                }
                break;
                


            case "repairing":
                //creep.say("repair !");
                /*var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: object => object.hits < (object.hitsMax / 4)
                });*/
                
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (object) => {
                        if (object.structureType === STRUCTURE_WALL) {
                            if (object.hits < 3000) {
                                return true;
                            }
                        } else {
                            if (object.hits < (object.hitsMax / 4)) {
                                return true;
                            }
                        }
                    }
                    //filter: object => object.hits < (object.hitsMax / 4)
                });

                targets.sort((a, b) => a.hits - b.hits);

                if (targets.length > 0) {
                    if (creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0]);
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


module.exports = roleRepairer;

