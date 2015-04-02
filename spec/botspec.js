'use strict'

describe('Testing bots', function() {
	
	var robotService
	
	beforeEach(module('Tribetron'))
	
	beforeEach(inject(function(Robot) {
		robotService = Robot
	}))
	
	it('robot should be defined', function() {
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

})