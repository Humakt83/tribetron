'use strict'

angular.module('Tribetron').controller('ConquestController', ['$scope', '$location', 'Player', 'Campaign', function($scope, $location, Player, Campaign) {

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
	
	function Conquest(width, height) {
		this.hasMovableArea = function(conquestPiece) {
			return $scope.conquest.getMovableAreas(conquestPiece).length > 0
		}
		this.getMovableAreas = function(conquestPiece) {
			return _.filter(_.flatten($scope.conquest.gameTable), function(piece) {
				var distance = conquestPiece.distanceFromPiece(piece)
				return !piece.owned && (distance < 2 || (distance < 3 && conquestPiece.isInSameLine(piece)))
			})
		}
		this.isSelectable = function(piece, playerTurn) {
			var selectablePieces = _.filter(_.flatten($scope.conquest.gameTable), function(conquestPiece) {
				if ($scope.selectedPiece) {
					var distance = conquestPiece.distanceFromPiece($scope.selectedPiece)
					return !conquestPiece.owned && (distance < 2 || (distance < 3 && conquestPiece.isInSameLine($scope.selectedPiece)))
				}
				return conquestPiece.owned && playerTurn === conquestPiece.playerPiece && $scope.conquest.hasMovableArea(conquestPiece)
			})
			return selectablePieces.indexOf(piece) > -1
		}
		this.getSelectablePieces = function(playerTurn) {
			return _.filter(_.flatten(this.gameTable), function(piece) {
				return $scope.conquest.isSelectable(piece, playerTurn)
			})
		}
		this.getPiecesNextToPiece = function(piece) {
			return _.filter(_.flatten(this.gameTable), function(conquestPiece) {
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
		this.getAmountOfPieces = function(player) {
			return _.filter(_.flatten(this.gameTable), function(conquestPiece) {
				return conquestPiece.owned && conquestPiece.playerPiece === player
			}).length
		}
		this.getAmountOfFreePieces = function() {
			return _.filter(_.flatten(this.gameTable), function(conquestPiece) {
				return !conquestPiece.owned
			}).length
		}
		this.getPiece = function(x, y) {
			return _.find(_.flatten(this.gameTable), function(piece) {
				return piece.xPosition == x && piece.yPosition == y
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
	
	function playAITurn() {
		function FromToScore(pieceFrom, pieceTo, score) {
			this.from = pieceFrom
			this.to = pieceTo
			this.score = score
		}
		function evaluateScore(conquest) {
			return conquest.getAmountOfPieces(false) - conquest.getAmountOfPieces(true)
		}
		function evaluateMove(from, to) {
			var conquestCopy = angular.copy($scope.conquest)
			conquestCopy.movePiece(conquestCopy.getPiece(from.xPosition, from.yPosition), conquestCopy.getPiece(to.xPosition, to.yPosition))
			return evaluateScore(conquestCopy)
		}
		var selectablePieces = $scope.conquest.getSelectablePieces(false)
		if (selectablePieces.length > 0) {
			var fromToScoreMap = []
			angular.forEach(selectablePieces, function(fromPiece) {
				angular.forEach($scope.conquest.getMovableAreas(fromPiece), function(toPiece) {
					fromToScoreMap.push(new FromToScore(fromPiece, toPiece, evaluateMove(fromPiece, toPiece)))
				})
			})
			var moveWithMaxScore = _.max(fromToScoreMap, function(fromToScore) { return fromToScore.score})
			var equalMoves = _.filter(fromToScoreMap, function(fromToScore) { return fromToScore.score == moveWithMaxScore.score})
			var moveToMake = equalMoves[Math.floor(Math.random() * equalMoves.length)]
			$scope.conquest.movePiece(moveToMake.from, moveToMake.to)
			return true
		}
		return false
	}

	if (!Player.getPlayer()) {
		$location.path('/')
		return
	}
	
    var scenario = Campaign.getCampaign().loadedScenario
    $scope.reward = scenario.reward
    $scope.conquest = new Conquest(scenario.width, scenario.height)
	
	$scope.selectPiece = function(piece) {
		function gameOver() {
			$scope.win = $scope.conquest.getAmountOfPieces(true) > $scope.conquest.getAmountOfPieces(false)
			$scope.conquestOver = true
			$scope.conquestOverText = $scope.win ? 'You have won this conquest, collect your reward and continue campaign' : 'Your defeat is shameful but campaign can still be continued'
		}
		if ($scope.conquest.isSelectable(piece, true)) {
			if (!$scope.selectedPiece) {
				$scope.selectedPiece = piece
			} else {
				$scope.conquest.movePiece($scope.selectedPiece, piece)
				$scope.selectedPiece = undefined
				playAITurn()
				while ($scope.conquest.getSelectablePieces(true).length < 1 && playAITurn()) {}
				if ($scope.conquest.getAmountOfFreePieces() < 1) {
					gameOver()
				}
			}
		}
	}
	
	$scope.skip = function() {
		$location.path('/game')
	}
	
	$scope.continueGame = function() {
		Player.getPlayer().money += $scope.reward
		$location.path('/game')
	}
}])