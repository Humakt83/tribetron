'use strict'

angular.module('Tribetron').controller('ChessController', ['$scope', '$location', 'Player', 'ChessBoard', 'ChessAI', function($scope, $location, Player, ChessBoard, ChessAI) {
	
	$scope.selectPiece = function(slot) {
		if (!$scope.gameOver && $scope.chessBoard.isSelectable(slot)) {
			if (!$scope.chessBoard.selected || ($scope.chessBoard.selected && slot.piece 
					&& $scope.chessBoard.selected.piece.whitePiece === slot.piece.whitePiece)) {
				$scope.chessBoard.setSelected(slot)
			} else {
				$scope.chessBoard.movePiece($scope.chessBoard.selected, slot)
				//TODO: Wait for modal to close
				$scope.checkState()
				if (!$scope.gameOver) {
					$scope.ai.playTurn($scope.chessBoard)
				}
			}
		}
	}
	
	$scope.checkState = function() {
		$scope.blackPieces = $scope.chessBoard.getBlackPieces()
		$scope.whitePieces = $scope.chessBoard.getWhitePieces()
		$scope.check = $scope.chessBoard.isCheck()
		$scope.gameOver = $scope.chessBoard.isGameOver()
	}
	
	$scope.chessBoard = ChessBoard.createBoard()
	$scope.ai = ChessAI.createAI(true)
	$scope.checkState()
	
}])