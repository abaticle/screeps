

Room.prototype.calculateCreepsTargets = function()  {

    let that = this;

    distanceSource = function () {
        let sources = that.find(FIND_SOURCES);
        let offloadPoints=  that.find(FIND_STRUCTURES, {
            filter: function(object) {
                return (object.structureType == STRUCTURE_SPAWN
                        || object.structureType == STRUCTURE_EXTENSION);
            }
        });
        let totalDistance= 0;
        let numRoutes = 0;
        for ( let i = 0 ; i < sources.length ; i++ ) {
            for ( let j = 0 ; j < offloadPoints.length ; j++ ) {
                totalDistance += sources[i].pos.findPathTo(offloadPoints[j]).length;
                numRoutes++;
            }
        }
        return totalDistance/numRoutes
    };

    distanceController = function () {
        let controller = that.controller;
        let offloadPoints=  that.find(FIND_STRUCTURES, {
            filter: function(object) {
                return (object.structureType == STRUCTURE_SPAWN
                        || object.structureType == STRUCTURE_EXTENSION);
            }
        });
        let totalDistance= 0;
        let numRoutes = 0;
        
        for ( let j = 0 ; j < offloadPoints.length ; j++ ) {
            totalDistance += controller.pos.findPathTo(offloadPoints[j]).length;
            numRoutes++;
        }
    
        return totalDistance/numRoutes
    };

/*    for (i = 0; i<1000; i++) {

    }*/
    

    let distSource = parseInt(distanceSource());
    let distController = parseInt(distanceController());

    for (i = 0; i<50; i++) {

        //Variables :  
        /*let carryPartsCarrier = 1;
        let carryPartsUpgrader = 1;
        let workPartsUpgrader = 1;    
        let numberCarrier = 1;
        let numberUpgrader = 1;*/
        let carryPartsCarrier = Math.floor(Math.random() * 6) + 1  ;
        let carryPartsUpgrader = Math.floor(Math.random() * 6) + 1  ;
        let workPartsUpgrader = Math.floor(Math.random() * 8) + 1  ;    
        let numberCarrier = Math.floor(Math.random() * 8) + 1  ;
        let numberUpgrader = Math.floor(Math.random() * 10) + 1  ;

        //Fixes :
        let workPartsMiner = 5;
        let numberMiner = 2;

        let costCarrier = carryPartsCarrier * 100;
        let costUpgrader = (carryPartsUpgrader * 100) + (workPartsUpgrader * 150);
        let costMiner = (workPartsMiner * 100) + 50;
        let totalCost = (costCarrier*numberCarrier)+(costMiner*numberMiner)+(costUpgrader+numberUpgrader);


        //Total energy mined in a creep lifetime
        let energyMiner = numberMiner*((workPartsMiner * 2 * 1500) - distSource);
        
        //Total energy hauled
        let energyHauled = numberCarrier*((1500 * carryPartsCarrier * 50) / (2 * distSource));    
        energyHauled = parseInt(energyHauled);
        
        //Total energy put in a upgrader
        let energyUpgraded = numberUpgrader*((1500 * carryPartsUpgrader * 50) / ( (2*distController)+((carryPartsUpgrader*50)/workPartsUpgrader) ));
        energyUpgraded = parseInt(energyUpgraded);



        //Energy hauled cannot be bigger than energy mined !!
        let warningHaulers = 0;

        if (energyHauled > energyMiner){
            warningHaulers = energyHauled - energyMiner;
            
            energyHauled = energyMiner; 
        }


        //Energy sent to controller can't be bigger than energy hauled !
        let warningUpgraders = 0;

        if (energyUpgraded > energyHauled) {
            warningUpgraders = energyUpgraded - energyHauled;

            energyUpgraded = energyHauled;
        }

        let totalEnergy = energyHauled - energyUpgraded - totalCost;
        let warningNotPossible = false;

        if (totalEnergy < 0) {
            warningNotPossible = true;
        } else {
            if (totalEnergy < 1000 && energyHauled > 25000) {
                warningNotPossible = false;
            } else {
                warningNotPossible = true;
            }
        }

        if (!warningNotPossible) {
            console.log("=====================================");
            console.log("Distance with sources :", distSource);    
            console.log("Distance with controller :", distController);
            console.log("=====================================");
            console.log("For", numberCarrier, "carriers, cost is", costCarrier*numberCarrier, "(with", carryPartsCarrier, "CARRY)");
            console.log("For", numberUpgrader, "upgraders cost is", costUpgrader, "(with", carryPartsUpgrader, "CARRY and", workPartsUpgrader, "WORK)");
            console.log("For", numberMiner, "miners cost is", costMiner*numberMiner);
            console.log("Total cost :", totalCost);
            console.log("=====================================");
            console.log("Energy mined in 1500 ticks by", numberMiner, "miners:", energyMiner);
            console.log("Energy hauled in 1500 ticks by", numberCarrier, "carriers:", energyHauled);
            console.log("Energy upgraded in 1500 ticks by", numberUpgrader, "upgraders:", energyUpgraded)
            console.log("Total remaining energy :", totalEnergy);
            console.log("=====================================");
            if (warningHaulers) console.log("WARNING: carriers have too much energy of", warningHaulers)
            if (warningNotPossible) console.log("WARNING: configuration not possible");
       console.log("<br><br><br><br>")
        }


        


    }






};





