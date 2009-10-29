// Master JS file. MapReduce object spawns a number of MapReduceWorker objects,
// whose start method may be called in pseudo-parallel with setTimeout.

function MapReduce (map, reduce, numWorkers, callback, callbackScope) {
    this.setMap(map);
    this.setReduce(reduce);
    this.numWorkers = numWorkers || 10;
    if(typeof callback == "function") {
	this.callback = callback;
    }
    if(typeof callbackScope == "object") {
	this.callback_scope = callbackScope;
    }
}

MapReduce.prototype = {
    map : function () {},
    reduce : function () {},
    callback : function (result ) {
	throw new Error("You forgot to set a callback function. In the mean time, your result is "+result+".");
    },
    callback_scope : null,
    numWorkers : 10,
    startTime : null,
    intermediate : null,
    emitIntermediate : function(data) {
	var isAtomicData;
	for(var key in data) {
	    if(data.hasOwnProperty(key)) {
		this.intermediate = {};
		if(!this.intermediate.hasOwnProperty(key)) {
		    this.intermediate[key] = [];
		}
		this.intermediate[key].push(data[key]);
	    }
	}    
	if(null === this.intermediate) {
	    this.intermediate = [];
	}
	if(this.intermediate.constructor == Array) {
	    this.intermediate.push(data);
	}	    
    },
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
    Start : function (data) {
	this.startTime = new Date();
	var intermediateResults = [];
	for(var i = 0; i < data.length; i++) {
	    this.map(data[i]);
	}
	this.finish(intermediateResults.reduce(this.reduce));
    },    
    deferredStart : function ( data ) {
	var workers = [], activeWorkers = 0, dataLeft = data.length, dataQueue = [], i = 0, state = 0;
	

	function getAvailableWorker ( ) {
	    for(var i = 0; i < workers.length; i++) {
		if(workers[i].status) {
		    return workers[i];
		}
	    }
	}

	function workerCallback ( ) {
	    activeWorkers-=1;
	    dataLeft-=1;
	    if ( dataLeft > 0 ) {	       
		if(dataQueue.length > 0) {
		    var d = dataQueue.shift();
		    getAvailableWorker().start(d.data,d.fn);
		    activeWorkers+=1;
		}
	    }
	    else {
		if(this.intermediate.constructor == Array) {
		    this.finish(this.intermediate.reduce(this.reduce));
		}
		else {
		    var result = null;
		    for(var k in this.intermediate) {
			if(this.intermediate.hasOwnProperty(k)) {
			    if(this.intermediate[k].constructor == Array) {
				result[k] = this.intermediate[k].reduce(this.reduce);
			    }
			    else {
				result[k] = this.intermediate[k];
			    }
			}
		    }
		    this.finish(result);
		}
	    }
	}

	function enqueueData ( data, fn ) {
	    if(activeWorkers < workers.length) {
		getAvailableWorker().start(data,fn);
	    }
	    else {
		dataQueue.push( { data : data, fn : fn } );
	    }
	}
	 
	for(i; i < this.numWorkers; i++) {
	    workers.push(new MapReduceWorker(workerCallback, this, this));
	}

	for(i = 0; i < data.length; i++) {
	    enqueueData(data[i], this.map);
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


function MapReduceWorker ( callback, master, callbackScope ) {
    this.emitIntermediate = function(intermediate) {
	master.emitIntermediate(intermediate);
    };
    this.callback = function ( ) {
	this.status = 1;
	if(typeof callbackScope !== "undefined") {
	    callback.call(callbackScope);
	}
	else {
	    callback();
	}
    };
}

MapReduceWorker.prototype = {
    status : 1, // available
    execute : function(data, fn) {
	this.status = 0; // working
	if(data.constructor == Array) {
	    for(var i = 0; i < data.length; i++) {
		fn.call(this,data[i]); // fn MUST call this.emitIntermediate to send its data up the chain
	    }
	}
	else {
	    fn.call(this,data);
	}
	this.callback();
    },
    start : function ( data, fn ) {
	setTimeout(
		   (function(context) { return function() { context.execute(data,fn);}; })(this), 
		   0
		   );
    }
};


// reduce function defined if undefined, as per MDC
// ** https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Global_Objects/Array/Reduce

if (!Array.prototype.reduce) {
    Array.prototype.reduce = function(fun /*, initial*/) {
	var len = this.length >>> 0;
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
