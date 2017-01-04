function Buildings(room) {

    this.room = room;
}


Buildings.prototype.maxConstructionSites = 50;

/*
 *  Get building config for each levels
 */
Buildings.prototype.getConfig = function() {
    return {
        levels: [{
            level: 1,
            extensions: 0,
            towers: 0,
            containers: 0,
            links: 0,
            storages: 0
        }, {
            level: 2,
            extensions: 5,
            towers: 0,
            containers: 0,
            links: 0,
            storages: 0
        }, {
            level: 3,
            extensions: 10,
            towers: 1,
            containers: 5,
            links: 0,
            storages: 0
        }, {
            level: 4,
            extensions: 20,
            towers: 1,
            containers: 10,
            links: 0,
            storages: 1
        }, {
            level: 5,
            extensions: 30,
            towers: 2,
            containers: 10,
            links: 2,
            storages: 1
        }, {
            level: 6,
            extensions: 40,
            towers: 2,
            containers: 10,
            links: 3,
            storages: 1
        }, {
            level: 7,
            extensions: 50,
            towers: 3,
            containers: 10,
            links: 4,
            storages: 1
        }, {
            level: 8,
            extensions: 60,
            towers: 6,
            containers: 10,
            links: 6,
            storages: 1
        }]
    };
};

Buildings.prototype.runBuildings = function() {
        
    this.room.memory.buildings.towers.forEach((tower) => {
        this._runTower(Game.getObjectById(tower.id));
    });
    
    this.room.memory.buildings.links.forEach((link) => {
        this._runLink(Game.getObjectById(link.id), link); 
    });    
}


Buildings.prototype.createLayout = function() {



    let layout = [];
    let roads = [];
    let that = this;    

    fillRoadsLayout = function() {

        _.map(that.room.memory.buildings.sources, source => Game.getObjectById(source.id))
            .forEach(source => {    
                let roadList = _.map(
                    that._getRoad(source.pos, that.room.controller.pos),
                    (road) => {
                        road.type = STRUCTURE_ROAD;
                        road.level = 1;
                        road.built = false;
                        return road;
                    }
                );
                roads = _.union(roads, roadList);
            }
        );
                //Remove duplicates
        roads = _.uniq(roads, road => JSON.stringify(road));

        //Add roads to current layout
        layout = layout.concat(roads);
    };

    fillExtensionsLayout = function() {
        let extensions = [];
        let positions =  _.difference(
            that.room.controller.pos.findInRange(roads, 15),
            that.room.controller.pos.findInRange(roads, 4)
        );

        let maxExtensions = 50;
        let index = 0;
        let level = 2;

        while(extensions.length < maxExtensions) {

            let position = positions[index];

            if (position === undefined) {
                break;
            }

            let extPos = that.findFreePos(position, 1, layout);

            if (extPos !== undefined) {
                extPos.type = STRUCTURE_EXTENSION;
                extPos.level = level;
                extPos.built = false;

                layout.push(extPos);
                extensions.push(extPos);
            } else {
                index++;
            }

            //change level according to controller rank
            switch (extensions.length) {
                case 5:
                    level = 3;
                    break;
                case 10:
                    level = 4;
                    break;
                case 20:
                    level = 5;
                    break;
                case 30:
                    level = 6;
                    break;
            }
        };
    };

    fillStorageLayout = function() {

        //Add storage near controller
        let storage = that.findFreePos(that.room.controller.pos, 2, layout);

        if (storage !== undefined) {        
            storage.type = STRUCTURE_STORAGE;
            storage.level = 4;
            storage.built = false;
            layout.push(storage);
        }
    };

    fillLinksLayout = function() {

        let link;

        that.room.memory.buildings.sources.forEach((source, index) => {

            link = that.findFreePos(source.pos, 2, layout);

            link.type = STRUCTURE_LINK;

            if (index === 0) {
                link.level = 5;    
            } else {
                link.level = 6;
            }
            
            link.built = false;
            layout.push(link);  
        });


        link = that.findFreePos(that.room.controller.pos, 2, layout);

        link.type = STRUCTURE_LINK;
        link.level = 5;    
        link.built = false;
        layout.push(link);  


    };

    deleteAllFlags = function() {
        _.forIn(Game.flags, function(flag) {
            if (flag.name != "test")
              flag.remove();
        })
    };


    displayLayoutAsFlags = function() {
        let i= 0;
        layout.forEach(layoutData => {

            i++;

            let name = "";
            let color = "";

            switch (layoutData.type) {

                case STRUCTURE_ROAD:
                    name = "r";
                    color = COLOR_WHITE;
                    break;

                case STRUCTURE_EXTENSION:
                    name = "e";
                    color = COLOR_BLUE;
                    break;

                case STRUCTURE_LINK:
                    name = "r";
                    color = COLOR_RED;
                    break;

                case STRUCTURE_WALL:
                    name = "s";
                    color = COLOR_YELLOW;
                    break;                   

                case STRUCTURE_RAMPART:
                    name = "s";
                    color = COLOR_ORANGE;
                    break;                                     
            }

            that.room.createFlag(layoutData.pos, name+i, color);

        });
    };

    if (this.room.memory.layout !== undefined) {        
        return;
    }

    fillRoadsLayout();
    fillExtensionsLayout();
    fillStorageLayout();
    fillLinksLayout();

    this.room.memory.layout = layout;

};

