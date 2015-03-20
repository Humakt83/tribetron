'use strict'

describe('Testing player', function() {
	
	var playerService
	
	beforeEach(module('Tribetron'))
	
	beforeEach(inject(function(Player) {
		playerService = Player
	}))
	
	it('player should be defined', function() {
		expect(playerService).toBeDefined()
	})
	
	it('creates player with name and team', function() {
		var teamName = 'test-team', playerName = 'testPlayer'
		var player = playerService.createPlayer(playerName, teamName)
		expect(player).toBeDefined()
		expect(player.team.name).toEqual(teamName)
		expect(player.name).toEqual(playerName)
	})
	
	it('levels up player', function() {
		var player = playerService.createPlayer('Teppo', 'Testaaja')
		expect(player.level).toEqual(1)
		player.levelUp()
		expect(player.level).toEqual(2)
		player.levelUp()
		player.levelUp()
		expect(player.level).toEqual(4)
	})
	
	it('levelling up player increases stats of avatar', function() {
		function expectAvatarStats(avatar, expectedHealth, expectedDamage) {
			expect(player.avatar.currentHealth).toEqual(expectedHealth)
			expect(player.avatar.type.maxHealth).toEqual(expectedHealth)
			expect(player.avatar.type.meleeDamage).toEqual(expectedDamage)
		}
		var player = playerService.createPlayer('Teppo', 'Testaaja')
		expect(player.avatar).toBeDefined()
		expectAvatarStats(player.avatar, 20, 5)
		player.levelUp()
		expectAvatarStats(player.avatar, 25, 7)
		player.levelUp()
		expectAvatarStats(player.avatar, 30, 9)
		player.levelUp()
		expectAvatarStats(player.avatar, 35, 11)
	})

})