'use strict'

angular.module('Tribetron').factory('ngIterator', [function() {
	return function(arr) { 
		return {
			index : -1,
			hasNext : function(){ return this.index <= arr.length },
			hasPrevious: function(){ return this.index > 0 },

			current: function(){ return arr[ this["index"] ] },

			next : function(){
				if(this.hasNext()){
					this.index = this.index + 1            
					return this.current()
				} 
				throw 'No more elements to iterate'
			},

			previous : function(){
				if(this.hasPrevious()){
					this.index = this.index - 1
					return this.current()
				}
				throw 'No previous element'
			}
		}
	}
}])