Buildings.prototype._getRoad = function(fromPosition, toPosition) {

    return _.map(
        fromPosition.findPathTo(toPosition, {
            ignoreCreeps: true
        }),
        path => new RoomPosition(path.x, path.y, this.room.name)
    );
};

/*
 * Find free position near fromPosition
 */
Buildings.prototype.findFreePos = function(fromPosition, maxRange, avoidPositions) {

    maxRange = maxRange || 10;
    avoidPositions = avoidPositions || [];

    let newPos;

    for (let range = 1; range <= maxRange; range++) {

        let areas = this.room.lookForAtArea(
            LOOK_TERRAIN,
            fromPosition.y - range,
            fromPosition.x - range,
            fromPosition.y + range,
            fromPosition.x + range,
            true
        );

        for (let i = 0; i < areas.length; i++) {
            let area = areas[i];

            if (area.type === "terrain" && (area.terrain === "plain" || area.terrain === "swamp")) {

                //console.log(JSON.stringify(area))

                let pos = this.room.getPositionAt(area.x, area.y);

                if (pos.lookFor(LOOK_STRUCTURES).length == 0 && pos.lookFor(LOOK_CONSTRUCTION_SITES).length == 0) {
                    //console.log(_.find(avoidPositions, {x : pos.x, y: pos.y}))

                    //console.log(avoidPositions[0].x, avoidPositions[0].y, pos.x, pos.y)

                    if (_.find(avoidPositions, {x : pos.x, y: pos.y}) === undefined) {
                        //console.log(pos)
                        newPos = pos;
                        break;                        
                    }

                }
            }
        }

        if (newPos !== undefined) {
            break;
        }
    }

    return newPos;
};



/*
 *  Get current room level memory
 */
Buildings.prototype.getLevelConfig = function() {

    let levelIndex = this.room.controller.level - 1;

    return this.getConfig().levels[levelIndex];
};

/*
 *  Launch buildings constructions
 */
Buildings.prototype.createBuildings_test = function(time) {
    if (time !== undefined) {
        if (Game.time % time !== 0) {
            return;
        }
    }

    let layout = this.room.memory.layout;
    let sites = this.room.find(FIND_CONSTRUCTION_SITES).length;

    layout.forEach((layoutData) => {

        if (layoutData.level <= this.room.controller.level && layoutData.built === false && this.room.controller.level > 1) {

            if (sites <= 5) {

                this.room.createConstructionSite(layoutData.x, layoutData.y, layoutData.type);
                layoutData.built = true;
                
                sites++;
            }
        }
    });

    this.room.memory.layout = layout;

};
Buildings.prototype.createBuildings = function(time) {
    if (time !== undefined) {
        if (Game.time % time !== 0) {
            return;
        }
    }

    let levelConfig = this.getLevelConfig();
    let memory = this.room.memory;
    let spawn;


    if (memory.buildings.spawns.length > 0) {
        spawn = memory.buildings.spawns[0];
    } else {
        console.log("WARNING : NO SPAWN, SO NO BUILDING !!!");
        return;
    }

    //Build towers
    let towers = memory.buildings.towers
    
    if (towers.length < levelConfig.towers) {
        if (memory.others.constructionSites.length == 0) {
            this._buildTower(spawn.pos);
            return;
        }
    }
    
    
    //Build extensions
    let extensions = memory.buildings.extensions;
    let controller = memory.buildings.controller;

    if (extensions.length < levelConfig.extensions) {
        if (memory.others.constructionSites.length == 0) {
            this._buildExtension(spawn.pos);
            return;
        }
    }

    
    //When 3 or more extensions, build road for sources and controller
    if (extensions.length >= 3) {

        _.where(memory.buildings.sources, {roadBuild: false}).forEach(source => {
            this._buildRoad(spawn.pos, this.room.getPositionAt(source.pos.x, source.pos.y));
            source.roadBuild = true;
        });

        if (controller.roadBuild == false) {
            this._buildRoad(spawn.pos, this.room.controller.pos);            
            controller.roadBuild = true;
        }
    }
    if (extensions.length === levelConfig.extensions && this.room.controller.level >= 3) {
       // this._buildWalls();
    }


    /*  TODO :

        - Wall + Ramparts
        - Links (From/To ?)
        - Containers : près du controller ?
        - Storage : près du controller ?

        - Construction nouveau spawn


    */  
       
            
    //Build containers
    /*if (memory.containers < levelMemory.containersTarget) {
        var constructionSites = this.room.find(FIND_CONSTRUCTION_SITES);

        if (constructionSites.length == 0) {
            this._buildContainer(spawn.pos);
            return;
        }
    }*/

    
    
};


