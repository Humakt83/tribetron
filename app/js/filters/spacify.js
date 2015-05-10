'use strict'

angular.module('Tribetron').filter('spacify', function() {
    return function(input) {
		var spacify = function(text) {
			var specialCharactersToIgnore = '?:,./\%¤!%&;'
			var spacifiedText = text.charAt(0)
			angular.forEach(text.substr(1).split(''), function(ch) {
				if (ch == ch.toUpperCase() && specialCharactersToIgnore.indexOf(ch) === -1 && isNaN(ch))
					spacifiedText += ' ' + ch.toLowerCase()
				else
					spacifiedText += ch
			})
			return spacifiedText
		}
		return (input) ? spacify(input) : ''
    }
})