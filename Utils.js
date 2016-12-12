var CreepMiner = require('CreepMiner');
var CreepCarrier = require('CreepCarrier');
var CreepBuilder = require('CreepBuilder');
var CreepUpgrader = require('CreepUpgrader');
var CreepRepairer = require('CreepRepairer');



module.exports = {
	

	/*
	*	Delete old creeps
	*/
	updateMemory: function() {
        for (var name in Memory.creeps) {

            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }
    },

    /*
    *	Report in console some infos
    */
    report: function(room) {

        if (Game.time % 15 === 0) {

            let log= {
                numberCreeps: 0,
                energyAvailable: room.room.energyAvailable,
                energyCapacityAvailable: room.room.energyCapacityAvailable,
                extensions: room.room.memory.extensions,
                droppedEnergy: room.getDroppedEnergy(),
                miners: 0,
                carriers: 0,
                builders: 0,
                repairers: 0,
                upgraders: 0
            }

            //log.numberCreeps = Game.creeps.length;

            for (creep in Game.creeps) {

                log.numberCreeps++;

                switch(Game.creeps[creep].memory.role) {
                    case "CreepBuilder":
                        log.builders++;
                        break;
                    case "CreepCarrier":
                        log.carriers++;
                        break;
                    case "CreepRepairer":
                        log.repairers++;
                        break;
                    case "CreepMiner":
                        log.miners++;
                        break;
                    case "CreepUpgrader":
                        log.upgraders++;
                        break;
                }
            }

            console.log("===========================================");
            console.log("Total number of creeps : ", log.numberCreeps);
            console.log("Total number of miners : ", log.miners);
            console.log("Total number of carriers : ", log.carriers);
            console.log("Total number of builders : ", log.builders);
            console.log("Total number of repairers : ", log.repairers);
            console.log("Total number of upgraders : ", log.upgraders);
            

            console.log("Room energy : ", log.energyAvailable, " / ", log.energyCapacityAvailable);
            console.log("Dropped energy : ", log.droppedEnergy)

        }

    }
};