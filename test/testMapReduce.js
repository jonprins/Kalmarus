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
	  function testSetMapWithInvalidArgs() {
	      shouldThrowException(function() { mr.setMap("foo");},
				   "Invalid args should throw.");
	  },
	  function tearDown() {
	      mr = null;
	  }
);
