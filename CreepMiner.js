/*
    memory: {
        role: "CreepMiner",
        linkedStructure: <source id>
    }
*/
module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var source = Game.getObjectById(creep.memory.linkedStructure);

        if (source && creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        }
        
        
    }
};