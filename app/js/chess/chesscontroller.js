'use strict'

angular.module('Tribetron').controller('ChessController', ['$scope', '$location', 'Player', 'Chess', 'ChessAI', 'ChessPiece', 'PositionService', 'Campaign',
		function($scope, $location, Player, Chess, ChessAI, ChessPiece, PositionService, Campaign) {
	
	$scope.selectPiece = function(x, y) {
		if (!$scope.gameOver) {
			if (!$scope.chessBoard.selected || $scope.chessBoard.canSetSelected(x, y)) {
				$scope.chessBoard.setSelected(x, y)
			} else if ($scope.chessBoard.isMovable(x, y)) {
				$scope.chessBoard.movePiece($scope.chessBoard.selected, PositionService.createPosition(x, y))
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
		$scope.chessBoard = Chess.createBoard()
		$scope.ai = ChessAI.createAI($scope.aiOnBlack)
		$scope.checkState()
		if (!$scope.aiOnBlack) {
			$scope.aiTurn()
		}
	})
	
	$scope.piece = ChessPiece
	
	$scope.position = PositionService
	
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
		} else if ($scope.aiOnBlack === !$scope.chessBoard.turnOfWhite) {
			$scope.win = true
			$scope.chessOverText = 'Checkmate. ' + Player.getPlayer().name + ' is winner.'
		} else {
			$scope.chessOverText = 'Checkmate. Computer is winner.'
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