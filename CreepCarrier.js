/*
    memory: {
        role: "CreepCarrier",
        targetMiner: <miner id>,
        linkedStructure: <source id used by miner>
    }
*/

let CreepBase = require("CreepBase");

var roleCarrier = {
    
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
        
        switch (this.getAction(creep)) {
            case "retiring":
                let spawns = creep.room.getMemory().optimizer.spawns;
                
                if (spawns.length > 0) {
                    creep.moveTo(spawns[0]);
                    spawns[0].recycleCreep(creep);
                }
                break;
                
                
            case "harvesting":
                if (_.has(creep.memory, "linkedStructure")) {
                    let source = Game.getObjectById(creep.memory.linkedStructure);
                    let energy = source.pos.findInRange(FIND_DROPPED_ENERGY, 2);
        
                    if (energy.length) {
                        creep.moveTo(energy[0]);
                        creep.pickup(energy[0]);
                    }  
                } else {
                    let source = creep.room.find(FIND_DROPPED_ENERGY);
                    
                    if (source.length > 0) {
                        creep.moveTo(source[0]);
                        creep.pickup(source[0]);
                    }
                }
              
                break;
                
                
            case "refilling":
                
                let target = CreepBase.getBestRefiller(creep);
        
                if (target != undefined) {
                    if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                }
                break;
        }
        

        //creep.room.createConstructionSite(creep.pos.x, creep.pos.y,STRUCTURE_ROAD)

        

        //let source = Game.getObjectById(creep.memory.linkedStructure);
        
        /*if (creep.pos.findInRange([source], 1).length > 0) {
            var dir = Math.floor(Math.random() * 7);
            res = creep.move(dir);
        }*/
        
    }
};

module.exports = roleCarrier;