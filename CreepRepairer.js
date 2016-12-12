var roleRepairer = {

    run: function(creep) {

        if (creep.carry.energy == 0) {
            creep.memory.action = "harvesting";
        } else {
            creep.memory.action = "repairing";
        }

        switch (creep.memory.action) {

            case "harvesting":
                var closestSpawn = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                    filter: function(structure) {
                        return structure.energy > 0 && (
                            structure.structureType === STRUCTURE_EXTENSION ||
                            structure.structureType === STRUCTURE_SPAWN
                        );
                    }
                });

                if (closestSpawn) {
                    if (creep.withdraw(closestSpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(closestSpawn);
                    }
                }
                break;


            case "repairing":
                //creep.say("repair !");
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: object => object.hits < (object.hitsMax / 4)
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
            var dir = Math.floor(Math.random() * 7);
            res = creep.move(dir);
        }
    }
};

module.exports = roleRepairer;