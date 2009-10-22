eval(loadFile("src/mapreduce.js"));

var mr;

testCases(test,
	
	function setUp() {
		mr = new MapReduce();
	},

	function testSetMapWithValidArgs() {
		assert.that("foo", eq("foo"));
	},
	
	function tearDown() {
		mr = null;
	}
);
