'use strict'

angular.module('Tribetron').factory('AreaMap', ['$filter', function($filter) {

	
	function Area(xCoord, yCoord, isWall) {
		this.calculateDistance = function(toArea) {
			return Math.abs(this.xCoord - toArea.xCoord) + Math.abs(this.yCoord - toArea.yCoord)
		}
		this.findClosest = function(areas) {
			var closest, closestDistance
			var thisArea = this
			angular.forEach(areas, function(area) {
				var calculatedDistance = thisArea.calculateDistance(area)
				if (!closest || closestDistance > calculatedDistance) {
					closest = area
					closestDistance = calculatedDistance
				}
			})
			return closest
		}
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
		this.findAreaWhereBotIs = function(bot) {
			var areaWhereBotIs = null 
			angular.forEach(this.areas, function(area) {
				if (area.robot === bot) areaWhereBotIs = area
			})
			return areaWhereBotIs
		}
		this.moveBot = function(from, to) {
			if (this.botCanBePlacedOnArea(to)) {
				to.setRobot(from.robot)
				from.setRobot()
				return true
			}
			return false
		}
		this.moveBotTowards = function(botArea, targetArea) {
			var xDistance = botArea.xCoord - targetArea.xCoord
			var yDistance = botArea.yCoord - targetArea.yCoord
			var moveOptions = [], thisMap = this
			if (Math.abs(xDistance) >= Math.abs(yDistance)) {
				moveOptions.push(this.getAreaByCoord(new Coord(botArea.xCoord + (Math.sign(xDistance) * -1), botArea.yCoord)))
				moveOptions.push(_.shuffle([
					this.getAreaByCoord(new Coord(botArea.xCoord, botArea.yCoord + 1)), 
					this.getAreaByCoord(new Coord(botArea.xCoord, botArea.yCoord - 1))]))
			} else {
				moveOptions.push(this.getAreaByCoord(new Coord(botArea.xCoord, botArea.yCoord + (Math.sign(yDistance) * -1))))
				moveOptions.push(_.shuffle([
					this.getAreaByCoord(new Coord(botArea.xCoord + 1, botArea.yCoord)),
					this.getAreaByCoord(new Coord(botArea.xCoord -1, botArea.yCoord))]))
			}
			_.find(_.flatten(moveOptions), function(option) { return thisMap.moveBot(botArea, option) })
		}
		this.findOpponents = function(team) {
			return $filter('filter')(areas, function(area) { return area.robot && !area.robot.destroyed && area.robot.team !== team })
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