/*
*   Initialize room memory
*/
Room.prototype.initMemory = function() {
    
 //delete this.memory;
 
    if (this.memory.init === true) {
        return;
    }
    
    console.log("initialize optimizer for room", this.name);
    
    let memory = {
        init: true,

/*        borders: {
            top: {
                wallsBuilt: false,
                wallsNeeded: (room.find(FIND_EXIT_TOP).length === 0 ? true : false)
            },
            right: {
                wallsBuilt: false,
                wallsNeeded: (room.find(FIND_EXIT_RIGHT).length === 0 ? true : false)
            },
            bottom: {
                wallsBuilt: false,
                wallsNeeded: (room.find(FIND_EXIT_BOTTOM).length === 0 ? true : false)
            },
            left: {
                wallsBuilt: false,
                wallsNeeded: (room.find(FIND_EXIT_LEFT).length === 0 ? true : false)
            }
        },*/

        buildings: {
            sources: [],
            controller: {},
            spawns: [],
            extensions: [],
            containers: [],
            storages: [],
            links: [],
            towers: []    
        },

        creepsCurrent: {
            builders: 0,
            haulers: 0,
            repairers: 0,
            roomAttackers:0,
            roomReclaimers:0,
            upgraders: 0
        },

        creepsTarget: {
            builders: 0,
            haulers: 0,
            repairers: 0,
            roomAttackers:0,
            roomReclaimers:0,
            upgraders: 0
        },

        others: {
            constructionSites: [],
            droppedEnergy: [],
            storedEnergy: 0
        }
    };

    

    //Add Spawns :
    let spawns = this.find(FIND_MY_SPAWNS);
    
    spawns.forEach(spawn => {

        memory.buildings.spawns.push({
            id: spawn.id,
            pos: spawn.pos
        });

    });


    //update creeps targets:
    let controllerToSpawn = 999;
    if (memory.buildings.spawns.length > 0) {
        controllerToSpawn = this.controller.pos.getRangeTo(spawns[0]);
    }

    if (controllerToSpawn < 5) {
        memory.creepsTarget.upgraders = 1;   
    } else {
        memory.creepsTarget.upgraders = 2;
    }





    //Add sources :
    let sources = this.find(FIND_SOURCES);

    sources.forEach(source => {            

        //Range between spawn and source :
        let sourceToSpawn = 999;
        if (spawns.length > 0) {
            sourceToSpawn = source.pos.getRangeTo(spawns[0]);
        }
        
        //Available space around the source :
        let minersTarget = _.filter(this.lookForAtArea(
            LOOK_TERRAIN,
            source.pos.y - 1,
            source.pos.x - 1,
            source.pos.y + 1,
            source.pos.x + 1,
            true
        ), (area) => area.terrain === "plain" || area.terrain === "swamp").length;

        if (minersTarget > 2) {
            minersTarget = 2;
        }

        let carriersTarget = 0;
        if (minersTarget == 2) {
            if (sourceToSpawn < 6) {
                carriersTarget = 1;
            } else {
                carriersTarget = 2;    
            }
            
        } else {
            carriersTarget = 1;
        }

        memory.buildings.sources.push({
            id: source.id,
            pos: source.pos,
            miners: 0,
            minersTarget: minersTarget,
            carriers: 0,
            carriersTarget: carriersTarget,
            roadBuild: false
        });
    });


    //Add controller :
    memory.buildings.controller = {
        id: this.controller.id,
        pos: this.controller.pos,
        level: this.controller.level,
        roadBuild: false
    };


    this.memory = memory;
}


