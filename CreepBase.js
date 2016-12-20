/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('CreepBase');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    
    
    suicideYourself: function(creep) {
        
        
        
    },
    
    /*
    *   Find closest construction site
    */
    getBestConstructionSite: function(creep) {
        
        let optimizer = creep.room.getMemory().optimizer;
        
        let constructionSite = creep.pos.findClosestByRange(optimizer.constructionSites);
        
        if (constructionSite !== null) {
            return constructionSite;
        }
        
    },
    
    
    
    /*
    *   Get best energy source
    */
    getBestSource: function(creep) {
        
        let optimizer = creep.room.getMemory().optimizer;
        
        //Try with containers
        let container = creep.pos.findClosestByRange(optimizer.containers, {
            filter: (container) => { 
                return container.store[RESOURCE_ENERGY] > 0
            }
        });
        
        if (container !== null) {
            return container;
        }
        
        
        //Try with extensions
        let extension = creep.pos.findClosestByRange(optimizer.extensions, {
            filter: (extension) => { 
                return extension.energy > 0
            }
        });
        
        if (extension !== null) {
            return extension;
        } 
        
    },
    
    
    /*
    *   Get energy structure to refill
    */
    getBestRefiller: function(creep) {
        
        let optimizer = creep.room.getMemory().optimizer;
        let tower, extension, spawn, container;
        
        //Try with towers with less than 200 energy for defense
        tower = creep.pos.findClosestByRange(optimizer.towers, {
            filter: (tower) => { 
                return tower.energy < 400
            }
        });
        
        if (tower !== null) {
            return tower;
        }

        //Try with extensions, because generally nearer than spawns
        extension = creep.pos.findClosestByRange(optimizer.extensions, {
            filter: (extension) => { 
                return extension.energy < extension.energyCapacity
            }
        });
        
        if (extension !== null) {
            return extension;
        } 

        //Try with spawns    
        spawn = creep.pos.findClosestByRange(optimizer.spawns, {
            filter: (spawn) => { 
                return spawn.energy < spawn.energyCapacity
            }
        })
        
        if (spawn !== null) {
            return spawn;
        } 
                
            
        //Again with towers
        tower = creep.pos.findClosestByRange(optimizer.towers, {
            filter: (tower) => { 
                return tower.energy < tower.energyCapacity
            }
        });
        
        if (tower !== null) {
            return tower;
        }        
                
                
        //Finally with containers
        container = creep.pos.findClosestByRange(optimizer.containers, {
            filter: (container) => { 
                return _.sum(container.store) < container.storeCapacity
            }
        });
        
        if (container !== null) {
            return container;
        }

        
    }
    
    

};