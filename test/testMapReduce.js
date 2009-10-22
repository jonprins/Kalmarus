eval(loadFile("src/mapreduce.js"));

var mr;

testCases(test,
	  function setUp() {
	      mr = new MapReduce();
	  },
	  function testSetMapWithValidArgs() {
	      var map = function () { var foo = "foo"; };
	      mr.setMap(map);
	      assert.that(mr.map, eq(map));
	  },
	  function testSetMapWithInvalidArg() {
	      shouldThrowException(function () { mr.setMap("foo");},
				   "non-fn arg should throw.");
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
	  function tearDown() {
	      mr = null;
	  }
);
