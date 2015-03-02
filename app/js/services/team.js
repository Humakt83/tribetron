'use strict'

angular.module('Tribetron').factory('Team', ['$filter', 'Robot', function($filter, Robot) {
	
	var playerTeam
	
	function BotsByType(typeName, amount) {
		this.typeName = typeName
		this.bots = amount
	}
	
	function Team(name, robots, isEnemy) {
		
		this.containsBot = function(robot) {
			return this.robots.indexOf(robot) > -1
		}
		
		this.updateBotCount = function() {
			this.botsByTypeAlive = this.botsPerTypeRemaining()
		}
		
		this.botsRemaining = function() {
			return $filter('filter')(this.robots, {'destroyed': false}).length
		}
		
		this.botsPerTypeRemaining = function() {
			var botsPerType = [], thisTeam = this
			angular.forEach(Robot.getTypes(), function(type) {
				var botType = new type()
				botsPerType.push(new BotsByType(botType.typeName, $filter('filter')(thisTeam.robots, function(bot) {
					return bot.type.typeName === botType.typeName && !bot.destroyed
				})))
			})
			return botsPerType
		}
		
		this.addBot = function(robot) {
			this.robots.push(robot)
			robot.setTeam(this)
		}
		
		this.destroyedBots = function() {
			return $filter('filter')(this.robots, {'destroyed': true})
		}
		
		this.removeBot = function(robot) {
			this.robots.splice(this.robots.indexOf(robot), 1)
		}
		
		this.robots = robots
		this.isEnemy = isEnemy
		this.name = name
		this.botsByTypeAlive = this.botsPerTypeRemaining()
		var thisTeam = this
		angular.forEach(robots, function(robo) {
			robo.setTeam(thisTeam)
		})
	}
	return {
		createTeam : function (name, robots, isEnemy) {
			return new Team(name, robots, isEnemy)
		},
		createPlayerTeam : function (name, robots) {
			playerTeam = new Team(name, robots)
			return playerTeam
		},
		getPlayerTeam : function() {
			return playerTeam
		}
	}
}])