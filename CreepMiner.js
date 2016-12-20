/*
    memory: {
        role: "CreepMiner",
        linkedStructure: <source id>
    }
*/
module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        let optimizer = creep.room.getMemory().optimizer;
        let source = Game.getObjectById(creep.memory.linkedStructure);

        let container = creep.pos.findInRange(FIND_STRUCTURES, 1, {
            filter: { 
                structureType : STRUCTURE_CONTAINER
            }
        });
        
        if (container.length > 0) {
            creep.transfer(container[0], RESOURCE_ENERGY)
        }
        

        if (source && creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        }
        
        
    }
};