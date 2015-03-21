'use strict'

angular.module('Tribetron').factory('Robot', ['$interval', 'BattleLog', 'GameHandler', 'GameSettings', function($interval, BattleLog, GameHandler, GameSettings) {
	var types = [Hunter, Box, Medic, Totter, Radiator, Psycho, Crate, Zipper, Multiplicator, Cannoneer, 
				Sniper, Hacker, Destructor, Trasher, PsychoMedic, HotTot, MegaHunter, Titan, Tauron, Colossus,
				CombinatorAtomitum, CombinatorPlutan]
	
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
		this.levelRequirement = 1
		this.price = 10
		this.maxHealth = 10
		this.meleeDamage = 5
		this.intelligence = 'low'
		this.typeName = 'hunter'
		this.description = 'Hunter seeks closest opponent to rumble with.'
	}
	
	function MegaHunter() {
		this.takeTurn = function(bot, map, team) {
			var area = map.findAreaWhereBotIs(bot)
			var opponentAreas = map.findOpponents(team)
			var closestOpponent = area.findClosest(opponentAreas)
			if (area.calculateDistance(closestOpponent) < 2) 
				closestOpponent.robot.receiveDamage('MegaHunter', this.meleeDamage, map)
			else {
				BattleLog.add('MegaHunter moves towards enemy.')
				map.moveBotTowardsUsingFinder(area, closestOpponent)
			}
		}
		this.destroyEffect = function(bot, map, team) {
			var botArea = map.findAreaWhereBotIs(bot)
			var areas = map.findAreasCloseToArea(botArea)
			botArea.setRobot()
			team.removeBot(bot)
			areas.push(botArea)
			GameHandler.getGameState().removeBotFromQueue(bot)
			angular.forEach(areas, function(area) {
				if (map.botCanBePlacedOnArea(area)) {
					var hunter = new Robot(new Hunter())
					team.addBot(hunter)
					area.setRobot(hunter)
					GameHandler.getGameState().addBotToQueue(hunter)
				}
			})
		}
		this.levelRequirement = 5
		this.price = 50
		this.maxHealth = 30
		this.meleeDamage = 15
		this.intelligence = 'medium'
		this.typeName = 'megaHunter'
		this.description = 'MegaHunter is three times as strong as Hunter and upon destruction will split into them.'
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
		this.levelRequirement = 1
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
				map.moveBotTowardsUsingFinder(area, closestOpponent)
			}
		}
		this.levelRequirement = 3
		this.price = 30
		this.maxHealth = 7
		this.rangedDamage = 4
		this.range = 7
		this.intelligence = 'medium'
		this.typeName = 'sniper'
		this.description = 'Sniper can pick opponent from afar but is unable to attack opponent in melee and thus attempts to retreat.'
	}
	
	function Box() {
		this.takeTurn = function() {
			BattleLog.add('Box does nothing.')
		}
		this.levelRequirement = 1
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
		this.levelRequirement = 2
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
					map.moveBotTowardsUsingFinder(area, closestInjured)
					BattleLog.add('Medic moves towards injured ally')
				}
			} else BattleLog.add('Medic does nothing.')
		}
		this.levelRequirement = 2
		this.price = 12
		this.heal = 4
		this.maxHealth = 8
		this.intelligence = 'medium'
		this.typeName = 'medic'
		this.description = 'Medic tries to help the closest injured ally.'
	}
	
	function Totter() {
		this.takeTurn = function(bot, map) {
			var area = map.findAreaWhereBotIs(bot)
			var areasNear = map.findAreasCloseToArea(area)
			var areaToMove = areasNear[Math.floor(Math.random() * areasNear.length)]
			if (areaToMove.robot != undefined && areaToMove.robot != null) {
				bot.receiveDamage('self', this.meleeDamage, map)
				areaToMove.robot.receiveDamage('Totter', this.meleeDamage, map)
			} else if (areaToMove.isWall) {
				bot.receiveDamage('Wall', this.meleeDamage, map)
			} else {
				BattleLog.add('Totter randomly tots around')
				map.moveBot(area, areaToMove)
			}
		}
		this.destroyEffect = function(bot, map, team) {
			var area = map.findAreaWhereBotIs(bot)
			var areasNear = map.findAreasCloseToArea(area)
			area.setRobot()
			area.setExplosion()
			angular.forEach(areasNear, function(areaNear) {
				if (areaNear.robot) areaNear.robot.receiveDamage('Totter', bot.type.meleeDamage, map)
			})			
			team.removeBot(bot)
			GameHandler.getGameState().removeBotFromQueue(bot)
		}
		this.levelRequirement = 1
		this.price = 1
		this.maxHealth = 9
		this.meleeDamage = 8
		this.intelligence = 'insane'
		this.typeName = 'totter'
		this.description = 'Totter tots around randomly until hitting obstacle, damaging itself and the target greatly in the process. Will explode when destroyed damaging surrounding bots.'
	}
	
	function HotTot() {
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
				BattleLog.add('Hottot rams its target')
				target.robot.receiveDamage('Hottot', this.meleeDamage, map)
			} else {
				BattleLog.add('Hottot did not find suitable target to destroy.')
			}
		}
		this.destroyEffect = function(bot, map, team) {
			var botArea = map.findAreaWhereBotIs(bot)
			var areas = map.findAreasCloseToArea(botArea)
			botArea.setRobot()
			botArea.setExplosion()
			team.removeBot(bot)
			areas.push(botArea)
			GameHandler.getGameState().removeBotFromQueue(bot)
			angular.forEach(areas, function(area) {
				if (map.botCanBePlacedOnArea(area)) {
					var totter = new Robot(new Totter())
					team.addBot(totter)
					area.setRobot(totter)
					GameHandler.getGameState().addBotToQueue(totter)
				}
			})
		}
		this.levelRequirement = 3
		this.price = 27
		this.maxHealth = 14
		this.meleeDamage = 9
		this.intelligence = 'insane'
		this.typeName = 'hottot'
		this.description = 'Hottot is like a Psycho, but will create Totters when destroyed.'
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
		this.levelRequirement = 1
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
		this.levelRequirement = 2
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
		this.levelRequirement = 2
		this.price = 20
		this.maxHealth = 15
		this.meleeDamage = 10
		this.intelligence = 'insane'
		this.typeName = 'psycho'
		this.description = 'Psycho will attack any robot that enters its radar in diagonal or horizontal line'
	}
	
	function PsychoMedic() {
		this.psychoTurn = function(bot, map, team) {
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
				BattleLog.add('Psycho-medic rams its target')
				target.robot.receiveDamage('Psycho-medic', this.meleeDamage, map)
			} else {
				BattleLog.add('Psycho-medic did not find suitable target to destroy.')
			}
		}
		this.medicTurn = function(bot, map, team) {
			var area = map.findAreaWhereBotIs(bot)
			var injuredAreas = map.findInjuredAllies(team, bot)
			if (injuredAreas.length > 0) {
				var closestInjured = area.findClosest(injuredAreas)
				if (area.calculateDistance(closestInjured) < 2) closestInjured.robot.receiveHealing('Psycho-medic', this.heal)
				else {
					map.moveBotTowardsUsingFinder(area, closestInjured)
					BattleLog.add('Psycho-medic moves towards injured ally')
				}
			} else BattleLog.add('Psycho-medic does nothing.')
		}
		this.takeTurn = function(bot, map, team) {
			this.psychoMode = this.psychoMode || Math.floor(Math.random() * 10) == 0
			if (this.psychoMode) this.psychoTurn(bot, map, team)
			else this.medicTurn(bot, map, team)
		}
		this.levelRequirement = 3
		this.price = 21
		this.maxHealth = 14
		this.meleeDamage = 9
		this.heal = 11
		this.intelligence = 'insane'
		this.typeName = 'psycho-medic'
		this.description = 'Psycho-medic will act like a normal medic, but there is a 10% chance for the medic to go berserk each turn.'
	}
	
	function Tauron() {
		this.takeTurn = function(bot, map, team) {
			var area = map.findAreaWhereBotIs(bot)
			var opponentAreas = map.findOpponents(bot.team, false)
			var target = _.find(opponentAreas, function(botArea) {
				return map.areaCanbeReachedInStraightLine(area, botArea) && !map.anythingBetweenAreas(area, botArea)
			})
			if (target && !target.robot.destroyed) {
				while (area.calculateDistance(target) > 1) {
					map.moveBotTowardsInStraightLine(area, target)
					area = map.findAreaWhereBotIs(bot)
				}
				BattleLog.add('Tauron rams its target')
				target.robot.receiveDamage('Tauron', this.meleeDamage, map)
			} else {
				var closestOpponent = area.findClosest(opponentAreas)
				BattleLog.add('Tauron moves towards enemy.')
				map.moveBotTowards(area, closestOpponent)
			}
		}
		this.levelRequirement = 3
		this.price = 30
		this.maxHealth = 25
		this.meleeDamage = 15
		this.intelligence = 'low'
		this.typeName = 'tauron'
		this.description = 'Tauron will charge towards enemy dealing massive damage'
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
		this.destroyEffect = function(bot, map, team) {
			map.findAreaWhereBotIs(bot).setRobot()
			team.removeBot(bot)
			GameHandler.getGameState().removeBotFromQueue(bot)
		}
		this.levelRequirement = 4
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
			} else if (area.calculateDistance(closestOpponent) == 2 && !closestOpponent.robot.range && closestOpponent.robot.meleeDamage ) {
				BattleLog.add('Hacker waits for enemy to close in')
			} else {
				BattleLog.add('Hacker moves towards enemy.')
				map.moveBotTowardsUsingFinder(area, closestOpponent, true)
			}
		}
		this.levelRequirement = 4
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
				BattleLog.add('Destructor moves towards enemy.')
				map.moveBotTowards(area, closestOpponent)
			}
		}
		this.levelRequirement = 5
		this.price = 40
		this.maxHealth = 36
		this.meleeDamage = 18
		this.intelligence = 'low'
		this.typeName = 'destructor'
		this.description = 'Desctructor crushes its opponents with devastating blows.'
	}
	
	function Trasher() {
		this.takeTurn = function(bot, map, team) {
			var area = map.findAreaWhereBotIs(bot)
			var opponentAreas = map.findOpponents(team, true)
			var closestOpponent = area.findClosest(opponentAreas)
			if (area.calculateDistance(closestOpponent) < 2) {
				if (closestOpponent.robot.destroyed) {
					BattleLog.add('Trasher cleans up enemy wreckage')
					closestOpponent.robot.team.removeBot(closestOpponent.robot)
					closestOpponent.setRobot()
				} else closestOpponent.robot.receiveDamage('Trasher', this.meleeDamage, map)
			} else {
				BattleLog.add('Trasher moves towards enemy.')
				map.moveBotTowards(area, closestOpponent)
			}
		}
		this.levelRequirement = 3
		this.price = 20
		this.maxHealth = 20
		this.meleeDamage = 8
		this.intelligence = 'low'
		this.typeName = 'trasher'
		this.description = 'Trasher is a tough bot which cleans up enemy wrecks or makes more of them.'
	}
	
	function Titan() {
		this.takeTurn = function(bot, map, team) {
			var area = map.findAreaWhereBotIs(bot)
			var opponentAreas = map.findOpponents(team)
			var closestOpponent = area.findClosest(opponentAreas)
			var distance = area.calculateDistance(closestOpponent)
			if (distance <= this.range) { 
				closestOpponent.robot.receiveDamage('Titan', distance < 2 ? this.meleeDamage : this.rangedDamage, map)
			} else {
				BattleLog.add('Titan moves towards enemy.')
				map.moveBotTowardsUsingFinder(area, closestOpponent, false)
			}
		}
		this.levelRequirement = 6
		this.price = 120
		this.maxHealth = 50
		this.rangedDamage = 15
		this.meleeDamage = 22
		this.range = 5
		this.intelligence = 'medium'
		this.typeName = 'titan'
		this.description = 'Titan delivers massive damage from range and even more at melee combat.'
	}
	
	function Colossus() {
		this.takeTurn = function(bot, map, team) {
			var area = map.findAreaWhereBotIs(bot)
			var opponentAreas = map.findOpponents(team, true)
			var closestOpponent = area.findClosest(opponentAreas)
			if (area.calculateDistance(closestOpponent) < 2) {
				if (closestOpponent.robot.destroyed) {
					BattleLog.add('Colossus crushes enemy under its treadmills')
					closestOpponent.robot.team.removeBot(closestOpponent.robot)
					closestOpponent.setRobot()
					map.moveBot(area, closestOpponent)
				} else closestOpponent.robot.receiveDamage('Colossus', this.meleeDamage, map)
			} else {
				BattleLog.add('Colossus moves towards enemy.')
				map.moveBotTowardsUsingFinder(area, closestOpponent, false)
			}
		}
		this.levelRequirement = 6
		this.price = 150
		this.maxHealth = 75
		this.meleeDamage = 30
		this.intelligence = 'medium'
		this.typeName = 'colossus'
		this.description = 'Colossus crushes any enemy under its treadmills.'
	}
	
	function CombinatorAtomitum() {
		this.takeTurn = function(bot, map, team) {
			var area = map.findAreaWhereBotIs(bot)
			var targets = map.findAreaWithBotByTypeName(new CombinatorPlutan().typeName, team, true)
			if (targets && targets.length > 0) {
				var closestTarget = area.findClosest(targets)
				var distance = area.calculateDistance(closestTarget)
				if (distance < 2) { 
					bot.type = new Colossus() //for now
					bot.resetHealth()
					team.removeBot(closestTarget.robot)
					GameHandler.getGameState().removeBotFromQueue(closestTarget.robot)
					closestTarget.setRobot()
				} else {
					BattleLog.add('Atomitum moves towards Plutan.')
					map.moveBotTowardsUsingFinder(area, closestTarget, false)
				}
			} else BattleLog.add('Atomitum finds no suitable targets to combine with')
		}
		this.levelRequirement = 4
		this.price = 30
		this.maxHealth = 20
		this.intelligence = 'medium'
		this.typeName = 'atomitum'
		this.description = 'Atomitum tries to reach its other half, Plutan, and combine with it into Colossus.'
	}
	
	function CombinatorPlutan() {
		this.takeTurn = function(bot, map, team) {
			var area = map.findAreaWhereBotIs(bot)
			var targets = map.findAreaWithBotByTypeName(new CombinatorAtomitum().typeName, team, true)
			if (targets && targets.length > 0) {
				var closestTarget = area.findClosest(targets)
				var distance = area.calculateDistance(closestTarget)
				if (distance < 2) { 
					bot.type = new Colossus() //for now
					bot.resetHealth()
					team.removeBot(closestTarget.robot)
					GameHandler.getGameState().removeBotFromQueue(closestTarget.robot)
					closestTarget.setRobot()
				} else {
					BattleLog.add('Plutan moves towards Atomitum.')
					map.moveBotTowardsUsingFinder(area, closestTarget, false)
				}
			} else BattleLog.add('Plutan finds no suitable targets to combine with')
		}
		this.levelRequirement = 4
		this.price = 32
		this.maxHealth = 22
		this.intelligence = 'medium'
		this.typeName = 'plutan'
		this.description = 'Plutan tries to reach its other half, Atomitum, and combine with it into Colossus.'
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
			if (this.destroyed) return
			this.currentHealth = Math.max(0, (this.currentHealth - damage))
			BattleLog.add(this.type.typeName + ' receives ' + damage + ' damage from ' + source) 
			if (this.currentHealth <= 0) {
				BattleLog.add(this.type.typeName + ' is destroyed')
				this.destroyed = true
				if (this.type.destroyEffect) this.type.destroyEffect(this, map, this.team)
			}
			this.damaged = damage
			var thisRobot = this
			$interval(function() {
				thisRobot.damaged--		
			}, 50 * GameSettings.getGameSpeed(), damage)
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
		this.resetHealth = function() {
			this.currentHealth = this.type.maxHealth
		}
		this.stunned = 0
		this.type = type;
		this.destroyed = false;
		this.currentHealth = this.type.maxHealth
		this.damaged = 0
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