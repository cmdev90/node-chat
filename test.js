

var obj = function(a, b){
	this.a = a || 0;
	this.b = b || 0;
};

obj.prototype = {
	
	sum : function () {
		return this.a + this.b;
	},

	extend : function (options) {
		extention = options;
		extention.__proto__ = this;
		return extention;
	},

	run: function (method) {
		return this[method]();
	}

}

var o = new obj();
var o2 = new obj(2,5);

console.log(o);
console.log(o2);

console.log(o.sum());
console.log(o2.sum());

var newO = o.extend({multipy : function (){return this.a * this.b;}});
var newO2 = o2.extend({multipy : function (){return this.a * this.b;}});

newO2.b = 67;

console.log(newO.multipy());
console.log(newO2.multipy());


console.log(newO.run("multipy"));
console.log(newO2.run("multipy"));