/*
*   Update all buildings counters
*/
Room.prototype.updateMemoryBuildings = function (time) {

    if (time !== undefined) {
        if (Game.time % time !== 0) {
            return;
        }
    }



    let memory = this.memory;
    memory.buildings.controller.level = this.controller.level;
    memory.buildings.spawns = [];
    memory.buildings.containers = [];
    memory.buildings.extensions = [];
    memory.buildings.storages = [];
    memory.buildings.towers = [];
    memory.buildings.links = [];

    let structures = this.find(FIND_STRUCTURES);
    structures.forEach((structure) => {

        switch (structure.structureType) {
            
            case STRUCTURE_SPAWN:
                memory.buildings.spawns.push({
                    id: structure.id,
                    pos: structure.pos
                });
                break;
                
            case STRUCTURE_EXTENSION:
                memory.buildings.extensions.push({
                    id: structure.id,
                    pos: structure.pos,
                    energy: structure.energy,
                    energyCapacity: structure.energyCapacity
                });
                break;
                
            case STRUCTURE_STORAGE:
                memory.buildings.storages.push({
                    id: structure.id,
                    pos: structure.pos,
                    store: structure.store,
                    storeCapacity: structure.storeCapacity
                });
                break;
                
            case STRUCTURE_TOWER: 
                memory.buildings.towers.push({
                    id: structure.id,
                    pos: structure.pos,
                    energy: structure.energy,
                    energyCapacity: structure.energyCapacity
                });
                break;
            
            case STRUCTURE_CONTAINER: 
                memory.buildings.containers.push({
                    id: structure.id,
                    pos: structure.pos,
                    store: structure.store,
                    storeCapacity: structure.storeCapacity
                });
                break;

            case STRUCTURE_LINK:
                let from = false;
                let sources = memory.buildings.sources;


                if (structure.pos.findInRange(memory.buildings.sources, 2).length) {
                    from = true;
                }

                memory.buildings.links.push({
                    id: structure.id,
                    pos: structure.pos,
                    from: from
                });
                break;                
        }
    });
};

/*
*   Update creeps counters
*       Can be called when a creep dies ?
*/ 
Room.prototype.updateMemoryCreepsCurrent = function(time) {
    
    if (time !== undefined) {
        if (Game.time % time !== 0) {
            return;
        }
    }

    this.memory.creepsCurrent.builders = 0;
    this.memory.creepsCurrent.haulers = 0;
    this.memory.creepsCurrent.repairers = 0;
    this.memory.creepsCurrent.roomAttackers = 0;
    this.memory.creepsCurrent.roomReclaimers = 0;
    this.memory.creepsCurrent.upgraders = 0;

    this.memory.buildings.sources.forEach(source => {
        source.miners = 0;
        source.carriers = 0;
    })

    for (let name in Memory.creeps) {       
        let creepMemory = Game.creeps[name].memory;
        
        if (creepMemory.roomOrigin === this.name) {
            switch (creepMemory.role) {
                
                case "CreepMiner":
                    this.memory.buildings.sources.forEach((source) => {
                        if (source.id === creepMemory.linkedStructure) {
                            source.miners++;
                        }
                    })
                    break;
                    
                case "CreepCarrier":
                    this.memory.buildings.sources.forEach((source) => {
                        if (source.id === creepMemory.linkedStructure) {
                            source.carriers++;
                        }
                    })
                    break;
                             
                case "CreepHauler":
                    this.memory.creepsCurrent.haulers++;
                    break;

                case "CreepBuilder":
                    this.memory.creepsCurrent.builders++;
                    break;
                    
                case "CreepRepairer":
                    this.memory.creepsCurrent.repairers++;
                    break;
                    
                case "CreepRoomAttacker":
                    this.memory.creepsCurrent.roomAttackers++;
                    break;
                    
                case "CreepRoomReclaimer":
                    this.memory.creepsCurrent.roomReclaimers++;
                    break;
                    
                case "CreepUpgrader":
                    this.memory.creepsCurrent.upgraders++;
                    break;
                   
            }

        }
    }
};

