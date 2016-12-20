
Room.prototype.updateOptimizer = function() {
    let memory = this.getMemory();
    
    //delete memory.optimizer;
    if (memory.optimizer === undefined) {
        memory.optimizer = {
            sources: this.find(FIND_SOURCES_ACTIVE),
            extensions: [],
            containers: [],
            towers: [],
            constructionSites: [],
            spawns: [],
            droppedEnergy: []
        }
    }
    
    memory.optimizer.sources = this.find(FIND_SOURCES_ACTIVE);
    
    memory.optimizer.extensions = this.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_EXTENSION }
    });
    
    memory.optimizer.containers = this.find(FIND_STRUCTURES, {
        filter: { structureType: STRUCTURE_CONTAINER }
    });
    
    memory.optimizer.towers = this.find(FIND_STRUCTURES, {
        filter: { structureType: STRUCTURE_TOWER }
    });
    
    memory.optimizer.constructionSites = this.find(FIND_CONSTRUCTION_SITES);
    
    memory.optimizer.spawns = this.find(FIND_MY_STRUCTURES, {
        filter: function(structure) {
            return structure.structureType === STRUCTURE_SPAWN;
        }
    });
    
    memory.optimizer.droppedEnergy = this.find(FIND_DROPPED_ENERGY);
}


Room.prototype.getOptimizer = function() {
    return this.getMemory().optimizer;
}   

Room.prototype.setOptimizer = function(optimizer) {
    this.getMemory().optimizer = optimizer;
}




/*
 *   Initialize room memory
 */
Room.prototype.init = function() {

    let memory = this.getMemory();
    
   //memory.init = false;
    
    if (memory.init === false || memory.init === undefined) {

        //Initialize memory :
        memory = {
            init: true,
            spawn: {},
            sources: [],
            controller: {},
            stats: {
                droppedEnergy: 0,
                energyAvailable: 0,
                energyCapacityAvailable: 0,
                constructionSites: 0
            }
        };

        //List room sources :
        this.find(FIND_SOURCES_ACTIVE).forEach(source => {

            let areas = this.lookForAtArea(
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

            //Limit to 3 max
            if (minersTarget > 2) {
                minersTarget = 2;
            }

            let carriersTarget = 0;
            if (minersTarget == 2) {
                carriersTarget = 2;
            } else {
                carriersTarget = 1;
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
        let spawn = this.find(FIND_MY_SPAWNS)[0];

        memory.spawn = {
            id: spawn.id,
            pos: spawn.pos,
            builders: 0,
            buildersTarget: 2,
            repairers: 0,
            repairersTarget: 1,
            attackers: 0,
            attackersTarget: 0,
            roadBuild: false
        }

        //Controller :
        memory.controller = {
            id: this.controller.id,
            pos: this.controller.pos,
            level: this.controller.level,
            upgraders: 0,
            upgradersTarget: 2,
            roadBuild: false
        }


        this.setMemory(memory);
    }

};


/*
 *   Getter & setter for room memory
 */
Room.prototype.getMemory = function() {
    return this.memory;
};
Room.prototype.setMemory = function(memory) {
    this.memory = memory;
};

Room.prototype.storeData = function() {
    let memory = this.getMemory();
    
    let data = [];
}

/*
 *   Get this room spawn structure
 */
Room.prototype.getSpawn = function() {
    return Game.getObjectById(this.getMemory().spawn.id);
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
    }).length;

    memory.spawn.repairers = _.filter(Game.creeps, (creep) => {
        return creep.memory.role === "CreepRepairer" && creep.memory.linkedStructure === memory.spawn.id;
    }).length;

    memory.spawn.attackers = _.filter(Game.creeps, (creep) => {
        return creep.memory.role === "CreepAttackers" && creep.memory.linkedStructure === memory.spawn.id;
    }).length;


    //Update controller stats
    memory.controller.upgraders = _.filter(Game.creeps, (creep) => {
        return creep.memory.role === "CreepUpgrader" && creep.memory.linkedStructure === memory.controller.id;
    }).length;

    memory.stats.constructionSites = this.find(FIND_CONSTRUCTION_SITES).length;

    memory.controller.level = this.controller.level;

    memory.stats.energyAvailable = this.energyAvailable;
    memory.stats.energyCapacityAvailable = this.energyCapacityAvailable;



    this.setMemory(memory);
};


module.exports = Room;