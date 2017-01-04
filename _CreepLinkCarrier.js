/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('CreepLinkCarrier');
 * mod.thing == 'a thing'; // true
 */
let CreepBase = require("CreepBase");

module.exports = {
    
    
    
    getAction: function(creep) {
        if (creep.ticksToLive < 50) {
            return "retiring";
        } else {
            if (creep.carry.energy == 0) {
                return "harvesting"
            } else {
                return "refilling";
            }
        }
    },
    

    run: function(creep) {
        creep.memory.action = this.getAction(creep);
       
        switch (creep.memory.action) {
            case "retiring":
                let spawns = creep.room.getMemory().optimizer.spawns;
                
                if (spawns.length > 0) {
                    creep.moveTo(spawns[0]);
                    spawns[0].recycleCreep(creep);
                }
                break;
                
                
            case "harvesting":
                if (_.has(creep.memory, "linkedStructure")) {
                    let link = Game.getObjectById(creep.memory.linkedStructure);
        
                    if (link !== null) {
                        CreepBase.routeCreep(creep, link);
                        creep.withdraw(link, RESOURCE_ENERGY);
                    }  
                }
                break;
                
            case "refilling":
                let target = CreepBase.getBestRefiller(creep);
        
                if (target != undefined) {
                    if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        let mov = creep.moveTo(target);
                    }
                }
                break;
        }
    }
    
};