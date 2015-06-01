'use strict'

angular.module('Tribetron').factory('GraphicsUtil', ['$timeout', '$window', 'GameSettings', function($timeout, $window, GameSettings) {
	return {
		drawLazer : function(fromArea, toArea) {
			function getTableCell(area) {
				var tableRow = angular.element('table.game tr')[area.yCoord]
				return tableRow.getElementsByTagName('td')[area.xCoord]
			}
			function getElementForLazer(left, top, width, height) {
				var style = 'left: ' + left + 'px; top: ' + top + 'px; width: ' + width + 'px; height:' + height + 'px;'
				return angular.element('<div class="lazer-beam" style="' + style + '"/>')
			}
			var fromRect = getTableCell(fromArea).getBoundingClientRect()
			var toRect = getTableCell(toArea).getBoundingClientRect()
			var lazerElement = null
			var offset = 25
			if (fromArea.xCoord === toArea.xCoord) {
				var left = fromRect.left + offset
				var width = 4
				var top = fromRect.top > toRect.top ? toRect.top : fromRect.top
				top = top + offset + window.pageYOffset
				var height = Math.abs(fromRect.top - toRect.top) + offset
				lazerElement = getElementForLazer(left, top, width, height)
			} else {
				var top = fromRect.top + offset + window.pageYOffset
				var height = 4
				var left = fromRect.left > toRect.left ? toRect.left : fromRect.left
				left = left + offset
				var width = Math.abs(fromRect.left - toRect.left) + offset
				lazerElement = getElementForLazer(left, top, width, height)
			}
			angular.element('body').append(lazerElement)
			$timeout(function() { 
				angular.element('div.lazer-beam').remove()
			}, 100 * GameSettings.getGameSpeed())
		}
	}

}])