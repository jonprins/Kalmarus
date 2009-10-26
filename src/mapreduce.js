// Master JS file. MapReduce object spawns a number of MapReduceWorker objects,
// whose start method may be called in pseudo-parallel with setTimeout.

var MapReduce = function (map,reduce,numWorkers,callback,callbackScope) {
    this.setMap(map);
    this.setReduce(reduce);
    this.maxWorkers = numWorkers || 10;
    if(typeof callback == "function") {
	this.callback = callback;
    }
    if(typeof callbackScope == "object") {
	this.callback_scope = callbackScope;
    }
};

MapReduce.prototype = {
    map : function () {},
    reduce : function () {},
    callback : function (result ) {
	throw new Error("You forgot to set a callback function. In the mean time, your result is "+result+".");
    },
    callback_scope : null,
    maxWorkers : 10,
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
	
	var slice = data.length / this.maxWorkers;
	var i = 0;
	var workers = [];
	var activeWorkers = 0;
	var workerFinished = function ( data ) {
	    intermediateResults = intermediateResults.concat ( data );
	    activeWorkers--;
	    if(activeWorkers < 1) {
		this.finish(intermediateResults.reduce(this.reduce));
	    }
	};
	    
	for(i = 0; i < ((slice > 1) ? this.maxWorkers : data.length); i++) {
	    workers.push(new MapReduceWorker(
					     (slice > 1) ?
					     data.slice(i*slice,
							(i*slice+slice < data.length) ?
							i*slice+slice : null
							) : data[i],
					     this.map,
					     workerFinished,
					     this
					     )
			 );	
	    
	    activeWorkers++;

	    setTimeout(
		       function(worker) {
			   return function() { 
			       worker.start.call(worker);
			   };
		       }(workers[workers.length-1),
		       0
		       );
	}
    },
    finish : function (result) {
	if (typeof this.callback_scope == "object") {
	    this.callback.call(this.callback_scope, result);
	}
	else {
	    this.callback(result);
	}
	
    }	
};


// empty object for now, will be filled in when MR is actually multithreaded
var MapReduceWorker = function(data, fn, callback, callbackScope) {
    this.status = 1;
    this.getData = function ( ) { return data; };
    this.getFunction = function ( ) { return fn; };
    this.callback = function ( finishedData ) {
	if(typeof callbackScope !== "undefined") {
	    callback.call(callbackScope, finishedData);
	}
	else {
	    callback(finishedData);
	}
    };
};

MapReduceWorker.prototype = {
    status : 0,
    start : function ( ) {
	this.status = 2;
	var intermediateData = [];
	var data = this.getData();
	if(data.constructor == Array) {
	    for(var i = 0; i < data.length; i++) {
		intermediateData.push(this.getFunction()(data[i]));
	    }
	}
	else {
	    intermediateData = this.getFunction()(data);
	}
	this.status = 0;
	this.callback(intermediateData);
    }
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
