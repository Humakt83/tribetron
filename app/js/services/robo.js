'use strict'

angular.module('Tribetron').factory('Robot', ['BattleLog', 'GameHandler', function(BattleLog, GameHandler) {
	var types = [Hunter, Box, Medic, Totter, Radiator, Psycho, Crate, Zipper, Multiplicator, Cannoneer, Sniper, Hacker, Destructor]
	
	function Hunter() {
		this.takeTurn = function(bot, map, team) {
			var area = map.findAreaWhereBotIs(bot)
			var opponentAreas = map.findOpponents(team)
			var closestOpponent = area.findClosest(opponentAreas)
			if (area.calculateDistance(closestOpponent) < 2) 
				closestOpponent.robot.receiveDamage('Hunter', this.meleeDamage, map)
			else {
				BattleLog.add('Hunter moves towards enemy.')
				map.moveBotTowards(area, closestOpponent)
			}
		}
		this.price = 10
		this.maxHealth = 10
		this.meleeDamage = 5
		this.intelligence = 'low'
		this.typeName = 'hunter'
		this.description = 'Hunter seeks closest opponent to rumble with.'
	}
	
	function Zipper() {
		this.takeTurn = function(bot, map, team) {
			var area = map.findAreaWhereBotIs(bot)
			var opponentAreas = map.findOpponents(team)
			var closestOpponent = area.findClosest(opponentAreas)
			if (area.calculateDistance(closestOpponent) <= this.range) 
				closestOpponent.robot.receiveDamage('Zipper', this.rangedDamage, map)
			else {
				BattleLog.add('Zipper moves towards enemy.')
				map.moveBotTowards(area, closestOpponent)
			}
		}
		this.price = 10
		this.maxHealth = 5
		this.rangedDamage = 3
		this.range = 3
		this.intelligence = 'low'
		this.typeName = 'zipper'
		this.description = 'Zipper prefers to attack opponent from range but will not retreat from close combat either.'
	}
	
	function Sniper() {
		this.takeTurn = function(bot, map, team) {
			var area = map.findAreaWhereBotIs(bot)
			var opponentAreas = map.findOpponents(team)
			var closestOpponent = area.findClosest(opponentAreas)
			var distance = area.calculateDistance(closestOpponent)
			if (distance < 2) {
				if (map.moveBotAway(area, closestOpponent)) BattleLog.add('Sniper moves away from the enemy')
			} else if (distance <= this.range) {
				closestOpponent.robot.receiveDamage('Sniper', this.rangedDamage, map)
			} else {
				BattleLog.add('Sniper moves towards enemy.')
				map.moveBotTowards(area, closestOpponent)
			}
		}
		this.price = 25
		this.maxHealth = 7
		this.rangedDamage = 4
		this.range = 10
		this.intelligence = 'medium'
		this.typeName = 'sniper'
		this.description = 'Sniper can pick opponent from afar but is unable to attack opponent in melee and thus attempts to retreat.'
	}
	
	function Box() {
		this.takeTurn = function() {
			BattleLog.add('Box does nothing.')
		}
		this.typeName = 'box'
		this.price = 0
		this.maxHealth = 5
		this.intelligence = 'none'
		this.description = 'It`s a box. A box bot'
	}
	
	function Crate() {
		this.takeTurn = function() {
			BattleLog.add('Crate does nothing.')
		}
		this.typeName = 'crate'
		this.price = 5
		this.maxHealth = 30
		this.intelligence = 'none'
		this.description = 'A tough box'
	}
	
	function Medic() {
		this.takeTurn = function(bot, map, team) {
			var area = map.findAreaWhereBotIs(bot)
			var injuredAreas = map.findInjuredAllies(team, bot)
			if (injuredAreas.length > 0) {
				var closestInjured = area.findClosest(injuredAreas)
				if (area.calculateDistance(closestInjured) < 2) closestInjured.robot.receiveHealing('Medic', this.heal)
				else {
					map.moveBotTowards(area, closestInjured)
					BattleLog.add('Medic moves towards injured ally')
				}
			} else BattleLog.add('Medic does nothing.')
		}
		this.price = 12
		this.heal = 4
		this.maxHealth = 8
		this.intelligence = 'low'
		this.typeName = 'medic'
		this.description = 'Medic tries to help the closest injured ally.'
	}
	
	function Totter() {
		this.takeTurn = function(bot, map) {
			var area = map.findAreaWhereBotIs(bot)
			var areasNear = map.findAreasCloseToArea(area)
			var areaToMove = areasNear[Math.floor(Math.random() * areasNear.length)]
			if (areaToMove.robot) {
				bot.receiveDamage('self', this.meleeDamage)
				areaToMove.robot.receiveDamage('Totter', this.meleeDamage, map)
			} else if (areaToMove.isWall) {
				bot.receiveDamage('Wall', this.meleeDamage)
			} else {
				BattleLog.add('Totter randomly tots around')
				map.moveBot(area, areaToMove)
			}
		}
		this.price = 1
		this.maxHealth = 9
		this.meleeDamage = 8
		this.intelligence = 'insane'
		this.typeName = 'totter'
		this.description = 'Totter tots around randomly until hitting obstacle, damaging itself and the target greatly in the process'
	}
	
	function Radiator() {
		this.radiateDamage = function(map, area, bot) {
			var areasNear = map.findAreasCloseToArea(area)
			angular.forEach(areasNear, function(areaNear) {
				if (areaNear.robot) areaNear.robot.receiveDamage('Radiator', bot.type.radiationDamage, map)
			})
		}
		this.takeTurn = function(bot, map, team) {
			var area = map.findAreaWhereBotIs(bot)
			var opponentAreas = map.findOpponents(team)
			var closestOpponent = area.findClosest(opponentAreas)
			if (area.calculateDistance(closestOpponent) < 2) {
				this.radiateDamage(map, area, bot)
			} else {
				BattleLog.add('Radiator moves towards enemy.')
				map.moveBotTowards(area, closestOpponent)
			}
		}
		this.price = 10
		this.maxHealth = 9
		this.radiationDamage = 4
		this.intelligence = 'low'
		this.typeName = 'radiator'
		this.description = 'Radiator seeks out enemies and inflicts damage to all the robots surrounding itself.'
	}
	
	function Cannoneer() {
		this.inflictDamage = function(map, area, bot) {
			var areasNear = map.findAreasCloseToArea(area)
			areasNear.push(area)
			angular.forEach(areasNear, function(areaNear) {
				if (areaNear.robot) areaNear.robot.receiveDamage('Cannoneer', bot.type.explosiveDamage, map)
			})
		}
		this.takeTurn = function(bot, map, team) {
			var area = map.findAreaWhereBotIs(bot)
			var opponentAreas = map.findOpponents(team)
			var closestOpponent = area.findClosest(opponentAreas)
			if (area.calculateDistance(closestOpponent) < this.range) {
				this.inflictDamage(map, closestOpponent, bot)
			}
		}
		this.price = 12
		this.maxHealth = 12
		this.explosiveDamage = 1
		this.range = 8
		this.intelligence = 'low'
		this.typeName = 'cannoneer'
		this.description = 'While unable to move, Cannoneer strikes opponents from afar damaging it and all the surrounding targets'
	}
	
	function Psycho() {
		this.takeTurn = function(bot, map, team) {
			var area = map.findAreaWhereBotIs(bot)
			var botAreas = map.findAreasWithOtherBots(bot, false)
			var target = _.find(botAreas, function(botArea) {
				return map.areaCanbeReachedInStraightLine(area, botArea) && !map.anythingBetweenAreas(area, botArea)
			})
			if (target && !target.robot.destroyed) {
				while (area.calculateDistance(target) > 1) {
					map.moveBotTowardsInStraightLine(area, target)
					area = map.findAreaWhereBotIs(bot)
				}
				BattleLog.add('Psycho rams its target')
				target.robot.receiveDamage('Psycho', this.meleeDamage, map)
			} else {
				BattleLog.add('Psycho did not find suitable target to destroy.')
			}
		}
		this.price = 20
		this.maxHealth = 15
		this.meleeDamage = 10
		this.intelligence = 'insane'
		this.typeName = 'psycho'
		this.description = 'Psycho will attack any robot that enters its radar in diagonal or horizontal line'
	}
	
	function Multiplicator() {
		this.reduceLifeSpan = function(bot, map, team) {
			this.lifeSpan -= 1 
			if (this.lifeSpan < 1) {
				BattleLog.add('Multiplicator expires after having existed a rich full life')
				team.removeBot(bot)
				map.findAreaWhereBotIs(bot).robot = undefined
				GameHandler.getGameState().removeBotFromQueue(bot)
			}
			return this.lifeSpan > 0
		}
		
		this.takeTurn = function(bot, map, team) {
			if (!this.reduceLifeSpan(bot, map, team)) {
				return
			}
			var area = map.findAreaWhereBotIs(bot)
			var opponentAreas = map.findOpponents(team)
			var closestOpponent = area.findClosest(opponentAreas)
			if (area.calculateDistance(closestOpponent) < 2) 
				closestOpponent.robot.receiveDamage('Multiplicator', this.meleeDamage, map)
			else {
				var botClone = new Robot(_.find(getTypesAsObjects(), function(typeAsObject) { return bot.type.typeName === typeAsObject.typeName}))
				if (map.moveBotTowards(area, closestOpponent)) {
					BattleLog.add('Multiplicator moves towards enemy and leaves a clone behind.')
					area.robot = botClone
					team.addBot(botClone)
					GameHandler.getGameState().addBotToQueue(botClone)
				}
			}
		}
		this.price = 20
		this.maxHealth = 1
		this.meleeDamage = 1
		this.intelligence = 'low'
		this.lifeSpan = 3
		this.typeName = 'multiplicator'
		this.description = 'Multiplicator will move itself towards closest opponent leaving a fresh clone on the previous spot. Due to short life span, Multiplicator will vanish after the battle.'
	}
	
	function Hacker() {
		this.takeTurn = function(bot, map, team) {
			var area = map.findAreaWhereBotIs(bot)
			var opponentAreas = map.findOpponents(team)
			var closestOpponent = area.findClosest(opponentAreas)
			if (area.calculateDistance(closestOpponent) < 2) {
				BattleLog.add('Hacker hacks enemy')
				var target = closestOpponent.robot
				target.team.removeBot(target)
				target.team = this.team
				target.hacked = !target.hacked
				team.addBot(target)
			} else {
				BattleLog.add('Hacker moves towards enemy.')
				map.moveBotTowards(area, closestOpponent)
			}
		}
		this.price = 25
		this.maxHealth = 6
		this.intelligence = 'high'
		this.typeName = 'hacker'
		this.description = 'Hacker turns enemies to allies until end of combat.'
	}
	
	function Destructor() {
		this.takeTurn = function(bot, map, team) {
			var area = map.findAreaWhereBotIs(bot)
			var opponentAreas = map.findOpponents(team)
			var closestOpponent = area.findClosest(opponentAreas)
			if (area.calculateDistance(closestOpponent) < 2) 
				closestOpponent.robot.receiveDamage('Destructor', this.meleeDamage, map)
			else {
				BattleLog.add('Hunter moves towards enemy.')
				map.moveBotTowards(area, closestOpponent)
			}
		}
		this.price = 40
		this.maxHealth = 30
		this.meleeDamage = 15
		this.intelligence = 'low'
		this.typeName = 'destructor'
		this.description = 'Desctructor crushes its opponents with devastating blows.'
	}
	
	function Robot(type) {
		this.takeTurn = function(map) {
			if (this.stunned < 1) {
				this.type.takeTurn(this, map, this.team)
			} else {
				BattleLog.add(this.type.typeName + ' is stunned and skips the turn')
				this.stunned -= 1
				if (this.type.typeName == 'multiplicator') {
					this.type.reduceLifeSpan(this, map, this.team)
				}
			}
		}
		this.setTeam = function(team) {
			this.team = team
		}
		this.getTypeClass = function() {
			var postfix = this.team.isEnemy ? '_enemy' : ''
			return this.type.typeName + postfix
		}
		this.receiveDamage = function(source, damage, map) {
			this.currentHealth = Math.max(0, (this.currentHealth - damage))
			BattleLog.add(this.type.typeName + ' receives ' + damage + ' damage from ' + source) 
			if (this.currentHealth <= 0) {
				BattleLog.add(this.type.typeName + ' is destroyed')
				if (this.type.typeName === 'multiplicator') {
					map.findAreaWhereBotIs(this).robot = undefined
					this.team.removeBot(this)
					GameHandler.getGameState().removeBotFromQueue(this)
				} else {
					this.destroyed = true
				}
			}
		}
		this.receiveHealing = function(source, heal) {
			this.destroyed = false
			this.currentHealth = Math.min(this.type.maxHealth, (this.currentHealth + heal))
			BattleLog.add(source + ' heals ' + this.type.typeName + ' for ' + heal + ' health')
		}
		this.isInjured = function() {
			return this.currentHealth < this.type.maxHealth
		}
		this.calculatePercentageOfHealth = function() {
			return Math.round((this.currentHealth / this.type.maxHealth) * 100)
		}
		this.stun = function(stunTime) {
			this.stunned = stunTime
		}
		this.cleanEffects = function() {
			this.stunned = 0
		}
		this.stunned = 0
		this.type = type;
		this.destroyed = false;
		this.currentHealth = this.type.maxHealth
	}
	
	var getTypesAsObjects = function() {
			return _.map(types, function(type) { return new type()})
		}
	
	return {
		createRobot : function(type) {
			return new Robot(type)
		},
		getTypes : function() {
			return types
		},
		getTypesAsObjects: getTypesAsObjects
	}
}])