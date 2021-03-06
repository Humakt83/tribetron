'use strict'

angular.module('Tribetron').factory('AreaMap', ['$timeout', 'GameSettings', function($timeout, GameSettings) {

	const PF = require('pathfinding')

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
		this.isBetween = function(from, to) {
			if (from.xCoord === to.xCoord && this.xCoord === from.xCoord) {
				return (this.yCoord > from.yCoord && this.yCoord < to.yCoord) || (this.yCoord < from.yCoord && this.yCoord > to.yCoord)
			}
			if (from.yCoord === to.yCoord && this.yCoord === from.yCoord) {
				return (this.xCoord > from.xCoord && this.xCoord < to.xCoord) || (this.xCoord < from.xCoord && this.xCoord > to.xCoord)
			}			
			return false
		}
		this.setRobot = function(robot) {
			this.robot = robot
		}
		this.setTrap = function(trap) {
			this.trap = trap
		}
		this.setLoot = function(loot) {
			this.loot = loot
		}
		this.setExplosion = function(big, nuke) {
			this.explosion = true
			this.bigExplosion = big
			this.nuke = nuke
			var thisArea = this
			$timeout(function() { 
				thisArea.explosion = false
				thisArea.nuke = false
			}, 100 * GameSettings.getGameSpeed())
		}
		this.isEmpty = function () {
			return !(this.isWall || this.trap || this.robot)
		}
		this.xCoord = xCoord
		this.yCoord = yCoord
		this.isWall = isWall
		this.robot = null
		this.trap = null
		this.loot = null
		this.explosion = false
		this.bigExplosion = false
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
		
		this.findAreasWithOtherBots = function(bot, botsAreDestroyed) {
			return _.filter(this.areas, function(area) { return area.robot && area.robot !== bot && area.robot.destroyed == botsAreDestroyed})
		}
		
		this.findAreasCloseToArea = function(area) {
			return _.compact([this.getAreaByCoord(new Coord(area.xCoord - 1, area.yCoord)),
				this.getAreaByCoord(new Coord(area.xCoord + 1, area.yCoord)),
				this.getAreaByCoord(new Coord(area.xCoord, area.yCoord - 1)),
				this.getAreaByCoord(new Coord(area.xCoord, area.yCoord + 1))])
		}
		
		this.moveBot = function(from, to) {
			if (this.botCanBePlacedOnArea(to)) {
				let robotTo = to.robot
				to.setRobot(from.robot)
				from.setRobot(robotTo)
				if (to.trap) {
					to.trap.triggerTrap(to, to.robot, this)
				}
				return true
			}
			return false
		}
		
		this.moveBotTowardsUsingFinder = function(botArea, targetArea, avoidTraps) {
			function walkableArea(area) {
				return area === targetArea || (!area.isWall && !(area.robot && !area.robot.destroyed) && (!avoidTraps || !area.trap))
			}
			var grid = new PF.Grid(this.width, this.height)
			angular.forEach(this.areas, function(area) {
				grid.setWalkableAt(area.xCoord, area.yCoord, walkableArea(area))
			})
			var finder = new PF.BestFirstFinder()
			var path = finder.findPath(botArea.xCoord, botArea.yCoord, targetArea.xCoord, targetArea.yCoord, grid)
			return path && path.length > 1 ? this.moveBot(botArea, this.getAreaByCoord(new Coord(path[1][0], path[1][1]))) : false
		}		
		
		this.moveBotTowards = function(botArea, targetArea) {
			var xDistance = botArea.xCoord - targetArea.xCoord
			var yDistance = botArea.yCoord - targetArea.yCoord
			var moveOptions = [], thisMap = this
			if (Math.abs(xDistance) >= Math.abs(yDistance)) {
				moveOptions.push(this.getAreaByCoord(new Coord(botArea.xCoord + (Math.sign(xDistance) * -1), botArea.yCoord)))
				if (yDistance !== 0) moveOptions.push(this.getAreaByCoord(new Coord(botArea.xCoord, botArea.yCoord + (Math.sign(yDistance) * -1))))
				moveOptions.push(_.shuffle([
					this.getAreaByCoord(new Coord(botArea.xCoord, botArea.yCoord + 1)), 
					this.getAreaByCoord(new Coord(botArea.xCoord, botArea.yCoord - 1))]))
			} else {
				moveOptions.push(this.getAreaByCoord(new Coord(botArea.xCoord, botArea.yCoord + (Math.sign(yDistance) * -1))))
				if (xDistance !== 0) moveOptions.push(this.getAreaByCoord(new Coord(botArea.xCoord + (Math.sign(xDistance) * -1), botArea.yCoord)))
				moveOptions.push(_.shuffle([
					this.getAreaByCoord(new Coord(botArea.xCoord + 1, botArea.yCoord)),
					this.getAreaByCoord(new Coord(botArea.xCoord -1, botArea.yCoord))]))
			}
			return _.find(_.compact(_.flatten(moveOptions)), function(option) { return thisMap.moveBot(botArea, option) })
		}
		
		this.moveBotTowardsCloserAxis = function(botArea, targetArea) {
			var xDistance = botArea.xCoord - targetArea.xCoord
			var yDistance = botArea.yCoord - targetArea.yCoord
			if (Math.abs(xDistance) > Math.abs(yDistance)) {
				return this.moveBot(botArea, this.getAreaByCoord(new Coord(botArea.xCoord, botArea.yCoord + (Math.sign(yDistance) * -1))))
			} 
			return this.moveBot(botArea, this.getAreaByCoord(new Coord(botArea.xCoord + (Math.sign(xDistance) * -1), botArea.yCoord)))
		}
		
		this.moveBotAway = function(botArea, fromArea) {
			var xDistance = botArea.xCoord - fromArea.xCoord
			var yDistance = botArea.yCoord - fromArea.yCoord
			var moveOptions = [], thisMap = this
			if (Math.abs(xDistance) >= Math.abs(yDistance) || (Math.abs(xDistance) == Math.abs(yDistance) && Math.floor(Math.random()) == 1)) {
				moveOptions.push(this.getAreaByCoord(new Coord(botArea.xCoord + Math.sign(xDistance), botArea.yCoord)))
				if (yDistance !== 0) moveOptions.push(this.getAreaByCoord(new Coord(botArea.xCoord, botArea.yCoord + Math.sign(yDistance))))
				moveOptions.push(_.shuffle([
					this.getAreaByCoord(new Coord(botArea.xCoord, botArea.yCoord + 1)), 
					this.getAreaByCoord(new Coord(botArea.xCoord, botArea.yCoord - 1))]))
			} else {
				moveOptions.push(this.getAreaByCoord(new Coord(botArea.xCoord, botArea.yCoord + Math.sign(yDistance))))
				if (xDistance !== 0) moveOptions.push(this.getAreaByCoord(new Coord(botArea.xCoord + Math.sign(xDistance), botArea.yCoord)))
				moveOptions.push(_.shuffle([
					this.getAreaByCoord(new Coord(botArea.xCoord + 1, botArea.yCoord)),
					this.getAreaByCoord(new Coord(botArea.xCoord -1, botArea.yCoord))]))
			}
			return _.find(_.compact(_.flatten(moveOptions)), function(option) { return thisMap.moveBot(botArea, option) })
		}
		
		this.moveBotTowardsInStraightLine = function(botArea, targetArea) {
			var xDistance = botArea.xCoord - targetArea.xCoord
			var yDistance = botArea.yCoord - targetArea.yCoord
			if (xDistance !== 0)
				this.moveBot(botArea, this.getAreaByCoord(new Coord(botArea.xCoord + (Math.sign(xDistance) * -1), botArea.yCoord)))
			else
				this.moveBot(botArea, this.getAreaByCoord(new Coord(botArea.xCoord, botArea.yCoord + (Math.sign(yDistance) * -1))))
		}
		
		this.areaCanbeReachedInStraightLine = function(area, targetArea) {
			return area.yCoord == targetArea.yCoord || area.xCoord == targetArea.xCoord
		}
		
		this.anythingBetweenAreas = function(area, targetArea) {
			var blocked = false
			if (area.yCoord == targetArea.yCoord) {
				var minX = Math.min(area.xCoord, targetArea.xCoord)
				var maxX = Math.max(area.xCoord, targetArea.xCoord)
				angular.forEach(this.getAreasByRow(area.yCoord), function(areaByRow) {
					if ((areaByRow.robot || areaByRow.isWall) && areaByRow.xCoord > minX && areaByRow.xCoord < maxX) 
						blocked = true
				})
			} else if (area.xCoord == targetArea.xCoord) {
				var minY = Math.min(area.yCoord, targetArea.yCoord)
				var maxY = Math.max(area.yCoord, targetArea.yCoord)
				angular.forEach(this.getAreasByColumn(area.xCoord), function(areaByColumn) {
					if ((areaByColumn.robot || areaByColumn.isWall) && areaByColumn.yCoord > minY && areaByColumn.yCoord < maxY) 
						blocked = true
				})
			} else blocked = true
			return blocked
		}
		
		this.findAreaWithBotByTypeName = function(typeName, team, onlyUndestroyed) {
			return _.filter(areas, function(area) {
				return area.robot && area.robot.type.typeName == typeName && (!team || team === area.robot.team) && (!onlyUndestroyed || !area.robot.destroyed)
			})
		}
		
		this.findAreaWithOpponentsBotByTypeName = function(typeName, team) {
			return _.filter(areas, function(area) {
				return area.robot && area.robot.type.typeName == typeName && team !== area.robot.team && !area.robot.destroyed
			})
		}
		
		this.findOpponents = function(team, includeDestroyed) {
			return _.filter(areas, function(area) { 
				return area.robot && (includeDestroyed || !area.robot.destroyed) && area.robot.team !== team 
			})
		}
		this.findClosestOpponent = function(botArea, team, includeDestroyed) {
			var opponents = this.findOpponents(team, includeDestroyed)
			return botArea.findClosest(_.filter(opponents, function(opp) { return opp !== botArea }))
		}		
		this.findInjuredAllies = function(team, bot, doNotIncludeDestroyed) {
			return _.filter(areas, function(area) { 
				return area.robot && area.robot.isInjured() && area.robot.team === team && area.robot !== bot && (!doNotIncludeDestroyed || !area.robot.destroyed)
			})
		}
		this.getAreasByRow = function(row) {
			return _.filter(areas, function(area) { return area.yCoord === row})
		}
		this.getAreasByColumn = function(column) {
			return _.filter(areas, function(area) { return area.xCoord === column})
		}
		this.getAreaByCoord = function(coord) {
			var foundedArea = _.filter(areas, {'yCoord': coord.y, 'xCoord': coord.x})
			return foundedArea ? foundedArea[0] : null
		}
		this.botCanBePlacedOnArea = function(area, mustNotContainBot) {
			return area && !area.isWall && !(area.robot && (mustNotContainBot || !area.robot.destroyed))
		}
		this.getAreasBetween = function(from, to) {
			if (!this.areaCanbeReachedInStraightLine(from, to)) return
			return _.filter(areas, function(area) {
				return area.isBetween(from, to)
			})
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
		this.tryToPlaceTrap = function(trap, coord) {
			var areaByCoord = this.getAreaByCoord(coord)
			if (areaByCoord && !areaByCoord.isWall && !areaByCoord.robot && !areaByCoord.trap) {
				areaByCoord.setTrap(trap)
				return true
			}
		}
		
		this.placeTrapAtRandomFreeSpot = function(trap) {
			function randomCoord() {
				return new Coord(Math.floor(Math.random() * width), Math.floor(Math.random() * height))
			}
			while (!this.tryToPlaceTrap(trap, randomCoord())) {}
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
		},
		createCoord: function(x, y) {
			return new Coord(x, y)
		},
		createArea: function(x,y, wall) {
			return new Area(x,y, wall)
		}
	}
}])