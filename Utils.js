var CreepMiner = require('CreepMiner');
var CreepCarrier = require('CreepCarrier');
var CreepBuilder = require('CreepBuilder');
var CreepUpgrader = require('CreepUpgrader');
var CreepRepairer = require('CreepRepairer');



module.exports = {
    
    record: function(room, time) {
        if (time !== undefined) {
            if (Game.time % time !== 0) {
                return;
            }
        }

        let records = room.memory.records;
        
        
        if (records === undefined) {
            records = [];
        } else {
            if (records.length > 400) {
                records = _.drop(records, records.length - 399);
            }
        }
        
        records.push({
            tick: Game.time,
            energyAvailable: room.energyAvailable,
            progress: room.controller.progress
        })
        
        room.memory.records = records;
        
    },

    /*
     *   Delete old creeps
     */
    updateMemory: function(room) {
        for (var name in Memory.creeps) {

            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
                
            }
        }
    },


    displayRecords: function(room, time) {
        if (time !== undefined) {
            if (Game.time % time !== 0) {
                return;
            }
        }

        let heigth = 120;


        function getPointList(records, property) {

            let points = [];
            let x = 50, y = 0;
            let max = _.max(records, property)[property];
            let min = _.min(records, property)[property];
            
            _.each(records, function(record) {
                
                if (_.has(record, property)) {
                    y = ((heigth * record[property]) / max).toFixed(0);
                    
                    points.push(x.toString() + "," + y.toString());
                }
                x += 4; 
            });         

            return points;

        };


        let records = _.takeRight(room.memory.records, 100);
        
        let energy = getPointList(records, "energyAvailable");           
        let progress = getPointList(records, "progress");               
                
        let charts = [
            "<svg heigth='", heigth, "' width='100%'>",
            "<g>",
            "<text x='0' y='15' fill='grey'>", _.max(records, "energyAvailable")["energyAvailable"], "</text>",            
            "<text x='0' y='65' fill='grey'>", _.max(records, "energyAvailable")["energyAvailable"]/2, "</text>",           
            "<text x='0' y='120' fill='grey'>", _.min(records, "energyAvailable")["energyAvailable"], "</text>",
            "</g>",
            "<polyline fill='none' stroke='white' stroke-width='1' points='30,5 30,", (heigth).toString(), "'/>",
            "<polyline fill='none' stroke='white' stroke-width='1' points='",
            energy.join(" "),
            "'/>",
            /*"<polyline fill='none' stroke='red' stroke-width='1' points='",
            progress.join(" "),
            "'/>",*/
            "</svg>"
        ].join("");
        
        console.log(charts);
        
    },

    /*
     *   Report in console some infos
     */
    report: function(room, time) {
        if (time !== undefined) {
            if (Game.time % time !== 0) {
                return;
            }
        }


        let log = {
            level: room.memory.buildings.controller.level,
            upgradePerTick: 0,
            energyAvailable: room.energyAvailable,
            energyCapacityAvailable: room.energyCapacityAvailable,
            extensions: room.memory.buildings.extensions.length,
            containers: room.memory.buildings.containers.length,
            towers: room.memory.buildings.towers.length,
            droppedEnergy: _.sum(room.memory.others.droppedEnergy, "energy"),
            storedEnergy: room.memory.others.storedEnergy,
            numberCreeps: 0,
            miners: 0,
            carriers: 0,
            haulers: 0,
            builders: 0,
            repairers: 0,
            upgraders: 0,
            roomReclaimers: 0
        }

        //log.numberCreeps = Game.creeps.length;
        
        
        for (let creep in Game.creeps) {
            
            if (Game.creeps[creep].memory.roomOrigin === room.name) {

                log.numberCreeps++;

                switch (Game.creeps[creep].memory.role) {
                    case "CreepHauler":
                        log.haulers++;
                    case "CreepBuilder":
                        log.builders++;
                        break;
                    case "CreepLinkCarrier":
                        log.linkCarriers++;
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
                    case "CreepRoomReclaimer":
                        log.roomReclaimers++;
                        break;
                    case "CreepUpgrader":
                        _.each(Game.creeps[creep].body, (part) => {
                            if (part.type === WORK) {
                                log.upgradePerTick++;
                            }
                        });
                        
                        log.upgraders++;
                        break;
                }
            }
        }
        
        function convertNumber(num) {
            if (num > 999999) {
                return (num/1000).toFixed(1) + 'm'
            } else {
                if (num > 999) {
                    return (num/1000).toFixed(1) + 'k'
                }
            }
            return num;
        }
        
        let columnWidth = "25%";
        let widthLeft = "200px";
        let widthRight = "50px";
        
        let displayLevel = [
            "<h4>Level</h4>",
            "<table border='1' color='red'>",
            "<tr><td width='70px'>GCL</td><td align='center' width='120px'>", Game.gcl.level, "</td></tr>",
            "<tr><td>Progress</td><td align='center'>", convertNumber(Game.gcl.progress), "/", convertNumber(Game.gcl.progressTotal), "</td></tr>",
            "</table>"
        ].join("");
        
        let displayRoom = [
            "<h4>Room</h4>",
            "<table border='1'>",
            "<tr><td width='150px'>Room level</td><td align='center' width='50px'>", log.level, "</td></tr>",
            "<tr><td>Upgrade per tick</td><td align='center'>", log.upgradePerTick, "</td></tr>",
            "<tr><td>Extensions</td><td align='center'>", log.extensions, "</td></tr>",
            "<tr><td>Containers</td><td align='center'>", log.containers, "</td></tr>",
            "<tr><td>Towers</td><td align='center'>", log.towers, "</td></tr>",
            "</table>"
        ].join("");
        
        let displayEnergy = [
            "<h4>Energy</h4>",
            "<table border='1'>",
            "<tr><td width='110px'>Room energy</td><td align='center' width='50px'>&nbsp;", log.energyAvailable, "/", log.energyCapacityAvailable, "&nbsp;</td></tr>",
            "<tr><td>Dropped energy</td><td align='center'>", log.droppedEnergy, "</td></tr>",
            "<tr><td>Stored energy</td><td align='center'>", log.storedEnergy, "</td></tr>",
            "</table>"
        ].join("");
        
        let displayCreeps = [
            "<h4>Creeps</h4>",
            "<table border='1' color='red'>",
            "<tr><td width='160px'>Total number of creeps</td><td align='center' width='50px'>", log.numberCreeps, "</td></tr>",
            "<tr><td>Number of miners</td><td align='center'>", log.miners, "</td></tr>",
            "<tr><td>Number of carriers</td><td align='center'>", log.carriers, "</td></tr>",
            "<tr><td>Number of haulers</td><td align='center'>", log.haulers, "</td></tr>",
            "<tr><td>Number of builders</td><td align='center'>", log.builders, "</td></tr>",
            "<tr><td>Number of repairers</td><td align='center'>", log.repairers, "</td></tr>",
            "<tr><td>Number of upgraders</td><td align='center'>", log.upgraders, "</td></tr>",
            
            "<tr><td>Number of room reclaimers</td><td align='center'>", log.roomReclaimers, "</td></tr>",
            
            "</table>"
        ].join("");

        console.log([
            "<h3>", room.name, "</h3>",
            "<table><tr>",
            "<td width='", columnWidth, "' valign='top'>", displayLevel, "</td>", 
            "<td width='", columnWidth, "' valign='top'>", displayRoom, "</td>", 
            "<td width='", columnWidth, "' valign='top'>", displayEnergy, "</td>", 
            "<td width='", columnWidth, "' valign='top'>", displayCreeps,"</td>", 
            "</tr></table>"
        ].join(""));
              
    

    }
};