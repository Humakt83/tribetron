'use strict'

angular.module('Tribetron').controller('ChessController', ['$scope', '$location', 'Player', 'ChessBoard', function($scope, $location, Player, ChessBoard) {
	
	$scope.selectPiece = function(slot) {
		if (!$scope.gameOver && $scope.chessBoard.isSelectable(slot)) {
			if (!$scope.chessBoard.selected || ($scope.chessBoard.selected && slot.piece 
					&& $scope.chessBoard.selected.piece.whitePiece === slot.piece.whitePiece)) {
				$scope.chessBoard.setSelected(slot)
			} else {
				$scope.chessBoard.movePiece($scope.chessBoard.selected, slot)
				$scope.checkState()
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
	$scope.checkState()
	
}])