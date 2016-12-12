var Population = require('Population');
var Buildings = require('Buildings');

function Room(room) {

    this.room = room;

    this.init();
    this.updateCounters();

    this.population = new Population(this);
    this.buildings = new Buildings(this);
}


/*
*   Update counter for each source.miners and source.carriers
        TODO:Optimize with loop on Game.creeps
*/
Room.prototype.updateCounters = function() {
    let memory = this.getMemory();

    //Update sources stats
    memory.sources.forEach((source) => {

        source.miners = _.filter(Game.creeps, (creep) => {
            return (creep.memory.role === "CreepMiner" && creep.memory.linkedStructure === source.id);
        }).length;

        source.carriers = _.filter(Game.creeps, (creep) => {
            return (creep.memory.role === "CreepCarrier" && creep.memory.linkedStructure === source.id);
        }).length;
    });


    //Update spawn stats
    memory.spawn.builders = _.filter(Game.creeps, (creep) => {
        return creep.memory.role === "CreepBuilder" && creep.memory.linkedStructure === memory.spawn.id;
    })

    memory.spawn.repairers = _.filter(Game.creeps, (creep) => {
        return creep.memory.role === "CreepRepairer" && creep.memory.linkedStructure === memory.spawn.id;
    });


    //Update controller stats
    memory.controller.repairers = _.filter(Game.creeps, (creep) => {
        return creep.memory.role === "CreepUpdgrader" && creep.memory.linkedStructure === memory.controller.id;
    });



    this.setMemory(memory);
};

Room.prototype.getMemory = function() {
    return this.room.memory;
};

Room.prototype.setMemory = function(memory) {
    this.room.memory = memory;
};


/*
 *   Initialize room memory
 */
Room.prototype.init = function() {

    if (this.room.memory.init === false || this.room.memory.init === undefined) {


        //Initialize memory :
        let memory = {
            init: true,
            spawn: {},
            sources: [],
            controller: {},
            stats: {
                droppedEnergy: _.sum(this.room.find(FIND_DROPPED_ENERGY, "amount"))
            }
        };


        //List room sources :
        this.room.find(FIND_SOURCES_ACTIVE).forEach(source => {

            let areas = this.room.lookForAtArea(
                LOOK_TERRAIN,
                source.pos.y - 1,
                source.pos.x - 1,
                source.pos.y + 1,
                source.pos.x + 1,
                true
            );

            let minersTarget = _.filter(areas, (area) => {
                return area.terrain === "plain" || area.terrain === "swamp";
            }).length;

            let carriersTarget = 0;
            if (minersTarget <= 2) {
                carriersTarget = 2;
            } else {
                carriersTarget = 3;
            }

            memory.sources.push({
                id: source.id,
                pos: source.pos,
                miners: 0,
                minersTarget: minersTarget,
                carriers: 0,
                carriersTarget: carriersTarget,
                roadBuild: false
            });
        });


        //Spawn :
        let spawn = this.room.find(FIND_MY_SPAWNS)[0];

        memory.spawn = {
            id: spawn.id,
            pos: spawn.pos,
            builders: 0,
            buildersTarger: 3,
            repairers: 0,
            repairersTarget: 2,
            roadBuild: false
        }

        //Controller :
        memory.controller = {
            id: this.room.controller.id,
            pos: this.room.controller.pos,
            level: this.room.controller.level,
            targetUpgraders: 1,
            roadBuild: false
        }


        this.room.memory = memory;
    }
};




module.exports = Room;