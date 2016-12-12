var CreepBuilder = require("CreepBuilder");
var CreepCarrier = require("CreepCarrier");
var CreepMiner = require("CreepMiner");
var CreepRepairer = require("CreepRepairer");
var CreepUpgrader = require("CreepUpgrader");


function Population(room) {

    this.room = room;

    this.init();

    this.populate();
    this.runCreeps();
}



Population.prototype.getMemory = function() {
    return Memory.creepsConfig;
};

Population.prototype.setMemory = function(config) {
    Memory.creepsConfig = config;
};

/*
 *   Init memory
 */
Population.prototype.init = function() {

    if (this.getMemory() === undefined) {

        let memory = {
            CreepMiner: {
                builds: [
                    [MOVE, WORK],
                    [MOVE, WORK, WORK],
                    [MOVE, WORK, WORK, WORK],
                    [MOVE, WORK, WORK, WORK, WORK],
                    [MOVE, WORK, WORK, WORK, WORK, WORK]
                ]
            },
            CreepBuilder: {
                builds: [
                    [MOVE, WORK, CARRY],
                    [MOVE, WORK, WORK, CARRY],
                    [MOVE, WORK, WORK, CARRY, CARRY],
                    [MOVE, WORK, WORK, WORK, CARRY, CARRY],
                    [MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY]
                ]
            },
            CreepUpgrader: {
                builds: [
                    [MOVE, WORK, CARRY],
                    [MOVE, WORK, WORK, CARRY],
                    [MOVE, WORK, WORK, CARRY, CARRY],
                    [MOVE, WORK, WORK, WORK, CARRY, CARRY],
                    [MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY]
                ]
            },
            CreepCarrier: {
                builds: [
                    [MOVE, CARRY],
                    [MOVE, MOVE, CARRY],
                    [MOVE, MOVE, CARRY, CARRY],
                    [MOVE, MOVE, CARRY, CARRY, CARRY],
                    [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],
                    [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY],
                    [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY],
                    [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                ]
            },
            CreepRepairer: {
                builds: [
                    [MOVE, WORK, CARRY],
                    [MOVE, WORK, WORK, CARRY],
                    [MOVE, WORK, WORK, CARRY, CARRY],
                    [MOVE, WORK, WORK, WORK, CARRY, CARRY],
                    [MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY],
                    [MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY],
                    [MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY]
                ]
            }
        }

        this.setMemory(memory);
    }
};



/*
 *   Run creeps for each roles
 */
Population.prototype.runCreeps = function() {

    _.each(Game.creeps, function(creep) {

        switch (creep.memory.role) {

            case 'CreepBuilder':
                CreepBuilder.run(creep);
                break;

            case 'CreepCarrier':
                CreepCarrier.run(creep);
                break;

            case 'CreepMiner':
                CreepMiner.run(creep);
                break;

            case 'CreepRepairer':
                CreepRepairer.run(creep);
                break;

            case 'CreepUpgrader':
                CreepUpgrader.run(creep);
                break;

        }
    });
};


/*
 *   Create a new name using role
 */
Population.prototype.getNewName = function(role) {

    let numTmp = 0;
    let num = 0;


    var creeps = _.filter(Game.creeps, function(creep) {
        if (creep.memory.role === role) {
            try {
                numTmp = parseInt(creep.name.split("-")[1]);

                if (numTmp > num) {
                    num = numTmp;
                }

            } catch (e) {}
            return true;
        }
        return false;
    });

    if (num === undefined) {
        num = "1";
    } else {
        num = (parseInt(num) + 1).toString();
    }

    return role + "-" + num;
};


/*
 *   Calculate screep body cost
 */
Population.prototype.getCost = function(build) {

    let buildCost = 0;

    for (let index = 0; index < build.length; ++index) {

        let bodypart = build[index];

        switch (bodypart) {
            case MOVE:
            case CARRY:
                buildCost += 50;
                break;
            case WORK:
                buildCost += 100;
                break;
            case ATTACK:
                buildCost += 80;
                break;
            case RANGED_ATTACK:
                buildCost += 150;
                break;
            case HEAL:
                buildCost += 250;
                break;
            case TOUGH:
                buildCost += 10;
                break;
            case CLAIM:
                buildCost += 600;
                break;
        }
    }

    return buildCost;
};


/**
 *	Create creep 
 *      Get best build for a creep 
 */
Population.prototype.createCreep = function(memory) {

    let result = -11;
    let spawn = Game.getObjectById(this.room.getMemory().spawn.id);
    let role = this.getMemory()[memory.role];

    role.builds.reverse().forEach(build => {

        if (spawn.canCreateCreep(build) == OK) {

            //add cost to creep memory for later optimization
            memory.cost = this.getCost(build);

            result = spawn.createCreep(build, this.getNewName(memory.role), memory);

            if (_.isString(result)) {
                this.created = true;
            }
        }
    });

    return result;
};

/*
 *   Get miners using a sourceId
 */
Population.prototype.getSourceMiners = function(sourceId) {

    return _.filter(Game.creeps, (creep) => {
        return creep.memory.role === "CreepMiner" && creep.memory.linkedStructure === sourceId;
    });
};

/**
 *	Populate the current room 
 *		1. For each source, create at least one miner
 *      2. Then create carrier(s)
 *      3. And only then create builders/upgraders
 */
Population.prototype.populate = function() {

    if (this.room.energyAvailable < 100) {
        return;
    }

    var roomMemory = this.room.getMemory();


    //created prevent creating more than 1 creep a tick
    this.created = false;


    //First, create miners and carriers
    roomMemory.sources.forEach((source, index) => {

        if (!this.created) {

            if (source.miners === 0) {
                this.createCreep({
                    role: "CreepMiner",
                    linkedStructure: source.id
                });
            }

            if (source.carriers === 0) {
                let targetMiner = this.getSourceMiners(source.id);

                if (targetMiner.length > 0) {

                    let result = this.createCreep({
                        role: "CreepCarrier",
                        targetMiner: targetMiner[0].id,
                        linkedStructure: source.id
                    });

                }
            }

            //if (source.miners < source.minersTarget && this.room.getDroppedEnergy() < 5000) {
            if (source.miners < source.minersTarget) {
                this.createCreep({
                    role: "CreepMiner",
                    linkedStructure: source.id
                });
            }

            if (source.carriers < source.carriersTarget) {
                let targetMiner = this.getSourceMiners(source.id);

                if (targetMiner.length > 0) {

                    let result = this.createCreep({
                        role: "CreepCarrier",
                        targetMiner: targetMiner[0].id,
                        linkedStructure: source.id
                    });

                }
            }
        }
    });

    //And then, create builders, upgraders and repairers
    if (!this.created) {
        if (roomMemory.spawn.builders < roomMemory.spawn.buildersTarget) {
            let result = this.createCreep({
                role: "CreepBuilder",
                linkedStructure: roomMemory.spawn.id
            });
        }

        if (roomMemory.spawn.repairers < roomMemory.spawn.repairersTarget) {
            let result = this.createCreep({
                role: "CreepRepairer",
                linkedStructure: roomMemory.spawn.id
            });
        }

        if (roomMemory.controller.upgraders < roomMemory.controller.upgradersTarget) {
            let result = this.createCreep({
                role: "CreepUpgrader",
                linkedStructure: roomMemory.controller.id
            });
        }
    }
};


module.exports = Population;