Buildings.prototype._buildWalls = function(direction) {

    let config = {
        "1": {
            from: {x:2, y: 2},
            to: {x: 48, y: 2}
        },
        "5": {
            from: {x:2, y: 48},
            to: {x: 48, y: 48}
        },
        "3": {
            from: {x:48, y: 2},
            to: {x: 48, y: 48}
        },
        "7": {
            from: {x:2, y: 2},
            to: {x:2, y: 48}
        }
    };

    let that = this;

    function buildWallBorder(direction) {

        let directionConfig = config[direction];

        let x = 0;
        let y = 0;
        let x2 = 0;
        let y2 = 0;
        let area;
        let construct;
        let start;
        let prev;
        let rampart;
        let layout = [];
        let walls = [];

        switch(direction) {

            case TOP:
            case BOTTOM:

                y = directionConfig.from.y;
                x = directionConfig.from.x;

                while (x <= directionConfig.to.x) {

                    getTerrain = function(x, y) {
                        return _.find(that.room.lookAt(x, y), { type: "terrain" });
                    }

                    area = getTerrain(x, y);

                    if (area.terrain !== "wall") {

                        construct = true;

                        switch(direction) {
                            case TOP:
                                if (getTerrain(x-1, y-1).terrain === "wall" && getTerrain(x+1, y-1).terrain === "wall" ) {
                                    construct = false;
                                }
                                break;

                            case BOTTOM:
                                if (getTerrain(x-1, y+1).terrain === "wall" && getTerrain(x+1, y+1).terrain === "wall" ) {
                                    construct = false;
                                }
                                break;
                        }

                        if (construct) {
                            layout.push({
                                x: x,
                                y: y,
                                type: STRUCTURE_WALL
                            })
                        }
                    }
                    x++;
                }   

                layout.forEach((wall, index) => {

                    if (index === 0) {
                        start = wall;
                    } else {
                        prev = layout[index - 1];

                        if (wall.x !== (prev.x + 1)  || index === (layout.length-1)) {

                            if (index === (layout.length)) {
                                end = wall;
                            } else {
                                end = prev;    
                            } 

                            rampart = _.find(layout, {
                                x: start.x + (parseInt((end.x - start.x) / 2)),
                                y: directionConfig.from.y
                            }); 
                            if (rampart !== undefined) {
                                rampart.type = STRUCTURE_RAMPART;   
                            }

                            start = wall;
                        }
                    }

                });
                break;

            case LEFT:
            case RIGHT: 

                y = directionConfig.from.y;
                x = directionConfig.from.x;

                while (y <= directionConfig.to.y) {

                    getTerrain = function(x, y) {
                        return _.find(that.room.lookAt(x, y), { type: "terrain" });
                    }

                    area = getTerrain(x, y);

                    if (area.terrain !== "wall") {

                        construct = true;

                        switch(direction) {
                            case LEFT:
                                if (getTerrain(x-1, y-1).terrain === "wall" && getTerrain(x-1, y+1).terrain === "wall" ) {
                                    construct = false;
                                }
                                break;

                            case RIGHT:
                                if (getTerrain(x+1, y-1).terrain === "wall" && getTerrain(x+1, y+1).terrain === "wall" ) {
                                    construct = false;
                                }
                                break;
                        }

                        if (construct) {
                            layout.push({
                                x: x,
                                y: y,
                                type: STRUCTURE_WALL
                            })
                        }
                    }
                    y++;
                }   

                layout.forEach((wall, index) => {

                    if (index === 0) {
                        start = wall;
                    } else {
                        prev = layout[index - 1];

                        if (wall.y !== (prev.y + 1)  || index === (layout.length-1)) {

                            if (index === (layout.length)) {
                                end = wall;
                            } else {
                                end = prev;    
                            } 

                            rampart = _.find(layout, {
                                x: directionConfig.from.x,
                                y: start.y + (parseInt((end.y - start.y) / 2))
                            }); 
                            if (rampart !== undefined) {
                                rampart.type = STRUCTURE_RAMPART;   
                            }

                            start = wall;
                        }
                    }

                });
                break;
        }

        layout.forEach(building => {
            console.log(building.x, building.y)
            console.log(that.room.createConstructionSite(building.x, building.y, building.type));
        })

    };

    let exits = Game.map.describeExits(this.room.name);

    if (_.has(exits, TOP)) {
        buildWallBorder(TOP);    
    }
    if (_.has(exits, BOTTOM)) {
        buildWallBorder(BOTTOM);    
    }
    if (_.has(exits, RIGHT)) {
        buildWallBorder(RIGHT);    
    }
    if (_.has(exits, LEFT)) {
        buildWallBorder(LEFT);    
    }

    

};

