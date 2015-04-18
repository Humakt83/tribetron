'use strict'

describe('Testing loot', function() {
	
	var lootService, player
	
	beforeEach(module('Tribetron'))
	
	beforeEach(inject(function(Loot, Player) {
		lootService = Loot
		player = Player.createPlayer('Player', 'Team')
	}))
	
	it('service should be defined', function() {
		expect(lootService).toBeDefined()
	})
	
	it('service returns an array of loot', function() {
		expect(lootService.getLootTypesAsObjects().length).toBeGreaterThan(0)
	})
	
	it('loot types have goal, pickupmessage and names defined', function() {
		angular.forEach(lootService.getLootTypesAsObjects(), function(loot) {
			expect(loot.name).toBeDefined()
			expect(loot.cssName).toBeDefined()
			expect(loot.pickupMessage).toBeDefined()
			expect(loot.goal).toBeDefined()
		})
	})
	
	it('treasure is a goal', function() {
		var treasure = _.find(lootService.getLootTypesAsObjects(), function(loot) { return loot.name === 'Treasure' })
		expect(treasure.goal).toBeTruthy()
	})
	
	it('picking up money increases player´s money', function() {
		var playerMoney = player.money
		var money = _.find(lootService.getLootTypesAsObjects(), function(loot) { return loot.name === 'Money' })
		money.pickup(player)
		expect(player.money).toEqual(playerMoney + money.baseValue)
	})
	
	it('picking up toolkit repairs avatar', function() {
		player.avatar.receiveDamage('test', 5)
		expect(player.avatar.currentHealth).toBeLessThan(player.avatar.type.maxHealth)
		_.find(lootService.getLootTypesAsObjects(), function(loot) { return loot.name === 'Toolkit' }).pickup(player)
		expect(player.avatar.currentHealth).toEqual(player.avatar.type.maxHealth)
	})
	
})