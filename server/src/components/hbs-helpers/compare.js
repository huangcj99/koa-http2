
const compare = function(left, operator, right, options) {
    if (arguments.length < 3) {
        throw new Error('Handlerbars Helper "compare" needs 2 parameters');
    }
    var operators = {
        '==':     function(l, r) {return l == r; },
        '===':    function(l, r) {return l === r; },
        '!=':     function(l, r) {return l != r; },
        '!==':    function(l, r) {return l !== r; },
        '<':      function(l, r) {return l < r; },
        '>':      function(l, r) {return l > r; },
        '<=':     function(l, r) {return l <= r; },
        '>=':     function(l, r) {return l >= r; },
        '&&':     function(l, r) {return l && r;},
        '||':     function(l, r) {return l || r;},
        'typeof': function(l, r) {return typeof l == r; },
        'break-row': function(l, r) {if(l===0){return false} return l % r === 0; },
        'indexof': function(l,r) { //如果l中包含r，返回true
            var lowerL = l.toLowerCase();
            var lowerR = r.toLowerCase();
            if(lowerL.indexOf(lowerR) >= 0){
                return true;
            }else {
                return false;
            }
        }
    };

    if (!operators[operator]) {
        throw new Error('Handlerbars Helper "compare" doesn\'t know the operator ' + operator);
    }

    var result = operators[operator](left, right);

    if (result) {
       return options.fn(this);
    } else {
       return options.inverse(this);
    }
};

module.exports = compare;