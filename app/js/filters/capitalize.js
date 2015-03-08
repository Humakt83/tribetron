angular.module('Tribetron').filter('capitalize', function() {
    return function(input) {
		var capitalizeFirstLetter = function(text) {
			return text.charAt(0).toUpperCase() + text.substr(1)
		}
		return (input) ? capitalizeFirstLetter(input) : ''
    }
})