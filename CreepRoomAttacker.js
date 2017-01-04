    let CreepBase = require("CreepBase");
    
    module.exports = {

        run: function(creep) {
            
            
            if (!_.has(Game.flags, "TargetRoom")){
                console.log(creep.name, ": No TargetRoom !!! I prefere to die");
                creep.suicide();
                return;
            }
            
            let flag = Game.flags.TargetRoom;
            
            //Go to room
            if (flag.pos.roomName !== creep.pos.roomName || (
                    creep.pos.x === 0  ||
                    creep.pos.x === 49 ||
                    creep.pos.y === 0  ||
                    creep.pos.y === 49
                )) {
               
                creep.moveTo(flag.pos);
                
            //Try to kill !!!!
            } else {
                
                let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                    filter: function(object) {
                        return object.getActiveBodyparts(ATTACK) != 0;
                    }
                });
                
                if (target == undefined) {
                    target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                }                
                
                if (target != undefined) {                    
                    creep.moveTo(target);
                    creep.attack(target);                    
            
                    if (Game.time % 10 === 0) {
                        creep.say("KILL !");
                    }
                }
                
                
                
            }
            
        }
        
    };