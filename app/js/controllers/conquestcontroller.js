'use strict'

angular.module('Tribetron').controller('ConquestController', ['$scope', '$location', 'Player', function($scope, $location, Player) {

	var width = 7, height = 7, reward = 50
	
	
	function ConquestPiece(playerPiece, owned) {
		this.getClass = function() {
			if (!owned) 
				return ''
			return this.playerPiece? 'multiplicator' : 'multiplicator_enemy'
		}
		this.playerPiece = playerPiece
		this.owned = owned
	}
	
	function Conquest() {
		var gameTable = new Array()
		for (var x = 0; x < width; x++) {
			gameTable[x] = new Array()
			for (var y = 0; y < height; y++) {
				gameTable[x].push(new ConquestPiece())
			}
		}
		gameTable[0][0] = new ConquestPiece(true, true)
		gameTable[0][1] = new ConquestPiece(true, true)
		gameTable[1][0] = new ConquestPiece(true, true)
		gameTable[width-1][height-1] = new ConquestPiece(false, true)
		gameTable[width-2][height-1] = new ConquestPiece(false, true)
		gameTable[width-1][height-2] = new ConquestPiece(false, true)
		this.gameTable = gameTable
	}

	$scope.conquest = new Conquest()
	
	if (!Player.getPlayer()) {
		//$location.path('/')
		//return
	}
	
	$scope.skip = function() {
		$location.path('/game')
	}
	
	$scope.win = function() {
		Player.getPlayer().money += $scope.reward
		$location.path('/game')
	}
}])