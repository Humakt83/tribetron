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

})