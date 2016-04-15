var bigInt = require('big-integer');

var generateA = function (k) {
    var a = [];
    for (var i = 0; i < k; i++) {
        a.push(bigInt.randBetween(0, 1).toString());
    }
    return { a: a };
}

var check = function (y, x, v, a, n){
    y = bigInt(y);
    x = bigInt(x);
    n = bigInt(n);
    var mod = x.mod(n);
    for (var i = 0; i < v.length; i++) {
        var vi = bigInt(v[i]);
        var ai = bigInt(a[i]);
        mod = vi.pow(ai).multiply(mod).mod(n);
    }
    var ysqmodn = y.square().mod(n);
    return ysqmodn.compare(mod) == 0 || ysqmodn.compare(mod.negate()) == 0;
}

exports.generateA = generateA;
exports.check = check;