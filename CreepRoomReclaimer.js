let CreepBase = require("CreepBase");

module.exports = {

    run: function(creep) {        
          
        if (!_.has(Game.flags, "TargetRoom")){
            console.log(creep.name, ": No TargetRoom !!! Let me die sir")
            creep.suicide();
            return;
        }
        
        let flag = Game.flags.TargetRoom;
                
        if (creep.carry.energy == 0) {
            creep.memory.action = "harvesting";
        } else {
            if (flag.room.controller.my === true && flag.room.controller.ticksToDowngrade > 500) {
                creep.memory.action = "building";
            } else {
                creep.memory.action = "upgrading";
            }
        }
        
        
        
        
        let target;
        
        switch(creep.memory.action) {
           
            
            case "harvesting":
                target = CreepBase.getBestSource(creep);
                
                if (target && target.room.name === creep.room.name) {
                    if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                } else {
                    if (creep.room.name !== creep.memory.roomOrigin) {
                        creep.moveTo(Game.getObjectById(creep.memory.spawnOrigin));
                    }
                }
                break;
            
            
            case "upgrading":

                if (flag.pos.roomName !== creep.pos.roomName || (
                    creep.pos.x === 0  ||
                    creep.pos.x === 49 ||
                    creep.pos.y === 0  ||
                    creep.pos.y === 49
                )) {
               
                    creep.moveTo(flag.pos);
                
                } else {
                    if (creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.controller);
                    }
                }
                
                break;
                    
            case "building":

                if (flag.pos.roomName !== creep.pos.roomName || (
                    creep.pos.x === 0  ||
                    creep.pos.x === 49 ||
                    creep.pos.y === 0  ||
                    creep.pos.y === 49
                )) {
               
                    creep.moveTo(flag.pos);
                    
                } else {
                    target = CreepBase.getBestTargetBuilder(creep);
    
                    if (target !== null) {
                        if (creep.build(target) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                        }
                    }
                }

                break;
        }
        
        
        
        
        //Go to room
        /*if (flag.pos.roomName !== creep.pos.roomName || (
                creep.pos.x === 0  ||
                creep.pos.x === 49 ||
                creep.pos.y === 0  ||
                creep.pos.y === 49
            )) {
           
            creep.moveTo(flag.pos);
            
        //Try to kill !!!!
        } else {
            
            
            
            
        }*/
        
    }

};