var zepto = {
  List: class extends Array {
    constructor(...args) {
      super();
      if (args.length == 1 && Array.isArray(args[0])) {
        args = args[0];
      }
      for (var arg of args) {
        this.push(arg);
      }
      return this;
    }
    car() {
      return this[0];
    }
    cdr() {
      return this.slice(1);
    }
    empty() {
      return this.length === 0;
    }
    append(...args) {
      return args.reduce((a,b) => a.concat(b), this);
    }
    extend(...args) {
      var copy = new zepto.List(this);
      args.reduce((a,b) => { a.push(b); return a}, copy);
      return copy;
    }
    toString() {
      var contents = this.length ? this.cdr().reduce((a,b) => a + ", " + b, this.car()) : "";
      return "[" + contents + "]";
    }
    call(_, idx) {
      return this[idx];
    }
    contains(val) {
      return this.indexOf(val) > -1;
    }
  },
  ByteVector: class extends Uint8Array {
    car() {
      return this[0];
    }
    cdr() {
      return this.slice(1);
    }
    append(...args) {
      return this.extend.apply(this, args);
    }
    extend(...args) {
      // this allocates temporary Arrays for every iteration of reduce
      // Possible low hanging fruit for optimization
      var concat = (a, b) => {
        if (!(b instanceof zepto.ByteVector)) {
          b = new zepto.ByteVector([b]);
        }
        var c = new zepto.ByteVector(a.length + b.length);
        c.set(a);
        c.set(b, a.length);

        return c;
      }
      return args.reduce(concat, this);
    }
    toString() {
      var contents = this.length ? this.cdr().reduce((a,b) => a + ", " + b, this.car()) : "";
      return "b{" + contents + "}";
    }
    call(_, idx) {
      return this[idx];
    }
    contains(val) {
      return this.indexOf(val) > -1;
    }
  },
  HashMap: class extends Object {
    // The "hash" function is `toString()` for now. That sucks,
    // but reduces the complexity. Keys are strings anyway.
    // We provide a hashfun anyway, just to be sure. It's a variant
    // of Java's String.hashCode method that returns a string.
    hashfun(inpt) {
      var hash = 0;
      if (inpt.length == 0) return hash;
      for (var i = 0; i < inpt.length; i++) {
          var c = inpt.charCodeAt(i);
          hash = ((hash<<5)-hash)+c;
          hash = hash & hash;
      }
      return hash.toString();
    }
    constructor(...args) {
      super();
      for (var key = 0; key < args.length; key++) {
        var obj = args[key];
        if (obj && obj.length && obj.length === 2) {
          this[obj[0].toString()] = obj[1];
        } else if (obj instanceof Object && !Array.isArray(obj)) {
          for (var ikey of Object.keys(obj)) {
            this[ikey] = obj[ikey];
          }
        } else {
          this[obj.toString()] = args[++key];
        }
      }
      return this;
    }
    toString() {
      var keys = Object.keys(this);
      var contents = keys.length ? keys.slice(1)
                                       .reduce((a,b) => a  + this[a] + ", " + b, keys[0])
                                 : "";
      return "{" + contents + "}";
    }
    call(_, key) {
      return this[key];
    }
    contains(val) {
      return this.hasOwnProperty(val.toString());
    }
    empty() {
      return Object.keys(this).length === 0;
    }
  },
  Str: class extends String {
    car() {
      return this[0];
    }
    cdr() {
      return this.slice(1);
    }
    constructor(raw) {
      super(raw);
      this.raw = raw;
    }
    append(...args) {
      return args.reduce((a,b) => a + b, this);
    }
    extend(...args) {
      return args.reduce((a,b) => a + b, this);
    }
    toString() {
      return this.raw;
    }
    contains(val) {
      return this.indexOf(val) > -1;
    }
    empty() {
      return this.length === 0;
    }
  },
  add: function(...args) {
    return args.reduce((a,b) => a + b, 0);
  },
  mult: function(...args) {
    return args.reduce((a,b) => a * b, 1);
  },
  div: function() {
    return [].slice.call(arguments, 1).reduce((a,b) => a / b, arguments[0]);
  },
  sub: function() {
    return [].slice.call(arguments, 1).reduce((a,b) => a - b, arguments[0]);
  },
  isnil: (val) => val === null,
  hashSet: (hash, key, val) => hash[key] = val,
  apply: function(x, ...args) {
    return x.apply(null, args.reduce((a,b) => a.concat(b), []));
  },
};
module.exports = zepto;
