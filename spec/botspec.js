'use strict'

describe('Testing bots', function() {
	
	var robotService, log, map, team, mapService, gameHandler
	
	beforeEach(module('Tribetron'))
	
	beforeEach(inject(function(Robot, BattleLog, AreaMap, Team, GameHandler) {
		robotService = Robot
		log = BattleLog.getLog()
		log.reset()
		map = AreaMap.createMap(12, 12)
		mapService = AreaMap
		team = Team
		gameHandler = GameHandler
	}))
	
	it('service should be defined', function() {
		expect(robotService).toBeDefined()
	})
	
	it('service returns array of robot types', function() {
		expect(robotService.getTypes().length).toBeGreaterThan(0)
	})
	
	it('bot types have maxHealth, description, level requirement and price attributes', function() {
		angular.forEach(robotService.getTypes(), function(botType) {
			expect(new botType().maxHealth).toBeDefined()
			expect(new botType().price).toBeDefined()
			expect(new botType().description).toBeDefined()
			expect(new botType().levelRequirement).toBeDefined()
		})
	})
	
	it('returns details of given bot type', function() {
		var details = robotService.getDetails(new (robotService.getTypes()[0])())
		expect(details.length).toBeGreaterThan(0)
		expect(details).toContain('levelRequirement: 1')
	})
	
	it('creates robot with type', function() {
		var type = robotService.getTypes()[0]
		var bot = robotService.createRobot(new type())
		expect(bot).toBeDefined()
		expect(bot.currentHealth).toBeDefined()
		expect(bot.type).toBeDefined()
	})
	
	it('robot is destroyed if it receives more damage than its current health', function() {
		var bot = robotService.createRobot(new (robotService.getTypes()[1])())
		expect(bot.destroyed).toBeFalsy()
		expect(bot.currentHealth).toEqual(bot.type.maxHealth)
		bot.receiveDamage('test', 900)
		expect(bot.destroyed).toBeTruthy()
		expect(bot.currentHealth).toEqual(0)
	})
	
	it('destroyed robot will be undestroyed if it receives healing', function() {
		var bot = robotService.createRobot(new (robotService.getTypes()[1])())
		bot.receiveDamage('test', 900)
		expect(bot.destroyed).toBeTruthy()
		bot.receiveHealing('test', 2)
		expect(bot.destroyed).toBeFalsy()
		expect(bot.currentHealth).toEqual(2)
	})
	
	describe('Box', function() {
		
		it('does nothing', function() {
			robotService.createRobotUsingTypeName('box').takeTurn()
			expect(log.log[0]).toEqual('Box does nothing.\n')
		})
		
	})
	
	describe('Crate', function() {
		
		it('does nothing', function() {
			robotService.createRobotUsingTypeName('crate').takeTurn()
			expect(log.log[0]).toEqual('Crate does nothing.\n')
		})
		
	})
	
	describe('Hunter', function() {
	
		it('moves towards enemy', function() {
			var hunter = createTeamWithRobotAndPlaceOnMap('hunter', false, 1, 1)
			var enemy = createTeamWithRobotAndPlaceOnMap('hunter', true, 5, 1)
			expect(calculateDistanceBetweenBots(hunter, enemy)).toEqual(4)
			hunter.takeTurn(map)
			expect(calculateDistanceBetweenBots(hunter, enemy)).toEqual(3)
		})
		
		it('attacks enemy next to it', function() {
			var hunter = createTeamWithRobotAndPlaceOnMap('hunter', false, 1, 1)
			var enemy = createTeamWithRobotAndPlaceOnMap('hunter', true, 1, 2)
			expect(enemy.currentHealth).toEqual(enemy.type.maxHealth)
			hunter.takeTurn(map)
			expect(enemy.currentHealth).toBeLessThan(enemy.type.maxHealth)
		})
	})
	
	describe('Psycho', function() {
	
		it('charges enemy bot on the same line', function() {
			var psycho = createTeamWithRobotAndPlaceOnMap('psycho', false, 1, 1)
			var enemy = createTeamWithRobotAndPlaceOnMap('hunter', true, 1, 6)
			psycho.takeTurn(map)
			expect(enemy.currentHealth).toBeLessThan(enemy.type.maxHealth)
		})
		
		it('charges ally on the same line', function() {
			var psycho = createTeamWithRobotAndPlaceOnMap('psycho', false, 1, 1)
			var ally = createTeamWithRobotAndPlaceOnMap('box', false, 6, 1)
			psycho.takeTurn(map)
			expect(ally.currentHealth).toBeLessThan(ally.type.maxHealth)
		})
		
		it('does nothing when there is no target on the same line', function() {
			var psycho = createTeamWithRobotAndPlaceOnMap('psycho', false, 1, 1)
			var enemy = createTeamWithRobotAndPlaceOnMap('hunter', true, 6, 2)
			psycho.takeTurn(map)
			expect(enemy.currentHealth).toEqual(enemy.type.maxHealth)
		})
	})
	
	describe('Medic', function() {
		
		it('does nothing when no ally is injured', function() {
			var medic = createTeamWithRobotAndPlaceOnMap('medic', false, 1, 1)
			medic.takeTurn(map)
			expect(log.log[0]).toEqual('Medic does nothing.\n')
		})
		
		it('moves towards injured ally', function() {
			var medic = createTeamWithRobotAndPlaceOnMap('medic', false, 1, 1)
			var ally = createRobotIntoTeamAndPlaceOnMap('hunter', medic.team, 1, 4)
			expect(calculateDistanceBetweenBots(medic, ally)).toEqual(3)
			ally.receiveDamage('test', 3)
			medic.takeTurn(map)
			expect(calculateDistanceBetweenBots(medic, ally)).toEqual(2)
		})
		
		it('heals injured ally', function() {
			var medic = createTeamWithRobotAndPlaceOnMap('medic', false, 1, 1)
			var ally = createRobotIntoTeamAndPlaceOnMap('box', medic.team, 1, 2)
			ally.receiveDamage('test', 2)
			expect(ally.currentHealth).not.toEqual(ally.type.maxHealth)
			medic.takeTurn(map)
			expect(ally.currentHealth).toEqual(ally.type.maxHealth)
		})
		
		it('revives destroyed ally', function() {
			var medic = createTeamWithRobotAndPlaceOnMap('medic', false, 1, 1)
			var ally = createRobotIntoTeamAndPlaceOnMap('hunter', medic.team, 1, 2)
			ally.receiveDamage('test', 9000)
			expect(ally.destroyed).toBeTruthy()
			medic.takeTurn(map)
			expect(ally.destroyed).toBeFalsy()
		})
		
	})
	
	describe('Lazor', function() {
	
		it('attacks enemy bot on the same line', function() {
			var lazor = createTeamWithRobotAndPlaceOnMap('lazor', false, 1, 6)
			var enemy = createTeamWithRobotAndPlaceOnMap('hunter', true, 6, 6)
			lazor.takeTurn(map)
			expect(enemy.currentHealth).toBeLessThan(enemy.type.maxHealth)
		})
		
		it('does damage to multiple enemy bots on the same line', function() {
			var lazor = createTeamWithRobotAndPlaceOnMap('lazor', false, 1, 1)
			var enemy = createTeamWithRobotAndPlaceOnMap('hunter', true, 1, 6)
			var enemy2 = createTeamWithRobotAndPlaceOnMap('crate', true, 1, 4)
			var enemy3 = createTeamWithRobotAndPlaceOnMap('zipper', true, 1, 5)
			lazor.takeTurn(map)
			expect(enemy.currentHealth).toBeLessThan(enemy.type.maxHealth)
			expect(enemy2.currentHealth).toBeLessThan(enemy2.type.maxHealth)
			expect(enemy3.destroyed).toBeTruthy()
		})
		
		it('does damage to allies on the same line as enemy', function() {
			var lazor = createTeamWithRobotAndPlaceOnMap('lazor', false, 1, 1)
			var enemy = createTeamWithRobotAndPlaceOnMap('hunter', true, 1, 6)
			var ally = createRobotIntoTeamAndPlaceOnMap('medic', lazor.team, 1, 4)
			lazor.takeTurn(map)
			expect(enemy.currentHealth).toBeLessThan(enemy.type.maxHealth)
			expect(ally.currentHealth).toBeLessThan(ally.type.maxHealth)
		})
		
		it('moves towards enemy using x-axis', function() {
			var lazor = createTeamWithRobotAndPlaceOnMap('lazor', false, 1, 1)
			var enemy = createTeamWithRobotAndPlaceOnMap('hunter', true, 2, 6)
			lazor.takeTurn(map)
			expect(map.findAreaWhereBotIs(lazor).xCoord).toEqual(2)
			expect(map.findAreaWhereBotIs(lazor).yCoord).toEqual(1)
		})
		
		it('moves towards enemy using y-axis', function() {
			var lazor = createTeamWithRobotAndPlaceOnMap('lazor', false, 1, 6)
			var enemy = createTeamWithRobotAndPlaceOnMap('hunter', true, 6, 3)
			lazor.takeTurn(map)
			expect(map.findAreaWhereBotIs(lazor).xCoord).toEqual(1)
			expect(map.findAreaWhereBotIs(lazor).yCoord).toEqual(5)
		})
	})
	
	describe('Multiplicator', function() {
		
		it('removes itself after enough time has passed', function() {
			var multiplicator = createTeamWithRobotAndPlaceOnMap('multiplicator', false, 1, 1)
			var enemy = createTeamWithRobotAndPlaceOnMap('lazor', true, 1, 2)
			gameHandler.createGameState(multiplicator.team, enemy.team, 25);
			var team = multiplicator.team
			multiplicator.takeTurn(map)
			expect(team.robots.length).toEqual(1)
			multiplicator.takeTurn(map)
			multiplicator.takeTurn(map)
			expect(team.robots.length).toEqual(0)
		})
		
		it('creates a clone of itself when no enemy is close', function() {
			var multiplicator = createTeamWithRobotAndPlaceOnMap('multiplicator', false, 3, 5)			
			var enemy = createTeamWithRobotAndPlaceOnMap('box', true, 1, 2)
			gameHandler.createGameState(multiplicator.team, enemy.team, 25);
			multiplicator.takeTurn(map)
			expect(multiplicator.team.robots.length).toEqual(2)
			multiplicator.takeTurn(map)
			expect(multiplicator.team.robots.length).toEqual(3)
		})
		
		it('deals damage to enemy instead of creating a clone', function() {
			var multiplicator = createTeamWithRobotAndPlaceOnMap('multiplicator', false, 1, 1)
			var enemy = createTeamWithRobotAndPlaceOnMap('box', true, 1, 2)
			multiplicator.takeTurn(map)
			expect(enemy.currentHealth).toBeLessThan(enemy.type.maxHealth)
			expect(multiplicator.team.robots.length).toEqual(1)
		})
		
		it('created clone is created into a spot that is closer to enemy while original remains in the original spot', function() {
			var multiplicator = createTeamWithRobotAndPlaceOnMap('multiplicator', false, 1, 1)
			var enemy = createTeamWithRobotAndPlaceOnMap('lazor', true, 1, 6)
			gameHandler.createGameState(multiplicator.team, enemy.team, 25);
			multiplicator.takeTurn(map)
			expect(multiplicator.type.lifeSpan).toEqual(2)
			expect(multiplicator === map.getAreaByCoord(mapService.createCoord(1,1)).robot).toBeTruthy()
			var clone = map.getAreaByCoord(mapService.createCoord(1,2)).robot
			expect(clone.type.lifeSpan).toEqual(3)			
			clone.takeTurn(map)
			expect(clone.type.lifeSpan).toEqual(2)
			expect(clone === map.getAreaByCoord(mapService.createCoord(1,2)).robot).toBeTruthy()
			expect(map.getAreaByCoord(mapService.createCoord(1,2)).robot.type.typeName).toEqual('multiplicator')
		})
	})
	
	describe('Nuka', function() {
		
		it('moves towards enemy', function() {
			var nuka = createTeamWithRobotAndPlaceOnMap('nuka', false, 1, 1)
			var enemy = createTeamWithRobotAndPlaceOnMap('crate', true, 1, 5)
			nuka.takeTurn(map)				
			expect(map.getAreaByCoord(mapService.createCoord(1,2)).robot).toEqual(nuka)
		})
		
		it('moves towards enemy it can reach', function() {
			var nuka = createTeamWithRobotAndPlaceOnMap('nuka', false, 1, 1)
			var enemy = createTeamWithRobotAndPlaceOnMap('crate', true, 1, 4)
			createRobotIntoTeamAndPlaceOnMap('colossus', enemy.team, 5, 1)
			map.getAreaByCoord(mapService.createCoord(1,3)).isWall = true
			map.getAreaByCoord(mapService.createCoord(1,5)).isWall = true
			map.getAreaByCoord(mapService.createCoord(2,4)).isWall = true
			nuka.takeTurn(map)
			var area = map.findAreaWhereBotIs(nuka)
			expect(area.xCoord).toEqual(2)
			expect(area.yCoord).toEqual(1)
		})
		
		it('explodes when countdown reaches zero', function() {
			var nuka = createTeamWithRobotAndPlaceOnMap('nuka', false, 1, 1)
			var nukasTeam = nuka.team
			var enemy = createTeamWithRobotAndPlaceOnMap('crate', true, 5, 5)
			gameHandler.createGameState(nukasTeam, enemy.team, 25);
			for (var i = nuka.type.turnsToExplode; i > 0; i--) {
				expect(nukasTeam.robots.length).toEqual(1)
				nuka.takeTurn(map)				
			}
			expect(nukasTeam.robots.length).toEqual(0)
		})
		
		it('explodes when destroyed damaging all surrounding bots', function() {
			var nuka = createTeamWithRobotAndPlaceOnMap('nuka', false, 1, 1)
			var ally = createRobotIntoTeamAndPlaceOnMap('medic', nuka.team, 1, 2)
			var allyCrate = createRobotIntoTeamAndPlaceOnMap('crate', nuka.team, 2, 1)
			var allyCrate2 = createRobotIntoTeamAndPlaceOnMap('crate', nuka.team, 1, 5)
			var enemy = createTeamWithRobotAndPlaceOnMap('crate', true, 1, 4)
			var enemyColossus = createRobotIntoTeamAndPlaceOnMap('colossus', enemy.team, 3, 1)
			gameHandler.createGameState(nuka.team, enemy.team, 25);
			nuka.receiveDamage('test', 30, map)
			expect(ally.destroyed).toBeTruthy()
			expect(allyCrate.destroyed).toBeTruthy()
			expect(enemy.destroyed).toBeTruthy()
			expect(allyCrate2.destroyed).toBeFalsy()
			expect(enemyColossus.destroyed).toBeFalsy()
			expect(enemyColossus.currentHealth).toEqual(45)
		})
		
	})
	
	describe('Cannoneer', function() {
		
		it('is unable to move', function() {
			var cannoneer = createTeamWithRobotAndPlaceOnMap('cannoneer', false, 1, 1)
			var enemy = createTeamWithRobotAndPlaceOnMap('crate', true, 10, 10)
			cannoneer.takeTurn(map)
			expect(map.getAreaByCoord(mapService.createCoord(1,1)).robot).toEqual(cannoneer)
			expect(enemy.currentHealth).toEqual(enemy.type.maxHealth)
		})
		
		it('hits cluster of bots', function(){
			var cannoneer = createTeamWithRobotAndPlaceOnMap('cannoneer', false, 1, 1)
			var enemy = createTeamWithRobotAndPlaceOnMap('crate', true, 1, 7)
			var enemy2 = createRobotIntoTeamAndPlaceOnMap('colossus', enemy.team, 1, 6)
			var enemy3 = createRobotIntoTeamAndPlaceOnMap('titan', enemy.team, 2, 6)
			cannoneer.takeTurn(map)
			angular.forEach([enemy, enemy2, enemy3], function(ene) {
				expect(ene.currentHealth).toBeLessThan(ene.type.maxHealth);
			})			
		})
	})
	
	describe('Sniper', function() {
		
		it('attacks enemy from afar', function() {
			var sniper = createTeamWithRobotAndPlaceOnMap('sniper', false, 1, 1)
			var enemy = createTeamWithRobotAndPlaceOnMap('crate', true, 1, 7)
			sniper.takeTurn(map)
			expect(enemy.currentHealth).toBeLessThan(enemy.type.maxHealth)
		})
		
		it('retreats if the enemy is in melee range', function() {	
			var sniper = createTeamWithRobotAndPlaceOnMap('sniper', false, 1, 2)
			var enemy = createTeamWithRobotAndPlaceOnMap('crate', true, 1, 3)
			sniper.takeTurn(map)
			expect(enemy.currentHealth).toEqual(enemy.type.maxHealth)
			expect(map.getAreaByCoord(mapService.createCoord(1,1)).robot).toEqual(sniper)
		})
	})
	
	describe('MegaHunter', function() {
		
		it('moves towards enemy', function() {
			var mega = createTeamWithRobotAndPlaceOnMap('megahunter', false, 1, 1)
			var enemy = createTeamWithRobotAndPlaceOnMap('totter', true, 1, 5)
			mega.takeTurn(map)				
			expect(map.getAreaByCoord(mapService.createCoord(1,2)).robot).toEqual(mega)
		})
		
		it('when defeated will divide into hunters', function() {
			var mega = createTeamWithRobotAndPlaceOnMap('megahunter', false, 2, 2)
			var team = mega.team
			gameHandler.createGameState(team, [], 25);
			mega.receiveDamage('test', 99, map)
			
			expect(map.getAreaByCoord(mapService.createCoord(1,2)).robot.type.typeName).toEqual('hunter')
			expect(map.getAreaByCoord(mapService.createCoord(2,1)).robot.type.typeName).toEqual('hunter')
			expect(map.getAreaByCoord(mapService.createCoord(2,2)).robot.type.typeName).toEqual('hunter')
			expect(map.getAreaByCoord(mapService.createCoord(2,3)).robot.type.typeName).toEqual('hunter')
			expect(map.getAreaByCoord(mapService.createCoord(3,2)).robot.type.typeName).toEqual('hunter')
			expect(team.robots.length).toEqual(5)
		})
		
		it('only places hunters to tiles next to MegaHunter that are free', function() {
			var mega = createTeamWithRobotAndPlaceOnMap('megahunter', false, 2, 2)
			var enemy = createTeamWithRobotAndPlaceOnMap('crate', true, 2, 3)
			map.getAreaByCoord(mapService.createCoord(1,2)).isWall = true
			var team = mega.team
			gameHandler.createGameState(team, [], 25);
			mega.receiveDamage('test', 99, map)
			expect(map.getAreaByCoord(mapService.createCoord(1,2)).robot).toEqual(null)
			expect(map.getAreaByCoord(mapService.createCoord(2,1)).robot.type.typeName).toEqual('hunter')
			expect(map.getAreaByCoord(mapService.createCoord(2,3)).robot.type.typeName).toEqual('crate')
			expect(map.getAreaByCoord(mapService.createCoord(2,2)).robot.type.typeName).toEqual('hunter')
			expect(map.getAreaByCoord(mapService.createCoord(3,2)).robot.type.typeName).toEqual('hunter')
			expect(team.robots.length).toEqual(3)
		})
	})
	
	var createRobotIntoTeamAndPlaceOnMap = function(botTypeName, team, x, y) {
		var bot = robotService.createRobotUsingTypeName(botTypeName)
		map.tryToPlaceRobot(bot, mapService.createCoord(x,y))
		team.addBot(bot)
		return bot
	}
	
	var createTeamWithRobotAndPlaceOnMap = function(botTypeName, isEnemy, x, y) {
		var bot = robotService.createRobotUsingTypeName(botTypeName)
		map.tryToPlaceRobot(bot, mapService.createCoord(x,y))
		team.createTeam('name', [bot], isEnemy)
		return bot
	}
		
	var calculateDistanceBetweenBots = function(bot, enemyBot) {
		return map.findAreaWhereBotIs(bot).calculateDistance(map.findAreaWhereBotIs(enemyBot))
	}
})