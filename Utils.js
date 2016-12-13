var CreepMiner = require('CreepMiner');
var CreepCarrier = require('CreepCarrier');
var CreepBuilder = require('CreepBuilder');
var CreepUpgrader = require('CreepUpgrader');
var CreepRepairer = require('CreepRepairer');



module.exports = {


    /*
     *   Delete old creeps
     */
    updateMemory: function() {
        for (var name in Memory.creeps) {

            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }
    },

    /*
     *   Report in console some infos
     */
    report: function(room) {

        if (Game.time % 1 === 0) {

            let log = {
                numberCreeps: 0,
                energyAvailable: room.energyAvailable,
                energyCapacityAvailable: room.energyCapacityAvailable,
                extensions: room.memory.extensions,
                // droppedEnergy: room.getDroppedEnergy(),
                miners: 0,
                carriers: 0,
                builders: 0,
                repairers: 0,
                upgraders: 0
            }

            //log.numberCreeps = Game.creeps.length;


            for (let creep in Game.creeps) {

                log.numberCreeps++;

                switch (Game.creeps[creep].memory.role) {
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

            let display = [
                "<table border='1' cellpadding='10'>",
                "<tr><td>Total number of creeps</td><td align='center'>", log.numberCreeps, "</td></tr>",
                "<tr><td>Total number of miners</td><td align='center'>", log.miners, "</td></tr>",
                "<tr><td>Total number of carriers</td><td align='center'>", log.carriers, "</td></tr>",
                "<tr><td>Total number of builders</td><td align='center'>", log.builders, "</td></tr>",
                "<tr><td>Total number of repairers</td><td align='center'>", log.repairers, "</td></tr>",
                "<tr><td>Total number of upgraders</td><td align='center'>", log.upgraders, "</td></tr>",
                "<tr><td>Room energy</td><td>", log.energyAvailable, "/", log.energyCapacityAvailable, "</td></tr>",
                "</table>"
            ].join("");


            console.log(display);
            //console.log("Dropped energy : ", log.droppedEnergy)

        }

    }
};