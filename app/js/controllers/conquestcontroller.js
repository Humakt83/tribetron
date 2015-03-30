'use strict'

angular.module('Tribetron').controller('ConquestController', ['$scope', '$location', '$filter', 'Player', function($scope, $location, $filter, Player) {

	var width = 7, height = 7, reward = 50
	
	
	function ConquestPiece(xPosition, yPosition, playerPiece, owned) {
		this.getClass = function() {
			if (!this.owned) 
				return ''
			return this.playerPiece? 'multiplicator' : 'multiplicator_enemy'
		}
		this.distanceFromPiece = function(piece) {
			return Math.abs(piece.xPosition - this.xPosition) + Math.abs(piece.yPosition - this.yPosition)
		}
		this.isInSameLine = function(piece) {
			return piece.xPosition === this.xPosition || piece.yPosition === this.yPosition
		}
		this.turn = function(selectedPiece) {
			this.playerPiece = selectedPiece.playerPiece
			this.owned = true
			if (selectedPiece.distanceFromPiece(this) > 1) {
				selectedPiece.playerPiece = false
				selectedPiece.owned = false
			}
		}
		this.playerPiece = playerPiece
		this.owned = owned
		this.xPosition = xPosition
		this.yPosition = yPosition
	}
	
	function Conquest() {
		function hasMovableArea(conquestPiece, thisGameTable) {
			return 0 < $filter('filter')(_.flatten(thisGameTable), function(piece) {
				var distance = conquestPiece.distanceFromPiece(piece)
				return !piece.owned && (distance < 2 || (distance < 3 && conquestPiece.isInSameLine(piece)))
			}).length
		}
		this.isSelectable = function(piece) {
			var thisGameTable = this.gameTable
			var selectablePieces = $filter('filter')(_.flatten(thisGameTable), function(conquestPiece) {
				if ($scope.selectedPiece) {
					var distance = conquestPiece.distanceFromPiece($scope.selectedPiece)
					return $scope.selectedPiece !== conquestPiece && !conquestPiece.owned && (distance < 2 || (distance < 3 && conquestPiece.isInSameLine($scope.selectedPiece)))
				}
				return conquestPiece.owned && conquestPiece.playerPiece && hasMovableArea(conquestPiece, thisGameTable)
			})
			return selectablePieces.indexOf(piece) > -1
		}
		this.getPiecesNextToPiece = function(piece) {
			return $filter('filter')(_.flatten(this.gameTable), function(conquestPiece) {
				return conquestPiece.distanceFromPiece(piece) < 2
			})
		}
		this.movePiece = function(selectedPiece, targetPiece) {
			targetPiece.turn(selectedPiece)
			angular.forEach(this.getPiecesNextToPiece(targetPiece), function(piece) {
				if (piece.owned) {
					piece.playerPiece = targetPiece.playerPiece
				}
			})
		}
		var gameTable = []
		for (var x = 0; x < width; x++) {
			gameTable[x] = []
			for (var y = 0; y < height; y++) {
				gameTable[x].push(new ConquestPiece(x, y))
			}
		}
		gameTable[0][0] = new ConquestPiece(0, 0, true, true)
		gameTable[0][1] = new ConquestPiece(0, 1, true, true)
		gameTable[1][0] = new ConquestPiece(1, 0, true, true)
		gameTable[width-1][height-1] = new ConquestPiece(width-1, height-1, false, true)
		gameTable[width-2][height-1] = new ConquestPiece(width-2, height-1, false, true)
		gameTable[width-1][height-2] = new ConquestPiece(width-1, height-2, false, true)
		this.gameTable = gameTable
	}

	$scope.conquest = new Conquest()
	
	$scope.selectPiece = function(piece) {
		if ($scope.conquest.isSelectable(piece)) {
			if (!$scope.selectedPiece) {
				$scope.selectedPiece = piece
			} else {
				$scope.conquest.movePiece($scope.selectedPiece, piece)
				$scope.selectedPiece = undefined
			}
		}
	}
	
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