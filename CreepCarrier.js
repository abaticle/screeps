/*
    memory: {
        role: "CreepCarrier",
        targetMiner: <miner id>,
        linkedStructure: <source id used by miner>
    }
*/
var roleCarrier = {

    run: function(creep) {

        //creep.room.createConstructionSite(creep.pos.x, creep.pos.y,STRUCTURE_ROAD)

        var source = Game.getObjectById(creep.memory.linkedStructure);
        
        if (creep.ticksToLive < 100) {
            
            var closestSpawn = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: function(structure) {
                    return structure.structureType === STRUCTURE_SPAWN;
                }
            });
            
            if (closestSpawn) {
                creep.moveTo(closestSpawn);
                closestSpawn.recycleCreep(creep);
            }
            
            
        } else {

            //if (creep.carry.energy < creep.carryCapacity) {
            if (creep.carry.energy == 0) {
                var energy = source.pos.findInRange(FIND_DROPPED_ENERGY, 2);
    
                if (energy.length) {
                    creep.moveTo(energy[0]);
                    creep.pickup(energy[0]);
                }
    
    
            } else {
                let tower;
                
                let targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        
                        //First priority for towers with less than 200 energy
                        if (structure.structureType == STRUCTURE_TOWER &&
                            structure.energy < structure.energyCapacity) {
                            
                            if (structure.energy < 200) {
                                tower = structure;
                            }
                            
                            return true;
                        }
                        
                        if ((structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN) &&
                            structure.energy < structure.energyCapacity) {
    
                            return true;
                        }
                        
                         
                        if (structure.structureType == STRUCTURE_CONTAINER &&
                            _.sum(structure.store) < structure.storeCapacity) {
        
                           
                            return true;
                        }
    
                        return false;
    
                        /*return (
                            structure.structureType == STRUCTURE_EXTENSION || 
                            structure.structureType == STRUCTURE_CONTAINER || 
                            structure.structureType == STRUCTURE_SPAWN
                        ) &&
                            structure.energy < structure.storeCapacity;*/
                    }
                });
    
                if (targets.length > 0) {
                    let target;
                    
                    if (tower !== undefined) {
                        target = tower;
                    } else {
                        target = targets[0];
                    } 
                    
                    
                    if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                }
            }
        }
        
        //let source = Game.getObjectById(creep.memory.linkedStructure);
        
        if (creep.pos.findInRange([source], 1).length > 0) {
            var dir = Math.floor(Math.random() * 7);
            res = creep.move(dir);
        }
        
    }
};

module.exports = roleCarrier;