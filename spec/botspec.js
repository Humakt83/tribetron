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
		
		var createTeamWithRobotAndPlaceOnMap = function(isEnemy, x, y) {
			var hunter = robotService.createRobotUsingTypeName('hunter')
			map.tryToPlaceRobot(hunter, mapService.createCoord(x,y))
			team.createTeam('name', [hunter], isEnemy)
			return hunter
		}
		
		var calculateDistanceBetweenBots = function(bot, enemyBot) {
			return map.findAreaWhereBotIs(bot).calculateDistance(map.findAreaWhereBotIs(enemyBot))
		}
		
		it('moves towards enemy', function() {
			var hunter = createTeamWithRobotAndPlaceOnMap(false, 1, 1)
			var enemy = createTeamWithRobotAndPlaceOnMap(true, 5, 1)
			expect(calculateDistanceBetweenBots(hunter, enemy)).toEqual(4)
			hunter.takeTurn(map)
			expect(calculateDistanceBetweenBots(hunter, enemy)).toEqual(3)
		})
		
		it('attacks enemy next to it', function() {
			var hunter = createTeamWithRobotAndPlaceOnMap(false, 1, 1)
			var enemy = createTeamWithRobotAndPlaceOnMap(true, 1, 2)
			expect(enemy.currentHealth).toEqual(enemy.type.maxHealth)
			hunter.takeTurn(map)
			expect(enemy.currentHealth).toBeLessThan(enemy.type.maxHealth)
		})
	})
})