/*
*   Update creeps to be built
*       needs buildings and others to be filled
*/
Room.prototype.updateMemoryCreepsTarget = function(time) {

    if (time !== undefined) {
        if (Game.time % time !== 0) {
            return;
        }
    }

    this.memory.creepsTarget.builders = 0;
    this.memory.creepsTarget.haulers = 0;
    this.memory.creepsTarget.roomAttackers = 0;
    this.memory.creepsTarget.roomReclaimers = 0;
    this.memory.creepsTarget.repairers = 0;
    this.memory.creepsTarget.upgraders = 0;



    //Create haulers if some energy on ground
    let sum = _.sum(this.memory.others.droppedEnergy, "energy");

    this.memory.creepsTarget.haulers = parseInt((sum / 1000).toFixed(0));
    if (this.memory.creepsTarget.haulers === 0) {
        this.memory.creepsTarget.haulers = 1;
    } else {
        if (this.memory.creepsTarget.haulers > 6) {
            this.memory.creepsTarget.haulers = 6;
        }
    }


    //If some construction site, create builders
    let sites = this.memory.others.constructionSites.length;

    if (sites > 0) {
        this.memory.creepsTarget.builders = parseInt(sites / 5);

        if (this.memory.creepsTarget.builders === 0) {
            this.memory.creepsTarget.builders = 1;
        }
    }


    //Create attackers and reclaimers
    let flag = Game.flags.TargetRoom;

    if (flag !== undefined) {
        this.memory.creepsTarget.roomAttackers = 1;
        this.memory.creepsTarget.roomReclaimers = 1;   
    }




    //If no tower to repaire things, create repairers
    if (this.memory.buildings.controller.level > 1) {
        let towers = this.memory.buildings.towers.length;

        if (towers === 0) {
            this.memory.creepsTarget.repairers = 1;
        }    
    }
    
    
    //And update upgraders 
    if (this.memory.others.level < 3) {
        this.memory.creepsTarget.upgraders = 2;
    } else {
        this.memory.creepsTarget.upgraders = 3;

        let numUpgraders = parseInt(this.memory.others.storedEnergy / 2000) > 3;
        if (numUpgraders > 3) {
            this.memory.creepsTarget.upgraders = numUpgraders;
        }
    }

    //TEST :
    this.memory.creepsTarget.upgraders = 1;
};

/*
*   Update other stats
*/
Room.prototype.updateMemoryOthers = function(time) {

    if (time !== undefined) {
        if (Game.time % time !== 0) {
            return;
        }
    }

    this.memory.others.droppedEnergy = this.find(FIND_DROPPED_ENERGY);
    this.memory.others.constructionSites = this.find(FIND_CONSTRUCTION_SITES);



    this.memory.others.storedEnergy = _.sum(this.memory.buildings.storages, (storage) => {
        return storage.store[RESOURCE_ENERGY]
    })

    this.memory.others.storedEnergy += _.sum(this.memory.buildings.containers, (storage) => {
        return storage.store[RESOURCE_ENERGY]
    })
}

module.exports = Room;