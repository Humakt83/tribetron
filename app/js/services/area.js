'use strict'

angular.module('Tribetron').factory('AreaMap', ['$filter', function($filter) {
	function Area(xCoord, yCoord, isWall) {
		this.setRobot = function(robot) {
			this.robot = robot
		}
		this.xCoord = xCoord
		this.yCoord = yCoord
		this.isWall = isWall
		this.robot = null
	}
	
	function Coord(x, y) {
		this.x = x;
		this.y = y;
	}
	
	function Map(areas, width, height) {
		this.moveBot = function(bot) {
			var areaWhereBotIs = null 
			angular.forEach(this.areas, function(area) {
				if (area.robot === bot) areaWhereBotIs = area
			})
			var areaOnRight = this.getAreaByCoord(new Coord(areaWhereBotIs.xCoord + 1, areaWhereBotIs.yCoord))
			if (this.botCanBePlacedOnArea(areaOnRight)) {
				areaOnRight.setRobot(bot)
				areaWhereBotIs.setRobot()
			}
		}
		this.getAreasByRow = function(row) {
			return $filter('filter')(areas, {'yCoord':row}, 'xCoord')
		}
		this.getAreaByCoord = function(coord) {
			return $filter('filter')(areas, {'yCoord': coord.y, 'xCoord': coord.x})[0]
		}
		this.botCanBePlacedOnArea = function(area) {
			return area && !area.isWall && !area.robot
		}
		this.tryToPlaceRobot = function(robot, coord) {
			var areaByCoord  = this.getAreaByCoord(coord)
			if (this.botCanBePlacedOnArea(areaByCoord)) {
				areaByCoord.setRobot(robot)
				return true
			}
		}
		this.placeRobotAtRandomFreeSpot = function(robot, isEnemyTeam) {
			function randomCoord () {
				if (isEnemyTeam)
					return new Coord(Math.floor((width / 2 + 1) + (Math.random() * ((width / 2)))), Math.floor(Math.random() * height)) 
				else
					return new Coord(Math.floor(Math.random() * ((width / 2) -1)), Math.floor(Math.random() * height)) 
			}
			while (!this.tryToPlaceRobot(robot, randomCoord())){}
		}
		this.areas = areas
		this.width = width
		this.height = height
		this.lines = new Array(width)
		this.rows = new Array(height)
	}
	
	return {
		createMap : function(width, height) {
			var areas = []
			for (var y = 0; y < height; y++) {
				for (var x = 0; x < width; x++) {
					if ( y === 0 || x === 0 || y === height -1 || x === width -1)
						areas.push(new Area(x, y, true))
					else
						areas.push(new Area(x, y))
				}
			}
			return new Map(areas, width, height)
		}
	}
}])