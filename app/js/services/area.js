'use strict'

angular.module('Tribetron').factory('AreaMap', ['$filter', function($filter) {
	function Area(xCoord, yCoord, isWall) {
		this.setRobot = function(robot) {
			this.robot = robot
		}
		this.xCoord = xCoord
		this.yCoord = yCoord
		this.isWall = isWall
	}
	
	function Coord(x, y) {
		this.x = x;
		this.y = y;
	}
	
	function Map(areas, width, height) {
		this.getAreasByRow = function(row) {
			return $filter('filter')(areas, {'yCoord':row}, 'xCoord')
		}
		this.getAreaByCoord = function(coord) {
			return $filter('filter')(areas, {'yCoord': coord.y, 'xCoord': coord.x})[0]
		}
		this.placeRobotAtRandomFreeSpot = function(robot, xCoord, yCoord) {
			function randomCoord () { return new Coord(Math.floor(Math.random() * width), Math.floor(Math.random() * height)) }
			var placed = false
			while (!placed) {
				var areaByCoord  = this.getAreaByCoord(randomCoord())
				if (!areaByCoord.isWall && !areaByCoord.robot) {
					areaByCoord.setRobot(robot)
					placed = true
				}
			}
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