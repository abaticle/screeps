let CreepBase = require("CreepBase");

module.exports = {

    run: function(creep) {
        
        let source = Game.getObjectById(creep.memory.linkedStructure);

        if (source === undefined) {
            creep.suicide();
            return;
        }


        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        } else {
            let links = creep.pos.findInRange(creep.room.memory.buildings.links, 1); 

            if (links.length > 0) {  

                let transfer = creep.transfer(Game.getObjectById(links[0].id), RESOURCE_ENERGY);

                
            } else {
                let container = creep.pos.findInRange(creep.room.memory.buildings.containers, 1);
                
                if (container.length > 0) {
                    creep.transfer(Game.getObjectById(container[0].id), RESOURCE_ENERGY)
                } else {
                    creep.drop(RESOURCE_ENERGY);
                }
            }
        } 

        
    }
};