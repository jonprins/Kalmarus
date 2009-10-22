// Master JS file. NOT multithreaded yet! Will add after basic single-threaded 
// mapreduce is finished

var MapReduce = function () {

};

MapReduce.prototype = {
    map : function () {},
    reduce : function () {},
    callback : function (result ) {
	alert(result + " ||| you forgot to set your own callback!");
    },
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
	var intermediateResults = [];
	for(var i = 0; i < data.length; i++) {
	    intermediateResults.push(this.map(data[i]));
	}
	return (intermediateResults.reduce(this.reduce));
    },
    finish : function (result) {
	
	/*
	if (typeof callback_scope == "object") {
	    this.callback.call(this.callback_scope, result);
	}
	else {
	    this.callback(result);
	}
	*/
    }	
};


// empty object for now, will be filled in when MR is actually multithreaded
var MapReduceWorker = function() {
};

MapReduceWorker.prototype = {
    
};


// reduce function defined if undefined, as per MDC
// ** https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Global_Objects/Array/Reduce

if (!Array.prototype.reduce) {
    Array.prototype.reduce = function(fun /*, initial*/) {
	var len = this.length || 0;
	if (typeof fun != "function") {
	    throw new TypeError();
	}

	// no value to return if no initial value and an empty array
	if (len === 0 && arguments.length == 1) {
	    throw new TypeError();
	}

	var i = 0;
	var rv = null;

	if (arguments.length >= 2) {
	    rv = arguments[1];
	}
	else {
	    do {
		if (i in this) {
		    rv = this[i++];
		    break;
		}

		// if array contains no values, no initial value to return
		if (++i >= len) {
		    throw new TypeError();
		}
	    }
	    while (true);
	}

	for (; i < len; i++) {
	    if (i in this) {
		rv = fun.call(null, rv, this[i], i, this);
	    }
	}

	return rv;
    };
}
