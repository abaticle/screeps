var CreepBuilder = require("CreepBuilder");
var CreepHauler = require("CreepHauler");
var CreepCarrier = require("CreepCarrier");
var CreepMiner = require("CreepMiner");
var CreepRepairer = require("CreepRepairer");
var CreepUpgrader = require("CreepUpgrader");
var CreepRoomAttacker = require("CreepRoomAttacker");
var CreepRoomReclaimer = require("CreepRoomReclaimer");

function Population(room) {
    this.room = room;
}

/*
*   Optimize currents creep population
*/
Population.prototype.optimize = function(time) {

    if (time !== undefined) {
        if (Game.time % time !== 0) {
            return;
        }
    }

    //If enough available energy, kill weak creep to renew
    if (this.room.energyAvailable > 500) {
        let lowestCost = 400;
        let creepToKill;
        
        _.each(Game.creeps, function(creep) {
            if (creep.memory.cost < lowestCost && creep.ticksToLive < 300) {
                creepToKill = creep;
            }
        })
        
        
        if (creepToKill) {
            creepToKill.suicide();
        }
    }
}

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

Population.prototype.getConfig2 = function() {

    return{
        CreepMiner: {
            base: [MOVE,WORK], 
            increase: [WORK],
            baseEnergy: 150,
            increaseEnergy: 100,
            max: 600
        },
        CreepBuilder: {
            base: [MOVE, MOVE, WORK, CARRY], 
            increase: [MOVE, MOVE, WORK, CARRY],
            baseEnergy: 250,
            increaseEnergy: 250,
            max: Infinity
        },
        CreepUpgrader: {
            base: [MOVE, MOVE, WORK, CARRY], 
            increase: [MOVE, MOVE, WORK, CARRY],
            baseEnergy: 250,
            increaseEnergy: 250,
            max: Infinity
        },
        CreepHauler: {
            base: [MOVE, CARRY], 
            increase: [MOVE, CARRY],
            baseEnergy: 100,
            increaseEnergy: 100,
            max: Infinity
        },
        CreepCarrier: {
            base: [MOVE, CARRY], 
            increase: [MOVE, CARRY],
            baseEnergy: 100,
            increaseEnergy: 100,
            max: Infinity
        },
        CreepRepairer: {
            base: [MOVE, MOVE, WORK, CARRY], 
            increase: [MOVE, MOVE, WORK, CARRY],
            baseEnergy: 250,
            increaseEnergy: 250,
            max: Infinity
        },
        CreepRoomAttacker: {
            base: [TOUGH, TOUGH, MOVE, MOVE, ATTACK, ATTACK], 
            increase: [TOUGH, TOUGH, MOVE, MOVE, ATTACK, ATTACK], 
            baseEnergy: 280,
            increaseEnergy: 280,
            max: Infinity            
        }
    }

}


Population.prototype.createCreep = function(memory) {

    let spawn = Game.getObjectById(this.room.memory.buildings.spawns[0].id);
    let creepConfig = this.getConfig2()[memory.role];
    let build = creepConfig.base;



    if (this.created) {
        return -11; 
    }


    while(true) {
        if (this.getCost(build.concat(creepConfig.increase)) > creepConfig.max) {
            break;
        }
        if (build.concat(creepConfig.increase).length > 50) {
            break;
        }

        if (spawn.canCreateCreep(build.concat(creepConfig.increase)) == OK) {
            build = build.concat(creepConfig.increase);
        } else {
            break;
        }
    }
    

    memory.role = memory.role;
    memory.cost = this.getCost(build);
    memory.roomOrigin = this.room.name;
    memory.debug = false;

    let result = spawn.createCreep(build, this.getNewName(memory.role), memory);

    if (_.isString(result)) {
        console.log("generate ", memory.role, " with cost ", memory.cost);
        this.created = true;
    }

    return result;

}

/*
*   Get role configuration
*/
Population.prototype.getConfig = function() {
    return {
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
                [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY],
                [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY]
            ]
        },
        CreepHauler: {
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
        },
        CreepRoomAttacker: {
            builds:[
                [       //490
                    TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, 
                    ATTACK, ATTACK, ATTACK, 
                    MOVE,MOVE,MOVE,MOVE
                ]
            ]
        },
        CreepRoomReclaimer: {
            builds: [
                [MOVE, MOVE, WORK, CARRY, CARRY, CLAIM]
            ]
        },
    }
}



/*
 *   Run creeps for each roles
 */
