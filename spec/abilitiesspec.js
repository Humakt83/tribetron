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
	
	describe('Cooldown', function() {
		
		var abilityWithCooldown;

		beforeEach(function() {
			abilityWithCooldown = abilitiesService.getAbilityByName('Stun')
		})
		
		it('cooldown timer is at zero initially', function() {
			expect(abilityWithCooldown.cooldownLeft).not.toEqual(abilityWithCooldown.cooldown)
		})
		
		it('using and ability with cooldown sets cooldown', function() {
			abilityWithCooldown.activate('test', robotService.createRobot(new (robotService.getTypes()[0])))
			expect(abilityWithCooldown.cooldownLeft).toEqual(abilityWithCooldown.cooldown)
		})
		
		it('reduces abilities cooldown left value', function() {
			abilityWithCooldown.activate('test', robotService.createRobot(new (robotService.getTypes()[0])))
			abilitiesService.reduceCooldowns()
			expect(abilityWithCooldown.cooldownLeft).toEqual(abilityWithCooldown.cooldown - 1)
		})
		
		it('resets abilities cooldown values', function() {
			abilityWithCooldown.activate('test', robotService.createRobot(new (robotService.getTypes()[0])))
			abilitiesService.reset()
			expect(abilityWithCooldown.cooldownLeft).toEqual(0)
		})
		
	})
	
	describe('Attack', function() {
	
		it('returns whether an attack would destroy a bot', function() {
			var bot = robotService.createRobot(new (robotService.getTypes()[0]))
			expect(abilitiesService.wouldAttackDestroyBot(bot)).toBeFalsy()
			bot.currentHealth = 1
			expect(abilitiesService.wouldAttackDestroyBot(bot)).toBeTruthy()
		})
	})
	
	describe('Stun', function() {
		
		it('stuns the bot', function() {
			var stun = abilitiesService.getAbilityByName('Stun')
			var bot = robotService.createRobot(new (robotService.getTypes()[0]))
			stun.activate('test', bot)
			expect(bot.stunned).toBeGreaterThan(0)
		})
		
	})
	

	
})