/*
 *  Build extension near to spawn area with road between them
 */
Buildings.prototype._buildExtension = function(fromPosition) {

    var newPos = this.findFreePos(fromPosition);

    if (newPos === undefined) {
        return;
    }

    if ((fromPosition.x - fromPosition.y) % 2 == 1) {
        if ((newPos.x - newPos.y) % 2 == 0) {
            this.room.createConstructionSite(newPos, STRUCTURE_EXTENSION);
        } else {
            this.room.createConstructionSite(newPos, STRUCTURE_ROAD);
        }
    } else {
        if ((newPos.x - newPos.y) % 2 == 0) {
            this.room.createConstructionSite(newPos, STRUCTURE_ROAD);
        } else {
            this.room.createConstructionSite(newPos, STRUCTURE_EXTENSION);
        }
    }

};

/*
 *  Build a road between 2 pos
 */
Buildings.prototype._buildRoad = function(fromPosition, toPosition) {

    var path = fromPosition.findPathTo(toPosition, {
        ignoreCreeps: true
    });

    if (path.length > 0) {
        path.forEach((pos) => {
            var create = this.room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD);
        });
        return;
    }
};



/*
*   Build a container near fromPosition
*/
Buildings.prototype._buildContainer = function(fromPosition) {

    var newPos = this.findFreePos(fromPosition);

    if (newPos === undefined) {
        return;
    }

    if ((fromPosition.x - fromPosition.y) % 2 == 1) {
        if ((newPos.x - newPos.y) % 2 == 0) {
            this.room.createConstructionSite(newPos, STRUCTURE_CONTAINER);
        } else {
            this.room.createConstructionSite(newPos, STRUCTURE_TOWER);
        }
    } else {
        if ((newPos.x - newPos.y) % 2 == 0) {
            this.room.createConstructionSite(newPos, STRUCTURE_ROAD);
        } else {
            this.room.createConstructionSite(newPos, STRUCTURE_CONTAINER);
        }
    }
}

/*
*   Build a tower near fromPosition
*/
Buildings.prototype._buildTower = function(fromPosition) {

    var newPos = this.findFreePos(fromPosition);

    if (newPos === undefined) {
        return;
    }

    if ((fromPosition.x - fromPosition.y) % 2 == 1) {
        if ((newPos.x - newPos.y) % 2 == 0) {
            this.room.createConstructionSite(newPos, STRUCTURE_EXTENSION);
        } else {
            this.room.createConstructionSite(newPos, STRUCTURE_TOWER);
        }
    } else {
        if ((newPos.x - newPos.y) % 2 == 0) {
            this.room.createConstructionSite(newPos, STRUCTURE_ROAD);
        } else {
            this.room.createConstructionSite(newPos, STRUCTURE_TOWER);
        }
    }
}


/*
*   Run link : transfer between "from=true" to "from=false"
*/
Buildings.prototype._runLink = function(link,memory) {
    
    if (memory.from) {
        let linkTo = _.find(this.room.memory.buildings.links, {from: false});

        if (linkTo) {
            //console.log(linkTo.pos)
            link.transferEnergy(Game.getObjectById(linkTo.id));
        }
    } 
}


/*
*   Run towers : attack and then repaire structures
*/
Buildings.prototype._runTower = function(tower) {


    //First, try to find hostile creep
    var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    //console.log(closestHostile)
    if(closestHostile) {
        tower.attack(closestHostile);
    } else {
        
        //Else, try to repaire structures, but keep a minimum of 200 energy
        if (tower.energy > 200 && this.room.energyAvailable > 200) {
            
             var targets = this.room.find(FIND_STRUCTURES, {
                filter: (object) => {
                    if (object.structureType === STRUCTURE_WALL || object.structureType === STRUCTURE_RAMPART) {
                        if (object.hits < 8000) {
                            return true;
                        }
                    } else {
                        if (object.hits < (object.hitsMax / 4)) {
                            return true;
                        }
                    }
                    return false;
                }
            });

            targets.sort((a, b) => a.hits - b.hits);

            if(targets.length > 0) {
                tower.repair(targets[0]);
            }
        }
       
    }
}

module.exports = Buildings;