eval(loadFile("src/mapreduce.js"));

var mr;

testCases(test,
	  function setUp() {
	      mr = new MapReduce();
	  },
	  function testSetMapWithValidArgs() {
	      var map = function (foo) { return "foo"; };
	      mr.setMap(map);
	      assert.that(mr.map, eq(map));
	  },
	  function testSetMapWithInvalidArg() {
	      shouldThrowException(function () { mr.setMap("foo");},
				   "non-fn arg should throw");
	  },
	  function testSetMapWithInvalidMapFn() {
	      var invalidMap = function(foo,bar) { return 1; };
	      shouldThrowException(function() { mr.setMap(invalidMap); },
				   "fn with too many args should throw");
	  },
	  function testSetReduceWithValidArg() {
	      var reduce = function () { var foo = "foo"; };
	      mr.setReduce(reduce);
	      assert.that(mr.reduce, eq(reduce));
	  },
	  function testSetReduceWithInvalidArg() {
	      shouldThrowException(function () { mr.setReduce("foo"); },
				   "non-fn arg should throw.");
	  },
	  /*
	  function testStart() {
	      var map = function (in) { return in+1; };
	      mr.setMap(map);
	      mr.setReduce(function(a,b) { return a+b; });
	      assert.that(mr.start([0,1,2,3,4]), eq(120));
	      },*/
	  function tearDown() {
	      mr = null;
	  }
);
