var CreepBuilder = require("CreepBuilder");
var CreepCarrier = require("CreepCarrier");
var CreepMiner = require("CreepMiner");
var CreepRepairer = require("CreepRepairer");
var CreepUpgrader = require("CreepUpgrader");


function Population(room) {
    this.room = room;
}




/*
*   Optimize currents creep population
*/
Population.prototype.optimize = function() {
    if (Game.time % 10 === 0) {
        
        //If enough dropped energy, create a new carrier
        if (_.sum(this.room.getOptimizer().droppedEnergy, "energy") > 1500) { 

            let carriers = 0;

            for (let creep in Game.creeps) {
                if (Game.creeps[creep].memory.role === "CreepCarrier") {
                    carriers++;
                }
            }

            if (carriers < 6) {
                this.createCreep({
                    role: "CreepCarrier"
                });
            }
        }

        //If enough available energy, kill weak creep to renew
        if (this.room.energyAvailable > 500) {
            let lowestCost = 400;
            let creepToKill;
            
            _.each(Game.creeps, function(creep) {
                if (creep.memory.cost < lowestCost && creep.ticksToLive < 750) {
                    creepToKill = creep;
                }
            })
            
            
            if (creepToKill) {
                creepToKill.suicide();
            }
        }
    }
}


/*
*   Parts costs
*/
Population.prototype.getParts = function() {
    return {
        MOVE: 50,
        CARRY: 50,
        WORK: 100,
        ATTACK: 80,
        RANGED_ATTACK: 150,
        HEAL: 250,
        TOUGH: 10,
        CLAIM: 600
    };
}


/*
*   Get roles configuration
*/
Population.prototype.getRoles = function() {
    return {
        CreepMiner: {
            maxEnergy: 500, 
            config: {
                move: 0.3,
                work: 0.6
            }
        },
        CreepBuilder: {
            config: {
                move: 0.3,
                work: 0.6,
                carry: 0.6
            }
        },
        CreepUpgrader: {
            config: {
                move: 0.3,
                work: 0.4,
                carry: 0.6
            }
        },
        CreepCarrier: {
            config: {
                move: 0.4,
                carry: 0.6
            }
        },
        CreepRepairer: {
            config: {
                move: 0.3,
                work: 0.4,
                carry: 0.6
            }
        }
    }
}


