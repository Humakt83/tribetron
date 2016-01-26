'use strict'

var chess = require('jschessrulz')

angular.module('Tribetron').controller('ChessController', ['$scope', '$location', 'Player', 'ChessAI', 'Campaign', 'ChessService',
		function($scope, $location, Player, ChessAI, Campaign, ChessService) {
	
	const cssNames = ['totter', 'hunter', 'medic', 'psycho', 'lazor', 'hacker']

	$scope.selectPiece = function(x, y) {
		if (!$scope.gameOver) {
			if (!$scope.chessBoard.selected || $scope.chessBoard.canSetSelected(x, y)) {
				$scope.chessBoard.setSelected(x, y)
			} else if ($scope.chessBoard.isMovable(x, y)) {
				$scope.chessBoard.movePiece($scope.chessBoard.selected, ChessService.createPosition(x, y))
				$scope.checkState()
				if (!$scope.gameOver) {
					$scope.aiTurn()
				}
			}
		}
	}
	
	if (!Player.getPlayer()) {
		$location.path('/')
		return
	}
	
	Campaign.getScenario(Campaign.getCampaign().currentScenario).success(function(result) {
		$scope.reward = result.reward
		$scope.aiOnBlack = result.aiOnBlack
		$scope.chessBoard = ChessService.getNewChess()
		$scope.ai = ChessAI.createAI($scope.aiOnBlack)
		$scope.checkState()
		if (!$scope.aiOnBlack) {
			$scope.aiTurn()
		}
	})	

	$scope.piece = ChessService.getPiece()
	
	$scope.win = false
	
	$scope.aiTurn = function() {
		$scope.ai.playTurn($scope.chessBoard)
		$scope.checkState()
	}
	
	$scope.checkState = function() {
		$scope.blackPieces = $scope.chessBoard.getBlackPieces()
		$scope.whitePieces = $scope.chessBoard.getWhitePieces()
		$scope.gameOver = $scope.chessBoard.isGameOver()
		if ($scope.gameOver) {
			gameOver()
		}
	}
	
	var gameOver = function() {
		if ($scope.chessBoard.isStaleMate()) {
			$scope.chessOverText = 'Stalemate'
		} else if ($scope.chessBoard.isCheckMate()) {
			$scope.chessOverText = 'Checkmate'
			if ($scope.aiOnBlack === !$scope.chessBoard.turnOfWhite) {
				$scope.win = true
				$scope.chessOverText = 'Checkmate. ' + Player.getPlayer().name + ' is winner.'
			} else {
				$scope.chessOverText = 'Checkmate. Computer is winner.'
			}	
		} else if ($scope.chessBoard.isInsufficientMaterial()) {
			$scope.chessOverText = 'Insufficient material'
		} else if ($scope.chessBoard.isThreefoldRepetition()) {
			$scope.chessOverText = 'Threefold repetition'
		} else if ($scope.chessBoard.isOverMoveLimit()) {
			$scope.chessOverText = 'Move limit reached'
		} else {
			$scope.chessOverText = 'Game over for unknown reason?'
		}
	}

	$scope.getCssNameForPiece = function(piece) {
		if (piece === 0) return ''
		var name = cssNames[Math.abs(piece) - 1]
		return piece < 0 ? name + '_enemy' : name
	}
	
	$scope.skip = function() {
		$location.path('/game')
	}
	
	$scope.continueGame = function() {
		Player.getPlayer().money += $scope.reward
		$location.path('/game')
	}
	
}])