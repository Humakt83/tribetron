'use strict'

describe('Testing bots', function() {
	
	var robotService, log, map, team, mapService
	
	beforeEach(module('Tribetron'))
	
	beforeEach(inject(function(Robot, BattleLog, AreaMap, Team) {
		robotService = Robot
		log = BattleLog.getLog()
		log.reset()
		map = AreaMap.createMap(10, 10)
		mapService = AreaMap
		team = Team
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