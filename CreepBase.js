/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('CreepBase');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    
    /*
    *   Recycle a creep
    */
    retire: function(creep) {

        let spawns = creep.room.memory.buildings.spawns;

        if (spawns[0] !== undefined) {
            let spawn = Game.getObjectById(spawns[0].id);

            if (spawn.recycleCreep(creep) === ERR_NOT_IN_RANGE) {
                creep.moveTo(spawn);
            }
        } else {
            creep.suicide();
        }
    },

    routeCreep: function (creep,dest) {
        let dir = 0;
        

        if(creep.fatigue>0){
            return -1;
        }
        if(typeof dest == "undefined"){
            return -1;
        }
    
        let locStr = creep.room.name+"."+creep.pos.x+"."+creep.pos.y
    
        let path = false;
    
        if(typeof Memory.routeCache !== "object"){
             Memory.routeCache = {};
        }
    
        if(typeof Memory.routeCache[locStr] === "undefined"){
    
            Memory.routeCache[locStr] = {'dests':{},'established':Game.time}
    
    
        }
        if(typeof Memory.routeCache[locStr]['dests'][''+dest.id] === "undefined"){    
            Memory.routeCache[locStr]['dests'][dest.id] = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0};
            path = creep.room.findPath(creep.pos,dest.pos,{maxOps:500,heuristicWeight:2})
            if(typeof path[0] !== "undefined"){
    
    
            Memory.routeCache[locStr]['dests'][''+dest.id][path[0].direction]+=1;
    
            for(let i =0;i<path.length-1;i++){
                let step = path[i];
                let stepStr = creep.room.name+"."+step.x+"."+step.y//creep.room.name+"."+step.x+"."+step.y
                if(typeof Memory.routeCache[stepStr] === "undefined"){
                    Memory.routeCache[stepStr] = {'dests':{},'established':Game.time,'usefreq':0.0};
                }
                if(typeof Memory.routeCache[stepStr]['dests'][''+dest.id] === "undefined"){
                   Memory.routeCache[stepStr]['dests'][''+dest.id] = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0};
                }
                //console.log(path[i+1].direction);
                Memory.routeCache[stepStr]['dests'][''+dest.id][path[i+1].direction]+=1;
    
            }
            }
            else{
    
                dir = Math.floor(Math.random()*8);
    
    
                let error = creep.move(dir);
                return error;
    
            }
        }
    
        for(let k in Memory.routeCache[locStr]['dests']){
            if(Game.getObjectById(k)==null){//clean out invalid routes
                delete  Memory.routeCache[locStr]['dests'][k];
                //console.log("Pruned",k)
            }
        }
    
    
        let total = 0.0//pick from the weighted list of steps
        for (let d in Memory.routeCache[locStr]['dests'][''+dest.id]) {
            total+=Memory.routeCache[locStr]['dests'][''+dest.id][d];
        }
        total=total*Math.random();
    
        dir = 0;
        for(let d in Memory.routeCache[locStr]['dests'][''+dest.id]){
            total-=Memory.routeCache[locStr]['dests'][''+dest.id][d];
            if(total<0){
                dir = d;
                break;
            }
    
        }
    
        /*if(creep.pos.getRangeTo(dest)>1 && pathisBlocked(creep.pos,dir)){ //you will need your own "pathisBlocked" function!
            dir = Math.floor(Math.random()*8);
        }*/
    
    
        let error = creep.move(dir);
        
        return error;  
    },    
    
    /*
    *   Get best energy source for a carrier
    *       1. From dropped energy near creep source
    */
    getBestSourceCarrier: function(creep) {

        let source = Game.getObjectById(creep.memory.linkedStructure);        
        let droppedEnergy = source.pos.findInRange(FIND_DROPPED_ENERGY, 2);
        
        if (droppedEnergy.length) {
            return droppedEnergy[0];
        }  

        return undefined;
    }, 

    /*
    *   Get target to repaire 
    *       1. Wall and rampart with hits < 3000
    *       2. others with hits < hitsMax / 4
    */
    getBestTargetRepairer: function(creep) {
        var targets = creep.room.find(FIND_STRUCTURES, {
            filter: (object) => {
                if (object.structureType === STRUCTURE_WALL || object.structureType === STRUCTURE_RAMPART) {
                    if (object.hits < 3000) {
                        return true;
                    }
                } else {
                    if (object.hits < (object.hitsMax / 4)) {
                        return true;
                    }
                }
            }
        });

        targets.sort((a, b) => a.hits - b.hits);

        if (targets.length > 0) {
            return targets[0];
        } 

        return undefined;
    },


    /*
    *   Get source where energy can be harvested
    *       creep : current creep
    *       structures : current room structures from "room.memory.buildings"
    */
    _getSource: function(creep, structures) {

        let source; 

        if (structures === "droppedEnergy") {
            source = creep.pos.findClosestByRange(_.map(creep.room.memory.others[structures]), structure => Game.getObjectById(structure.id));
        } else {
            source = creep.pos.findClosestByRange(_.map(creep.room.memory.buildings[structures], structure => Game.getObjectById(structure.id)), {

                filter: (structure) => { 

                    switch (structures) {

                        case "containers": 
                        case "storages":
                            return structure.store[RESOURCE_ENERGY] > 0;

                        case "extensions":
                        case "spawns": 
                        case "links":
                            return structure.energy > 0;  
                    }                
                }
            });
        }


        
        if (source !== null) {
            return source;
        } else {
            return undefined;
        }
    },

    /*
    *   Get target structure to refill energy
    *       creep : current creep
    *       structures : current room structures from "room.memory.buildings"
    */
    _getTarget: function(creep, structures, towerPriority) {

        let buildings = creep.room.memory.buildings;

        let source = creep.pos.findClosestByRange(_.map(buildings[structures], structure => Game.getObjectById(structure.id)), {

            filter: (structure) => { 

                switch (structures) {

                    case "towers": 
                        if (towerPriority === true) {
                            return structure.energy < 300;    
                        } else {
                            return structure.energy < structure.energyCapacity;
                        }
                        

                    case "containers": 
                    case "storages":
                        //console.log("containers", JSON.stringify(structure));
                        return _.sum(structure.store) < structure.storeCapacity;

                    case "extensions":                        
                    case "spawns": 
                    case "links":
                        return structure.energy < structure.energyCapacity;
                }                
            }
        });
        
        if (source !== null) {
            return source;
        } else {
            return undefined;
        }
    },

    /*
    *   Get energy to build :
    *       1. From containers
    *       2. From storage
    *       3. From extensions
    *       4. From spawn
    */  
    getBestSourceBuilder: function(creep) {
        
        let orders = [
            "containers", 
            "storages",
            "extensions",
            "spawns"
        ];

        let target;

        for (let order of orders) {
            target = this._getSource(creep, order);

            if (target !== undefined) {
                break;
            }
        }

        return target;
    },

    /*
    *   Get energy to upgrade :
    *       1. From containers
    *       2. From storage
    *       3. From extensions
    *       4. From spawn
    */  
    getBestSourceUpgrader: function(creep) {

        let orders = [
            "containers", 
            "storages",
            "extensions",
            "spawns"
        ];

        let target;

        for (let order of orders) {
            target = this._getSource(creep, order);

            if (target !== undefined) {
                break;
            }
        }

        return target;
    },


    /*
    *   Get energy to repaire :
    *       1. From containers
    *       2. From storage
    */  
    getBestSourceRepairer: function(creep) {
        
        let orders = [
            "containers", 
            "storages"
        ];

        let target;

        for (let order of orders) {
            target = this._getSource(creep, order);

            if (target !== undefined) {
                break;
            }
        }

        return target;
    },

    /*
    *   Get best energy source for a hauler
    *       1. Links
    *       2. Containers
    *       3. Storage
    */
    getBestSourceHauler: function(creep) {
        
        let orders = [
            "droppedEnergy",
            "links",
            "containers", 
            "storages"
        ];

        let target;

        for (let order of orders) {
            target = this._getSource(creep, order);

            if (target !== undefined) {
                break;
            }
        }

        return target;
    },
    
    /*
    *   Get energy structure to refill
    *       1. Tower with < 200 energy
    *       2. extensions
    *       3. spawn
    *       4. Tower with > 200 energy
    *       5. Containers
    *       6. Storages
    */
    getBestTargetCarrier: function(creep) {
        
        let orders = [
            "towers+", 
            "extensions", 
            "spawns", 
            "towers",
            "containers",
            "storages"
        ];

        let target;

        for (let order of orders) {
            
            if (order === "towers+") {
                target = this._getTarget(creep, order, true);
            } else {
                target = this._getTarget(creep, order)
            }

            if (target !== undefined) {
                break;
            }
        }

        return target;

    },

    /*
    *   Get target for builder
    *       1. Closest constructionSite
    */
    getBestTargetBuilder: function(creep) {

        let sites = creep.room.memory.others.constructionSites;

        let constructionSite = creep.pos.findClosestByRange(_.map(sites, site => Game.getObjectById(site.id)))

        if (constructionSite !== null) {
            return constructionSite;
        }

        return undefined;
    },

    /*
    *   Get energy structure to refill
    *       1. Tower with < 200 energy
    *       2. extensions
    *       3. spawn
    *       4. Tower with > 200 energy
    *       5. Containers
    *       6. Storages
    */
    getBestTargetHauler: function(creep) {
        
        let orders = [
            "towers+", 
            "extensions", 
            "spawns", 
            "towers",
            "containers",
            "storages"
        ];

        let target;

        for (let order of orders) {
            
            if (order === "towers+") {
                target = this._getTarget(creep, order, true);
            } else {
                target = this._getTarget(creep, order)
            }

            if (target !== undefined) {
                break;
            }
        }

        return target;
    },

};