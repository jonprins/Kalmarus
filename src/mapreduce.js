// Master JS file. NOT multithreaded yet! Will add after basic single-threaded 
// mapreduce is finished

var MapReduce = function () {

};

MapReduce.prototype = {
    map : function () {},
    reduce : function () {},
    callback : function () {},
    callback_scope : null,
	
    setMap : function (map) {
	if (typeof map !== "function") {
	    throw new TypeError("map is not a function");	
	}
	else if (map.length !== 1) {
	    throw new TypeError("map fn should only have one argument");
	}
	else {
	    this.map = map;
	}
    },
    setReduce : function (reduce) {
	if (typeof reduce !== "function") {
	    throw new TypeError("reduce is not a function");
	}
	else {
	    this.reduce = reduce;
	}
    },
    start : function (data) {
	// execute	
    },
    finish : function (result) {
	if (typeof callback_scope == "object") {
	    this.callback.call(this.callback_scope, result);
	}
	else {
	    this.callback(result);
	}
    }	
};