
/*
	memory.buildings = {
			extensions: 0,
			extensionsTarget: 0
	}
*/
function Buildings(room) {

	this.room = room;
	this.spawn = room.find(FIND_MY_SPAWNS)[0];

	this.init();

	this.updateCounters();
	this.createBuildings();

}


/*
* Find free position near fromPosition
*/
Buildings.prototype.findFreePos = function(fromPosition) {

	let maxRange = 3;
	let newPos;

	for (let range = 1; range <= maxRange; range ++) {

		let areas = this.room.lookForAtArea(
			LOOK_TERRAIN, 
			fromPosition.y-range, 
			fromPosition.x-range, 
			fromPosition.y+range, 
			fromPosition.x+range, 
			true
		);	
		
		for (let i = 0; i < areas.length; i++) {
			let area = areas[i];

			if (area.type === "terrain") {
				
				let pos = this.room.getPositionAt(area.x,area.y);

				if (pos.lookFor(LOOK_STRUCTURES).length == 0 && pos.lookFor(LOOK_CONSTRUCTION_SITES).length == 0) {
					newPos = pos;
					break;
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
*	Get building memory
*/
Buildings.prototype.getMemory = function() {
	return this.room.memory.buildings;
};


/*
*	Get current room level memory
*/ 
Buildings.prototype.getLevelMemory = function() {
	
	let levelIndex = this.room.controller.level - 1;

	return this.room.memory.buildings.levels[levelIndex];
};





/*
* 	Set building memory
*/
Buildings.prototype.setMemory = function(memory) {
	this.room.memory.buildings = memory;
};

/*
*	Initialize building memory which count structures created and to create
*/
Buildings.prototype.init = function() {

	if (this.room.memory.buildings === undefined) {

		console.log("initialize room ", this.room, " buildings");

		let memory = {
			extensions: 0,
			towers: 0,
			levels: [{
				level: 1,
				extensionsTarget: 0,
				towersTarget: 0
			},{
				level: 2,
				extensionsTarget: 5,
				towersTarget: 0
			},{
				level: 3,
				extensionsTarget: 10,
				towersTarget: 1
			}]
		};

		this.setMemory(memory);
	}
};



/*
*	Count current buildings
*/
Buildings.prototype.updateCounters = function() {

	var memory = this.getMemory();

	memory.extensions = this.room.find(FIND_MY_STRUCTURES, {
	    filter: { 
	    	structureType: STRUCTURE_EXTENSION 
	    }
	}).length;

	memory.towers = this.room.find(FIND_MY_STRUCTURES, {
	    filter: { 
	    	structureType: STRUCTURE_TOWER
	    }
	}).length;


	this.setMemory(memory);
};

/*
*	Launch buildings constructions
*/
Buildings.prototype.createBuildings = function() {
	
	let memory = this.getMemory();
	let levelMemory = this.getLevelMemory();

	//Build extensions
	if (memory.extensions < levelMemory.extensionsTarget){

		var constructionSites = this.room.find(FIND_CONSTRUCTION_SITES);

		if (constructionSites.length == 0) {
			this.buildExtension(this.spawn.pos);
		} 
	}

	
	//Build towers
	if (memory.towers < levelMemory.extensionsTarget) {
		this.buildTower(this.spawn.pos);
	}

	//When 3 or more extensions, build road for sources
	if (memory.extensions >= 3) {	
		
		this.room.memory.config.sources.forEach((source) => {
			if (source.roadBuild == true) {
				return;
			}

			this.buildRoad(this.spawn.pos, this.room.getPositionAt(source.pos.x, source.pos.y));
			
			source.roadBuild = true;			
		});		
	}

	//When 4 or more extensions, build road for controller
	if (memory.extensions >= 4) {
		this.buildRoad(this.spawn.pos, this.room.controller.pos);
	}



	this.setMemory(memory);
};

/*
*	Build extension near to spawn area with road between them
*/
Buildings.prototype.buildExtension = function(fromPosition) {

	var newPos = this.findFreePos(fromPosition);

	if (newPos === undefined) {
		return;
	}

	if ((fromPosition.x - fromPosition.y) % 2 == 1) {
		if ((newPos.x - newPos.y) % 2 == 0) {
			this.room.createConstructionSite(newPos,STRUCTURE_EXTENSION);
		} else {
			this.room.createConstructionSite(newPos,STRUCTURE_ROAD);
		}
	} else {
		if ((newPos.x - newPos.y) % 2 == 0) {
			this.room.createConstructionSite(newPos,STRUCTURE_ROAD);
		} else {
			this.room.createConstructionSite(newPos,STRUCTURE_EXTENSION);
		}
	}

};

/*
*	Build a road between 2 pos
*/
Buildings.prototype.buildRoad = function(fromPosition, toPosition) {

	var path = fromPosition.findPathTo(toPosition, {
		ignoreCreeps: true
	});

	if (path.length > 0) {
		path.forEach((pos) => {
			var create = this.room.createConstructionSite(pos.x, pos.y,STRUCTURE_ROAD);
		});
		return;
	}
};



Buildings.prototype.buildTower = function(fromPosition) {

	var newPos = this.findFreePos(fromPosition);

	if (newPos === undefined) {
		return;
	}

	if ((fromPosition.x - fromPosition.y) % 2 == 1) {
		if ((newPos.x - newPos.y) % 2 == 0) {
			this.room.createConstructionSite(newPos,STRUCTURE_EXTENSION);
		} else {
			this.room.createConstructionSite(newPos,STRUCTURE_TOWER);
		}
	} else {
		if ((newPos.x - newPos.y) % 2 == 0) {
			this.room.createConstructionSite(newPos,STRUCTURE_ROAD);
		} else {
			this.room.createConstructionSite(newPos,STRUCTURE_TOWER);
		}
	}
}


module.exports = Buildings;