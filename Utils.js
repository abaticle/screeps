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

        if (Game.time % 10 === 0) {

            let log = {
                numberCreeps: 0,
                energyAvailable: room.energyAvailable,
                energyCapacityAvailable: room.energyCapacityAvailable,
                extensions: room.getOptimizer().extensions.length,
                containers: room.getOptimizer().containers.length,
                droppedEnergy: _.sum(room.getOptimizer().droppedEnergy, "energy"),
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
            
            let widthLeft = "200";
            let widthRight = "50";
            
            let displayCreeps = [
                "<h4>Creeps</h4>",
                "<table border='1'>",
                "<tr><td width='", widthLeft , "px'>Total number of creeps</td><td align='center' width='", widthRight , "px'>", log.numberCreeps, "</td></tr>",
                "<tr><td>Number of miners</td><td align='center'>", log.miners, "</td></tr>",
                "<tr><td>Number of carriers</td><td align='center'>", log.carriers, "</td></tr>",
                "<tr><td>Number of builders</td><td align='center'>", log.builders, "</td></tr>",
                "<tr><td>Number of repairers</td><td align='center'>", log.repairers, "</td></tr>",
                "<tr><td>Number of upgraders</td><td align='center'>", log.upgraders, "</td></tr>",
                "</table>"
            ].join("");
            
            
            let displayEnergy = [
                "<h4>Energy</h4>",
                "<table border='1'>",
                "<tr><td width='", widthLeft , "px'>Room energy</td><td align='center' width='", widthRight , "px'>&nbsp;", log.energyAvailable, "/", log.energyCapacityAvailable, "&nbsp;</td></tr>",
                "<tr><td>Dropped energy</td><td align='center'>", log.droppedEnergy, "</td></tr>",
                "</table>"
            ].join("")

            let displayBuildings = [
                "<h4>Buildings</h4>",
                "<table border='1'>",
                "<tr><td width='", widthLeft , "px'>Extensions</td><td align='center' width='", widthRight , "px'>", log.extensions, "</td></tr>",
                "<tr><td>Containers</td><td align='center'>", log.containers, "</td></tr>",
                "</table>"
            ].join("");


            console.log([
                displayCreeps, 
                displayEnergy, 
                displayBuildings
            ].join(""));
            //console.log("Dropped energy : ", log.droppedEnergy)

        }

    }
};