Population.prototype.runCreeps = function() {
    
    for (let name in Game.creeps) {
        
        let creep = Game.creeps[name];
        
        if (this.room.name === creep.memory.roomOrigin) {
            eval(creep.memory.role + ".run(creep)");
        }
    }
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



/**
 *  Create creep 
 *      Get best build for a creep 
 */
Population.prototype.createCreep_o = function(memory) {


    let spawn;

    if (this.room.memory.buildings.spawns.length == 0) {
        console.log("No Spawner !!! can't create creep !");
        return;
    } else {
        spawn = Game.getObjectById(this.room.memory.buildings.spawns[0].id);
    }


    let result = -11;

    let role = this.getConfig()[memory.role];
    let builds = role.builds.reverse();
    
    builds.forEach(build => {

        if (spawn.canCreateCreep(build) == OK && !this.created) {
            
            //If room owned, remove CLAIM part
            if (memory.role === "CreepRoomReclaimer") {
                if (_.has(Game.flags, "TargetRoom")) {
                    if (Game.flags.TargetRoom.room.controller.my == true) {
                        build = [MOVE, MOVE, WORK, CARRY, CARRY];
                    }
                }
            }            
            
            //add cost to creep memory for later optimization
            memory.cost = this.getCost(build);
            
            //Add debug value for debugging purpose
            memory.debug = false;

            result = spawn.createCreep(build, this.getNewName(memory.role), memory);

            if (_.isString(result)) {
                console.log("generate ", memory.role, " with cost ", memory.cost);
                this.created = true;
            }
        }
    });

    return result;
};



/**
 *  Populate the current room 
 *      1. For each source, create at least one miner 
 *      2. Then create carrier(s)
 *      3. And only then create builders/upgraders/etc.
 */
Population.prototype.createCreeps = function() {

                   
    let roomMemory = this.room.memory;


    //created prevent creating more than 1 creep a tick
    this.created = false;
    
    //First, create miners and carriers
    roomMemory.buildings.sources.forEach((source, index) => {

        if (source.miners === 0) {
            
            this.createCreep({
                role: "CreepMiner",
                linkedStructure: source.id,
                roomOrigin: this.room.name
            });

        } else {
            if (source.carriers === 0) {
                
                let targetMiners = this._getSourceMiners(source.id);

                if (targetMiners.length > 0) {
                    
                    this.createCreep({
                        role: "CreepCarrier",
                        targetMiner: targetMiners[0].id,
                        linkedStructure: source.id,
                        roomOrigin: this.room.name
                    });

                }
            } else {

                let sourceMiners = this._getSourceMiners(source.id);

                let workParts = 0;

                _.each(sourceMiners, miner => {

                    workParts += miner.body.filter(part => {
                        return part.type === WORK;
                    }).length;
                });


                if (source.miners < source.minersTarget && workParts < 5) {

                    this.createCreep({
                        role: "CreepMiner",
                        linkedStructure: source.id,
                        roomOrigin: this.room.name
                    });

                } else {
                    if (source.carriers < source.carriersTarget) {
                        let targetMiners = this._getSourceMiners(source.id);

                        if (targetMiners.length > 0) {

                            this.createCreep({
                                role: "CreepCarrier",
                                targetMiner: targetMiners[0].id,
                                linkedStructure: source.id,
                                roomOrigin: this.room.name
                            });

                        }
                    }
                }
            }
        }
    
    });
    
    if (this.room.energyAvailable < (this.room.energyCapacity * 0.8)) {
        return;
    }

    //And then, create builders, upgraders and repairers
    if (!this.created) {
        
        let constructionSites = this.room.memory.others.constructionSites.length;

        if (roomMemory.creepsCurrent.haulers < roomMemory.creepsTarget.haulers) {
            this.createCreep({
                role: "CreepHauler",
                roomOrigin: this.room.name
            });

        } else {        
            if (roomMemory.creepsCurrent.builders < roomMemory.creepsTarget.builders && constructionSites > 0) {
                this.createCreep({
                    role: "CreepBuilder",
                    linkedStructure: roomMemory.buildings.spawns[0].id,
                    roomOrigin: this.room.name
                });
            } else {
                if (roomMemory.creepsCurrent.upgraders < roomMemory.creepsTarget.upgraders) {

                    this.createCreep({
                        role: "CreepUpgrader",
                        linkedStructure: roomMemory.buildings.controller.id,
                        roomOrigin: this.room.name
                    });
                } else {
                    if (roomMemory.creepsCurrent.repairers < roomMemory.creepsTarget.repairers) {
                        this.createCreep({
                            role: "CreepRepairer",
                            linkedStructure: roomMemory.buildings.spawns[0].id,
                            roomOrigin: this.room.name
                        });
                    } else {
                        
                        if (roomMemory.creepsCurrent.roomAttackers < roomMemory.creepsTarget.roomAttackers) {
                            this.createCreep({
                                role: "CreepRoomAttacker",
                                roomOrigin: this.room.name
                            });
                        } else {
                            if (roomMemory.creepsCurrent.roomReclaimers < roomMemory.creepsTarget.roomReclaimers) {
                                this.createCreep({
                                    role: "CreepRoomReclaimer",
                                    spawnOrigin: roomMemory.buildings.spawns[0].id,
                                    roomOrigin: this.room.name
                                });
                            }
                        }
                    }
                }
            }
        }

    }
};

/*
 *   Get miners using a sourceId
 */
Population.prototype._getSourceMiners = function(sourceId) {

    return _.filter(Game.creeps, (creep) => {
        return (
            creep.memory.role === "CreepMiner" && 
            creep.memory.linkedStructure === sourceId &&
            creep.memory.roomOrigin === this.room.name);
    });
};

module.exports = Population;