'use strict'

angular.module('Tribetron').factory('PositionService', [function() {

	function Position(x, y, piece) {
		this.newPosition = function(xModifier, yModifier) {
			return new Position(this.x + xModifier, this.y + yModifier)
		}
		this.movePiece = function(from) {
			this.piece = from.piece
			from.piece = undefined
			this.piece.position = this
		}
		this.getClass = function() {
			return this.piece ? this.piece.getClass() : ''
		}
		this.x = x
		this.y = y
		this.piece = piece
		if (this.piece) this.piece.position = this
	}
	
	return {
		createPosition : function(x, y, piece) {
			return new Position(x, y, piece)
		}
	}
}])