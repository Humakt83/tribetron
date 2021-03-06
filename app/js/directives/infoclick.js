'use strict'

angular.module('Tribetron').directive('ngInfoClick', ['$parse', function($parse) {
    return function(scope, element, attrs) {
		var fn = $parse(attrs.ngInfoClick);
		element.bind('contextmenu', function(event) {
			scope.$apply(function() {
				event.preventDefault();
				fn(scope, {$event:event});
            });
        });
    };
}]);