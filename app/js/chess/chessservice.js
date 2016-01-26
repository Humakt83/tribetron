"use strict"

var Chess = require("jschessrulz")

angular.module('Tribetron').factory("ChessService", function() {
	
	return {
		getNewChess : function() {
			return new Chess.Chess()
		},
		getPiece : function() {
			return Chess.Piece
		},
		createPosition : function(x, y) {
			return new Chess.Position(x, y)
		}
	}
})