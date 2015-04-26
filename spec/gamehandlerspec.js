'use strict'

describe('Testing GameHandler', function() {

	var gameHandler, robotService, teamA, teamB
	
	beforeEach(module('Tribetron'))
	
	beforeEach(inject(function(GameHandler, Robot, Team) {
		gameHandler = GameHandler
		robotService = Robot
		teamA = Team.createTeam('TeamA', [], false)
		teamB = Team.createTeam('TeamB', [], true)
	}))
	
	it('is defined', function() {
		expect(gameHandler).toBeDefined()
	})
	
	it('creates a game state', function() {
		var gameState = gameHandler.createGameState([teamA, teamB], 15)
		expect(gameState).toBeDefined()
		expect(gameState.maxRounds).toEqual(15)
		expect(gameState.round).toEqual(1)
		expect(gameState.robotTurn).toEqual(0)
	})
	
	describe('Testing queue', function() {
		
		it('creates a robot queue by placing a robot from teamB after robot from teamB and vice versa', function() {
			addBotsToTeam(teamA, [createBot(), createBot(), createBot()])
			addBotsToTeam(teamB, [createBot(), createBot(), createBot()])
			var botQueue = gameHandler.createGameState([teamA, teamB], 15).robotQueue
			expect(botQueue.length).toEqual(6)
			angular.forEach(botQueue, function(bot) {
				var indexOfBot = botQueue.indexOf(bot)
				if (indexOfBot % 2 == 0) {
					expect(bot.team.isEnemy).toBeFalsy()
				} else {
					expect(bot.team.isEnemy).toBeTruthy()
				}
			})
		})
		
		it('removes a bot from queue', function() {
			addBotsToTeam(teamA, [createBot(), createBot(), createBot()])
			addBotsToTeam(teamB, [createBot(), createBot(), createBot()])
			var gameState = gameHandler.createGameState([teamA, teamB], 15)
			var botQueue = gameState.robotQueue
			gameState.removeBotFromQueue(teamA.robots[0])
			expect(botQueue.length).toEqual(5)
			expect(gameState.robotTurn).toEqual(-1)
		})
		
		it('removes a bot from queue and decreases turn counter', function() {
			addBotsToTeam(teamA, [createBot(), createBot(), createBot()])
			addBotsToTeam(teamB, [createBot(), createBot(), createBot()])
			var gameState = gameHandler.createGameState([teamA, teamB], 15)
			gameState.nextRobot()
			gameState.nextRobot()
			expect(gameState.robotTurn).toEqual(2)
			gameState.removeBotFromQueue(teamA.robots[0])
			expect(gameState.robotTurn).toEqual(1)
			gameState.removeBotFromQueue(teamB.robots[0])
			expect(gameState.robotTurn).toEqual(0)
		})
		
		it('adds a bot to the beginning of a queue and increases turn counter', function() {
			addBotsToTeam(teamA, [createBot(), createBot(), createBot()])
			addBotsToTeam(teamB, [createBot(), createBot(), createBot()])
			var gameState = gameHandler.createGameState([teamA, teamB], 15)
			var bot = createBot()
			gameState.addBotToQueue(bot)
			expect(gameState.robotTurn).toEqual(1)
			expect(gameState.robotQueue.indexOf(bot)).toEqual(0)
		})
	})
	
	var createBot = function() {
		return robotService.createRobot(new (robotService.getTypes()[0])())
	}
	
	var addBotsToTeam = function(team, bots) {
		angular.forEach(bots, function(bot) {
			team.addBot(bot)
		})
	}
	
})