/*
*   TODO !!
*/
Population.prototype.getBestCreepBody = function(memory, energy) {
    
    
    energy = energy || this.room.energyAvailable;
    
   // let energy = this.room.energyAvailable;
        
    let parts = this.getParts();
    let role = this.getRoles()[memory.role];
    
    let move = 0;
    let work = 0;
    let carry = 0;
    let attack = 0;
    let range_attack = 0;
    let heal = 0;
    let tough = 0;
    let claim = 0;
    
    let body = [];
    
    if (_.has(role, "maxEnergy")) {
        if (energy > role.maxEnergy) {
            energy = role.maxEnergy;
        }
    }
    
    if (_.has(role.config, "work")) {
        work = Math.floor(energy * role.config.work / 100);
        
        for (var i = 0; i < work; i++) {
            body.push(WORK);
        }
    }
    
    if (_.has(role.config, "carry")) {
        carry = Math.floor(energy * role.config.carry / 100);
        
        for (var i = 0; i < carry; i++) {
            body.push(CARRY);
        }
    } 
    
    if (_.has(role.config, "move")) {
        move = Math.floor(energy * role.config.move / 100);
        
        for (var i = 0; i < move; i++) {
            body.push(MOVE);
        }
    }
    
    if (_.has(role.config, "attack")) {
        attack = Math.floor(energy * role.config.attack / 100);
        
        for (var i = 0; i < attack; i++) {
            body.push(ATTACK);
        }
    }
    
    let leftoverEnergy = energy - this.getCost(body);
    
    
    if (leftoverEnergy >= 100 && memory.role !== CreepCarrier) {
        body.push(WORK);
        leftoverEnergy -= 100;
    }
    
    if (leftoverEnergy >= 50) {
        body.push(MOVE);
        leftoverEnergy -= 50;
    }
    
    
    
    switch(memory.role) {
        case "CreepUpgrader":
        case "CreepMiner":
        case "CreepBuilder":
        case "CreepRepairer":
            if (_.indexOf(body, WORK) == -1) {
                body = [];
            }
            break;
            
        
        case "CreepCarrier":
            if (_.indexOf(body, CARRY) == -1) {
                body = [];
            }
            break;
        
    }
    
    
    
    if (_.indexOf(body, MOVE) == -1) {
        body = [];
    }
    
    return body;
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
    
  //  this.setMemory(undefined)
    
    if (this.getMemory() === undefined) {

        let memory = {
            CreepMiner: {
                builds: [
                    [MOVE, WORK, CARRY],
                    [MOVE, WORK, CARRY, WORK],
                    [MOVE, MOVE, CARRY, WORK, WORK, WORK],
                    [MOVE, MOVE, MOVE, CARRY, WORK, WORK, WORK, WORK, WORK]
                ]
            },
            CreepBuilder: {
                builds: [
                    [MOVE, WORK, CARRY],
                    [MOVE, MOVE, WORK, WORK, CARRY],
                    [MOVE, MOVE, WORK, WORK, CARRY, CARRY],
                    [MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY],
                    [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY]
                ]
            },
            CreepUpgrader: {
                builds: [
                    [MOVE, WORK, CARRY],
                    [MOVE, WORK, WORK, CARRY],
                    [MOVE, MOVE, WORK, WORK, CARRY, CARRY],
                    [MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY],
                    [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY]
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
                    [MOVE, MOVE, WORK, WORK, CARRY, CARRY],
                    [MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY],
                    [MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY],
                    [MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY],
                    [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY]
                ]
            },
            CreepRangedAttacker: {
                builds: [
                    [TOUGH, MOVE, RANGED_ATTACK],
                    [TOUGH, TOUGH, TOUGH, MOVE, RANGED_ATTACK, RANGED_ATTACK],
                    [TOUGH, TOUGH, TOUGH, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK]
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
 *  Create creep 
 *      Get best build for a creep 
 */
Population.prototype.createCreep = function(memory) {

    let result = -11;
    let spawn = this.room.getSpawn();
    let role = this.getMemory()[memory.role];
    let build = this.getBestCreepBody(memory);
    
    //memory.cost = this.getCost(build);
    
    /*result = spawn.createCreep(build, this.getNewName(memory.role), memory);
    
    if (_.isString(result)) {
        
        console.log("generate ", memory.role, " with cost ", memory.cost);
        
        this.created = true;
    }*/
    
    role.builds.reverse().forEach(build => {

        if (spawn.canCreateCreep(build) == OK && !this.created) {
            
            //add cost to creep memory for later optimization
            memory.cost = this.getCost(build);

            result = spawn.createCreep(build, this.getNewName(memory.role), memory);

            //console.log("mem: ", JSON.stringify(memory))

            if (_.isString(result)) {
                
                console.log("generate ", memory.role, " with cost ", memory.cost);
                
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
 *  Populate the current room 
 *      1. For each source, create at least one miner
 *      2. Then create carrier(s)
 *      3. And only then create builders/upgraders
 */
Population.prototype.createCreeps = function() {

    if (this.room.energyAvailable < 100 || this.room.getSpawn().spawning != null) {
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

            } else {

                if (source.carriers === 0) {
                    let targetMiners = this.getSourceMiners(source.id);

                    if (targetMiners.length > 0) {

                        this.createCreep({
                            role: "CreepCarrier",
                            targetMiner: targetMiners[0].id,
                            linkedStructure: source.id
                        });

                    }
                } else {

                    if (source.miners < source.minersTarget) {

                        this.createCreep({
                            role: "CreepMiner",
                            linkedStructure: source.id
                        });

                    } else {
                        if (source.carriers < source.carriersTarget) {
                            let targetMiners = this.getSourceMiners(source.id);

                            if (targetMiners.length > 0) {

                                this.createCreep({
                                    role: "CreepCarrier",
                                    targetMiner: targetMiners[0].id,
                                    linkedStructure: source.id
                                });

                            }
                        }
                    }
                }
            }
        }
    });

    //And then, create builders, upgraders and repairers
    if (!this.created) {
        
        var constructionSites = this.room.find(FIND_CONSTRUCTION_SITES);
        
        
        
        if (roomMemory.spawn.builders < roomMemory.spawn.buildersTarget && constructionSites.length > 0) {
            this.createCreep({
                role: "CreepBuilder",
                linkedStructure: roomMemory.spawn.id
            });
        } else {
            if (roomMemory.controller.upgraders < roomMemory.controller.upgradersTarget) {
                this.createCreep({
                    role: "CreepUpgrader",
                    linkedStructure: roomMemory.controller.id
                });
            } else {
                if (roomMemory.spawn.repairers < roomMemory.spawn.repairersTarget) {
                    this.createCreep({
                        role: "CreepRepairer",
                        linkedStructure: roomMemory.spawn.id
                    });
                } else {
                    
                    
                    
                    
                }
            }
        }

    }
};


module.exports = Population;