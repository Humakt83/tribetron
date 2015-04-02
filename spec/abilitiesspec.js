'use strict'

describe('Testing abilities', function() {
	
	var abilitiesService, robotService
	
	beforeEach(module('Tribetron'))
	
	beforeEach(inject(function(Abilities, Robot) {
		abilitiesService = Abilities
		robotService = Robot
	}))
	
	it('service should be defined', function() {
		expect(abilitiesService).toBeDefined()
	})
	
	it('service returns an array of abilities', function() {
		expect(abilitiesService.getAbilities().length).toBeGreaterThan(0)
	})
	
	it('returns an ability by name', function() {
		expect(abilitiesService.getAbilityByName('Teleport')).toBeDefined()
	})
	
	it('all abilities have name and level requirement', function() {
		angular.forEach(abilitiesService.getAbilities(), function(ability) {
			expect(ability.name).toBeDefined()
			expect(ability.levelRequirement).toBeGreaterThan(0)
		})
	})
	
	it('returns whether an attack would destroy a bot', function() {
		var bot = robotService.createRobot(new (robotService.getTypes()[0]))
		expect(abilitiesService.wouldAttackDestroyBot(bot)).toBeFalsy()
		bot.currentHealth = 1
		expect(abilitiesService.wouldAttackDestroyBot(bot)).toBeTruthy()
	})
	
})