let CreepBase = require("CreepBase");

var roleBuilder = {


    getAction: function(creep) {
        
        if (creep.ticksToLive < 50) {
            return "retiring";
        } else {
            if (creep.carry.energy == 0) {
                return "harvesting";
            } else {
                //var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
                let targets = creep.room.getMemory().optimizer.constructionSites;
    
                if (targets.length > 0) {
                    return "building";
                } else {
                    return "upgrading";
                }
            }
        }
        
    },


    /** @param {Creep} creep **/
    run: function(creep) {
        
        let target;

        switch (this.getAction(creep)) {
            
            
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
                
                target = CreepBase.getBestSource(creep);
               
                if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
                break;


            case "building":
                
                target = CreepBase.getBestConstructionSite(creep);

                if (target !== null) {
                    if (creep.build(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
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