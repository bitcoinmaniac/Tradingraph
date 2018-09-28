module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "fb15");
/******/ })
/************************************************************************/
/******/ ({

/***/ "01f9":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var LIBRARY = __webpack_require__("2d00");
var $export = __webpack_require__("5ca1");
var redefine = __webpack_require__("2aba");
var hide = __webpack_require__("32e9");
var Iterators = __webpack_require__("84f2");
var $iterCreate = __webpack_require__("41a0");
var setToStringTag = __webpack_require__("7f20");
var getPrototypeOf = __webpack_require__("38fd");
var ITERATOR = __webpack_require__("2b4c")('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};


/***/ }),

/***/ "05ea":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("c302");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__("499e").default
var update = add("1e9d74c9", content, true, {"sourceMap":false,"shadowMode":false});

/***/ }),

/***/ "097d":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// https://github.com/tc39/proposal-promise-finally

var $export = __webpack_require__("5ca1");
var core = __webpack_require__("8378");
var global = __webpack_require__("7726");
var speciesConstructor = __webpack_require__("ebd6");
var promiseResolve = __webpack_require__("bcaa");

$export($export.P + $export.R, 'Promise', { 'finally': function (onFinally) {
  var C = speciesConstructor(this, core.Promise || global.Promise);
  var isFunction = typeof onFinally == 'function';
  return this.then(
    isFunction ? function (x) {
      return promiseResolve(C, onFinally()).then(function () { return x; });
    } : onFinally,
    isFunction ? function (e) {
      return promiseResolve(C, onFinally()).then(function () { throw e; });
    } : onFinally
  );
} });


/***/ }),

/***/ "0d58":
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = __webpack_require__("ce10");
var enumBugKeys = __webpack_require__("e11e");

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};


/***/ }),

/***/ "11e9":
/***/ (function(module, exports, __webpack_require__) {

var pIE = __webpack_require__("52a7");
var createDesc = __webpack_require__("4630");
var toIObject = __webpack_require__("6821");
var toPrimitive = __webpack_require__("6a99");
var has = __webpack_require__("69a8");
var IE8_DOM_DEFINE = __webpack_require__("c69a");
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = __webpack_require__("9e1e") ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};


/***/ }),

/***/ "1495":
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__("86cc");
var anObject = __webpack_require__("cb7c");
var getKeys = __webpack_require__("0d58");

module.exports = __webpack_require__("9e1e") ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};


/***/ }),

/***/ "1991":
/***/ (function(module, exports, __webpack_require__) {

var ctx = __webpack_require__("9b43");
var invoke = __webpack_require__("31f4");
var html = __webpack_require__("fab2");
var cel = __webpack_require__("230e");
var global = __webpack_require__("7726");
var process = global.process;
var setTask = global.setImmediate;
var clearTask = global.clearImmediate;
var MessageChannel = global.MessageChannel;
var Dispatch = global.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer, channel, port;
var run = function () {
  var id = +this;
  // eslint-disable-next-line no-prototype-builtins
  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function (event) {
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!setTask || !clearTask) {
  setTask = function setImmediate(fn) {
    var args = [];
    var i = 1;
    while (arguments.length > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (__webpack_require__("2d95")(process) == 'process') {
    defer = function (id) {
      process.nextTick(ctx(run, id, 1));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if (MessageChannel) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {
    defer = function (id) {
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listener, false);
  // IE8-
  } else if (ONREADYSTATECHANGE in cel('script')) {
    defer = function (id) {
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set: setTask,
  clear: clearTask
};


/***/ }),

/***/ "1eb2":
/***/ (function(module, exports, __webpack_require__) {

// This file is imported into lib/wc client bundles.

if (typeof window !== 'undefined') {
  var i
  if ((i = window.document.currentScript) && (i = i.src.match(/(.+\/)[^/]+\.js$/))) {
    __webpack_require__.p = i[1] // eslint-disable-line
  }
}


/***/ }),

/***/ "1fa8":
/***/ (function(module, exports, __webpack_require__) {

// call something on iterator step with safe closing on error
var anObject = __webpack_require__("cb7c");
module.exports = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) anObject(ret.call(iterator));
    throw e;
  }
};


/***/ }),

/***/ "230e":
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__("d3f4");
var document = __webpack_require__("7726").document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};


/***/ }),

/***/ "2350":
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),

/***/ "23c6":
/***/ (function(module, exports, __webpack_require__) {

// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = __webpack_require__("2d95");
var TAG = __webpack_require__("2b4c")('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};


/***/ }),

/***/ "2621":
/***/ (function(module, exports) {

exports.f = Object.getOwnPropertySymbols;


/***/ }),

/***/ "27ee":
/***/ (function(module, exports, __webpack_require__) {

var classof = __webpack_require__("23c6");
var ITERATOR = __webpack_require__("2b4c")('iterator');
var Iterators = __webpack_require__("84f2");
module.exports = __webpack_require__("8378").getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};


/***/ }),

/***/ "2aba":
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__("7726");
var hide = __webpack_require__("32e9");
var has = __webpack_require__("69a8");
var SRC = __webpack_require__("ca5a")('src');
var TO_STRING = 'toString';
var $toString = Function[TO_STRING];
var TPL = ('' + $toString).split(TO_STRING);

__webpack_require__("8378").inspectSource = function (it) {
  return $toString.call(it);
};

(module.exports = function (O, key, val, safe) {
  var isFunction = typeof val == 'function';
  if (isFunction) has(val, 'name') || hide(val, 'name', key);
  if (O[key] === val) return;
  if (isFunction) has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if (O === global) {
    O[key] = val;
  } else if (!safe) {
    delete O[key];
    hide(O, key, val);
  } else if (O[key]) {
    O[key] = val;
  } else {
    hide(O, key, val);
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString() {
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});


/***/ }),

/***/ "2aeb":
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = __webpack_require__("cb7c");
var dPs = __webpack_require__("1495");
var enumBugKeys = __webpack_require__("e11e");
var IE_PROTO = __webpack_require__("613b")('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = __webpack_require__("230e")('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  __webpack_require__("fab2").appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};


/***/ }),

/***/ "2b4c":
/***/ (function(module, exports, __webpack_require__) {

var store = __webpack_require__("5537")('wks');
var uid = __webpack_require__("ca5a");
var Symbol = __webpack_require__("7726").Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;


/***/ }),

/***/ "2d00":
/***/ (function(module, exports) {

module.exports = false;


/***/ }),

/***/ "2d95":
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};


/***/ }),

/***/ "2e40":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_6_oneOf_1_0_node_modules_css_loader_index_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_lib_index_js_ref_6_oneOf_1_2_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_AxisX_vue_vue_type_style_index_0_id_1458e30f_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("dff9");
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_6_oneOf_1_0_node_modules_css_loader_index_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_lib_index_js_ref_6_oneOf_1_2_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_AxisX_vue_vue_type_style_index_0_id_1458e30f_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_index_js_ref_6_oneOf_1_0_node_modules_css_loader_index_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_lib_index_js_ref_6_oneOf_1_2_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_AxisX_vue_vue_type_style_index_0_id_1458e30f_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_vue_style_loader_index_js_ref_6_oneOf_1_0_node_modules_css_loader_index_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_lib_index_js_ref_6_oneOf_1_2_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_AxisX_vue_vue_type_style_index_0_id_1458e30f_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "31f4":
/***/ (function(module, exports) {

// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function (fn, args, that) {
  var un = that === undefined;
  switch (args.length) {
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return fn.apply(that, args);
};


/***/ }),

/***/ "32e9":
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__("86cc");
var createDesc = __webpack_require__("4630");
module.exports = __webpack_require__("9e1e") ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),

/***/ "33a4":
/***/ (function(module, exports, __webpack_require__) {

// check on default Array iterator
var Iterators = __webpack_require__("84f2");
var ITERATOR = __webpack_require__("2b4c")('iterator');
var ArrayProto = Array.prototype;

module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};


/***/ }),

/***/ "386b":
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__("5ca1");
var fails = __webpack_require__("79e5");
var defined = __webpack_require__("be13");
var quot = /"/g;
// B.2.3.2.1 CreateHTML(string, tag, attribute, value)
var createHTML = function (string, tag, attribute, value) {
  var S = String(defined(string));
  var p1 = '<' + tag;
  if (attribute !== '') p1 += ' ' + attribute + '="' + String(value).replace(quot, '&quot;') + '"';
  return p1 + '>' + S + '</' + tag + '>';
};
module.exports = function (NAME, exec) {
  var O = {};
  O[NAME] = exec(createHTML);
  $export($export.P + $export.F * fails(function () {
    var test = ''[NAME]('"');
    return test !== test.toLowerCase() || test.split('"').length > 3;
  }), 'String', O);
};


/***/ }),

/***/ "38fd":
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = __webpack_require__("69a8");
var toObject = __webpack_require__("4bf8");
var IE_PROTO = __webpack_require__("613b")('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};


/***/ }),

/***/ "3ff0":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("2350")(false);
// imports


// module
exports.push([module.i, "\n.please-stop-center[data-v-617e8cf5]{fill:rgba(192,11,101,.1)\n}\n.please-stop-handle[data-v-617e8cf5]{fill:rgba(192,11,101,.8)\n}", ""]);

// exports


/***/ }),

/***/ "41a0":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var create = __webpack_require__("2aeb");
var descriptor = __webpack_require__("4630");
var setToStringTag = __webpack_require__("7f20");
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
__webpack_require__("32e9")(IteratorPrototype, __webpack_require__("2b4c")('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};


/***/ }),

/***/ "456d":
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.14 Object.keys(O)
var toObject = __webpack_require__("4bf8");
var $keys = __webpack_require__("0d58");

__webpack_require__("5eda")('keys', function () {
  return function keys(it) {
    return $keys(toObject(it));
  };
});


/***/ }),

/***/ "4588":
/***/ (function(module, exports) {

// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};


/***/ }),

/***/ "4630":
/***/ (function(module, exports) {

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),

/***/ "499e":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./node_modules/vue-style-loader/lib/listToStyles.js
/**
 * Translates the list format produced by css-loader into something
 * easier to manipulate.
 */
function listToStyles (parentId, list) {
  var styles = []
  var newStyles = {}
  for (var i = 0; i < list.length; i++) {
    var item = list[i]
    var id = item[0]
    var css = item[1]
    var media = item[2]
    var sourceMap = item[3]
    var part = {
      id: parentId + ':' + i,
      css: css,
      media: media,
      sourceMap: sourceMap
    }
    if (!newStyles[id]) {
      styles.push(newStyles[id] = { id: id, parts: [part] })
    } else {
      newStyles[id].parts.push(part)
    }
  }
  return styles
}

// CONCATENATED MODULE: ./node_modules/vue-style-loader/lib/addStylesClient.js
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return addStylesClient; });
/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
  Modified by Evan You @yyx990803
*/



var hasDocument = typeof document !== 'undefined'

if (typeof DEBUG !== 'undefined' && DEBUG) {
  if (!hasDocument) {
    throw new Error(
    'vue-style-loader cannot be used in a non-browser environment. ' +
    "Use { target: 'node' } in your Webpack config to indicate a server-rendering environment."
  ) }
}

/*
type StyleObject = {
  id: number;
  parts: Array<StyleObjectPart>
}

type StyleObjectPart = {
  css: string;
  media: string;
  sourceMap: ?string
}
*/

var stylesInDom = {/*
  [id: number]: {
    id: number,
    refs: number,
    parts: Array<(obj?: StyleObjectPart) => void>
  }
*/}

var head = hasDocument && (document.head || document.getElementsByTagName('head')[0])
var singletonElement = null
var singletonCounter = 0
var isProduction = false
var noop = function () {}
var options = null
var ssrIdKey = 'data-vue-ssr-id'

// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
// tags it will allow on a page
var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\b/.test(navigator.userAgent.toLowerCase())

function addStylesClient (parentId, list, _isProduction, _options) {
  isProduction = _isProduction

  options = _options || {}

  var styles = listToStyles(parentId, list)
  addStylesToDom(styles)

  return function update (newList) {
    var mayRemove = []
    for (var i = 0; i < styles.length; i++) {
      var item = styles[i]
      var domStyle = stylesInDom[item.id]
      domStyle.refs--
      mayRemove.push(domStyle)
    }
    if (newList) {
      styles = listToStyles(parentId, newList)
      addStylesToDom(styles)
    } else {
      styles = []
    }
    for (var i = 0; i < mayRemove.length; i++) {
      var domStyle = mayRemove[i]
      if (domStyle.refs === 0) {
        for (var j = 0; j < domStyle.parts.length; j++) {
          domStyle.parts[j]()
        }
        delete stylesInDom[domStyle.id]
      }
    }
  }
}

function addStylesToDom (styles /* Array<StyleObject> */) {
  for (var i = 0; i < styles.length; i++) {
    var item = styles[i]
    var domStyle = stylesInDom[item.id]
    if (domStyle) {
      domStyle.refs++
      for (var j = 0; j < domStyle.parts.length; j++) {
        domStyle.parts[j](item.parts[j])
      }
      for (; j < item.parts.length; j++) {
        domStyle.parts.push(addStyle(item.parts[j]))
      }
      if (domStyle.parts.length > item.parts.length) {
        domStyle.parts.length = item.parts.length
      }
    } else {
      var parts = []
      for (var j = 0; j < item.parts.length; j++) {
        parts.push(addStyle(item.parts[j]))
      }
      stylesInDom[item.id] = { id: item.id, refs: 1, parts: parts }
    }
  }
}

function createStyleElement () {
  var styleElement = document.createElement('style')
  styleElement.type = 'text/css'
  head.appendChild(styleElement)
  return styleElement
}

function addStyle (obj /* StyleObjectPart */) {
  var update, remove
  var styleElement = document.querySelector('style[' + ssrIdKey + '~="' + obj.id + '"]')

  if (styleElement) {
    if (isProduction) {
      // has SSR styles and in production mode.
      // simply do nothing.
      return noop
    } else {
      // has SSR styles but in dev mode.
      // for some reason Chrome can't handle source map in server-rendered
      // style tags - source maps in <style> only works if the style tag is
      // created and inserted dynamically. So we remove the server rendered
      // styles and inject new ones.
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  if (isOldIE) {
    // use singleton mode for IE9.
    var styleIndex = singletonCounter++
    styleElement = singletonElement || (singletonElement = createStyleElement())
    update = applyToSingletonTag.bind(null, styleElement, styleIndex, false)
    remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true)
  } else {
    // use multi-style-tag mode in all other cases
    styleElement = createStyleElement()
    update = applyToTag.bind(null, styleElement)
    remove = function () {
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  update(obj)

  return function updateStyle (newObj /* StyleObjectPart */) {
    if (newObj) {
      if (newObj.css === obj.css &&
          newObj.media === obj.media &&
          newObj.sourceMap === obj.sourceMap) {
        return
      }
      update(obj = newObj)
    } else {
      remove()
    }
  }
}

var replaceText = (function () {
  var textStore = []

  return function (index, replacement) {
    textStore[index] = replacement
    return textStore.filter(Boolean).join('\n')
  }
})()

function applyToSingletonTag (styleElement, index, remove, obj) {
  var css = remove ? '' : obj.css

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = replaceText(index, css)
  } else {
    var cssNode = document.createTextNode(css)
    var childNodes = styleElement.childNodes
    if (childNodes[index]) styleElement.removeChild(childNodes[index])
    if (childNodes.length) {
      styleElement.insertBefore(cssNode, childNodes[index])
    } else {
      styleElement.appendChild(cssNode)
    }
  }
}

function applyToTag (styleElement, obj) {
  var css = obj.css
  var media = obj.media
  var sourceMap = obj.sourceMap

  if (media) {
    styleElement.setAttribute('media', media)
  }
  if (options.ssrId) {
    styleElement.setAttribute(ssrIdKey, obj.id)
  }

  if (sourceMap) {
    // https://developer.chrome.com/devtools/docs/javascript-debugging
    // this makes source maps inside style tags work properly in Chrome
    css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */'
    // http://stackoverflow.com/a/26603875
    css += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + ' */'
  }

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild)
    }
    styleElement.appendChild(document.createTextNode(css))
  }
}


/***/ }),

/***/ "4a59":
/***/ (function(module, exports, __webpack_require__) {

var ctx = __webpack_require__("9b43");
var call = __webpack_require__("1fa8");
var isArrayIter = __webpack_require__("33a4");
var anObject = __webpack_require__("cb7c");
var toLength = __webpack_require__("9def");
var getIterFn = __webpack_require__("27ee");
var BREAK = {};
var RETURN = {};
var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
  var iterFn = ITERATOR ? function () { return iterable; } : getIterFn(iterable);
  var f = ctx(fn, that, entries ? 2 : 1);
  var index = 0;
  var length, step, iterator, result;
  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if (result === BREAK || result === RETURN) return result;
  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
    result = call(iterator, f, step.value, entries);
    if (result === BREAK || result === RETURN) return result;
  }
};
exports.BREAK = BREAK;
exports.RETURN = RETURN;


/***/ }),

/***/ "4bf8":
/***/ (function(module, exports, __webpack_require__) {

// 7.1.13 ToObject(argument)
var defined = __webpack_require__("be13");
module.exports = function (it) {
  return Object(defined(it));
};


/***/ }),

/***/ "52a7":
/***/ (function(module, exports) {

exports.f = {}.propertyIsEnumerable;


/***/ }),

/***/ "5505":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("e002");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__("499e").default
var update = add("e8dea582", content, true, {"sourceMap":false,"shadowMode":false});

/***/ }),

/***/ "551c":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var LIBRARY = __webpack_require__("2d00");
var global = __webpack_require__("7726");
var ctx = __webpack_require__("9b43");
var classof = __webpack_require__("23c6");
var $export = __webpack_require__("5ca1");
var isObject = __webpack_require__("d3f4");
var aFunction = __webpack_require__("d8e8");
var anInstance = __webpack_require__("f605");
var forOf = __webpack_require__("4a59");
var speciesConstructor = __webpack_require__("ebd6");
var task = __webpack_require__("1991").set;
var microtask = __webpack_require__("8079")();
var newPromiseCapabilityModule = __webpack_require__("a5b8");
var perform = __webpack_require__("9c80");
var userAgent = __webpack_require__("a25f");
var promiseResolve = __webpack_require__("bcaa");
var PROMISE = 'Promise';
var TypeError = global.TypeError;
var process = global.process;
var versions = process && process.versions;
var v8 = versions && versions.v8 || '';
var $Promise = global[PROMISE];
var isNode = classof(process) == 'process';
var empty = function () { /* empty */ };
var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
var newPromiseCapability = newGenericPromiseCapability = newPromiseCapabilityModule.f;

var USE_NATIVE = !!function () {
  try {
    // correct subclassing with @@species support
    var promise = $Promise.resolve(1);
    var FakePromise = (promise.constructor = {})[__webpack_require__("2b4c")('species')] = function (exec) {
      exec(empty, empty);
    };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function')
      && promise.then(empty) instanceof FakePromise
      // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
      // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
      // we can't detect it synchronously, so just check versions
      && v8.indexOf('6.6') !== 0
      && userAgent.indexOf('Chrome/66') === -1;
  } catch (e) { /* empty */ }
}();

// helpers
var isThenable = function (it) {
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var notify = function (promise, isReject) {
  if (promise._n) return;
  promise._n = true;
  var chain = promise._c;
  microtask(function () {
    var value = promise._v;
    var ok = promise._s == 1;
    var i = 0;
    var run = function (reaction) {
      var handler = ok ? reaction.ok : reaction.fail;
      var resolve = reaction.resolve;
      var reject = reaction.reject;
      var domain = reaction.domain;
      var result, then, exited;
      try {
        if (handler) {
          if (!ok) {
            if (promise._h == 2) onHandleUnhandled(promise);
            promise._h = 1;
          }
          if (handler === true) result = value;
          else {
            if (domain) domain.enter();
            result = handler(value); // may throw
            if (domain) {
              domain.exit();
              exited = true;
            }
          }
          if (result === reaction.promise) {
            reject(TypeError('Promise-chain cycle'));
          } else if (then = isThenable(result)) {
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch (e) {
        if (domain && !exited) domain.exit();
        reject(e);
      }
    };
    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if (isReject && !promise._h) onUnhandled(promise);
  });
};
var onUnhandled = function (promise) {
  task.call(global, function () {
    var value = promise._v;
    var unhandled = isUnhandled(promise);
    var result, handler, console;
    if (unhandled) {
      result = perform(function () {
        if (isNode) {
          process.emit('unhandledRejection', value, promise);
        } else if (handler = global.onunhandledrejection) {
          handler({ promise: promise, reason: value });
        } else if ((console = global.console) && console.error) {
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if (unhandled && result.e) throw result.v;
  });
};
var isUnhandled = function (promise) {
  return promise._h !== 1 && (promise._a || promise._c).length === 0;
};
var onHandleUnhandled = function (promise) {
  task.call(global, function () {
    var handler;
    if (isNode) {
      process.emit('rejectionHandled', promise);
    } else if (handler = global.onrejectionhandled) {
      handler({ promise: promise, reason: promise._v });
    }
  });
};
var $reject = function (value) {
  var promise = this;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if (!promise._a) promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function (value) {
  var promise = this;
  var then;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if (promise === value) throw TypeError("Promise can't be resolved itself");
    if (then = isThenable(value)) {
      microtask(function () {
        var wrapper = { _w: promise, _d: false }; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch (e) {
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch (e) {
    $reject.call({ _w: promise, _d: false }, e); // wrap
  }
};

// constructor polyfill
if (!USE_NATIVE) {
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor) {
    anInstance(this, $Promise, PROMISE, '_h');
    aFunction(executor);
    Internal.call(this);
    try {
      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
    } catch (err) {
      $reject.call(this, err);
    }
  };
  // eslint-disable-next-line no-unused-vars
  Internal = function Promise(executor) {
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal.prototype = __webpack_require__("dcbc")($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected) {
      var reaction = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
      this._c.push(reaction);
      if (this._a) this._a.push(reaction);
      if (this._s) notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    }
  });
  OwnPromiseCapability = function () {
    var promise = new Internal();
    this.promise = promise;
    this.resolve = ctx($resolve, promise, 1);
    this.reject = ctx($reject, promise, 1);
  };
  newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
    return C === $Promise || C === Wrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Promise: $Promise });
__webpack_require__("7f20")($Promise, PROMISE);
__webpack_require__("7a56")(PROMISE);
Wrapper = __webpack_require__("8378")[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r) {
    var capability = newPromiseCapability(this);
    var $$reject = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x) {
    return promiseResolve(LIBRARY && this === Wrapper ? $Promise : this, x);
  }
});
$export($export.S + $export.F * !(USE_NATIVE && __webpack_require__("5cc5")(function (iter) {
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var values = [];
      var index = 0;
      var remaining = 1;
      forOf(iterable, false, function (promise) {
        var $index = index++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.e) reject(result.v);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var reject = capability.reject;
    var result = perform(function () {
      forOf(iterable, false, function (promise) {
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if (result.e) reject(result.v);
    return capability.promise;
  }
});


/***/ }),

/***/ "5537":
/***/ (function(module, exports, __webpack_require__) {

var core = __webpack_require__("8378");
var global = __webpack_require__("7726");
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: __webpack_require__("2d00") ? 'pure' : 'global',
  copyright: '© 2018 Denis Pushkarev (zloirock.ru)'
});


/***/ }),

/***/ "5c0b":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_lib_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("e45c");
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_lib_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_lib_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_lib_index_js_ref_8_oneOf_1_2_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "5ca1":
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__("7726");
var core = __webpack_require__("8378");
var hide = __webpack_require__("32e9");
var redefine = __webpack_require__("2aba");
var ctx = __webpack_require__("9b43");
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE];
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
  var key, own, out, exp;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if (target) redefine(target, key, out, type & $export.U);
    // export
    if (exports[key] != out) hide(exports, key, exp);
    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;


/***/ }),

/***/ "5cc5":
/***/ (function(module, exports, __webpack_require__) {

var ITERATOR = __webpack_require__("2b4c")('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function () { SAFE_CLOSING = true; };
  // eslint-disable-next-line no-throw-literal
  Array.from(riter, function () { throw 2; });
} catch (e) { /* empty */ }

module.exports = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR]();
    iter.next = function () { return { done: safe = true }; };
    arr[ITERATOR] = function () { return iter; };
    exec(arr);
  } catch (e) { /* empty */ }
  return safe;
};


/***/ }),

/***/ "5dbc":
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__("d3f4");
var setPrototypeOf = __webpack_require__("8b97").set;
module.exports = function (that, target, C) {
  var S = target.constructor;
  var P;
  if (S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && isObject(P) && setPrototypeOf) {
    setPrototypeOf(that, P);
  } return that;
};


/***/ }),

/***/ "5eda":
/***/ (function(module, exports, __webpack_require__) {

// most Object methods by ES6 should accept primitives
var $export = __webpack_require__("5ca1");
var core = __webpack_require__("8378");
var fails = __webpack_require__("79e5");
module.exports = function (KEY, exec) {
  var fn = (core.Object || {})[KEY] || Object[KEY];
  var exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function () { fn(1); }), 'Object', exp);
};


/***/ }),

/***/ "613b":
/***/ (function(module, exports, __webpack_require__) {

var shared = __webpack_require__("5537")('keys');
var uid = __webpack_require__("ca5a");
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};


/***/ }),

/***/ "626a":
/***/ (function(module, exports, __webpack_require__) {

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = __webpack_require__("2d95");
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};


/***/ }),

/***/ "62e4":
/***/ (function(module, exports) {

module.exports = function(module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),

/***/ "6821":
/***/ (function(module, exports, __webpack_require__) {

// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = __webpack_require__("626a");
var defined = __webpack_require__("be13");
module.exports = function (it) {
  return IObject(defined(it));
};


/***/ }),

/***/ "69a8":
/***/ (function(module, exports) {

var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};


/***/ }),

/***/ "6a99":
/***/ (function(module, exports, __webpack_require__) {

// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = __webpack_require__("d3f4");
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};


/***/ }),

/***/ "7333":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 19.1.2.1 Object.assign(target, source, ...)
var getKeys = __webpack_require__("0d58");
var gOPS = __webpack_require__("2621");
var pIE = __webpack_require__("52a7");
var toObject = __webpack_require__("4bf8");
var IObject = __webpack_require__("626a");
var $assign = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || __webpack_require__("79e5")(function () {
  var A = {};
  var B = {};
  // eslint-disable-next-line no-undef
  var S = Symbol();
  var K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function (k) { B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
  var T = toObject(target);
  var aLen = arguments.length;
  var index = 1;
  var getSymbols = gOPS.f;
  var isEnum = pIE.f;
  while (aLen > index) {
    var S = IObject(arguments[index++]);
    var keys = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
  } return T;
} : $assign;


/***/ }),

/***/ "7726":
/***/ (function(module, exports) {

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef


/***/ }),

/***/ "7785":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// http://stackoverflow.com/questions/10343913/how-to-create-a-web-worker-from-a-string

var URL = window.URL || window.webkitURL;

module.exports = function (content, url) {
  try {
    try {
      var blob;

      try {
        // BlobBuilder = Deprecated, but widely implemented
        var BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;

        blob = new BlobBuilder();

        blob.append(content);

        blob = blob.getBlob();
      } catch (e) {
        // The proposed API
        blob = new Blob([content]);
      }

      return new Worker(URL.createObjectURL(blob));
    } catch (e) {
      return new Worker('data:application/javascript,' + encodeURIComponent(content));
    }
  } catch (e) {
    if (!url) {
      throw Error('Inline worker is not supported');
    }

    return new Worker(url);
  }
};

/***/ }),

/***/ "77f1":
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__("4588");
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};


/***/ }),

/***/ "79e5":
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};


/***/ }),

/***/ "7a56":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var global = __webpack_require__("7726");
var dP = __webpack_require__("86cc");
var DESCRIPTORS = __webpack_require__("9e1e");
var SPECIES = __webpack_require__("2b4c")('species');

module.exports = function (KEY) {
  var C = global[KEY];
  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
    configurable: true,
    get: function () { return this; }
  });
};


/***/ }),

/***/ "7f20":
/***/ (function(module, exports, __webpack_require__) {

var def = __webpack_require__("86cc").f;
var has = __webpack_require__("69a8");
var TAG = __webpack_require__("2b4c")('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};


/***/ }),

/***/ "8079":
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__("7726");
var macrotask = __webpack_require__("1991").set;
var Observer = global.MutationObserver || global.WebKitMutationObserver;
var process = global.process;
var Promise = global.Promise;
var isNode = __webpack_require__("2d95")(process) == 'process';

module.exports = function () {
  var head, last, notify;

  var flush = function () {
    var parent, fn;
    if (isNode && (parent = process.domain)) parent.exit();
    while (head) {
      fn = head.fn;
      head = head.next;
      try {
        fn();
      } catch (e) {
        if (head) notify();
        else last = undefined;
        throw e;
      }
    } last = undefined;
    if (parent) parent.enter();
  };

  // Node.js
  if (isNode) {
    notify = function () {
      process.nextTick(flush);
    };
  // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
  } else if (Observer && !(global.navigator && global.navigator.standalone)) {
    var toggle = true;
    var node = document.createTextNode('');
    new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
    notify = function () {
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if (Promise && Promise.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    var promise = Promise.resolve(undefined);
    notify = function () {
      promise.then(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function () {
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global, flush);
    };
  }

  return function (fn) {
    var task = { fn: fn, next: undefined };
    if (last) last.next = task;
    if (!head) {
      head = task;
      notify();
    } last = task;
  };
};


/***/ }),

/***/ "8378":
/***/ (function(module, exports) {

var core = module.exports = { version: '2.5.7' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef


/***/ }),

/***/ "84f2":
/***/ (function(module, exports) {

module.exports = {};


/***/ }),

/***/ "86cc":
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__("cb7c");
var IE8_DOM_DEFINE = __webpack_require__("c69a");
var toPrimitive = __webpack_require__("6a99");
var dP = Object.defineProperty;

exports.f = __webpack_require__("9e1e") ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),

/***/ "8ac9":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("2350")(false);
// imports


// module
exports.push([module.i, "\n.crypto-chart .axis-border,.crypto-chart .axis-x,.crypto-chart .axis-y{fill:none;shape-rendering:crispEdges;stroke:#000;stroke-width:1px\n}\n.crypto-chart .candle{stroke-width:1px\n}\n.crypto-chart .candles-path-volume,.crypto-chart .candles-path-volume.hover{fill:rgba(21,101,192,.16);stroke:rgba(21,101,192,.16)\n}\n.crypto-chart .candles-path-positive{fill:#689f38;stroke:#689f38\n}\n.crypto-chart .candles-path-positive.hover{fill:rgba(104,230,56,.8);stroke:rgba(104,230,56,.8)\n}\n.crypto-chart .candles-path-negative{fill:#d32f2f;stroke:#d32f2f\n}\n.crypto-chart .candles-path-negative.hover{fill:#ff3c3c;stroke:#e62f2f\n}\n.crypto-chart .cross{fill:none;stroke:#333;stroke-dasharray:1,3;stroke-width:1;visibility:visible\n}\n.crypto-chart .price-label path{fill:#400;opacity:.5;stroke:#400\n}\n.crypto-chart .price-label text{fill:#fff;stroke:none;text-anchor:end\n}\n.crypto-chart .moment-label path{fill:#333;opacity:.5;stroke:#333\n}\n.crypto-chart .moment-label text{fill:#fff;stroke:none;text-anchor:middle\n}", ""]);

// exports


/***/ }),

/***/ "8b97":
/***/ (function(module, exports, __webpack_require__) {

// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = __webpack_require__("d3f4");
var anObject = __webpack_require__("cb7c");
var check = function (O, proto) {
  anObject(O);
  if (!isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function (test, buggy, set) {
      try {
        set = __webpack_require__("9b43")(Function.call, __webpack_require__("11e9").f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch (e) { buggy = true; }
      return function setPrototypeOf(O, proto) {
        check(O, proto);
        if (buggy) O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};


/***/ }),

/***/ "9093":
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = __webpack_require__("ce10");
var hiddenKeys = __webpack_require__("e11e").concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};


/***/ }),

/***/ "9b43":
/***/ (function(module, exports, __webpack_require__) {

// optional / simple context binding
var aFunction = __webpack_require__("d8e8");
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};


/***/ }),

/***/ "9c33":
/***/ (function(module, exports, __webpack_require__) {

module.exports = function() {
  return __webpack_require__("7785")("/******/ (function(modules) { // webpackBootstrap\n/******/ \t// The module cache\n/******/ \tvar installedModules = {};\n/******/\n/******/ \t// The require function\n/******/ \tfunction __webpack_require__(moduleId) {\n/******/\n/******/ \t\t// Check if module is in cache\n/******/ \t\tif(installedModules[moduleId]) {\n/******/ \t\t\treturn installedModules[moduleId].exports;\n/******/ \t\t}\n/******/ \t\t// Create a new module (and put it into the cache)\n/******/ \t\tvar module = installedModules[moduleId] = {\n/******/ \t\t\ti: moduleId,\n/******/ \t\t\tl: false,\n/******/ \t\t\texports: {}\n/******/ \t\t};\n/******/\n/******/ \t\t// Execute the module function\n/******/ \t\tmodules[moduleId].call(module.exports, module, module.exports, __webpack_require__);\n/******/\n/******/ \t\t// Flag the module as loaded\n/******/ \t\tmodule.l = true;\n/******/\n/******/ \t\t// Return the exports of the module\n/******/ \t\treturn module.exports;\n/******/ \t}\n/******/\n/******/\n/******/ \t// expose the modules object (__webpack_modules__)\n/******/ \t__webpack_require__.m = modules;\n/******/\n/******/ \t// expose the module cache\n/******/ \t__webpack_require__.c = installedModules;\n/******/\n/******/ \t// define getter function for harmony exports\n/******/ \t__webpack_require__.d = function(exports, name, getter) {\n/******/ \t\tif(!__webpack_require__.o(exports, name)) {\n/******/ \t\t\tObject.defineProperty(exports, name, { enumerable: true, get: getter });\n/******/ \t\t}\n/******/ \t};\n/******/\n/******/ \t// define __esModule on exports\n/******/ \t__webpack_require__.r = function(exports) {\n/******/ \t\tif(typeof Symbol !== 'undefined' && Symbol.toStringTag) {\n/******/ \t\t\tObject.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });\n/******/ \t\t}\n/******/ \t\tObject.defineProperty(exports, '__esModule', { value: true });\n/******/ \t};\n/******/\n/******/ \t// create a fake namespace object\n/******/ \t// mode & 1: value is a module id, require it\n/******/ \t// mode & 2: merge all properties of value into the ns\n/******/ \t// mode & 4: return value when already ns object\n/******/ \t// mode & 8|1: behave like require\n/******/ \t__webpack_require__.t = function(value, mode) {\n/******/ \t\tif(mode & 1) value = __webpack_require__(value);\n/******/ \t\tif(mode & 8) return value;\n/******/ \t\tif((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;\n/******/ \t\tvar ns = Object.create(null);\n/******/ \t\t__webpack_require__.r(ns);\n/******/ \t\tObject.defineProperty(ns, 'default', { enumerable: true, value: value });\n/******/ \t\tif(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));\n/******/ \t\treturn ns;\n/******/ \t};\n/******/\n/******/ \t// getDefaultExport function for compatibility with non-harmony modules\n/******/ \t__webpack_require__.n = function(module) {\n/******/ \t\tvar getter = module && module.__esModule ?\n/******/ \t\t\tfunction getDefault() { return module['default']; } :\n/******/ \t\t\tfunction getModuleExports() { return module; };\n/******/ \t\t__webpack_require__.d(getter, 'a', getter);\n/******/ \t\treturn getter;\n/******/ \t};\n/******/\n/******/ \t// Object.prototype.hasOwnProperty.call\n/******/ \t__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };\n/******/\n/******/ \t// __webpack_public_path__\n/******/ \t__webpack_require__.p = \"\";\n/******/\n/******/\n/******/ \t// Load entry module and return exports\n/******/ \treturn __webpack_require__(__webpack_require__.s = \"da2a\");\n/******/ })\n/************************************************************************/\n/******/ ({\n\n/***/ \"01f9\":\n/***/ (function(module, exports, __webpack_require__) {\n\n\"use strict\";\n\nvar LIBRARY = __webpack_require__(\"2d00\");\nvar $export = __webpack_require__(\"5ca1\");\nvar redefine = __webpack_require__(\"2aba\");\nvar hide = __webpack_require__(\"32e9\");\nvar Iterators = __webpack_require__(\"84f2\");\nvar $iterCreate = __webpack_require__(\"41a0\");\nvar setToStringTag = __webpack_require__(\"7f20\");\nvar getPrototypeOf = __webpack_require__(\"38fd\");\nvar ITERATOR = __webpack_require__(\"2b4c\")('iterator');\nvar BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`\nvar FF_ITERATOR = '@@iterator';\nvar KEYS = 'keys';\nvar VALUES = 'values';\n\nvar returnThis = function () { return this; };\n\nmodule.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {\n  $iterCreate(Constructor, NAME, next);\n  var getMethod = function (kind) {\n    if (!BUGGY && kind in proto) return proto[kind];\n    switch (kind) {\n      case KEYS: return function keys() { return new Constructor(this, kind); };\n      case VALUES: return function values() { return new Constructor(this, kind); };\n    } return function entries() { return new Constructor(this, kind); };\n  };\n  var TAG = NAME + ' Iterator';\n  var DEF_VALUES = DEFAULT == VALUES;\n  var VALUES_BUG = false;\n  var proto = Base.prototype;\n  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];\n  var $default = $native || getMethod(DEFAULT);\n  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;\n  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;\n  var methods, key, IteratorPrototype;\n  // Fix native\n  if ($anyNative) {\n    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));\n    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {\n      // Set @@toStringTag to native iterators\n      setToStringTag(IteratorPrototype, TAG, true);\n      // fix for some old engines\n      if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);\n    }\n  }\n  // fix Array#{values, @@iterator}.name in V8 / FF\n  if (DEF_VALUES && $native && $native.name !== VALUES) {\n    VALUES_BUG = true;\n    $default = function values() { return $native.call(this); };\n  }\n  // Define iterator\n  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {\n    hide(proto, ITERATOR, $default);\n  }\n  // Plug for library\n  Iterators[NAME] = $default;\n  Iterators[TAG] = returnThis;\n  if (DEFAULT) {\n    methods = {\n      values: DEF_VALUES ? $default : getMethod(VALUES),\n      keys: IS_SET ? $default : getMethod(KEYS),\n      entries: $entries\n    };\n    if (FORCED) for (key in methods) {\n      if (!(key in proto)) redefine(proto, key, methods[key]);\n    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);\n  }\n  return methods;\n};\n\n\n/***/ }),\n\n/***/ \"097d\":\n/***/ (function(module, exports, __webpack_require__) {\n\n\"use strict\";\n// https://github.com/tc39/proposal-promise-finally\n\nvar $export = __webpack_require__(\"5ca1\");\nvar core = __webpack_require__(\"8378\");\nvar global = __webpack_require__(\"7726\");\nvar speciesConstructor = __webpack_require__(\"ebd6\");\nvar promiseResolve = __webpack_require__(\"bcaa\");\n\n$export($export.P + $export.R, 'Promise', { 'finally': function (onFinally) {\n  var C = speciesConstructor(this, core.Promise || global.Promise);\n  var isFunction = typeof onFinally == 'function';\n  return this.then(\n    isFunction ? function (x) {\n      return promiseResolve(C, onFinally()).then(function () { return x; });\n    } : onFinally,\n    isFunction ? function (e) {\n      return promiseResolve(C, onFinally()).then(function () { throw e; });\n    } : onFinally\n  );\n} });\n\n\n/***/ }),\n\n/***/ \"09fa\":\n/***/ (function(module, exports, __webpack_require__) {\n\n// https://tc39.github.io/ecma262/#sec-toindex\nvar toInteger = __webpack_require__(\"4588\");\nvar toLength = __webpack_require__(\"9def\");\nmodule.exports = function (it) {\n  if (it === undefined) return 0;\n  var number = toInteger(it);\n  var length = toLength(number);\n  if (number !== length) throw RangeError('Wrong length!');\n  return length;\n};\n\n\n/***/ }),\n\n/***/ \"0a49\":\n/***/ (function(module, exports, __webpack_require__) {\n\n// 0 -> Array#forEach\n// 1 -> Array#map\n// 2 -> Array#filter\n// 3 -> Array#some\n// 4 -> Array#every\n// 5 -> Array#find\n// 6 -> Array#findIndex\nvar ctx = __webpack_require__(\"9b43\");\nvar IObject = __webpack_require__(\"626a\");\nvar toObject = __webpack_require__(\"4bf8\");\nvar toLength = __webpack_require__(\"9def\");\nvar asc = __webpack_require__(\"cd1c\");\nmodule.exports = function (TYPE, $create) {\n  var IS_MAP = TYPE == 1;\n  var IS_FILTER = TYPE == 2;\n  var IS_SOME = TYPE == 3;\n  var IS_EVERY = TYPE == 4;\n  var IS_FIND_INDEX = TYPE == 6;\n  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;\n  var create = $create || asc;\n  return function ($this, callbackfn, that) {\n    var O = toObject($this);\n    var self = IObject(O);\n    var f = ctx(callbackfn, that, 3);\n    var length = toLength(self.length);\n    var index = 0;\n    var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;\n    var val, res;\n    for (;length > index; index++) if (NO_HOLES || index in self) {\n      val = self[index];\n      res = f(val, index, O);\n      if (TYPE) {\n        if (IS_MAP) result[index] = res;   // map\n        else if (res) switch (TYPE) {\n          case 3: return true;             // some\n          case 5: return val;              // find\n          case 6: return index;            // findIndex\n          case 2: result.push(val);        // filter\n        } else if (IS_EVERY) return false; // every\n      }\n    }\n    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;\n  };\n};\n\n\n/***/ }),\n\n/***/ \"0d58\":\n/***/ (function(module, exports, __webpack_require__) {\n\n// 19.1.2.14 / 15.2.3.14 Object.keys(O)\nvar $keys = __webpack_require__(\"ce10\");\nvar enumBugKeys = __webpack_require__(\"e11e\");\n\nmodule.exports = Object.keys || function keys(O) {\n  return $keys(O, enumBugKeys);\n};\n\n\n/***/ }),\n\n/***/ \"0f88\":\n/***/ (function(module, exports, __webpack_require__) {\n\nvar global = __webpack_require__(\"7726\");\nvar hide = __webpack_require__(\"32e9\");\nvar uid = __webpack_require__(\"ca5a\");\nvar TYPED = uid('typed_array');\nvar VIEW = uid('view');\nvar ABV = !!(global.ArrayBuffer && global.DataView);\nvar CONSTR = ABV;\nvar i = 0;\nvar l = 9;\nvar Typed;\n\nvar TypedArrayConstructors = (\n  'Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array'\n).split(',');\n\nwhile (i < l) {\n  if (Typed = global[TypedArrayConstructors[i++]]) {\n    hide(Typed.prototype, TYPED, true);\n    hide(Typed.prototype, VIEW, true);\n  } else CONSTR = false;\n}\n\nmodule.exports = {\n  ABV: ABV,\n  CONSTR: CONSTR,\n  TYPED: TYPED,\n  VIEW: VIEW\n};\n\n\n/***/ }),\n\n/***/ \"1169\":\n/***/ (function(module, exports, __webpack_require__) {\n\n// 7.2.2 IsArray(argument)\nvar cof = __webpack_require__(\"2d95\");\nmodule.exports = Array.isArray || function isArray(arg) {\n  return cof(arg) == 'Array';\n};\n\n\n/***/ }),\n\n/***/ \"11e9\":\n/***/ (function(module, exports, __webpack_require__) {\n\nvar pIE = __webpack_require__(\"52a7\");\nvar createDesc = __webpack_require__(\"4630\");\nvar toIObject = __webpack_require__(\"6821\");\nvar toPrimitive = __webpack_require__(\"6a99\");\nvar has = __webpack_require__(\"69a8\");\nvar IE8_DOM_DEFINE = __webpack_require__(\"c69a\");\nvar gOPD = Object.getOwnPropertyDescriptor;\n\nexports.f = __webpack_require__(\"9e1e\") ? gOPD : function getOwnPropertyDescriptor(O, P) {\n  O = toIObject(O);\n  P = toPrimitive(P, true);\n  if (IE8_DOM_DEFINE) try {\n    return gOPD(O, P);\n  } catch (e) { /* empty */ }\n  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);\n};\n\n\n/***/ }),\n\n/***/ \"1495\":\n/***/ (function(module, exports, __webpack_require__) {\n\nvar dP = __webpack_require__(\"86cc\");\nvar anObject = __webpack_require__(\"cb7c\");\nvar getKeys = __webpack_require__(\"0d58\");\n\nmodule.exports = __webpack_require__(\"9e1e\") ? Object.defineProperties : function defineProperties(O, Properties) {\n  anObject(O);\n  var keys = getKeys(Properties);\n  var length = keys.length;\n  var i = 0;\n  var P;\n  while (length > i) dP.f(O, P = keys[i++], Properties[P]);\n  return O;\n};\n\n\n/***/ }),\n\n/***/ \"1991\":\n/***/ (function(module, exports, __webpack_require__) {\n\nvar ctx = __webpack_require__(\"9b43\");\nvar invoke = __webpack_require__(\"31f4\");\nvar html = __webpack_require__(\"fab2\");\nvar cel = __webpack_require__(\"230e\");\nvar global = __webpack_require__(\"7726\");\nvar process = global.process;\nvar setTask = global.setImmediate;\nvar clearTask = global.clearImmediate;\nvar MessageChannel = global.MessageChannel;\nvar Dispatch = global.Dispatch;\nvar counter = 0;\nvar queue = {};\nvar ONREADYSTATECHANGE = 'onreadystatechange';\nvar defer, channel, port;\nvar run = function () {\n  var id = +this;\n  // eslint-disable-next-line no-prototype-builtins\n  if (queue.hasOwnProperty(id)) {\n    var fn = queue[id];\n    delete queue[id];\n    fn();\n  }\n};\nvar listener = function (event) {\n  run.call(event.data);\n};\n// Node.js 0.9+ & IE10+ has setImmediate, otherwise:\nif (!setTask || !clearTask) {\n  setTask = function setImmediate(fn) {\n    var args = [];\n    var i = 1;\n    while (arguments.length > i) args.push(arguments[i++]);\n    queue[++counter] = function () {\n      // eslint-disable-next-line no-new-func\n      invoke(typeof fn == 'function' ? fn : Function(fn), args);\n    };\n    defer(counter);\n    return counter;\n  };\n  clearTask = function clearImmediate(id) {\n    delete queue[id];\n  };\n  // Node.js 0.8-\n  if (__webpack_require__(\"2d95\")(process) == 'process') {\n    defer = function (id) {\n      process.nextTick(ctx(run, id, 1));\n    };\n  // Sphere (JS game engine) Dispatch API\n  } else if (Dispatch && Dispatch.now) {\n    defer = function (id) {\n      Dispatch.now(ctx(run, id, 1));\n    };\n  // Browsers with MessageChannel, includes WebWorkers\n  } else if (MessageChannel) {\n    channel = new MessageChannel();\n    port = channel.port2;\n    channel.port1.onmessage = listener;\n    defer = ctx(port.postMessage, port, 1);\n  // Browsers with postMessage, skip WebWorkers\n  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'\n  } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {\n    defer = function (id) {\n      global.postMessage(id + '', '*');\n    };\n    global.addEventListener('message', listener, false);\n  // IE8-\n  } else if (ONREADYSTATECHANGE in cel('script')) {\n    defer = function (id) {\n      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function () {\n        html.removeChild(this);\n        run.call(id);\n      };\n    };\n  // Rest old browsers\n  } else {\n    defer = function (id) {\n      setTimeout(ctx(run, id, 1), 0);\n    };\n  }\n}\nmodule.exports = {\n  set: setTask,\n  clear: clearTask\n};\n\n\n/***/ }),\n\n/***/ \"1fa8\":\n/***/ (function(module, exports, __webpack_require__) {\n\n// call something on iterator step with safe closing on error\nvar anObject = __webpack_require__(\"cb7c\");\nmodule.exports = function (iterator, fn, value, entries) {\n  try {\n    return entries ? fn(anObject(value)[0], value[1]) : fn(value);\n  // 7.4.6 IteratorClose(iterator, completion)\n  } catch (e) {\n    var ret = iterator['return'];\n    if (ret !== undefined) anObject(ret.call(iterator));\n    throw e;\n  }\n};\n\n\n/***/ }),\n\n/***/ \"230e\":\n/***/ (function(module, exports, __webpack_require__) {\n\nvar isObject = __webpack_require__(\"d3f4\");\nvar document = __webpack_require__(\"7726\").document;\n// typeof document.createElement is 'object' in old IE\nvar is = isObject(document) && isObject(document.createElement);\nmodule.exports = function (it) {\n  return is ? document.createElement(it) : {};\n};\n\n\n/***/ }),\n\n/***/ \"23c6\":\n/***/ (function(module, exports, __webpack_require__) {\n\n// getting tag from 19.1.3.6 Object.prototype.toString()\nvar cof = __webpack_require__(\"2d95\");\nvar TAG = __webpack_require__(\"2b4c\")('toStringTag');\n// ES3 wrong here\nvar ARG = cof(function () { return arguments; }()) == 'Arguments';\n\n// fallback for IE11 Script Access Denied error\nvar tryGet = function (it, key) {\n  try {\n    return it[key];\n  } catch (e) { /* empty */ }\n};\n\nmodule.exports = function (it) {\n  var O, T, B;\n  return it === undefined ? 'Undefined' : it === null ? 'Null'\n    // @@toStringTag case\n    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T\n    // builtinTag case\n    : ARG ? cof(O)\n    // ES3 arguments fallback\n    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;\n};\n\n\n/***/ }),\n\n/***/ \"2621\":\n/***/ (function(module, exports) {\n\nexports.f = Object.getOwnPropertySymbols;\n\n\n/***/ }),\n\n/***/ \"27ee\":\n/***/ (function(module, exports, __webpack_require__) {\n\nvar classof = __webpack_require__(\"23c6\");\nvar ITERATOR = __webpack_require__(\"2b4c\")('iterator');\nvar Iterators = __webpack_require__(\"84f2\");\nmodule.exports = __webpack_require__(\"8378\").getIteratorMethod = function (it) {\n  if (it != undefined) return it[ITERATOR]\n    || it['@@iterator']\n    || Iterators[classof(it)];\n};\n\n\n/***/ }),\n\n/***/ \"2aba\":\n/***/ (function(module, exports, __webpack_require__) {\n\nvar global = __webpack_require__(\"7726\");\nvar hide = __webpack_require__(\"32e9\");\nvar has = __webpack_require__(\"69a8\");\nvar SRC = __webpack_require__(\"ca5a\")('src');\nvar TO_STRING = 'toString';\nvar $toString = Function[TO_STRING];\nvar TPL = ('' + $toString).split(TO_STRING);\n\n__webpack_require__(\"8378\").inspectSource = function (it) {\n  return $toString.call(it);\n};\n\n(module.exports = function (O, key, val, safe) {\n  var isFunction = typeof val == 'function';\n  if (isFunction) has(val, 'name') || hide(val, 'name', key);\n  if (O[key] === val) return;\n  if (isFunction) has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));\n  if (O === global) {\n    O[key] = val;\n  } else if (!safe) {\n    delete O[key];\n    hide(O, key, val);\n  } else if (O[key]) {\n    O[key] = val;\n  } else {\n    hide(O, key, val);\n  }\n// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative\n})(Function.prototype, TO_STRING, function toString() {\n  return typeof this == 'function' && this[SRC] || $toString.call(this);\n});\n\n\n/***/ }),\n\n/***/ \"2aeb\":\n/***/ (function(module, exports, __webpack_require__) {\n\n// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])\nvar anObject = __webpack_require__(\"cb7c\");\nvar dPs = __webpack_require__(\"1495\");\nvar enumBugKeys = __webpack_require__(\"e11e\");\nvar IE_PROTO = __webpack_require__(\"613b\")('IE_PROTO');\nvar Empty = function () { /* empty */ };\nvar PROTOTYPE = 'prototype';\n\n// Create object with fake `null` prototype: use iframe Object with cleared prototype\nvar createDict = function () {\n  // Thrash, waste and sodomy: IE GC bug\n  var iframe = __webpack_require__(\"230e\")('iframe');\n  var i = enumBugKeys.length;\n  var lt = '<';\n  var gt = '>';\n  var iframeDocument;\n  iframe.style.display = 'none';\n  __webpack_require__(\"fab2\").appendChild(iframe);\n  iframe.src = 'javascript:'; // eslint-disable-line no-script-url\n  // createDict = iframe.contentWindow.Object;\n  // html.removeChild(iframe);\n  iframeDocument = iframe.contentWindow.document;\n  iframeDocument.open();\n  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);\n  iframeDocument.close();\n  createDict = iframeDocument.F;\n  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];\n  return createDict();\n};\n\nmodule.exports = Object.create || function create(O, Properties) {\n  var result;\n  if (O !== null) {\n    Empty[PROTOTYPE] = anObject(O);\n    result = new Empty();\n    Empty[PROTOTYPE] = null;\n    // add \"__proto__\" for Object.getPrototypeOf polyfill\n    result[IE_PROTO] = O;\n  } else result = createDict();\n  return Properties === undefined ? result : dPs(result, Properties);\n};\n\n\n/***/ }),\n\n/***/ \"2b4c\":\n/***/ (function(module, exports, __webpack_require__) {\n\nvar store = __webpack_require__(\"5537\")('wks');\nvar uid = __webpack_require__(\"ca5a\");\nvar Symbol = __webpack_require__(\"7726\").Symbol;\nvar USE_SYMBOL = typeof Symbol == 'function';\n\nvar $exports = module.exports = function (name) {\n  return store[name] || (store[name] =\n    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));\n};\n\n$exports.store = store;\n\n\n/***/ }),\n\n/***/ \"2d00\":\n/***/ (function(module, exports) {\n\nmodule.exports = false;\n\n\n/***/ }),\n\n/***/ \"2d95\":\n/***/ (function(module, exports) {\n\nvar toString = {}.toString;\n\nmodule.exports = function (it) {\n  return toString.call(it).slice(8, -1);\n};\n\n\n/***/ }),\n\n/***/ \"2f21\":\n/***/ (function(module, exports, __webpack_require__) {\n\n\"use strict\";\n\nvar fails = __webpack_require__(\"79e5\");\n\nmodule.exports = function (method, arg) {\n  return !!method && fails(function () {\n    // eslint-disable-next-line no-useless-call\n    arg ? method.call(null, function () { /* empty */ }, 1) : method.call(null);\n  });\n};\n\n\n/***/ }),\n\n/***/ \"31f4\":\n/***/ (function(module, exports) {\n\n// fast apply, http://jsperf.lnkit.com/fast-apply/5\nmodule.exports = function (fn, args, that) {\n  var un = that === undefined;\n  switch (args.length) {\n    case 0: return un ? fn()\n                      : fn.call(that);\n    case 1: return un ? fn(args[0])\n                      : fn.call(that, args[0]);\n    case 2: return un ? fn(args[0], args[1])\n                      : fn.call(that, args[0], args[1]);\n    case 3: return un ? fn(args[0], args[1], args[2])\n                      : fn.call(that, args[0], args[1], args[2]);\n    case 4: return un ? fn(args[0], args[1], args[2], args[3])\n                      : fn.call(that, args[0], args[1], args[2], args[3]);\n  } return fn.apply(that, args);\n};\n\n\n/***/ }),\n\n/***/ \"32e9\":\n/***/ (function(module, exports, __webpack_require__) {\n\nvar dP = __webpack_require__(\"86cc\");\nvar createDesc = __webpack_require__(\"4630\");\nmodule.exports = __webpack_require__(\"9e1e\") ? function (object, key, value) {\n  return dP.f(object, key, createDesc(1, value));\n} : function (object, key, value) {\n  object[key] = value;\n  return object;\n};\n\n\n/***/ }),\n\n/***/ \"33a4\":\n/***/ (function(module, exports, __webpack_require__) {\n\n// check on default Array iterator\nvar Iterators = __webpack_require__(\"84f2\");\nvar ITERATOR = __webpack_require__(\"2b4c\")('iterator');\nvar ArrayProto = Array.prototype;\n\nmodule.exports = function (it) {\n  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);\n};\n\n\n/***/ }),\n\n/***/ \"36bd\":\n/***/ (function(module, exports, __webpack_require__) {\n\n\"use strict\";\n// 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)\n\nvar toObject = __webpack_require__(\"4bf8\");\nvar toAbsoluteIndex = __webpack_require__(\"77f1\");\nvar toLength = __webpack_require__(\"9def\");\nmodule.exports = function fill(value /* , start = 0, end = @length */) {\n  var O = toObject(this);\n  var length = toLength(O.length);\n  var aLen = arguments.length;\n  var index = toAbsoluteIndex(aLen > 1 ? arguments[1] : undefined, length);\n  var end = aLen > 2 ? arguments[2] : undefined;\n  var endPos = end === undefined ? length : toAbsoluteIndex(end, length);\n  while (endPos > index) O[index++] = value;\n  return O;\n};\n\n\n/***/ }),\n\n/***/ \"38fd\":\n/***/ (function(module, exports, __webpack_require__) {\n\n// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)\nvar has = __webpack_require__(\"69a8\");\nvar toObject = __webpack_require__(\"4bf8\");\nvar IE_PROTO = __webpack_require__(\"613b\")('IE_PROTO');\nvar ObjectProto = Object.prototype;\n\nmodule.exports = Object.getPrototypeOf || function (O) {\n  O = toObject(O);\n  if (has(O, IE_PROTO)) return O[IE_PROTO];\n  if (typeof O.constructor == 'function' && O instanceof O.constructor) {\n    return O.constructor.prototype;\n  } return O instanceof Object ? ObjectProto : null;\n};\n\n\n/***/ }),\n\n/***/ \"41a0\":\n/***/ (function(module, exports, __webpack_require__) {\n\n\"use strict\";\n\nvar create = __webpack_require__(\"2aeb\");\nvar descriptor = __webpack_require__(\"4630\");\nvar setToStringTag = __webpack_require__(\"7f20\");\nvar IteratorPrototype = {};\n\n// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()\n__webpack_require__(\"32e9\")(IteratorPrototype, __webpack_require__(\"2b4c\")('iterator'), function () { return this; });\n\nmodule.exports = function (Constructor, NAME, next) {\n  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });\n  setToStringTag(Constructor, NAME + ' Iterator');\n};\n\n\n/***/ }),\n\n/***/ \"456d\":\n/***/ (function(module, exports, __webpack_require__) {\n\n// 19.1.2.14 Object.keys(O)\nvar toObject = __webpack_require__(\"4bf8\");\nvar $keys = __webpack_require__(\"0d58\");\n\n__webpack_require__(\"5eda\")('keys', function () {\n  return function keys(it) {\n    return $keys(toObject(it));\n  };\n});\n\n\n/***/ }),\n\n/***/ \"4588\":\n/***/ (function(module, exports) {\n\n// 7.1.4 ToInteger\nvar ceil = Math.ceil;\nvar floor = Math.floor;\nmodule.exports = function (it) {\n  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);\n};\n\n\n/***/ }),\n\n/***/ \"4630\":\n/***/ (function(module, exports) {\n\nmodule.exports = function (bitmap, value) {\n  return {\n    enumerable: !(bitmap & 1),\n    configurable: !(bitmap & 2),\n    writable: !(bitmap & 4),\n    value: value\n  };\n};\n\n\n/***/ }),\n\n/***/ \"4a59\":\n/***/ (function(module, exports, __webpack_require__) {\n\nvar ctx = __webpack_require__(\"9b43\");\nvar call = __webpack_require__(\"1fa8\");\nvar isArrayIter = __webpack_require__(\"33a4\");\nvar anObject = __webpack_require__(\"cb7c\");\nvar toLength = __webpack_require__(\"9def\");\nvar getIterFn = __webpack_require__(\"27ee\");\nvar BREAK = {};\nvar RETURN = {};\nvar exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {\n  var iterFn = ITERATOR ? function () { return iterable; } : getIterFn(iterable);\n  var f = ctx(fn, that, entries ? 2 : 1);\n  var index = 0;\n  var length, step, iterator, result;\n  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');\n  // fast case for arrays with default iterator\n  if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {\n    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);\n    if (result === BREAK || result === RETURN) return result;\n  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {\n    result = call(iterator, f, step.value, entries);\n    if (result === BREAK || result === RETURN) return result;\n  }\n};\nexports.BREAK = BREAK;\nexports.RETURN = RETURN;\n\n\n/***/ }),\n\n/***/ \"4bf8\":\n/***/ (function(module, exports, __webpack_require__) {\n\n// 7.1.13 ToObject(argument)\nvar defined = __webpack_require__(\"be13\");\nmodule.exports = function (it) {\n  return Object(defined(it));\n};\n\n\n/***/ }),\n\n/***/ \"52a7\":\n/***/ (function(module, exports) {\n\nexports.f = {}.propertyIsEnumerable;\n\n\n/***/ }),\n\n/***/ \"551c\":\n/***/ (function(module, exports, __webpack_require__) {\n\n\"use strict\";\n\nvar LIBRARY = __webpack_require__(\"2d00\");\nvar global = __webpack_require__(\"7726\");\nvar ctx = __webpack_require__(\"9b43\");\nvar classof = __webpack_require__(\"23c6\");\nvar $export = __webpack_require__(\"5ca1\");\nvar isObject = __webpack_require__(\"d3f4\");\nvar aFunction = __webpack_require__(\"d8e8\");\nvar anInstance = __webpack_require__(\"f605\");\nvar forOf = __webpack_require__(\"4a59\");\nvar speciesConstructor = __webpack_require__(\"ebd6\");\nvar task = __webpack_require__(\"1991\").set;\nvar microtask = __webpack_require__(\"8079\")();\nvar newPromiseCapabilityModule = __webpack_require__(\"a5b8\");\nvar perform = __webpack_require__(\"9c80\");\nvar userAgent = __webpack_require__(\"a25f\");\nvar promiseResolve = __webpack_require__(\"bcaa\");\nvar PROMISE = 'Promise';\nvar TypeError = global.TypeError;\nvar process = global.process;\nvar versions = process && process.versions;\nvar v8 = versions && versions.v8 || '';\nvar $Promise = global[PROMISE];\nvar isNode = classof(process) == 'process';\nvar empty = function () { /* empty */ };\nvar Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;\nvar newPromiseCapability = newGenericPromiseCapability = newPromiseCapabilityModule.f;\n\nvar USE_NATIVE = !!function () {\n  try {\n    // correct subclassing with @@species support\n    var promise = $Promise.resolve(1);\n    var FakePromise = (promise.constructor = {})[__webpack_require__(\"2b4c\")('species')] = function (exec) {\n      exec(empty, empty);\n    };\n    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test\n    return (isNode || typeof PromiseRejectionEvent == 'function')\n      && promise.then(empty) instanceof FakePromise\n      // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables\n      // https://bugs.chromium.org/p/chromium/issues/detail?id=830565\n      // we can't detect it synchronously, so just check versions\n      && v8.indexOf('6.6') !== 0\n      && userAgent.indexOf('Chrome/66') === -1;\n  } catch (e) { /* empty */ }\n}();\n\n// helpers\nvar isThenable = function (it) {\n  var then;\n  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;\n};\nvar notify = function (promise, isReject) {\n  if (promise._n) return;\n  promise._n = true;\n  var chain = promise._c;\n  microtask(function () {\n    var value = promise._v;\n    var ok = promise._s == 1;\n    var i = 0;\n    var run = function (reaction) {\n      var handler = ok ? reaction.ok : reaction.fail;\n      var resolve = reaction.resolve;\n      var reject = reaction.reject;\n      var domain = reaction.domain;\n      var result, then, exited;\n      try {\n        if (handler) {\n          if (!ok) {\n            if (promise._h == 2) onHandleUnhandled(promise);\n            promise._h = 1;\n          }\n          if (handler === true) result = value;\n          else {\n            if (domain) domain.enter();\n            result = handler(value); // may throw\n            if (domain) {\n              domain.exit();\n              exited = true;\n            }\n          }\n          if (result === reaction.promise) {\n            reject(TypeError('Promise-chain cycle'));\n          } else if (then = isThenable(result)) {\n            then.call(result, resolve, reject);\n          } else resolve(result);\n        } else reject(value);\n      } catch (e) {\n        if (domain && !exited) domain.exit();\n        reject(e);\n      }\n    };\n    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach\n    promise._c = [];\n    promise._n = false;\n    if (isReject && !promise._h) onUnhandled(promise);\n  });\n};\nvar onUnhandled = function (promise) {\n  task.call(global, function () {\n    var value = promise._v;\n    var unhandled = isUnhandled(promise);\n    var result, handler, console;\n    if (unhandled) {\n      result = perform(function () {\n        if (isNode) {\n          process.emit('unhandledRejection', value, promise);\n        } else if (handler = global.onunhandledrejection) {\n          handler({ promise: promise, reason: value });\n        } else if ((console = global.console) && console.error) {\n          console.error('Unhandled promise rejection', value);\n        }\n      });\n      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should\n      promise._h = isNode || isUnhandled(promise) ? 2 : 1;\n    } promise._a = undefined;\n    if (unhandled && result.e) throw result.v;\n  });\n};\nvar isUnhandled = function (promise) {\n  return promise._h !== 1 && (promise._a || promise._c).length === 0;\n};\nvar onHandleUnhandled = function (promise) {\n  task.call(global, function () {\n    var handler;\n    if (isNode) {\n      process.emit('rejectionHandled', promise);\n    } else if (handler = global.onrejectionhandled) {\n      handler({ promise: promise, reason: promise._v });\n    }\n  });\n};\nvar $reject = function (value) {\n  var promise = this;\n  if (promise._d) return;\n  promise._d = true;\n  promise = promise._w || promise; // unwrap\n  promise._v = value;\n  promise._s = 2;\n  if (!promise._a) promise._a = promise._c.slice();\n  notify(promise, true);\n};\nvar $resolve = function (value) {\n  var promise = this;\n  var then;\n  if (promise._d) return;\n  promise._d = true;\n  promise = promise._w || promise; // unwrap\n  try {\n    if (promise === value) throw TypeError(\"Promise can't be resolved itself\");\n    if (then = isThenable(value)) {\n      microtask(function () {\n        var wrapper = { _w: promise, _d: false }; // wrap\n        try {\n          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));\n        } catch (e) {\n          $reject.call(wrapper, e);\n        }\n      });\n    } else {\n      promise._v = value;\n      promise._s = 1;\n      notify(promise, false);\n    }\n  } catch (e) {\n    $reject.call({ _w: promise, _d: false }, e); // wrap\n  }\n};\n\n// constructor polyfill\nif (!USE_NATIVE) {\n  // 25.4.3.1 Promise(executor)\n  $Promise = function Promise(executor) {\n    anInstance(this, $Promise, PROMISE, '_h');\n    aFunction(executor);\n    Internal.call(this);\n    try {\n      executor(ctx($resolve, this, 1), ctx($reject, this, 1));\n    } catch (err) {\n      $reject.call(this, err);\n    }\n  };\n  // eslint-disable-next-line no-unused-vars\n  Internal = function Promise(executor) {\n    this._c = [];             // <- awaiting reactions\n    this._a = undefined;      // <- checked in isUnhandled reactions\n    this._s = 0;              // <- state\n    this._d = false;          // <- done\n    this._v = undefined;      // <- value\n    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled\n    this._n = false;          // <- notify\n  };\n  Internal.prototype = __webpack_require__(\"dcbc\")($Promise.prototype, {\n    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)\n    then: function then(onFulfilled, onRejected) {\n      var reaction = newPromiseCapability(speciesConstructor(this, $Promise));\n      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;\n      reaction.fail = typeof onRejected == 'function' && onRejected;\n      reaction.domain = isNode ? process.domain : undefined;\n      this._c.push(reaction);\n      if (this._a) this._a.push(reaction);\n      if (this._s) notify(this, false);\n      return reaction.promise;\n    },\n    // 25.4.5.1 Promise.prototype.catch(onRejected)\n    'catch': function (onRejected) {\n      return this.then(undefined, onRejected);\n    }\n  });\n  OwnPromiseCapability = function () {\n    var promise = new Internal();\n    this.promise = promise;\n    this.resolve = ctx($resolve, promise, 1);\n    this.reject = ctx($reject, promise, 1);\n  };\n  newPromiseCapabilityModule.f = newPromiseCapability = function (C) {\n    return C === $Promise || C === Wrapper\n      ? new OwnPromiseCapability(C)\n      : newGenericPromiseCapability(C);\n  };\n}\n\n$export($export.G + $export.W + $export.F * !USE_NATIVE, { Promise: $Promise });\n__webpack_require__(\"7f20\")($Promise, PROMISE);\n__webpack_require__(\"7a56\")(PROMISE);\nWrapper = __webpack_require__(\"8378\")[PROMISE];\n\n// statics\n$export($export.S + $export.F * !USE_NATIVE, PROMISE, {\n  // 25.4.4.5 Promise.reject(r)\n  reject: function reject(r) {\n    var capability = newPromiseCapability(this);\n    var $$reject = capability.reject;\n    $$reject(r);\n    return capability.promise;\n  }\n});\n$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {\n  // 25.4.4.6 Promise.resolve(x)\n  resolve: function resolve(x) {\n    return promiseResolve(LIBRARY && this === Wrapper ? $Promise : this, x);\n  }\n});\n$export($export.S + $export.F * !(USE_NATIVE && __webpack_require__(\"5cc5\")(function (iter) {\n  $Promise.all(iter)['catch'](empty);\n})), PROMISE, {\n  // 25.4.4.1 Promise.all(iterable)\n  all: function all(iterable) {\n    var C = this;\n    var capability = newPromiseCapability(C);\n    var resolve = capability.resolve;\n    var reject = capability.reject;\n    var result = perform(function () {\n      var values = [];\n      var index = 0;\n      var remaining = 1;\n      forOf(iterable, false, function (promise) {\n        var $index = index++;\n        var alreadyCalled = false;\n        values.push(undefined);\n        remaining++;\n        C.resolve(promise).then(function (value) {\n          if (alreadyCalled) return;\n          alreadyCalled = true;\n          values[$index] = value;\n          --remaining || resolve(values);\n        }, reject);\n      });\n      --remaining || resolve(values);\n    });\n    if (result.e) reject(result.v);\n    return capability.promise;\n  },\n  // 25.4.4.4 Promise.race(iterable)\n  race: function race(iterable) {\n    var C = this;\n    var capability = newPromiseCapability(C);\n    var reject = capability.reject;\n    var result = perform(function () {\n      forOf(iterable, false, function (promise) {\n        C.resolve(promise).then(capability.resolve, reject);\n      });\n    });\n    if (result.e) reject(result.v);\n    return capability.promise;\n  }\n});\n\n\n/***/ }),\n\n/***/ \"5537\":\n/***/ (function(module, exports, __webpack_require__) {\n\nvar core = __webpack_require__(\"8378\");\nvar global = __webpack_require__(\"7726\");\nvar SHARED = '__core-js_shared__';\nvar store = global[SHARED] || (global[SHARED] = {});\n\n(module.exports = function (key, value) {\n  return store[key] || (store[key] = value !== undefined ? value : {});\n})('versions', []).push({\n  version: core.version,\n  mode: __webpack_require__(\"2d00\") ? 'pure' : 'global',\n  copyright: '© 2018 Denis Pushkarev (zloirock.ru)'\n});\n\n\n/***/ }),\n\n/***/ \"55dd\":\n/***/ (function(module, exports, __webpack_require__) {\n\n\"use strict\";\n\nvar $export = __webpack_require__(\"5ca1\");\nvar aFunction = __webpack_require__(\"d8e8\");\nvar toObject = __webpack_require__(\"4bf8\");\nvar fails = __webpack_require__(\"79e5\");\nvar $sort = [].sort;\nvar test = [1, 2, 3];\n\n$export($export.P + $export.F * (fails(function () {\n  // IE8-\n  test.sort(undefined);\n}) || !fails(function () {\n  // V8 bug\n  test.sort(null);\n  // Old WebKit\n}) || !__webpack_require__(\"2f21\")($sort)), 'Array', {\n  // 22.1.3.25 Array.prototype.sort(comparefn)\n  sort: function sort(comparefn) {\n    return comparefn === undefined\n      ? $sort.call(toObject(this))\n      : $sort.call(toObject(this), aFunction(comparefn));\n  }\n});\n\n\n/***/ }),\n\n/***/ \"5ca1\":\n/***/ (function(module, exports, __webpack_require__) {\n\nvar global = __webpack_require__(\"7726\");\nvar core = __webpack_require__(\"8378\");\nvar hide = __webpack_require__(\"32e9\");\nvar redefine = __webpack_require__(\"2aba\");\nvar ctx = __webpack_require__(\"9b43\");\nvar PROTOTYPE = 'prototype';\n\nvar $export = function (type, name, source) {\n  var IS_FORCED = type & $export.F;\n  var IS_GLOBAL = type & $export.G;\n  var IS_STATIC = type & $export.S;\n  var IS_PROTO = type & $export.P;\n  var IS_BIND = type & $export.B;\n  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE];\n  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});\n  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});\n  var key, own, out, exp;\n  if (IS_GLOBAL) source = name;\n  for (key in source) {\n    // contains in native\n    own = !IS_FORCED && target && target[key] !== undefined;\n    // export native or passed\n    out = (own ? target : source)[key];\n    // bind timers to global for call from export context\n    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;\n    // extend global\n    if (target) redefine(target, key, out, type & $export.U);\n    // export\n    if (exports[key] != out) hide(exports, key, exp);\n    if (IS_PROTO && expProto[key] != out) expProto[key] = out;\n  }\n};\nglobal.core = core;\n// type bitmap\n$export.F = 1;   // forced\n$export.G = 2;   // global\n$export.S = 4;   // static\n$export.P = 8;   // proto\n$export.B = 16;  // bind\n$export.W = 32;  // wrap\n$export.U = 64;  // safe\n$export.R = 128; // real proto method for `library`\nmodule.exports = $export;\n\n\n/***/ }),\n\n/***/ \"5cc5\":\n/***/ (function(module, exports, __webpack_require__) {\n\nvar ITERATOR = __webpack_require__(\"2b4c\")('iterator');\nvar SAFE_CLOSING = false;\n\ntry {\n  var riter = [7][ITERATOR]();\n  riter['return'] = function () { SAFE_CLOSING = true; };\n  // eslint-disable-next-line no-throw-literal\n  Array.from(riter, function () { throw 2; });\n} catch (e) { /* empty */ }\n\nmodule.exports = function (exec, skipClosing) {\n  if (!skipClosing && !SAFE_CLOSING) return false;\n  var safe = false;\n  try {\n    var arr = [7];\n    var iter = arr[ITERATOR]();\n    iter.next = function () { return { done: safe = true }; };\n    arr[ITERATOR] = function () { return iter; };\n    exec(arr);\n  } catch (e) { /* empty */ }\n  return safe;\n};\n\n\n/***/ }),\n\n/***/ \"5eda\":\n/***/ (function(module, exports, __webpack_require__) {\n\n// most Object methods by ES6 should accept primitives\nvar $export = __webpack_require__(\"5ca1\");\nvar core = __webpack_require__(\"8378\");\nvar fails = __webpack_require__(\"79e5\");\nmodule.exports = function (KEY, exec) {\n  var fn = (core.Object || {})[KEY] || Object[KEY];\n  var exp = {};\n  exp[KEY] = exec(fn);\n  $export($export.S + $export.F * fails(function () { fn(1); }), 'Object', exp);\n};\n\n\n/***/ }),\n\n/***/ \"613b\":\n/***/ (function(module, exports, __webpack_require__) {\n\nvar shared = __webpack_require__(\"5537\")('keys');\nvar uid = __webpack_require__(\"ca5a\");\nmodule.exports = function (key) {\n  return shared[key] || (shared[key] = uid(key));\n};\n\n\n/***/ }),\n\n/***/ \"626a\":\n/***/ (function(module, exports, __webpack_require__) {\n\n// fallback for non-array-like ES3 and non-enumerable old V8 strings\nvar cof = __webpack_require__(\"2d95\");\n// eslint-disable-next-line no-prototype-builtins\nmodule.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {\n  return cof(it) == 'String' ? it.split('') : Object(it);\n};\n\n\n/***/ }),\n\n/***/ \"63d9\":\n/***/ (function(module, exports, __webpack_require__) {\n\n__webpack_require__(\"ec30\")('Float32', 4, function (init) {\n  return function Float32Array(data, byteOffset, length) {\n    return init(this, data, byteOffset, length);\n  };\n});\n\n\n/***/ }),\n\n/***/ \"6821\":\n/***/ (function(module, exports, __webpack_require__) {\n\n// to indexed object, toObject with fallback for non-array-like ES3 strings\nvar IObject = __webpack_require__(\"626a\");\nvar defined = __webpack_require__(\"be13\");\nmodule.exports = function (it) {\n  return IObject(defined(it));\n};\n\n\n/***/ }),\n\n/***/ \"69a8\":\n/***/ (function(module, exports) {\n\nvar hasOwnProperty = {}.hasOwnProperty;\nmodule.exports = function (it, key) {\n  return hasOwnProperty.call(it, key);\n};\n\n\n/***/ }),\n\n/***/ \"6a99\":\n/***/ (function(module, exports, __webpack_require__) {\n\n// 7.1.1 ToPrimitive(input [, PreferredType])\nvar isObject = __webpack_require__(\"d3f4\");\n// instead of the ES6 spec version, we didn't implement @@toPrimitive case\n// and the second argument - flag - preferred type is a string\nmodule.exports = function (it, S) {\n  if (!isObject(it)) return it;\n  var fn, val;\n  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;\n  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;\n  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;\n  throw TypeError(\"Can't convert object to primitive value\");\n};\n\n\n/***/ }),\n\n/***/ \"7333\":\n/***/ (function(module, exports, __webpack_require__) {\n\n\"use strict\";\n\n// 19.1.2.1 Object.assign(target, source, ...)\nvar getKeys = __webpack_require__(\"0d58\");\nvar gOPS = __webpack_require__(\"2621\");\nvar pIE = __webpack_require__(\"52a7\");\nvar toObject = __webpack_require__(\"4bf8\");\nvar IObject = __webpack_require__(\"626a\");\nvar $assign = Object.assign;\n\n// should work with symbols and should have deterministic property order (V8 bug)\nmodule.exports = !$assign || __webpack_require__(\"79e5\")(function () {\n  var A = {};\n  var B = {};\n  // eslint-disable-next-line no-undef\n  var S = Symbol();\n  var K = 'abcdefghijklmnopqrst';\n  A[S] = 7;\n  K.split('').forEach(function (k) { B[k] = k; });\n  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;\n}) ? function assign(target, source) { // eslint-disable-line no-unused-vars\n  var T = toObject(target);\n  var aLen = arguments.length;\n  var index = 1;\n  var getSymbols = gOPS.f;\n  var isEnum = pIE.f;\n  while (aLen > index) {\n    var S = IObject(arguments[index++]);\n    var keys = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S);\n    var length = keys.length;\n    var j = 0;\n    var key;\n    while (length > j) if (isEnum.call(S, key = keys[j++])) T[key] = S[key];\n  } return T;\n} : $assign;\n\n\n/***/ }),\n\n/***/ \"7726\":\n/***/ (function(module, exports) {\n\n// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028\nvar global = module.exports = typeof window != 'undefined' && window.Math == Math\n  ? window : typeof self != 'undefined' && self.Math == Math ? self\n  // eslint-disable-next-line no-new-func\n  : Function('return this')();\nif (typeof __g == 'number') __g = global; // eslint-disable-line no-undef\n\n\n/***/ }),\n\n/***/ \"77f1\":\n/***/ (function(module, exports, __webpack_require__) {\n\nvar toInteger = __webpack_require__(\"4588\");\nvar max = Math.max;\nvar min = Math.min;\nmodule.exports = function (index, length) {\n  index = toInteger(index);\n  return index < 0 ? max(index + length, 0) : min(index, length);\n};\n\n\n/***/ }),\n\n/***/ \"79e5\":\n/***/ (function(module, exports) {\n\nmodule.exports = function (exec) {\n  try {\n    return !!exec();\n  } catch (e) {\n    return true;\n  }\n};\n\n\n/***/ }),\n\n/***/ \"7a56\":\n/***/ (function(module, exports, __webpack_require__) {\n\n\"use strict\";\n\nvar global = __webpack_require__(\"7726\");\nvar dP = __webpack_require__(\"86cc\");\nvar DESCRIPTORS = __webpack_require__(\"9e1e\");\nvar SPECIES = __webpack_require__(\"2b4c\")('species');\n\nmodule.exports = function (KEY) {\n  var C = global[KEY];\n  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {\n    configurable: true,\n    get: function () { return this; }\n  });\n};\n\n\n/***/ }),\n\n/***/ \"7f20\":\n/***/ (function(module, exports, __webpack_require__) {\n\nvar def = __webpack_require__(\"86cc\").f;\nvar has = __webpack_require__(\"69a8\");\nvar TAG = __webpack_require__(\"2b4c\")('toStringTag');\n\nmodule.exports = function (it, tag, stat) {\n  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });\n};\n\n\n/***/ }),\n\n/***/ \"8079\":\n/***/ (function(module, exports, __webpack_require__) {\n\nvar global = __webpack_require__(\"7726\");\nvar macrotask = __webpack_require__(\"1991\").set;\nvar Observer = global.MutationObserver || global.WebKitMutationObserver;\nvar process = global.process;\nvar Promise = global.Promise;\nvar isNode = __webpack_require__(\"2d95\")(process) == 'process';\n\nmodule.exports = function () {\n  var head, last, notify;\n\n  var flush = function () {\n    var parent, fn;\n    if (isNode && (parent = process.domain)) parent.exit();\n    while (head) {\n      fn = head.fn;\n      head = head.next;\n      try {\n        fn();\n      } catch (e) {\n        if (head) notify();\n        else last = undefined;\n        throw e;\n      }\n    } last = undefined;\n    if (parent) parent.enter();\n  };\n\n  // Node.js\n  if (isNode) {\n    notify = function () {\n      process.nextTick(flush);\n    };\n  // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339\n  } else if (Observer && !(global.navigator && global.navigator.standalone)) {\n    var toggle = true;\n    var node = document.createTextNode('');\n    new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new\n    notify = function () {\n      node.data = toggle = !toggle;\n    };\n  // environments with maybe non-completely correct, but existent Promise\n  } else if (Promise && Promise.resolve) {\n    // Promise.resolve without an argument throws an error in LG WebOS 2\n    var promise = Promise.resolve(undefined);\n    notify = function () {\n      promise.then(flush);\n    };\n  // for other environments - macrotask based on:\n  // - setImmediate\n  // - MessageChannel\n  // - window.postMessag\n  // - onreadystatechange\n  // - setTimeout\n  } else {\n    notify = function () {\n      // strange IE + webpack dev server bug - use .call(global)\n      macrotask.call(global, flush);\n    };\n  }\n\n  return function (fn) {\n    var task = { fn: fn, next: undefined };\n    if (last) last.next = task;\n    if (!head) {\n      head = task;\n      notify();\n    } last = task;\n  };\n};\n\n\n/***/ }),\n\n/***/ \"8378\":\n/***/ (function(module, exports) {\n\nvar core = module.exports = { version: '2.5.7' };\nif (typeof __e == 'number') __e = core; // eslint-disable-line no-undef\n\n\n/***/ }),\n\n/***/ \"84f2\":\n/***/ (function(module, exports) {\n\nmodule.exports = {};\n\n\n/***/ }),\n\n/***/ \"86cc\":\n/***/ (function(module, exports, __webpack_require__) {\n\nvar anObject = __webpack_require__(\"cb7c\");\nvar IE8_DOM_DEFINE = __webpack_require__(\"c69a\");\nvar toPrimitive = __webpack_require__(\"6a99\");\nvar dP = Object.defineProperty;\n\nexports.f = __webpack_require__(\"9e1e\") ? Object.defineProperty : function defineProperty(O, P, Attributes) {\n  anObject(O);\n  P = toPrimitive(P, true);\n  anObject(Attributes);\n  if (IE8_DOM_DEFINE) try {\n    return dP(O, P, Attributes);\n  } catch (e) { /* empty */ }\n  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');\n  if ('value' in Attributes) O[P] = Attributes.value;\n  return O;\n};\n\n\n/***/ }),\n\n/***/ \"9093\":\n/***/ (function(module, exports, __webpack_require__) {\n\n// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)\nvar $keys = __webpack_require__(\"ce10\");\nvar hiddenKeys = __webpack_require__(\"e11e\").concat('length', 'prototype');\n\nexports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {\n  return $keys(O, hiddenKeys);\n};\n\n\n/***/ }),\n\n/***/ \"9b43\":\n/***/ (function(module, exports, __webpack_require__) {\n\n// optional / simple context binding\nvar aFunction = __webpack_require__(\"d8e8\");\nmodule.exports = function (fn, that, length) {\n  aFunction(fn);\n  if (that === undefined) return fn;\n  switch (length) {\n    case 1: return function (a) {\n      return fn.call(that, a);\n    };\n    case 2: return function (a, b) {\n      return fn.call(that, a, b);\n    };\n    case 3: return function (a, b, c) {\n      return fn.call(that, a, b, c);\n    };\n  }\n  return function (/* ...args */) {\n    return fn.apply(that, arguments);\n  };\n};\n\n\n/***/ }),\n\n/***/ \"9c29\":\n/***/ (function(module, exports, __webpack_require__) {\n\n__webpack_require__(\"ec30\")('Uint32', 4, function (init) {\n  return function Uint32Array(data, byteOffset, length) {\n    return init(this, data, byteOffset, length);\n  };\n});\n\n\n/***/ }),\n\n/***/ \"9c6c\":\n/***/ (function(module, exports, __webpack_require__) {\n\n// 22.1.3.31 Array.prototype[@@unscopables]\nvar UNSCOPABLES = __webpack_require__(\"2b4c\")('unscopables');\nvar ArrayProto = Array.prototype;\nif (ArrayProto[UNSCOPABLES] == undefined) __webpack_require__(\"32e9\")(ArrayProto, UNSCOPABLES, {});\nmodule.exports = function (key) {\n  ArrayProto[UNSCOPABLES][key] = true;\n};\n\n\n/***/ }),\n\n/***/ \"9c80\":\n/***/ (function(module, exports) {\n\nmodule.exports = function (exec) {\n  try {\n    return { e: false, v: exec() };\n  } catch (e) {\n    return { e: true, v: e };\n  }\n};\n\n\n/***/ }),\n\n/***/ \"9def\":\n/***/ (function(module, exports, __webpack_require__) {\n\n// 7.1.15 ToLength\nvar toInteger = __webpack_require__(\"4588\");\nvar min = Math.min;\nmodule.exports = function (it) {\n  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991\n};\n\n\n/***/ }),\n\n/***/ \"9e1e\":\n/***/ (function(module, exports, __webpack_require__) {\n\n// Thank's IE8 for his funny defineProperty\nmodule.exports = !__webpack_require__(\"79e5\")(function () {\n  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;\n});\n\n\n/***/ }),\n\n/***/ \"a25f\":\n/***/ (function(module, exports, __webpack_require__) {\n\nvar global = __webpack_require__(\"7726\");\nvar navigator = global.navigator;\n\nmodule.exports = navigator && navigator.userAgent || '';\n\n\n/***/ }),\n\n/***/ \"a5b8\":\n/***/ (function(module, exports, __webpack_require__) {\n\n\"use strict\";\n\n// 25.4.1.5 NewPromiseCapability(C)\nvar aFunction = __webpack_require__(\"d8e8\");\n\nfunction PromiseCapability(C) {\n  var resolve, reject;\n  this.promise = new C(function ($$resolve, $$reject) {\n    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');\n    resolve = $$resolve;\n    reject = $$reject;\n  });\n  this.resolve = aFunction(resolve);\n  this.reject = aFunction(reject);\n}\n\nmodule.exports.f = function (C) {\n  return new PromiseCapability(C);\n};\n\n\n/***/ }),\n\n/***/ \"ac6a\":\n/***/ (function(module, exports, __webpack_require__) {\n\nvar $iterators = __webpack_require__(\"cadf\");\nvar getKeys = __webpack_require__(\"0d58\");\nvar redefine = __webpack_require__(\"2aba\");\nvar global = __webpack_require__(\"7726\");\nvar hide = __webpack_require__(\"32e9\");\nvar Iterators = __webpack_require__(\"84f2\");\nvar wks = __webpack_require__(\"2b4c\");\nvar ITERATOR = wks('iterator');\nvar TO_STRING_TAG = wks('toStringTag');\nvar ArrayValues = Iterators.Array;\n\nvar DOMIterables = {\n  CSSRuleList: true, // TODO: Not spec compliant, should be false.\n  CSSStyleDeclaration: false,\n  CSSValueList: false,\n  ClientRectList: false,\n  DOMRectList: false,\n  DOMStringList: false,\n  DOMTokenList: true,\n  DataTransferItemList: false,\n  FileList: false,\n  HTMLAllCollection: false,\n  HTMLCollection: false,\n  HTMLFormElement: false,\n  HTMLSelectElement: false,\n  MediaList: true, // TODO: Not spec compliant, should be false.\n  MimeTypeArray: false,\n  NamedNodeMap: false,\n  NodeList: true,\n  PaintRequestList: false,\n  Plugin: false,\n  PluginArray: false,\n  SVGLengthList: false,\n  SVGNumberList: false,\n  SVGPathSegList: false,\n  SVGPointList: false,\n  SVGStringList: false,\n  SVGTransformList: false,\n  SourceBufferList: false,\n  StyleSheetList: true, // TODO: Not spec compliant, should be false.\n  TextTrackCueList: false,\n  TextTrackList: false,\n  TouchList: false\n};\n\nfor (var collections = getKeys(DOMIterables), i = 0; i < collections.length; i++) {\n  var NAME = collections[i];\n  var explicit = DOMIterables[NAME];\n  var Collection = global[NAME];\n  var proto = Collection && Collection.prototype;\n  var key;\n  if (proto) {\n    if (!proto[ITERATOR]) hide(proto, ITERATOR, ArrayValues);\n    if (!proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);\n    Iterators[NAME] = ArrayValues;\n    if (explicit) for (key in $iterators) if (!proto[key]) redefine(proto, key, $iterators[key], true);\n  }\n}\n\n\n/***/ }),\n\n/***/ \"ba92\":\n/***/ (function(module, exports, __webpack_require__) {\n\n\"use strict\";\n// 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)\n\nvar toObject = __webpack_require__(\"4bf8\");\nvar toAbsoluteIndex = __webpack_require__(\"77f1\");\nvar toLength = __webpack_require__(\"9def\");\n\nmodule.exports = [].copyWithin || function copyWithin(target /* = 0 */, start /* = 0, end = @length */) {\n  var O = toObject(this);\n  var len = toLength(O.length);\n  var to = toAbsoluteIndex(target, len);\n  var from = toAbsoluteIndex(start, len);\n  var end = arguments.length > 2 ? arguments[2] : undefined;\n  var count = Math.min((end === undefined ? len : toAbsoluteIndex(end, len)) - from, len - to);\n  var inc = 1;\n  if (from < to && to < from + count) {\n    inc = -1;\n    from += count - 1;\n    to += count - 1;\n  }\n  while (count-- > 0) {\n    if (from in O) O[to] = O[from];\n    else delete O[to];\n    to += inc;\n    from += inc;\n  } return O;\n};\n\n\n/***/ }),\n\n/***/ \"bcaa\":\n/***/ (function(module, exports, __webpack_require__) {\n\nvar anObject = __webpack_require__(\"cb7c\");\nvar isObject = __webpack_require__(\"d3f4\");\nvar newPromiseCapability = __webpack_require__(\"a5b8\");\n\nmodule.exports = function (C, x) {\n  anObject(C);\n  if (isObject(x) && x.constructor === C) return x;\n  var promiseCapability = newPromiseCapability.f(C);\n  var resolve = promiseCapability.resolve;\n  resolve(x);\n  return promiseCapability.promise;\n};\n\n\n/***/ }),\n\n/***/ \"be13\":\n/***/ (function(module, exports) {\n\n// 7.2.1 RequireObjectCoercible(argument)\nmodule.exports = function (it) {\n  if (it == undefined) throw TypeError(\"Can't call method on  \" + it);\n  return it;\n};\n\n\n/***/ }),\n\n/***/ \"c366\":\n/***/ (function(module, exports, __webpack_require__) {\n\n// false -> Array#indexOf\n// true  -> Array#includes\nvar toIObject = __webpack_require__(\"6821\");\nvar toLength = __webpack_require__(\"9def\");\nvar toAbsoluteIndex = __webpack_require__(\"77f1\");\nmodule.exports = function (IS_INCLUDES) {\n  return function ($this, el, fromIndex) {\n    var O = toIObject($this);\n    var length = toLength(O.length);\n    var index = toAbsoluteIndex(fromIndex, length);\n    var value;\n    // Array#includes uses SameValueZero equality algorithm\n    // eslint-disable-next-line no-self-compare\n    if (IS_INCLUDES && el != el) while (length > index) {\n      value = O[index++];\n      // eslint-disable-next-line no-self-compare\n      if (value != value) return true;\n    // Array#indexOf ignores holes, Array#includes - not\n    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {\n      if (O[index] === el) return IS_INCLUDES || index || 0;\n    } return !IS_INCLUDES && -1;\n  };\n};\n\n\n/***/ }),\n\n/***/ \"c69a\":\n/***/ (function(module, exports, __webpack_require__) {\n\nmodule.exports = !__webpack_require__(\"9e1e\") && !__webpack_require__(\"79e5\")(function () {\n  return Object.defineProperty(__webpack_require__(\"230e\")('div'), 'a', { get: function () { return 7; } }).a != 7;\n});\n\n\n/***/ }),\n\n/***/ \"ca5a\":\n/***/ (function(module, exports) {\n\nvar id = 0;\nvar px = Math.random();\nmodule.exports = function (key) {\n  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));\n};\n\n\n/***/ }),\n\n/***/ \"cadf\":\n/***/ (function(module, exports, __webpack_require__) {\n\n\"use strict\";\n\nvar addToUnscopables = __webpack_require__(\"9c6c\");\nvar step = __webpack_require__(\"d53b\");\nvar Iterators = __webpack_require__(\"84f2\");\nvar toIObject = __webpack_require__(\"6821\");\n\n// 22.1.3.4 Array.prototype.entries()\n// 22.1.3.13 Array.prototype.keys()\n// 22.1.3.29 Array.prototype.values()\n// 22.1.3.30 Array.prototype[@@iterator]()\nmodule.exports = __webpack_require__(\"01f9\")(Array, 'Array', function (iterated, kind) {\n  this._t = toIObject(iterated); // target\n  this._i = 0;                   // next index\n  this._k = kind;                // kind\n// 22.1.5.2.1 %ArrayIteratorPrototype%.next()\n}, function () {\n  var O = this._t;\n  var kind = this._k;\n  var index = this._i++;\n  if (!O || index >= O.length) {\n    this._t = undefined;\n    return step(1);\n  }\n  if (kind == 'keys') return step(0, index);\n  if (kind == 'values') return step(0, O[index]);\n  return step(0, [index, O[index]]);\n}, 'values');\n\n// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)\nIterators.Arguments = Iterators.Array;\n\naddToUnscopables('keys');\naddToUnscopables('values');\naddToUnscopables('entries');\n\n\n/***/ }),\n\n/***/ \"cb7c\":\n/***/ (function(module, exports, __webpack_require__) {\n\nvar isObject = __webpack_require__(\"d3f4\");\nmodule.exports = function (it) {\n  if (!isObject(it)) throw TypeError(it + ' is not an object!');\n  return it;\n};\n\n\n/***/ }),\n\n/***/ \"cd1c\":\n/***/ (function(module, exports, __webpack_require__) {\n\n// 9.4.2.3 ArraySpeciesCreate(originalArray, length)\nvar speciesConstructor = __webpack_require__(\"e853\");\n\nmodule.exports = function (original, length) {\n  return new (speciesConstructor(original))(length);\n};\n\n\n/***/ }),\n\n/***/ \"ce10\":\n/***/ (function(module, exports, __webpack_require__) {\n\nvar has = __webpack_require__(\"69a8\");\nvar toIObject = __webpack_require__(\"6821\");\nvar arrayIndexOf = __webpack_require__(\"c366\")(false);\nvar IE_PROTO = __webpack_require__(\"613b\")('IE_PROTO');\n\nmodule.exports = function (object, names) {\n  var O = toIObject(object);\n  var i = 0;\n  var result = [];\n  var key;\n  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);\n  // Don't enum bug & hidden keys\n  while (names.length > i) if (has(O, key = names[i++])) {\n    ~arrayIndexOf(result, key) || result.push(key);\n  }\n  return result;\n};\n\n\n/***/ }),\n\n/***/ \"d3f4\":\n/***/ (function(module, exports) {\n\nmodule.exports = function (it) {\n  return typeof it === 'object' ? it !== null : typeof it === 'function';\n};\n\n\n/***/ }),\n\n/***/ \"d53b\":\n/***/ (function(module, exports) {\n\nmodule.exports = function (done, value) {\n  return { value: value, done: !!done };\n};\n\n\n/***/ }),\n\n/***/ \"d8e8\":\n/***/ (function(module, exports) {\n\nmodule.exports = function (it) {\n  if (typeof it != 'function') throw TypeError(it + ' is not a function!');\n  return it;\n};\n\n\n/***/ }),\n\n/***/ \"da2a\":\n/***/ (function(module, __webpack_exports__, __webpack_require__) {\n\n\"use strict\";\n__webpack_require__.r(__webpack_exports__);\n\n// EXTERNAL MODULE: ./node_modules/core-js/modules/web.dom.iterable.js\nvar web_dom_iterable = __webpack_require__(\"ac6a\");\n\n// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.object.keys.js\nvar es6_object_keys = __webpack_require__(\"456d\");\n\n// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.typed.float32-array.js\nvar es6_typed_float32_array = __webpack_require__(\"63d9\");\n\n// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.typed.uint32-array.js\nvar es6_typed_uint32_array = __webpack_require__(\"9c29\");\n\n// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.array.sort.js\nvar es6_array_sort = __webpack_require__(\"55dd\");\n\n// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.object.assign.js\nvar es6_object_assign = __webpack_require__(\"f751\");\n\n// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/builtin/es6/classCallCheck.js\nfunction _classCallCheck(instance, Constructor) {\n  if (!(instance instanceof Constructor)) {\n    throw new TypeError(\"Cannot call a class as a function\");\n  }\n}\n// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/builtin/es6/createClass.js\nfunction _defineProperties(target, props) {\n  for (var i = 0; i < props.length; i++) {\n    var descriptor = props[i];\n    descriptor.enumerable = descriptor.enumerable || false;\n    descriptor.configurable = true;\n    if (\"value\" in descriptor) descriptor.writable = true;\n    Object.defineProperty(target, descriptor.key, descriptor);\n  }\n}\n\nfunction _createClass(Constructor, protoProps, staticProps) {\n  if (protoProps) _defineProperties(Constructor.prototype, protoProps);\n  if (staticProps) _defineProperties(Constructor, staticProps);\n  return Constructor;\n}\n// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.array.iterator.js\nvar es6_array_iterator = __webpack_require__(\"cadf\");\n\n// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.promise.js\nvar es6_promise = __webpack_require__(\"551c\");\n\n// EXTERNAL MODULE: ./node_modules/core-js/modules/es7.promise.finally.js\nvar es7_promise_finally = __webpack_require__(\"097d\");\n\n// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/eslint-loader??ref--13-0!./src/workers/BinaryDataWorker.js\n\n\n\n\n\n\n\n\n\n\n\nvar MIN_WIDTH_CANDLE = 3;\nvar VOLUME_ZONE = 0.3; // Volume area\n\nvar BinaryDataWorker_BinaryDataWorker =\n/*#__PURE__*/\nfunction () {\n  function BinaryDataWorker() {\n    _classCallCheck(this, BinaryDataWorker);\n\n    this.data = {\n      treeReady: false,\n      candlesBinary: [],\n      candlesParsed: [],\n      averageBinary: [],\n      averageParsed: [],\n      firstEntry: 0,\n      lastResolution: 0,\n      start: null,\n      width: null,\n      last: {\n        offset: 0,\n        end: 0,\n        resolution: 0\n      },\n      tree: []\n    };\n    this.params = {\n      empty: false,\n      candleWidths: [],\n      defaultExposition: 86400 * 30,\n      fileSizes: {},\n      resolutions: [],\n      packetSize: 0,\n      dataRequestPending: false,\n      isInitialLoading: true,\n      needDropData: false\n    };\n    this.requestInitialParams();\n  }\n\n  _createClass(BinaryDataWorker, [{\n    key: \"resetData\",\n    value: function resetData() {\n      Object.assign(this.data, {\n        treeReady: false,\n        candlesBinary: [],\n        candlesParsed: [],\n        averageBinary: [],\n        averageParsed: [],\n        firstEntry: 0,\n        lastResolution: 0,\n        start: null,\n        width: null,\n        last: {\n          offset: 0,\n          end: 0,\n          resolution: 0\n        },\n        tree: []\n      });\n      Object.assign(this.params, {\n        dataRequestPending: false,\n        isInitialLoading: true,\n        fileSizes: {},\n        resolutions: [],\n        empty: false\n      });\n    }\n  }, {\n    key: \"requestInitialParams\",\n    value: function requestInitialParams() {\n      this.sendMessage('REQUEST_PARAMS', {\n        inner: ['candleWidths'],\n        outer: ['fileSizes', 'resolutions', 'packetSize']\n      });\n    }\n  }, {\n    key: \"initialLoading\",\n    value: function initialLoading(resolution) {\n      var end = this.params.fileSizes[resolution];\n      var offset = 0;\n      this.params.isInitialLoading = true;\n      this.requestData(offset, end - 1, resolution);\n    }\n  }, {\n    key: \"rebaseOffset\",\n    value: function rebaseOffset(offset, resolution) {\n      var dataLength = this.params.fileSizes[resolution];\n\n      if (offset < 0) {\n        return 0;\n      } else if (offset > dataLength - 1) {\n        return dataLength - 1;\n      }\n\n      return offset;\n    }\n  }, {\n    key: \"rebaseEnd\",\n    value: function rebaseEnd(end, resolution) {\n      if (end > this.params.fileSizes[resolution]) {\n        return this.params.fileSizes[resolution];\n      }\n\n      return end;\n    }\n  }, {\n    key: \"append\",\n    value: function append(data) {\n      this.data.treeReady = false;\n      this.params.dataRequestPending = false;\n      this.appendedData = ['candleData'];\n      this.data.candlesBinary = data.slice(0);\n\n      if (this.params.needDropData) {\n        this.data.candlesParsed.splice(0);\n        this.params.needDropData = false;\n      }\n\n      this.data.candlesParsed = this.data.candlesParsed.concat(this.parseChartData(this.data.candlesBinary)).sort(function (a, b) {\n        return a.timestamp - b.timestamp;\n      });\n\n      if (this.params.isInitialLoading === true) {\n        this.appendedData.push('averageData');\n        this.data.averageBinary = data.slice(0);\n        this.data.averageParsed = this.data.candlesParsed.slice(0);\n        this.params.isInitialLoading = false;\n      }\n\n      this.makeTree();\n      this.sendMessage('APPENDED', {\n        type: this.appendedData\n      });\n    }\n  }, {\n    key: \"parseEntity\",\n    value: function parseEntity(entity) {\n      return {\n        timestamp: new Uint32Array(entity, 0, 1)[0],\n        volume: new Float32Array(entity, 4, 1)[0],\n        open: new Float32Array(entity, 8, 1)[0],\n        high: new Float32Array(entity, 12, 1)[0],\n        low: new Float32Array(entity, 16, 1)[0],\n        close: new Float32Array(entity, 20, 1)[0],\n        average: new Float32Array(entity, 24, 1)[0]\n      };\n    }\n  }, {\n    key: \"parseChartData\",\n    value: function parseChartData(rawData) {\n      var dataArray = [];\n\n      for (var i = 0, j = 0; i < rawData.byteLength; i += this.params.packetSize, j++) {\n        dataArray[j] = this.parseEntity(rawData.slice(i, i + this.params.packetSize));\n      }\n\n      return dataArray;\n    }\n    /**\n     * @description Make specific tree by raw data\n     * @return none\n     */\n\n  }, {\n    key: \"makeTree\",\n    value: function makeTree() {\n      var _this = this;\n\n      if (this.data.candlesParsed.length > 0) {\n        this.data.start = this.data.candlesParsed[0].timestamp;\n        this.data.end = this.data.candlesParsed[this.data.candlesParsed.length - 1].timestamp;\n        this.params.candleWidths.map(function (case_) {\n          _this.data.tree[case_] = [];\n          var lastCandle = null;\n\n          _this.data.candlesParsed.map(function (candle) {\n            var id = candle.timestamp - candle.timestamp % case_;\n\n            if (lastCandle && id === lastCandle.id) {\n              lastCandle.low = candle.low < lastCandle.low ? candle.low : lastCandle.low;\n              lastCandle.high = candle.high > lastCandle.high ? candle.high : lastCandle.high;\n              lastCandle.close = candle.close;\n              lastCandle.volume += candle.volume;\n            } else {\n              if (lastCandle) {\n                _this.data.tree[case_].push(lastCandle);\n              }\n\n              lastCandle = {\n                id: id,\n                timestamp: candle.timestamp,\n                open: candle.open,\n                low: candle.low,\n                high: candle.high,\n                close: candle.close,\n                volume: candle.volume\n              };\n            }\n          });\n\n          if (lastCandle) {\n            _this.data.tree[case_].push(lastCandle);\n          }\n        });\n        this.data.treeReady = true;\n      }\n    }\n    /**\n     * @description Looking for satisfying width of candle\n     * @param {Number} exposition - exposition width\n     * @param {Number} viewWidth  - view box width\n     * @return true/false\n     */\n\n  }, {\n    key: \"findCandleWidthForUse\",\n    value: function findCandleWidthForUse(exposition, viewWidth) {\n      var targetCandleNumber = viewWidth / MIN_WIDTH_CANDLE;\n      var caseCandidate = null;\n      var prevCandleDiff = 0;\n      this.params.candleWidths.map(function (case_) {\n        if (caseCandidate) {\n          var candleDiff = Math.abs(Math.round(targetCandleNumber - exposition / case_));\n\n          if (candleDiff < prevCandleDiff) {\n            prevCandleDiff = candleDiff;\n            caseCandidate = case_;\n          }\n        } else {\n          caseCandidate = case_;\n          prevCandleDiff = Math.abs(Math.round(targetCandleNumber - exposition / case_));\n        }\n      });\n      return caseCandidate;\n    }\n  }, {\n    key: \"findAvailableResolution\",\n    value: function findAvailableResolution() {\n      var resolution = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 86400;\n      var resolutionQty = this.params.resolutions.length;\n\n      if (resolution > this.params.resolutions[resolutionQty - 1]) {\n        return this.params.resolutions[resolutionQty - 1];\n      }\n\n      for (var i = 0, len = resolutionQty; i < len; i++) {\n        if (resolution === this.params.resolutions[i] || resolution < this.params.resolutions[i] && i === 0) {\n          return this.params.resolutions[i];\n        } else if (resolution < this.params.resolutions[i] && i > 0) {\n          return this.params.resolutions[i - 1];\n        }\n      }\n    }\n  }, {\n    key: \"convertTimestampToPackage\",\n    value: function convertTimestampToPackage(timestamp, resolution) {\n      return Math.ceil(timestamp / resolution) * this.params.packetSize;\n    }\n  }, {\n    key: \"convertOffsetToPackage\",\n    value: function convertOffsetToPackage(offset, resolution) {\n      var lastPointTimestamp = new Date().getTime() / 1e3;\n      var offsetFromEnd = lastPointTimestamp - (offset - this.params.defaultExposition);\n      var convertedOffset = this.convertTimestampToPackage(offsetFromEnd, resolution);\n      var fileSize = this.params.fileSizes[resolution];\n      return this.rebaseOffset(fileSize - convertedOffset, resolution);\n    }\n  }, {\n    key: \"convertEndToPackage\",\n    value: function convertEndToPackage(end, resolution) {\n      var lastPointTimestamp = new Date().getTime() / 1e3;\n      var convertedEnd = this.convertTimestampToPackage(lastPointTimestamp - end, resolution);\n      var fileSize = this.params.fileSizes[resolution];\n      return this.rebaseEnd(fileSize - convertedEnd, resolution);\n    }\n    /**\n     * @description Render candles objects\n     * @param {Number} offset     - exposition offset\n     * @param {Number} exposition - exposition width\n     * @param {Number} viewWidth  - view box width\n     */\n\n  }, {\n    key: \"renderCandles\",\n    value: function renderCandles(offset, exposition, viewWidth, viewHeight) {\n      if (!this.data.treeReady) {\n        this.makeTree();\n      }\n\n      var result = {\n        low: null,\n        high: null,\n        maxVolume: null,\n        width: null,\n        candles: [],\n        candlesPositivePath: [],\n        candlesNegativePath: [],\n        volumePath: []\n      };\n      var theCase = this.findCandleWidthForUse(exposition, viewWidth);\n      var koofX = viewWidth / exposition;\n      result.width = theCase * koofX;\n      var dataByCase = this.data.tree[theCase];\n      var start = 0;\n\n      if (dataByCase && this.data.lastResolution === theCase) {\n        var stop = dataByCase.length;\n\n        if (offset > this.data.start) {\n          start = -Math.floor((offset - this.data.start) / theCase);\n        }\n\n        for (var index = -start; index < stop; index++) {\n          var candle = dataByCase[index];\n\n          if (candle.timestamp <= offset) {\n            continue;\n          } else if (candle.timestamp > offset + exposition) {\n            stop = index;\n            break;\n          } else if (start < 0) {\n            start = index;\n          }\n\n          if (result.low == null || result.low > candle.low) {\n            result.low = candle.low;\n          }\n\n          if (result.high == null || result.high < candle.high) {\n            result.high = candle.high;\n          }\n\n          if (result.maxVolume == null || result.maxVolume < candle.volume) {\n            result.maxVolume = candle.volume;\n          }\n        }\n\n        start = Math.abs(start);\n\n        if (stop == null) {\n          stop = dataByCase.length;\n        }\n\n        var yFactor = 0;\n\n        if (result.high !== result.low) {\n          yFactor = viewHeight / (result.high - result.low);\n        } else {\n          yFactor = viewHeight / (result.high * 1.1 - result.low);\n        }\n\n        var yVolumeFactor = 0;\n\n        if (result.maxVolume > 0) {\n          yVolumeFactor = viewHeight * VOLUME_ZONE / result.maxVolume;\n        }\n\n        var barHalf = theCase * koofX * 0.25;\n\n        for (var _index = start; _index < stop; _index++) {\n          var _candle = dataByCase[_index];\n          var x = (_candle.timestamp - offset) * koofX;\n          var pathMainLine = \"M\".concat(x, \" \").concat((result.high - _candle.low) * yFactor, \" L\").concat(x, \" \").concat((result.high - _candle.high) * yFactor, \" \");\n          var pathCandleBody = \"M\".concat(x - barHalf, \" \").concat((result.high - _candle.close) * yFactor, \"\\n           L\").concat(x + barHalf, \" \").concat((result.high - _candle.close) * yFactor, \"\\n           L\").concat(x + barHalf, \" \").concat((result.high - _candle.open) * yFactor, \"\\n           L\").concat(x - barHalf, \" \").concat((result.high - _candle.open) * yFactor);\n          var rCandle = Object.assign({}, _candle);\n\n          if (_candle.open <= _candle.close) {\n            rCandle.class = 'positive';\n            rCandle.candlePathIndex = result.candlesPositivePath.push(pathMainLine + pathCandleBody) - 1;\n          } else {\n            rCandle.class = 'negative';\n            rCandle.candlePathIndex = result.candlesNegativePath.push(pathMainLine + pathCandleBody) - 1;\n          }\n\n          rCandle.volumePathIndex = result.volumePath.push(\"M\".concat(x - barHalf, \" \").concat(viewHeight - _candle.volume * yVolumeFactor, \"\\n           L\").concat(x + barHalf, \" \").concat(viewHeight - _candle.volume * yVolumeFactor, \"\\n           L\").concat(x + barHalf, \" \").concat(viewHeight, \"\\n           L\").concat(x - barHalf, \" \").concat(viewHeight)) - 1;\n          rCandle.x = x;\n          result.candles.push(rCandle);\n        }\n      }\n\n      if (!this.params.isInitialLoading && offset > 1 && (this.data.start > offset || this.data.end < offset + exposition || !dataByCase || this.data.lastResolution !== theCase)) {\n        var resolution = this.findAvailableResolution(theCase);\n        var correctOffset = offset < this.data.end ? offset : this.data.end;\n        var correctEnd = offset + exposition > this.data.start ? offset + exposition : this.data.start;\n\n        if (resolution) {\n          this.requestData(this.convertOffsetToPackage(correctOffset, resolution), this.convertEndToPackage(correctEnd, resolution) - 1, resolution);\n        }\n      }\n\n      if (this.data.lastResolution !== theCase) {\n        this.params.needDropData = true;\n      }\n\n      this.data.lastResolution = theCase;\n      this.sendMessage('RENDERED', {\n        type: 'candles',\n        data: result\n      });\n    }\n  }, {\n    key: \"returnEmptyData\",\n    value: function returnEmptyData() {\n      this.sendMessage('RENDERED', {\n        type: 'candles',\n        data: {\n          candles: [],\n          candlesPositivePath: [],\n          candlesNegativePath: [],\n          volumePath: []\n        }\n      });\n      this.sendMessage('RENDERED', {\n        type: 'average',\n        data: {\n          minTimestamp: 0,\n          path: []\n        }\n      });\n    }\n  }, {\n    key: \"renderAverage\",\n    value: function renderAverage(viewWidth, viewHeight) {\n      var dataLength = this.data.averageParsed.length;\n\n      if (dataLength) {\n        var step = viewWidth / dataLength;\n        var result = {\n          minTimestamp: this.data.averageParsed[0].timestamp - 86400,\n          maxTimestamp: this.data.averageParsed[dataLength - 1].timestamp,\n          path: []\n        };\n        var sortedByAverage = this.data.averageParsed.slice(0).sort(function (a, b) {\n          return a.average - b.average;\n        });\n        var highest = sortedByAverage[dataLength - 1].average;\n        var lowest = sortedByAverage[0].average;\n        var yMultiplyer = 0;\n\n        if (highest !== lowest) {\n          yMultiplyer = viewHeight / (highest - lowest);\n        }\n\n        result.path.push(\"M0 \".concat(yMultiplyer * (highest - this.data.averageParsed[0].average)));\n\n        for (var i = 1; i < dataLength; i++) {\n          result.path.push(\"L\".concat(step * i, \" \").concat(yMultiplyer * (highest - this.data.averageParsed[i].average)));\n        }\n\n        this.sendMessage('RENDERED', {\n          type: 'average',\n          data: result\n        });\n      }\n    }\n  }, {\n    key: \"requestData\",\n    value: function requestData() {\n      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.data.last.offset;\n      var end = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.data.last.end;\n      var resolution = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.data.last.resolution;\n\n      if (!this.params.dataRequestPending && end > 0 && (this.data.last.offset !== offset || this.data.last.end !== end || this.data.last.resolution !== resolution)) {\n        this.params.dataRequestPending = true;\n        Object.assign(this.data.last, {\n          offset: offset,\n          end: end,\n          resolution: resolution\n        });\n        this.sendMessage('REQUEST_DATA', {\n          offset: offset,\n          end: end,\n          resolution: resolution\n        });\n      }\n    }\n    /**\n     * @description Apply params for render\n     * @param {Object} params - params\n     * @return none\n     */\n\n  }, {\n    key: \"setParams\",\n    value: function setParams(freshParams) {\n      if (freshParams.candleWidths && !this.isCandleWidthsTheSame(freshParams.candleWidths)) {\n        Object.assign(this.data, {\n          treeReady: false,\n          candlesBinary: [],\n          candlesParsed: [],\n          firstEntry: 0,\n          lastResolution: 0,\n          start: null,\n          width: null,\n          tree: [],\n          last: {\n            offset: 0,\n            end: 0,\n            resolution: 0\n          }\n        });\n      }\n\n      Object.assign(this.params, freshParams);\n    }\n  }, {\n    key: \"isCandleWidthsTheSame\",\n    value: function isCandleWidthsTheSame(newCandleWidths) {\n      for (var i = 0, len = newCandleWidths.length; i < len; i++) {\n        if (this.params.candleWidths.indexOf(newCandleWidths[i]) === -1) {\n          return false;\n        }\n      }\n\n      return true;\n    }\n  }, {\n    key: \"messageHandler\",\n    value: function messageHandler(message) {\n      switch (message.data.task) {\n        case 'SET_PARAMS':\n          {\n            this.setParams(message.data.params);\n\n            if (!this.data.averageParsed.length && Object.keys(this.params.fileSizes).length > 0 && this.params.resolutions.length > 0 && this.params.fileSizes[this.params.resolutions[this.params.resolutions.length - 1]] > 0 && this.params.packetSize && !this.params.dataRequestPending) {\n              this.initialLoading(this.params.resolutions[this.params.resolutions.length - 1]);\n            } else if (!this.data.averageParsed.length && Object.keys(this.params.fileSizes).length > 0 && this.params.resolutions.length > 0 && this.params.fileSizes[this.params.resolutions[this.params.resolutions.length - 1]] === 0) {\n              this.sendMessage('EMPTY');\n            }\n\n            break;\n          }\n\n        case 'APPEND':\n          {\n            this.append(message.data.data);\n            break;\n          }\n\n        case 'RENDER':\n          {\n            var params = message.data.params;\n\n            switch (params.type) {\n              case 'average':\n                {\n                  this.renderAverage(params.viewWidth, params.viewHeight);\n                  break;\n                }\n\n              case 'candles':\n                {\n                  this.renderCandles(params.offset, params.exposition, params.viewWidth, params.viewHeight);\n                  break;\n                }\n\n              default:\n                break;\n            }\n\n            break;\n          }\n\n        case 'RELOAD':\n          {\n            this.returnEmptyData();\n            this.params.empty = false;\n            this.resetData();\n            this.requestInitialParams();\n            break;\n          }\n\n        default:\n          break;\n      }\n    }\n    /**\n     * @description Send message to parrent\n     * @param {String} type - string based command for parrent\n     * @param {Object} body - data for message depends on command\n     */\n\n  }, {\n    key: \"sendMessage\",\n    value: function sendMessage(type) {\n      var body = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;\n      postMessage({\n        type: type,\n        body: body\n      });\n    }\n  }]);\n\n  return BinaryDataWorker;\n}();\n\nvar worker = new BinaryDataWorker_BinaryDataWorker();\n\nonmessage = function onmessage(data) {\n  worker.messageHandler(data);\n};\n\n/***/ }),\n\n/***/ \"dcbc\":\n/***/ (function(module, exports, __webpack_require__) {\n\nvar redefine = __webpack_require__(\"2aba\");\nmodule.exports = function (target, src, safe) {\n  for (var key in src) redefine(target, key, src[key], safe);\n  return target;\n};\n\n\n/***/ }),\n\n/***/ \"e11e\":\n/***/ (function(module, exports) {\n\n// IE 8- don't enum bug keys\nmodule.exports = (\n  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'\n).split(',');\n\n\n/***/ }),\n\n/***/ \"e853\":\n/***/ (function(module, exports, __webpack_require__) {\n\nvar isObject = __webpack_require__(\"d3f4\");\nvar isArray = __webpack_require__(\"1169\");\nvar SPECIES = __webpack_require__(\"2b4c\")('species');\n\nmodule.exports = function (original) {\n  var C;\n  if (isArray(original)) {\n    C = original.constructor;\n    // cross-realm fallback\n    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;\n    if (isObject(C)) {\n      C = C[SPECIES];\n      if (C === null) C = undefined;\n    }\n  } return C === undefined ? Array : C;\n};\n\n\n/***/ }),\n\n/***/ \"ebd6\":\n/***/ (function(module, exports, __webpack_require__) {\n\n// 7.3.20 SpeciesConstructor(O, defaultConstructor)\nvar anObject = __webpack_require__(\"cb7c\");\nvar aFunction = __webpack_require__(\"d8e8\");\nvar SPECIES = __webpack_require__(\"2b4c\")('species');\nmodule.exports = function (O, D) {\n  var C = anObject(O).constructor;\n  var S;\n  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);\n};\n\n\n/***/ }),\n\n/***/ \"ec30\":\n/***/ (function(module, exports, __webpack_require__) {\n\n\"use strict\";\n\nif (__webpack_require__(\"9e1e\")) {\n  var LIBRARY = __webpack_require__(\"2d00\");\n  var global = __webpack_require__(\"7726\");\n  var fails = __webpack_require__(\"79e5\");\n  var $export = __webpack_require__(\"5ca1\");\n  var $typed = __webpack_require__(\"0f88\");\n  var $buffer = __webpack_require__(\"ed0b\");\n  var ctx = __webpack_require__(\"9b43\");\n  var anInstance = __webpack_require__(\"f605\");\n  var propertyDesc = __webpack_require__(\"4630\");\n  var hide = __webpack_require__(\"32e9\");\n  var redefineAll = __webpack_require__(\"dcbc\");\n  var toInteger = __webpack_require__(\"4588\");\n  var toLength = __webpack_require__(\"9def\");\n  var toIndex = __webpack_require__(\"09fa\");\n  var toAbsoluteIndex = __webpack_require__(\"77f1\");\n  var toPrimitive = __webpack_require__(\"6a99\");\n  var has = __webpack_require__(\"69a8\");\n  var classof = __webpack_require__(\"23c6\");\n  var isObject = __webpack_require__(\"d3f4\");\n  var toObject = __webpack_require__(\"4bf8\");\n  var isArrayIter = __webpack_require__(\"33a4\");\n  var create = __webpack_require__(\"2aeb\");\n  var getPrototypeOf = __webpack_require__(\"38fd\");\n  var gOPN = __webpack_require__(\"9093\").f;\n  var getIterFn = __webpack_require__(\"27ee\");\n  var uid = __webpack_require__(\"ca5a\");\n  var wks = __webpack_require__(\"2b4c\");\n  var createArrayMethod = __webpack_require__(\"0a49\");\n  var createArrayIncludes = __webpack_require__(\"c366\");\n  var speciesConstructor = __webpack_require__(\"ebd6\");\n  var ArrayIterators = __webpack_require__(\"cadf\");\n  var Iterators = __webpack_require__(\"84f2\");\n  var $iterDetect = __webpack_require__(\"5cc5\");\n  var setSpecies = __webpack_require__(\"7a56\");\n  var arrayFill = __webpack_require__(\"36bd\");\n  var arrayCopyWithin = __webpack_require__(\"ba92\");\n  var $DP = __webpack_require__(\"86cc\");\n  var $GOPD = __webpack_require__(\"11e9\");\n  var dP = $DP.f;\n  var gOPD = $GOPD.f;\n  var RangeError = global.RangeError;\n  var TypeError = global.TypeError;\n  var Uint8Array = global.Uint8Array;\n  var ARRAY_BUFFER = 'ArrayBuffer';\n  var SHARED_BUFFER = 'Shared' + ARRAY_BUFFER;\n  var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';\n  var PROTOTYPE = 'prototype';\n  var ArrayProto = Array[PROTOTYPE];\n  var $ArrayBuffer = $buffer.ArrayBuffer;\n  var $DataView = $buffer.DataView;\n  var arrayForEach = createArrayMethod(0);\n  var arrayFilter = createArrayMethod(2);\n  var arraySome = createArrayMethod(3);\n  var arrayEvery = createArrayMethod(4);\n  var arrayFind = createArrayMethod(5);\n  var arrayFindIndex = createArrayMethod(6);\n  var arrayIncludes = createArrayIncludes(true);\n  var arrayIndexOf = createArrayIncludes(false);\n  var arrayValues = ArrayIterators.values;\n  var arrayKeys = ArrayIterators.keys;\n  var arrayEntries = ArrayIterators.entries;\n  var arrayLastIndexOf = ArrayProto.lastIndexOf;\n  var arrayReduce = ArrayProto.reduce;\n  var arrayReduceRight = ArrayProto.reduceRight;\n  var arrayJoin = ArrayProto.join;\n  var arraySort = ArrayProto.sort;\n  var arraySlice = ArrayProto.slice;\n  var arrayToString = ArrayProto.toString;\n  var arrayToLocaleString = ArrayProto.toLocaleString;\n  var ITERATOR = wks('iterator');\n  var TAG = wks('toStringTag');\n  var TYPED_CONSTRUCTOR = uid('typed_constructor');\n  var DEF_CONSTRUCTOR = uid('def_constructor');\n  var ALL_CONSTRUCTORS = $typed.CONSTR;\n  var TYPED_ARRAY = $typed.TYPED;\n  var VIEW = $typed.VIEW;\n  var WRONG_LENGTH = 'Wrong length!';\n\n  var $map = createArrayMethod(1, function (O, length) {\n    return allocate(speciesConstructor(O, O[DEF_CONSTRUCTOR]), length);\n  });\n\n  var LITTLE_ENDIAN = fails(function () {\n    // eslint-disable-next-line no-undef\n    return new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;\n  });\n\n  var FORCED_SET = !!Uint8Array && !!Uint8Array[PROTOTYPE].set && fails(function () {\n    new Uint8Array(1).set({});\n  });\n\n  var toOffset = function (it, BYTES) {\n    var offset = toInteger(it);\n    if (offset < 0 || offset % BYTES) throw RangeError('Wrong offset!');\n    return offset;\n  };\n\n  var validate = function (it) {\n    if (isObject(it) && TYPED_ARRAY in it) return it;\n    throw TypeError(it + ' is not a typed array!');\n  };\n\n  var allocate = function (C, length) {\n    if (!(isObject(C) && TYPED_CONSTRUCTOR in C)) {\n      throw TypeError('It is not a typed array constructor!');\n    } return new C(length);\n  };\n\n  var speciesFromList = function (O, list) {\n    return fromList(speciesConstructor(O, O[DEF_CONSTRUCTOR]), list);\n  };\n\n  var fromList = function (C, list) {\n    var index = 0;\n    var length = list.length;\n    var result = allocate(C, length);\n    while (length > index) result[index] = list[index++];\n    return result;\n  };\n\n  var addGetter = function (it, key, internal) {\n    dP(it, key, { get: function () { return this._d[internal]; } });\n  };\n\n  var $from = function from(source /* , mapfn, thisArg */) {\n    var O = toObject(source);\n    var aLen = arguments.length;\n    var mapfn = aLen > 1 ? arguments[1] : undefined;\n    var mapping = mapfn !== undefined;\n    var iterFn = getIterFn(O);\n    var i, length, values, result, step, iterator;\n    if (iterFn != undefined && !isArrayIter(iterFn)) {\n      for (iterator = iterFn.call(O), values = [], i = 0; !(step = iterator.next()).done; i++) {\n        values.push(step.value);\n      } O = values;\n    }\n    if (mapping && aLen > 2) mapfn = ctx(mapfn, arguments[2], 2);\n    for (i = 0, length = toLength(O.length), result = allocate(this, length); length > i; i++) {\n      result[i] = mapping ? mapfn(O[i], i) : O[i];\n    }\n    return result;\n  };\n\n  var $of = function of(/* ...items */) {\n    var index = 0;\n    var length = arguments.length;\n    var result = allocate(this, length);\n    while (length > index) result[index] = arguments[index++];\n    return result;\n  };\n\n  // iOS Safari 6.x fails here\n  var TO_LOCALE_BUG = !!Uint8Array && fails(function () { arrayToLocaleString.call(new Uint8Array(1)); });\n\n  var $toLocaleString = function toLocaleString() {\n    return arrayToLocaleString.apply(TO_LOCALE_BUG ? arraySlice.call(validate(this)) : validate(this), arguments);\n  };\n\n  var proto = {\n    copyWithin: function copyWithin(target, start /* , end */) {\n      return arrayCopyWithin.call(validate(this), target, start, arguments.length > 2 ? arguments[2] : undefined);\n    },\n    every: function every(callbackfn /* , thisArg */) {\n      return arrayEvery(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);\n    },\n    fill: function fill(value /* , start, end */) { // eslint-disable-line no-unused-vars\n      return arrayFill.apply(validate(this), arguments);\n    },\n    filter: function filter(callbackfn /* , thisArg */) {\n      return speciesFromList(this, arrayFilter(validate(this), callbackfn,\n        arguments.length > 1 ? arguments[1] : undefined));\n    },\n    find: function find(predicate /* , thisArg */) {\n      return arrayFind(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);\n    },\n    findIndex: function findIndex(predicate /* , thisArg */) {\n      return arrayFindIndex(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);\n    },\n    forEach: function forEach(callbackfn /* , thisArg */) {\n      arrayForEach(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);\n    },\n    indexOf: function indexOf(searchElement /* , fromIndex */) {\n      return arrayIndexOf(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);\n    },\n    includes: function includes(searchElement /* , fromIndex */) {\n      return arrayIncludes(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);\n    },\n    join: function join(separator) { // eslint-disable-line no-unused-vars\n      return arrayJoin.apply(validate(this), arguments);\n    },\n    lastIndexOf: function lastIndexOf(searchElement /* , fromIndex */) { // eslint-disable-line no-unused-vars\n      return arrayLastIndexOf.apply(validate(this), arguments);\n    },\n    map: function map(mapfn /* , thisArg */) {\n      return $map(validate(this), mapfn, arguments.length > 1 ? arguments[1] : undefined);\n    },\n    reduce: function reduce(callbackfn /* , initialValue */) { // eslint-disable-line no-unused-vars\n      return arrayReduce.apply(validate(this), arguments);\n    },\n    reduceRight: function reduceRight(callbackfn /* , initialValue */) { // eslint-disable-line no-unused-vars\n      return arrayReduceRight.apply(validate(this), arguments);\n    },\n    reverse: function reverse() {\n      var that = this;\n      var length = validate(that).length;\n      var middle = Math.floor(length / 2);\n      var index = 0;\n      var value;\n      while (index < middle) {\n        value = that[index];\n        that[index++] = that[--length];\n        that[length] = value;\n      } return that;\n    },\n    some: function some(callbackfn /* , thisArg */) {\n      return arraySome(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);\n    },\n    sort: function sort(comparefn) {\n      return arraySort.call(validate(this), comparefn);\n    },\n    subarray: function subarray(begin, end) {\n      var O = validate(this);\n      var length = O.length;\n      var $begin = toAbsoluteIndex(begin, length);\n      return new (speciesConstructor(O, O[DEF_CONSTRUCTOR]))(\n        O.buffer,\n        O.byteOffset + $begin * O.BYTES_PER_ELEMENT,\n        toLength((end === undefined ? length : toAbsoluteIndex(end, length)) - $begin)\n      );\n    }\n  };\n\n  var $slice = function slice(start, end) {\n    return speciesFromList(this, arraySlice.call(validate(this), start, end));\n  };\n\n  var $set = function set(arrayLike /* , offset */) {\n    validate(this);\n    var offset = toOffset(arguments[1], 1);\n    var length = this.length;\n    var src = toObject(arrayLike);\n    var len = toLength(src.length);\n    var index = 0;\n    if (len + offset > length) throw RangeError(WRONG_LENGTH);\n    while (index < len) this[offset + index] = src[index++];\n  };\n\n  var $iterators = {\n    entries: function entries() {\n      return arrayEntries.call(validate(this));\n    },\n    keys: function keys() {\n      return arrayKeys.call(validate(this));\n    },\n    values: function values() {\n      return arrayValues.call(validate(this));\n    }\n  };\n\n  var isTAIndex = function (target, key) {\n    return isObject(target)\n      && target[TYPED_ARRAY]\n      && typeof key != 'symbol'\n      && key in target\n      && String(+key) == String(key);\n  };\n  var $getDesc = function getOwnPropertyDescriptor(target, key) {\n    return isTAIndex(target, key = toPrimitive(key, true))\n      ? propertyDesc(2, target[key])\n      : gOPD(target, key);\n  };\n  var $setDesc = function defineProperty(target, key, desc) {\n    if (isTAIndex(target, key = toPrimitive(key, true))\n      && isObject(desc)\n      && has(desc, 'value')\n      && !has(desc, 'get')\n      && !has(desc, 'set')\n      // TODO: add validation descriptor w/o calling accessors\n      && !desc.configurable\n      && (!has(desc, 'writable') || desc.writable)\n      && (!has(desc, 'enumerable') || desc.enumerable)\n    ) {\n      target[key] = desc.value;\n      return target;\n    } return dP(target, key, desc);\n  };\n\n  if (!ALL_CONSTRUCTORS) {\n    $GOPD.f = $getDesc;\n    $DP.f = $setDesc;\n  }\n\n  $export($export.S + $export.F * !ALL_CONSTRUCTORS, 'Object', {\n    getOwnPropertyDescriptor: $getDesc,\n    defineProperty: $setDesc\n  });\n\n  if (fails(function () { arrayToString.call({}); })) {\n    arrayToString = arrayToLocaleString = function toString() {\n      return arrayJoin.call(this);\n    };\n  }\n\n  var $TypedArrayPrototype$ = redefineAll({}, proto);\n  redefineAll($TypedArrayPrototype$, $iterators);\n  hide($TypedArrayPrototype$, ITERATOR, $iterators.values);\n  redefineAll($TypedArrayPrototype$, {\n    slice: $slice,\n    set: $set,\n    constructor: function () { /* noop */ },\n    toString: arrayToString,\n    toLocaleString: $toLocaleString\n  });\n  addGetter($TypedArrayPrototype$, 'buffer', 'b');\n  addGetter($TypedArrayPrototype$, 'byteOffset', 'o');\n  addGetter($TypedArrayPrototype$, 'byteLength', 'l');\n  addGetter($TypedArrayPrototype$, 'length', 'e');\n  dP($TypedArrayPrototype$, TAG, {\n    get: function () { return this[TYPED_ARRAY]; }\n  });\n\n  // eslint-disable-next-line max-statements\n  module.exports = function (KEY, BYTES, wrapper, CLAMPED) {\n    CLAMPED = !!CLAMPED;\n    var NAME = KEY + (CLAMPED ? 'Clamped' : '') + 'Array';\n    var GETTER = 'get' + KEY;\n    var SETTER = 'set' + KEY;\n    var TypedArray = global[NAME];\n    var Base = TypedArray || {};\n    var TAC = TypedArray && getPrototypeOf(TypedArray);\n    var FORCED = !TypedArray || !$typed.ABV;\n    var O = {};\n    var TypedArrayPrototype = TypedArray && TypedArray[PROTOTYPE];\n    var getter = function (that, index) {\n      var data = that._d;\n      return data.v[GETTER](index * BYTES + data.o, LITTLE_ENDIAN);\n    };\n    var setter = function (that, index, value) {\n      var data = that._d;\n      if (CLAMPED) value = (value = Math.round(value)) < 0 ? 0 : value > 0xff ? 0xff : value & 0xff;\n      data.v[SETTER](index * BYTES + data.o, value, LITTLE_ENDIAN);\n    };\n    var addElement = function (that, index) {\n      dP(that, index, {\n        get: function () {\n          return getter(this, index);\n        },\n        set: function (value) {\n          return setter(this, index, value);\n        },\n        enumerable: true\n      });\n    };\n    if (FORCED) {\n      TypedArray = wrapper(function (that, data, $offset, $length) {\n        anInstance(that, TypedArray, NAME, '_d');\n        var index = 0;\n        var offset = 0;\n        var buffer, byteLength, length, klass;\n        if (!isObject(data)) {\n          length = toIndex(data);\n          byteLength = length * BYTES;\n          buffer = new $ArrayBuffer(byteLength);\n        } else if (data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {\n          buffer = data;\n          offset = toOffset($offset, BYTES);\n          var $len = data.byteLength;\n          if ($length === undefined) {\n            if ($len % BYTES) throw RangeError(WRONG_LENGTH);\n            byteLength = $len - offset;\n            if (byteLength < 0) throw RangeError(WRONG_LENGTH);\n          } else {\n            byteLength = toLength($length) * BYTES;\n            if (byteLength + offset > $len) throw RangeError(WRONG_LENGTH);\n          }\n          length = byteLength / BYTES;\n        } else if (TYPED_ARRAY in data) {\n          return fromList(TypedArray, data);\n        } else {\n          return $from.call(TypedArray, data);\n        }\n        hide(that, '_d', {\n          b: buffer,\n          o: offset,\n          l: byteLength,\n          e: length,\n          v: new $DataView(buffer)\n        });\n        while (index < length) addElement(that, index++);\n      });\n      TypedArrayPrototype = TypedArray[PROTOTYPE] = create($TypedArrayPrototype$);\n      hide(TypedArrayPrototype, 'constructor', TypedArray);\n    } else if (!fails(function () {\n      TypedArray(1);\n    }) || !fails(function () {\n      new TypedArray(-1); // eslint-disable-line no-new\n    }) || !$iterDetect(function (iter) {\n      new TypedArray(); // eslint-disable-line no-new\n      new TypedArray(null); // eslint-disable-line no-new\n      new TypedArray(1.5); // eslint-disable-line no-new\n      new TypedArray(iter); // eslint-disable-line no-new\n    }, true)) {\n      TypedArray = wrapper(function (that, data, $offset, $length) {\n        anInstance(that, TypedArray, NAME);\n        var klass;\n        // `ws` module bug, temporarily remove validation length for Uint8Array\n        // https://github.com/websockets/ws/pull/645\n        if (!isObject(data)) return new Base(toIndex(data));\n        if (data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {\n          return $length !== undefined\n            ? new Base(data, toOffset($offset, BYTES), $length)\n            : $offset !== undefined\n              ? new Base(data, toOffset($offset, BYTES))\n              : new Base(data);\n        }\n        if (TYPED_ARRAY in data) return fromList(TypedArray, data);\n        return $from.call(TypedArray, data);\n      });\n      arrayForEach(TAC !== Function.prototype ? gOPN(Base).concat(gOPN(TAC)) : gOPN(Base), function (key) {\n        if (!(key in TypedArray)) hide(TypedArray, key, Base[key]);\n      });\n      TypedArray[PROTOTYPE] = TypedArrayPrototype;\n      if (!LIBRARY) TypedArrayPrototype.constructor = TypedArray;\n    }\n    var $nativeIterator = TypedArrayPrototype[ITERATOR];\n    var CORRECT_ITER_NAME = !!$nativeIterator\n      && ($nativeIterator.name == 'values' || $nativeIterator.name == undefined);\n    var $iterator = $iterators.values;\n    hide(TypedArray, TYPED_CONSTRUCTOR, true);\n    hide(TypedArrayPrototype, TYPED_ARRAY, NAME);\n    hide(TypedArrayPrototype, VIEW, true);\n    hide(TypedArrayPrototype, DEF_CONSTRUCTOR, TypedArray);\n\n    if (CLAMPED ? new TypedArray(1)[TAG] != NAME : !(TAG in TypedArrayPrototype)) {\n      dP(TypedArrayPrototype, TAG, {\n        get: function () { return NAME; }\n      });\n    }\n\n    O[NAME] = TypedArray;\n\n    $export($export.G + $export.W + $export.F * (TypedArray != Base), O);\n\n    $export($export.S, NAME, {\n      BYTES_PER_ELEMENT: BYTES\n    });\n\n    $export($export.S + $export.F * fails(function () { Base.of.call(TypedArray, 1); }), NAME, {\n      from: $from,\n      of: $of\n    });\n\n    if (!(BYTES_PER_ELEMENT in TypedArrayPrototype)) hide(TypedArrayPrototype, BYTES_PER_ELEMENT, BYTES);\n\n    $export($export.P, NAME, proto);\n\n    setSpecies(NAME);\n\n    $export($export.P + $export.F * FORCED_SET, NAME, { set: $set });\n\n    $export($export.P + $export.F * !CORRECT_ITER_NAME, NAME, $iterators);\n\n    if (!LIBRARY && TypedArrayPrototype.toString != arrayToString) TypedArrayPrototype.toString = arrayToString;\n\n    $export($export.P + $export.F * fails(function () {\n      new TypedArray(1).slice();\n    }), NAME, { slice: $slice });\n\n    $export($export.P + $export.F * (fails(function () {\n      return [1, 2].toLocaleString() != new TypedArray([1, 2]).toLocaleString();\n    }) || !fails(function () {\n      TypedArrayPrototype.toLocaleString.call([1, 2]);\n    })), NAME, { toLocaleString: $toLocaleString });\n\n    Iterators[NAME] = CORRECT_ITER_NAME ? $nativeIterator : $iterator;\n    if (!LIBRARY && !CORRECT_ITER_NAME) hide(TypedArrayPrototype, ITERATOR, $iterator);\n  };\n} else module.exports = function () { /* empty */ };\n\n\n/***/ }),\n\n/***/ \"ed0b\":\n/***/ (function(module, exports, __webpack_require__) {\n\n\"use strict\";\n\nvar global = __webpack_require__(\"7726\");\nvar DESCRIPTORS = __webpack_require__(\"9e1e\");\nvar LIBRARY = __webpack_require__(\"2d00\");\nvar $typed = __webpack_require__(\"0f88\");\nvar hide = __webpack_require__(\"32e9\");\nvar redefineAll = __webpack_require__(\"dcbc\");\nvar fails = __webpack_require__(\"79e5\");\nvar anInstance = __webpack_require__(\"f605\");\nvar toInteger = __webpack_require__(\"4588\");\nvar toLength = __webpack_require__(\"9def\");\nvar toIndex = __webpack_require__(\"09fa\");\nvar gOPN = __webpack_require__(\"9093\").f;\nvar dP = __webpack_require__(\"86cc\").f;\nvar arrayFill = __webpack_require__(\"36bd\");\nvar setToStringTag = __webpack_require__(\"7f20\");\nvar ARRAY_BUFFER = 'ArrayBuffer';\nvar DATA_VIEW = 'DataView';\nvar PROTOTYPE = 'prototype';\nvar WRONG_LENGTH = 'Wrong length!';\nvar WRONG_INDEX = 'Wrong index!';\nvar $ArrayBuffer = global[ARRAY_BUFFER];\nvar $DataView = global[DATA_VIEW];\nvar Math = global.Math;\nvar RangeError = global.RangeError;\n// eslint-disable-next-line no-shadow-restricted-names\nvar Infinity = global.Infinity;\nvar BaseBuffer = $ArrayBuffer;\nvar abs = Math.abs;\nvar pow = Math.pow;\nvar floor = Math.floor;\nvar log = Math.log;\nvar LN2 = Math.LN2;\nvar BUFFER = 'buffer';\nvar BYTE_LENGTH = 'byteLength';\nvar BYTE_OFFSET = 'byteOffset';\nvar $BUFFER = DESCRIPTORS ? '_b' : BUFFER;\nvar $LENGTH = DESCRIPTORS ? '_l' : BYTE_LENGTH;\nvar $OFFSET = DESCRIPTORS ? '_o' : BYTE_OFFSET;\n\n// IEEE754 conversions based on https://github.com/feross/ieee754\nfunction packIEEE754(value, mLen, nBytes) {\n  var buffer = new Array(nBytes);\n  var eLen = nBytes * 8 - mLen - 1;\n  var eMax = (1 << eLen) - 1;\n  var eBias = eMax >> 1;\n  var rt = mLen === 23 ? pow(2, -24) - pow(2, -77) : 0;\n  var i = 0;\n  var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;\n  var e, m, c;\n  value = abs(value);\n  // eslint-disable-next-line no-self-compare\n  if (value != value || value === Infinity) {\n    // eslint-disable-next-line no-self-compare\n    m = value != value ? 1 : 0;\n    e = eMax;\n  } else {\n    e = floor(log(value) / LN2);\n    if (value * (c = pow(2, -e)) < 1) {\n      e--;\n      c *= 2;\n    }\n    if (e + eBias >= 1) {\n      value += rt / c;\n    } else {\n      value += rt * pow(2, 1 - eBias);\n    }\n    if (value * c >= 2) {\n      e++;\n      c /= 2;\n    }\n    if (e + eBias >= eMax) {\n      m = 0;\n      e = eMax;\n    } else if (e + eBias >= 1) {\n      m = (value * c - 1) * pow(2, mLen);\n      e = e + eBias;\n    } else {\n      m = value * pow(2, eBias - 1) * pow(2, mLen);\n      e = 0;\n    }\n  }\n  for (; mLen >= 8; buffer[i++] = m & 255, m /= 256, mLen -= 8);\n  e = e << mLen | m;\n  eLen += mLen;\n  for (; eLen > 0; buffer[i++] = e & 255, e /= 256, eLen -= 8);\n  buffer[--i] |= s * 128;\n  return buffer;\n}\nfunction unpackIEEE754(buffer, mLen, nBytes) {\n  var eLen = nBytes * 8 - mLen - 1;\n  var eMax = (1 << eLen) - 1;\n  var eBias = eMax >> 1;\n  var nBits = eLen - 7;\n  var i = nBytes - 1;\n  var s = buffer[i--];\n  var e = s & 127;\n  var m;\n  s >>= 7;\n  for (; nBits > 0; e = e * 256 + buffer[i], i--, nBits -= 8);\n  m = e & (1 << -nBits) - 1;\n  e >>= -nBits;\n  nBits += mLen;\n  for (; nBits > 0; m = m * 256 + buffer[i], i--, nBits -= 8);\n  if (e === 0) {\n    e = 1 - eBias;\n  } else if (e === eMax) {\n    return m ? NaN : s ? -Infinity : Infinity;\n  } else {\n    m = m + pow(2, mLen);\n    e = e - eBias;\n  } return (s ? -1 : 1) * m * pow(2, e - mLen);\n}\n\nfunction unpackI32(bytes) {\n  return bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0];\n}\nfunction packI8(it) {\n  return [it & 0xff];\n}\nfunction packI16(it) {\n  return [it & 0xff, it >> 8 & 0xff];\n}\nfunction packI32(it) {\n  return [it & 0xff, it >> 8 & 0xff, it >> 16 & 0xff, it >> 24 & 0xff];\n}\nfunction packF64(it) {\n  return packIEEE754(it, 52, 8);\n}\nfunction packF32(it) {\n  return packIEEE754(it, 23, 4);\n}\n\nfunction addGetter(C, key, internal) {\n  dP(C[PROTOTYPE], key, { get: function () { return this[internal]; } });\n}\n\nfunction get(view, bytes, index, isLittleEndian) {\n  var numIndex = +index;\n  var intIndex = toIndex(numIndex);\n  if (intIndex + bytes > view[$LENGTH]) throw RangeError(WRONG_INDEX);\n  var store = view[$BUFFER]._b;\n  var start = intIndex + view[$OFFSET];\n  var pack = store.slice(start, start + bytes);\n  return isLittleEndian ? pack : pack.reverse();\n}\nfunction set(view, bytes, index, conversion, value, isLittleEndian) {\n  var numIndex = +index;\n  var intIndex = toIndex(numIndex);\n  if (intIndex + bytes > view[$LENGTH]) throw RangeError(WRONG_INDEX);\n  var store = view[$BUFFER]._b;\n  var start = intIndex + view[$OFFSET];\n  var pack = conversion(+value);\n  for (var i = 0; i < bytes; i++) store[start + i] = pack[isLittleEndian ? i : bytes - i - 1];\n}\n\nif (!$typed.ABV) {\n  $ArrayBuffer = function ArrayBuffer(length) {\n    anInstance(this, $ArrayBuffer, ARRAY_BUFFER);\n    var byteLength = toIndex(length);\n    this._b = arrayFill.call(new Array(byteLength), 0);\n    this[$LENGTH] = byteLength;\n  };\n\n  $DataView = function DataView(buffer, byteOffset, byteLength) {\n    anInstance(this, $DataView, DATA_VIEW);\n    anInstance(buffer, $ArrayBuffer, DATA_VIEW);\n    var bufferLength = buffer[$LENGTH];\n    var offset = toInteger(byteOffset);\n    if (offset < 0 || offset > bufferLength) throw RangeError('Wrong offset!');\n    byteLength = byteLength === undefined ? bufferLength - offset : toLength(byteLength);\n    if (offset + byteLength > bufferLength) throw RangeError(WRONG_LENGTH);\n    this[$BUFFER] = buffer;\n    this[$OFFSET] = offset;\n    this[$LENGTH] = byteLength;\n  };\n\n  if (DESCRIPTORS) {\n    addGetter($ArrayBuffer, BYTE_LENGTH, '_l');\n    addGetter($DataView, BUFFER, '_b');\n    addGetter($DataView, BYTE_LENGTH, '_l');\n    addGetter($DataView, BYTE_OFFSET, '_o');\n  }\n\n  redefineAll($DataView[PROTOTYPE], {\n    getInt8: function getInt8(byteOffset) {\n      return get(this, 1, byteOffset)[0] << 24 >> 24;\n    },\n    getUint8: function getUint8(byteOffset) {\n      return get(this, 1, byteOffset)[0];\n    },\n    getInt16: function getInt16(byteOffset /* , littleEndian */) {\n      var bytes = get(this, 2, byteOffset, arguments[1]);\n      return (bytes[1] << 8 | bytes[0]) << 16 >> 16;\n    },\n    getUint16: function getUint16(byteOffset /* , littleEndian */) {\n      var bytes = get(this, 2, byteOffset, arguments[1]);\n      return bytes[1] << 8 | bytes[0];\n    },\n    getInt32: function getInt32(byteOffset /* , littleEndian */) {\n      return unpackI32(get(this, 4, byteOffset, arguments[1]));\n    },\n    getUint32: function getUint32(byteOffset /* , littleEndian */) {\n      return unpackI32(get(this, 4, byteOffset, arguments[1])) >>> 0;\n    },\n    getFloat32: function getFloat32(byteOffset /* , littleEndian */) {\n      return unpackIEEE754(get(this, 4, byteOffset, arguments[1]), 23, 4);\n    },\n    getFloat64: function getFloat64(byteOffset /* , littleEndian */) {\n      return unpackIEEE754(get(this, 8, byteOffset, arguments[1]), 52, 8);\n    },\n    setInt8: function setInt8(byteOffset, value) {\n      set(this, 1, byteOffset, packI8, value);\n    },\n    setUint8: function setUint8(byteOffset, value) {\n      set(this, 1, byteOffset, packI8, value);\n    },\n    setInt16: function setInt16(byteOffset, value /* , littleEndian */) {\n      set(this, 2, byteOffset, packI16, value, arguments[2]);\n    },\n    setUint16: function setUint16(byteOffset, value /* , littleEndian */) {\n      set(this, 2, byteOffset, packI16, value, arguments[2]);\n    },\n    setInt32: function setInt32(byteOffset, value /* , littleEndian */) {\n      set(this, 4, byteOffset, packI32, value, arguments[2]);\n    },\n    setUint32: function setUint32(byteOffset, value /* , littleEndian */) {\n      set(this, 4, byteOffset, packI32, value, arguments[2]);\n    },\n    setFloat32: function setFloat32(byteOffset, value /* , littleEndian */) {\n      set(this, 4, byteOffset, packF32, value, arguments[2]);\n    },\n    setFloat64: function setFloat64(byteOffset, value /* , littleEndian */) {\n      set(this, 8, byteOffset, packF64, value, arguments[2]);\n    }\n  });\n} else {\n  if (!fails(function () {\n    $ArrayBuffer(1);\n  }) || !fails(function () {\n    new $ArrayBuffer(-1); // eslint-disable-line no-new\n  }) || fails(function () {\n    new $ArrayBuffer(); // eslint-disable-line no-new\n    new $ArrayBuffer(1.5); // eslint-disable-line no-new\n    new $ArrayBuffer(NaN); // eslint-disable-line no-new\n    return $ArrayBuffer.name != ARRAY_BUFFER;\n  })) {\n    $ArrayBuffer = function ArrayBuffer(length) {\n      anInstance(this, $ArrayBuffer);\n      return new BaseBuffer(toIndex(length));\n    };\n    var ArrayBufferProto = $ArrayBuffer[PROTOTYPE] = BaseBuffer[PROTOTYPE];\n    for (var keys = gOPN(BaseBuffer), j = 0, key; keys.length > j;) {\n      if (!((key = keys[j++]) in $ArrayBuffer)) hide($ArrayBuffer, key, BaseBuffer[key]);\n    }\n    if (!LIBRARY) ArrayBufferProto.constructor = $ArrayBuffer;\n  }\n  // iOS Safari 7.x bug\n  var view = new $DataView(new $ArrayBuffer(2));\n  var $setInt8 = $DataView[PROTOTYPE].setInt8;\n  view.setInt8(0, 2147483648);\n  view.setInt8(1, 2147483649);\n  if (view.getInt8(0) || !view.getInt8(1)) redefineAll($DataView[PROTOTYPE], {\n    setInt8: function setInt8(byteOffset, value) {\n      $setInt8.call(this, byteOffset, value << 24 >> 24);\n    },\n    setUint8: function setUint8(byteOffset, value) {\n      $setInt8.call(this, byteOffset, value << 24 >> 24);\n    }\n  }, true);\n}\nsetToStringTag($ArrayBuffer, ARRAY_BUFFER);\nsetToStringTag($DataView, DATA_VIEW);\nhide($DataView[PROTOTYPE], $typed.VIEW, true);\nexports[ARRAY_BUFFER] = $ArrayBuffer;\nexports[DATA_VIEW] = $DataView;\n\n\n/***/ }),\n\n/***/ \"f605\":\n/***/ (function(module, exports) {\n\nmodule.exports = function (it, Constructor, name, forbiddenField) {\n  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {\n    throw TypeError(name + ': incorrect invocation!');\n  } return it;\n};\n\n\n/***/ }),\n\n/***/ \"f751\":\n/***/ (function(module, exports, __webpack_require__) {\n\n// 19.1.3.1 Object.assign(target, source)\nvar $export = __webpack_require__(\"5ca1\");\n\n$export($export.S + $export.F, 'Object', { assign: __webpack_require__(\"7333\") });\n\n\n/***/ }),\n\n/***/ \"fab2\":\n/***/ (function(module, exports, __webpack_require__) {\n\nvar document = __webpack_require__(\"7726\").document;\nmodule.exports = document && document.documentElement;\n\n\n/***/ })\n\n/******/ });", __webpack_require__.p + "a72c165ab20bd60b595b.worker.js");
};

/***/ }),

/***/ "9c6c":
/***/ (function(module, exports, __webpack_require__) {

// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = __webpack_require__("2b4c")('unscopables');
var ArrayProto = Array.prototype;
if (ArrayProto[UNSCOPABLES] == undefined) __webpack_require__("32e9")(ArrayProto, UNSCOPABLES, {});
module.exports = function (key) {
  ArrayProto[UNSCOPABLES][key] = true;
};


/***/ }),

/***/ "9c80":
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return { e: false, v: exec() };
  } catch (e) {
    return { e: true, v: e };
  }
};


/***/ }),

/***/ "9def":
/***/ (function(module, exports, __webpack_require__) {

// 7.1.15 ToLength
var toInteger = __webpack_require__("4588");
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};


/***/ }),

/***/ "9e1e":
/***/ (function(module, exports, __webpack_require__) {

// Thank's IE8 for his funny defineProperty
module.exports = !__webpack_require__("79e5")(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),

/***/ "a25f":
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__("7726");
var navigator = global.navigator;

module.exports = navigator && navigator.userAgent || '';


/***/ }),

/***/ "a3d4":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("2350")(false);
// imports


// module
exports.push([module.i, "\n.axis-border[data-v-1458e30f],.axis-x[data-v-1458e30f],.axis-y[data-v-1458e30f]{fill:none;shape-rendering:crispEdges;stroke:#000;stroke-width:1px\n}", ""]);

// exports


/***/ }),

/***/ "a5b8":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 25.4.1.5 NewPromiseCapability(C)
var aFunction = __webpack_require__("d8e8");

function PromiseCapability(C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject = aFunction(reject);
}

module.exports.f = function (C) {
  return new PromiseCapability(C);
};


/***/ }),

/***/ "aa77":
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__("5ca1");
var defined = __webpack_require__("be13");
var fails = __webpack_require__("79e5");
var spaces = __webpack_require__("fdef");
var space = '[' + spaces + ']';
var non = '\u200b\u0085';
var ltrim = RegExp('^' + space + space + '*');
var rtrim = RegExp(space + space + '*$');

var exporter = function (KEY, exec, ALIAS) {
  var exp = {};
  var FORCE = fails(function () {
    return !!spaces[KEY]() || non[KEY]() != non;
  });
  var fn = exp[KEY] = FORCE ? exec(trim) : spaces[KEY];
  if (ALIAS) exp[ALIAS] = fn;
  $export($export.P + $export.F * FORCE, 'String', exp);
};

// 1 -> String#trimLeft
// 2 -> String#trimRight
// 3 -> String#trim
var trim = exporter.trim = function (string, TYPE) {
  string = String(defined(string));
  if (TYPE & 1) string = string.replace(ltrim, '');
  if (TYPE & 2) string = string.replace(rtrim, '');
  return string;
};

module.exports = exporter;


/***/ }),

/***/ "ac6a":
/***/ (function(module, exports, __webpack_require__) {

var $iterators = __webpack_require__("cadf");
var getKeys = __webpack_require__("0d58");
var redefine = __webpack_require__("2aba");
var global = __webpack_require__("7726");
var hide = __webpack_require__("32e9");
var Iterators = __webpack_require__("84f2");
var wks = __webpack_require__("2b4c");
var ITERATOR = wks('iterator');
var TO_STRING_TAG = wks('toStringTag');
var ArrayValues = Iterators.Array;

var DOMIterables = {
  CSSRuleList: true, // TODO: Not spec compliant, should be false.
  CSSStyleDeclaration: false,
  CSSValueList: false,
  ClientRectList: false,
  DOMRectList: false,
  DOMStringList: false,
  DOMTokenList: true,
  DataTransferItemList: false,
  FileList: false,
  HTMLAllCollection: false,
  HTMLCollection: false,
  HTMLFormElement: false,
  HTMLSelectElement: false,
  MediaList: true, // TODO: Not spec compliant, should be false.
  MimeTypeArray: false,
  NamedNodeMap: false,
  NodeList: true,
  PaintRequestList: false,
  Plugin: false,
  PluginArray: false,
  SVGLengthList: false,
  SVGNumberList: false,
  SVGPathSegList: false,
  SVGPointList: false,
  SVGStringList: false,
  SVGTransformList: false,
  SourceBufferList: false,
  StyleSheetList: true, // TODO: Not spec compliant, should be false.
  TextTrackCueList: false,
  TextTrackList: false,
  TouchList: false
};

for (var collections = getKeys(DOMIterables), i = 0; i < collections.length; i++) {
  var NAME = collections[i];
  var explicit = DOMIterables[NAME];
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  var key;
  if (proto) {
    if (!proto[ITERATOR]) hide(proto, ITERATOR, ArrayValues);
    if (!proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
    Iterators[NAME] = ArrayValues;
    if (explicit) for (key in $iterators) if (!proto[key]) redefine(proto, key, $iterators[key], true);
  }
}


/***/ }),

/***/ "bc25":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_6_oneOf_1_0_node_modules_css_loader_index_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_lib_index_js_ref_6_oneOf_1_2_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Crosshair_vue_vue_type_style_index_0_id_08913442_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("5505");
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_6_oneOf_1_0_node_modules_css_loader_index_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_lib_index_js_ref_6_oneOf_1_2_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Crosshair_vue_vue_type_style_index_0_id_08913442_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_index_js_ref_6_oneOf_1_0_node_modules_css_loader_index_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_lib_index_js_ref_6_oneOf_1_2_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Crosshair_vue_vue_type_style_index_0_id_08913442_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_vue_style_loader_index_js_ref_6_oneOf_1_0_node_modules_css_loader_index_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_lib_index_js_ref_6_oneOf_1_2_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Crosshair_vue_vue_type_style_index_0_id_08913442_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "bcaa":
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__("cb7c");
var isObject = __webpack_require__("d3f4");
var newPromiseCapability = __webpack_require__("a5b8");

module.exports = function (C, x) {
  anObject(C);
  if (isObject(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};


/***/ }),

/***/ "be13":
/***/ (function(module, exports) {

// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};


/***/ }),

/***/ "c302":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("2350")(false);
// imports


// module
exports.push([module.i, "", ""]);

// exports


/***/ }),

/***/ "c366":
/***/ (function(module, exports, __webpack_require__) {

// false -> Array#indexOf
// true  -> Array#includes
var toIObject = __webpack_require__("6821");
var toLength = __webpack_require__("9def");
var toAbsoluteIndex = __webpack_require__("77f1");
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};


/***/ }),

/***/ "c58e":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_6_oneOf_1_0_node_modules_css_loader_index_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_lib_index_js_ref_6_oneOf_1_2_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_AxisY_vue_vue_type_style_index_0_id_4e16cadb_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("05ea");
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_6_oneOf_1_0_node_modules_css_loader_index_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_lib_index_js_ref_6_oneOf_1_2_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_AxisY_vue_vue_type_style_index_0_id_4e16cadb_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_index_js_ref_6_oneOf_1_0_node_modules_css_loader_index_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_lib_index_js_ref_6_oneOf_1_2_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_AxisY_vue_vue_type_style_index_0_id_4e16cadb_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_vue_style_loader_index_js_ref_6_oneOf_1_0_node_modules_css_loader_index_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_lib_index_js_ref_6_oneOf_1_2_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_AxisY_vue_vue_type_style_index_0_id_4e16cadb_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "c5f6":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var global = __webpack_require__("7726");
var has = __webpack_require__("69a8");
var cof = __webpack_require__("2d95");
var inheritIfRequired = __webpack_require__("5dbc");
var toPrimitive = __webpack_require__("6a99");
var fails = __webpack_require__("79e5");
var gOPN = __webpack_require__("9093").f;
var gOPD = __webpack_require__("11e9").f;
var dP = __webpack_require__("86cc").f;
var $trim = __webpack_require__("aa77").trim;
var NUMBER = 'Number';
var $Number = global[NUMBER];
var Base = $Number;
var proto = $Number.prototype;
// Opera ~12 has broken Object#toString
var BROKEN_COF = cof(__webpack_require__("2aeb")(proto)) == NUMBER;
var TRIM = 'trim' in String.prototype;

// 7.1.3 ToNumber(argument)
var toNumber = function (argument) {
  var it = toPrimitive(argument, false);
  if (typeof it == 'string' && it.length > 2) {
    it = TRIM ? it.trim() : $trim(it, 3);
    var first = it.charCodeAt(0);
    var third, radix, maxCode;
    if (first === 43 || first === 45) {
      third = it.charCodeAt(2);
      if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
    } else if (first === 48) {
      switch (it.charCodeAt(1)) {
        case 66: case 98: radix = 2; maxCode = 49; break; // fast equal /^0b[01]+$/i
        case 79: case 111: radix = 8; maxCode = 55; break; // fast equal /^0o[0-7]+$/i
        default: return +it;
      }
      for (var digits = it.slice(2), i = 0, l = digits.length, code; i < l; i++) {
        code = digits.charCodeAt(i);
        // parseInt parses a string to a first unavailable symbol
        // but ToNumber should return NaN if a string contains unavailable symbols
        if (code < 48 || code > maxCode) return NaN;
      } return parseInt(digits, radix);
    }
  } return +it;
};

if (!$Number(' 0o1') || !$Number('0b1') || $Number('+0x1')) {
  $Number = function Number(value) {
    var it = arguments.length < 1 ? 0 : value;
    var that = this;
    return that instanceof $Number
      // check on 1..constructor(foo) case
      && (BROKEN_COF ? fails(function () { proto.valueOf.call(that); }) : cof(that) != NUMBER)
        ? inheritIfRequired(new Base(toNumber(it)), that, $Number) : toNumber(it);
  };
  for (var keys = __webpack_require__("9e1e") ? gOPN(Base) : (
    // ES3:
    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
    // ES6 (in case, if modules with ES6 Number statics required before):
    'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
    'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
  ).split(','), j = 0, key; keys.length > j; j++) {
    if (has(Base, key = keys[j]) && !has($Number, key)) {
      dP($Number, key, gOPD(Base, key));
    }
  }
  $Number.prototype = proto;
  proto.constructor = $Number;
  __webpack_require__("2aba")(global, NUMBER, $Number);
}


/***/ }),

/***/ "c69a":
/***/ (function(module, exports, __webpack_require__) {

module.exports = !__webpack_require__("9e1e") && !__webpack_require__("79e5")(function () {
  return Object.defineProperty(__webpack_require__("230e")('div'), 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),

/***/ "c8ba":
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1, eval)("this");
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "ca5a":
/***/ (function(module, exports) {

var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};


/***/ }),

/***/ "ca68":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("3ff0");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__("499e").default
var update = add("0140e4c4", content, true, {"sourceMap":false,"shadowMode":false});

/***/ }),

/***/ "cadf":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var addToUnscopables = __webpack_require__("9c6c");
var step = __webpack_require__("d53b");
var Iterators = __webpack_require__("84f2");
var toIObject = __webpack_require__("6821");

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = __webpack_require__("01f9")(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');


/***/ }),

/***/ "cb7c":
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__("d3f4");
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};


/***/ }),

/***/ "cd3f":
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, module) {/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Used to identify `toStringTag` values supported by `_.clone`. */
var cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] =
cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
cloneableTags[boolTag] = cloneableTags[dateTag] =
cloneableTags[float32Tag] = cloneableTags[float64Tag] =
cloneableTags[int8Tag] = cloneableTags[int16Tag] =
cloneableTags[int32Tag] = cloneableTags[mapTag] =
cloneableTags[numberTag] = cloneableTags[objectTag] =
cloneableTags[regexpTag] = cloneableTags[setTag] =
cloneableTags[stringTag] = cloneableTags[symbolTag] =
cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] =
cloneableTags[weakMapTag] = false;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/**
 * Adds the key-value `pair` to `map`.
 *
 * @private
 * @param {Object} map The map to modify.
 * @param {Array} pair The key-value pair to add.
 * @returns {Object} Returns `map`.
 */
function addMapEntry(map, pair) {
  // Don't return `map.set` because it's not chainable in IE 11.
  map.set(pair[0], pair[1]);
  return map;
}

/**
 * Adds `value` to `set`.
 *
 * @private
 * @param {Object} set The set to modify.
 * @param {*} value The value to add.
 * @returns {Object} Returns `set`.
 */
function addSetEntry(set, value) {
  // Don't return `set.add` because it's not chainable in IE 11.
  set.add(value);
  return set;
}

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

/**
 * A specialized version of `_.reduce` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @param {boolean} [initAccum] Specify using the first element of `array` as
 *  the initial value.
 * @returns {*} Returns the accumulated value.
 */
function arrayReduce(array, iteratee, accumulator, initAccum) {
  var index = -1,
      length = array ? array.length : 0;

  if (initAccum && length) {
    accumulator = array[++index];
  }
  while (++index < length) {
    accumulator = iteratee(accumulator, array[index], index, array);
  }
  return accumulator;
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined,
    Symbol = root.Symbol,
    Uint8Array = root.Uint8Array,
    getPrototype = overArg(Object.getPrototypeOf, Object),
    objectCreate = Object.create,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    splice = arrayProto.splice;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols,
    nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
    nativeKeys = overArg(Object.keys, Object);

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView'),
    Map = getNative(root, 'Map'),
    Promise = getNative(root, 'Promise'),
    Set = getNative(root, 'Set'),
    WeakMap = getNative(root, 'WeakMap'),
    nativeCreate = getNative(Object, 'create');

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  return this.has(key) && delete this.__data__[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  return getMapData(this, key)['delete'](key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  getMapData(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  this.__data__ = new ListCache(entries);
}

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
}

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  return this.__data__['delete'](key);
}

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var cache = this.__data__;
  if (cache instanceof ListCache) {
    var pairs = cache.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      return this;
    }
    cache = this.__data__ = new MapCache(pairs);
  }
  cache.set(key, value);
  return this;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  // Safari 9 makes `arguments.length` enumerable in strict mode.
  var result = (isArray(value) || isArguments(value))
    ? baseTimes(value.length, String)
    : [];

  var length = result.length,
      skipIndexes = !!length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    object[key] = value;
  }
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.assign` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return object && copyObject(source, keys(source), object);
}

/**
 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
 * traversed objects.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @param {boolean} [isFull] Specify a clone including symbols.
 * @param {Function} [customizer] The function to customize cloning.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The parent object of `value`.
 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone(value, isDeep, isFull, customizer, key, object, stack) {
  var result;
  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!isObject(value)) {
    return value;
  }
  var isArr = isArray(value);
  if (isArr) {
    result = initCloneArray(value);
    if (!isDeep) {
      return copyArray(value, result);
    }
  } else {
    var tag = getTag(value),
        isFunc = tag == funcTag || tag == genTag;

    if (isBuffer(value)) {
      return cloneBuffer(value, isDeep);
    }
    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
      if (isHostObject(value)) {
        return object ? value : {};
      }
      result = initCloneObject(isFunc ? {} : value);
      if (!isDeep) {
        return copySymbols(value, baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = initCloneByTag(value, tag, baseClone, isDeep);
    }
  }
  // Check for circular references and return its corresponding clone.
  stack || (stack = new Stack);
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);

  if (!isArr) {
    var props = isFull ? getAllKeys(value) : keys(value);
  }
  arrayEach(props || value, function(subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    }
    // Recursively populate clone (susceptible to call stack limits).
    assignValue(result, key, baseClone(subValue, isDeep, isFull, customizer, key, value, stack));
  });
  return result;
}

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} prototype The object to inherit from.
 * @returns {Object} Returns the new object.
 */
function baseCreate(proto) {
  return isObject(proto) ? objectCreate(proto) : {};
}

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

/**
 * The base implementation of `getTag`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  return objectToString.call(value);
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var result = new buffer.constructor(buffer.length);
  buffer.copy(result);
  return result;
}

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}

/**
 * Creates a clone of `dataView`.
 *
 * @private
 * @param {Object} dataView The data view to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned data view.
 */
function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

/**
 * Creates a clone of `map`.
 *
 * @private
 * @param {Object} map The map to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned map.
 */
function cloneMap(map, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(mapToArray(map), true) : mapToArray(map);
  return arrayReduce(array, addMapEntry, new map.constructor);
}

/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} regexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */
function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

/**
 * Creates a clone of `set`.
 *
 * @private
 * @param {Object} set The set to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned set.
 */
function cloneSet(set, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(setToArray(set), true) : setToArray(set);
  return arrayReduce(array, addSetEntry, new set.constructor);
}

/**
 * Creates a clone of the `symbol` object.
 *
 * @private
 * @param {Object} symbol The symbol object to clone.
 * @returns {Object} Returns the cloned symbol object.
 */
function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    assignValue(object, key, newValue === undefined ? source[key] : newValue);
  }
  return object;
}

/**
 * Copies own symbol properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbols(source, object) {
  return copyObject(source, getSymbols(source), object);
}

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * Creates an array of the own enumerable symbol properties of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = nativeGetSymbols ? overArg(nativeGetSymbols, Object) : stubArray;

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11,
// for data views in Edge < 14, and promises in Node.js.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = objectToString.call(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : undefined;

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function initCloneArray(array) {
  var length = array.length,
      result = array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return (typeof object.constructor == 'function' && !isPrototype(object))
    ? baseCreate(getPrototype(object))
    : {};
}

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, cloneFunc, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag:
      return cloneArrayBuffer(object);

    case boolTag:
    case dateTag:
      return new Ctor(+object);

    case dataViewTag:
      return cloneDataView(object, isDeep);

    case float32Tag: case float64Tag:
    case int8Tag: case int16Tag: case int32Tag:
    case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
      return cloneTypedArray(object, isDeep);

    case mapTag:
      return cloneMap(object, isDeep, cloneFunc);

    case numberTag:
    case stringTag:
      return new Ctor(object);

    case regexpTag:
      return cloneRegExp(object);

    case setTag:
      return cloneSet(object, isDeep, cloneFunc);

    case symbolTag:
      return cloneSymbol(object);
  }
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * This method is like `_.clone` except that it recursively clones `value`.
 *
 * @static
 * @memberOf _
 * @since 1.0.0
 * @category Lang
 * @param {*} value The value to recursively clone.
 * @returns {*} Returns the deep cloned value.
 * @see _.clone
 * @example
 *
 * var objects = [{ 'a': 1 }, { 'b': 2 }];
 *
 * var deep = _.cloneDeep(objects);
 * console.log(deep[0] === objects[0]);
 * // => false
 */
function cloneDeep(value) {
  return baseClone(value, true, true);
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = cloneDeep;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__("c8ba"), __webpack_require__("62e4")(module)))

/***/ }),

/***/ "ce10":
/***/ (function(module, exports, __webpack_require__) {

var has = __webpack_require__("69a8");
var toIObject = __webpack_require__("6821");
var arrayIndexOf = __webpack_require__("c366")(false);
var IE_PROTO = __webpack_require__("613b")('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};


/***/ }),

/***/ "d263":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// B.2.3.6 String.prototype.fixed()
__webpack_require__("386b")('fixed', function (createHTML) {
  return function fixed() {
    return createHTML(this, 'tt', '', '');
  };
});


/***/ }),

/***/ "d3f4":
/***/ (function(module, exports) {

module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};


/***/ }),

/***/ "d53b":
/***/ (function(module, exports) {

module.exports = function (done, value) {
  return { value: value, done: !!done };
};


/***/ }),

/***/ "d8e8":
/***/ (function(module, exports) {

module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};


/***/ }),

/***/ "dcbc":
/***/ (function(module, exports, __webpack_require__) {

var redefine = __webpack_require__("2aba");
module.exports = function (target, src, safe) {
  for (var key in src) redefine(target, key, src[key], safe);
  return target;
};


/***/ }),

/***/ "dff9":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("a3d4");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__("499e").default
var update = add("6d8af73e", content, true, {"sourceMap":false,"shadowMode":false});

/***/ }),

/***/ "e002":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("2350")(false);
// imports


// module
exports.push([module.i, "", ""]);

// exports


/***/ }),

/***/ "e11e":
/***/ (function(module, exports) {

// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');


/***/ }),

/***/ "e45c":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("8ac9");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__("499e").default
var update = add("54b5dba8", content, true, {"sourceMap":false,"shadowMode":false});

/***/ }),

/***/ "ebd6":
/***/ (function(module, exports, __webpack_require__) {

// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject = __webpack_require__("cb7c");
var aFunction = __webpack_require__("d8e8");
var SPECIES = __webpack_require__("2b4c")('species');
module.exports = function (O, D) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};


/***/ }),

/***/ "f605":
/***/ (function(module, exports) {

module.exports = function (it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};


/***/ }),

/***/ "f726":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_6_oneOf_1_0_node_modules_css_loader_index_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_lib_index_js_ref_6_oneOf_1_2_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Navigator_vue_vue_type_style_index_0_id_617e8cf5_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("ca68");
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_6_oneOf_1_0_node_modules_css_loader_index_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_lib_index_js_ref_6_oneOf_1_2_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Navigator_vue_vue_type_style_index_0_id_617e8cf5_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_index_js_ref_6_oneOf_1_0_node_modules_css_loader_index_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_lib_index_js_ref_6_oneOf_1_2_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Navigator_vue_vue_type_style_index_0_id_617e8cf5_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_vue_style_loader_index_js_ref_6_oneOf_1_0_node_modules_css_loader_index_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_lib_index_js_ref_6_oneOf_1_2_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Navigator_vue_vue_type_style_index_0_id_617e8cf5_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "f751":
/***/ (function(module, exports, __webpack_require__) {

// 19.1.3.1 Object.assign(target, source)
var $export = __webpack_require__("5ca1");

$export($export.S + $export.F, 'Object', { assign: __webpack_require__("7333") });


/***/ }),

/***/ "fab2":
/***/ (function(module, exports, __webpack_require__) {

var document = __webpack_require__("7726").document;
module.exports = document && document.documentElement;


/***/ }),

/***/ "fb15":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: ./node_modules/@vue/cli-service/lib/commands/build/setPublicPath.js
var setPublicPath = __webpack_require__("1eb2");

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"0595ba96-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/App.vue?vue&type=template&id=06f4ea73&
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('div',[_c('svg',{ref:"chart",staticClass:"crypto-chart",style:({cursor: _vm.interactive.cursor}),attrs:{"viewBox":[0, 0, _vm.width ? _vm.width : 0, _vm.height ? _vm.height : 0],"width":_vm.width ? _vm.width : 0,"height":_vm.height ? _vm.height : 0},on:{"mousedown":function($event){$event.preventDefault();return _vm._onMixinMouse($event)},"mousemove":function($event){$event.preventDefault();return _vm._onMixinMouse($event)},"mouseup":function($event){$event.preventDefault();return _vm._onMixinMouse($event)},"mouseleave":function($event){$event.preventDefault();return _vm._onMixinMouse($event)},"touchstart":function($event){$event.preventDefault();return _vm._onMixinTouch($event)},"touchmove":function($event){$event.preventDefault();return _vm._onMixinTouch($event)},"touchend":function($event){$event.preventDefault();return _vm._onMixinTouch($event)},"touchcancel":function($event){$event.preventDefault();return _vm._onMixinTouch($event)}}},[(_vm.isLoading)?_c('g',{attrs:{"name":"loading"}},[_vm._t("loading",[_c('text',{attrs:{"y":30,"x":8,"font-size":14}},[_vm._v("Loading...")])])],2):_vm._e(),(!_vm.isEmpty)?_c('g',[(_vm.interactive.hoverCandle)?_c('g',[_c('text',{staticStyle:{"text-anchor":"start","font-family":"'Roboto', monospace"},style:(_vm.hoverColor(_vm.interactive.hoverCandle.open, _vm.interactive.hoverCandle.close)),attrs:{"y":15,"x":8,"font-size":_vm.interactiveTool.fontSize}},[_vm._v("\n            O: "+_vm._s(_vm.interactive.hoverCandle.open.toFixed(_vm.interactive.fraction.limit))+"\n            H: "+_vm._s(_vm.interactive.hoverCandle.high.toFixed(_vm.interactive.fraction.limit))+"\n            L: "+_vm._s(_vm.interactive.hoverCandle.low.toFixed(_vm.interactive.fraction.limit))+"\n            C: "+_vm._s(_vm.interactive.hoverCandle.close.toFixed(_vm.interactive.fraction.limit))+"\n            Vol: "+_vm._s(_vm.interactive.hoverCandle.volume.toFixed(_vm.interactive.fraction.nominal))+"\n          ")])]):_vm._e(),(_vm.candles)?_c('g',{attrs:{"transform":("translate(0, " + (this.offsets.chartTop) + ")")}},[_c('path',{staticClass:"candles-path-positive",attrs:{"d":_vm.positiveCandlesPath}}),_c('path',{staticClass:"candles-path-negative",attrs:{"d":_vm.negativeCandlesPath}}),_c('path',{staticClass:"candles-path-volume",attrs:{"d":_vm.volumeCandlesPath}}),(_vm.interactive.hoverCandle)?_c('g',[_c('path',{staticClass:"candles-path-volume hover",attrs:{"d":_vm.candles.volumePath[_vm.interactive.hoverCandle.volumePathIndex]}}),(_vm.interactive.hoverCandle.class == 'negative')?_c('path',{staticClass:"candles-path-negative hover",attrs:{"d":_vm.candles.candlesNegativePath[_vm.interactive.hoverCandle.candlePathIndex]}}):(_vm.interactive.hoverCandle.class == 'positive')?_c('path',{staticClass:"candles-path-positive hover",attrs:{"d":_vm.candles.candlesPositivePath[_vm.interactive.hoverCandle.candlePathIndex]}}):_vm._e()]):_vm._e()]):_vm._e(),_c('axis-y',{attrs:{"candles":_vm.candles,"chart-height":_vm.chart.height,"chart-width":_vm.chart.width,"chart-offset":_vm.offsets.chartTop,"fractionLimit":_vm.interactive.fraction.limit}}),_c('axis-x',{attrs:{"chart-height":_vm.chart.height,"chart-width":_vm.chart.width,"time-parts":_vm.zoom.time_parts,"exposition":_vm.exposition,"offset":_vm.interval.offset,"dpi":_vm.dpi,"candleWidth":_vm.candles && _vm.candles.width || 3,"chart-offset":_vm.offsets.chartBottom}}),_c('crosshair',{attrs:{"chart-height":_vm.chart.height,"chart-width":_vm.chart.width,"fractionLimit":_vm.interactive.fraction.limit,"chart-offset":_vm.offsets.chartTop,"candles":_vm.candles,"interactive":_vm.interactive}})],1):_c('g',[_c('text',{staticStyle:{"text-anchor":"start","font-family":"'Roboto', monospace"},attrs:{"y":_vm.height / 2,"x":_vm.width / 2,"font-size":14}},[_vm._t("noData",[_vm._v("No data")])],2)])])]),_c('navigator',{attrs:{"width":_vm.width,"average":_vm.average,"offset":_vm.interval.offset,"exposition":_vm.exposition,"wholeInterval":_vm.interval.width,"minZoom":_vm.minZoom,"maxZoom":_vm.maxZoom},on:{"handler":_vm.onHandle}})],1)}
var staticRenderFns = []


// CONCATENATED MODULE: ./src/App.vue?vue&type=template&id=06f4ea73&

// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.object.assign.js
var es6_object_assign = __webpack_require__("f751");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.array.iterator.js
var es6_array_iterator = __webpack_require__("cadf");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.promise.js
var es6_promise = __webpack_require__("551c");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es7.promise.finally.js
var es7_promise_finally = __webpack_require__("097d");

// EXTERNAL MODULE: ./node_modules/lodash.clonedeep/index.js
var lodash_clonedeep = __webpack_require__("cd3f");
var lodash_clonedeep_default = /*#__PURE__*/__webpack_require__.n(lodash_clonedeep);

// CONCATENATED MODULE: ./src/mixins/screen.js
/* harmony default export */ var screen = ({
  data: function data() {
    return {
      height: null,
      width: null,
      clientWidth: null,
      clientHeight: null,
      offsetTop: null,
      offsetLeft: null,
      chart: {
        height: 260,
        width: 940,
        offset: {
          top: 0,
          left: 0
        }
      },
      zoom: {
        value: this.intervalWidth / this.initExposition,
        time_parts: this.availableIntervals,
        curr_time_part: 0
      },
      interval: {
        width: this.intervalWidth,
        firstPoint: 0,
        offset: this.intervalStartOffset ? +this.intervalStartOffset : 0
      }
    };
  },
  computed: {
    // Pixel number includes zoom koof
    dpi: function dpi() {
      return this.chart.width / this.interval.width * this.zoom.value;
    },
    // Current time exposition
    exposition: function exposition() {
      return +(this.chart.width / this.dpi).toFixed(5);
    },
    // Coefficient of transformations native pixels to internal for X
    koofScreenX: function koofScreenX() {
      return 'clientWidth' in this && +this.clientWidth !== 0 ? this.width / this.clientWidth : 1;
    },
    // Coefficient of transformations native pixels to internal for Y
    koofScreenY: function koofScreenY() {
      return 'clientHeight' in this && +this.clientHeight !== 0 ? this.height / this.clientHeight : 1;
    },
    // Base for font height
    fontHeight: function fontHeight() {
      return this.koofScreenY > 0 ? 16 * this.koofScreenY : 16;
    },
    maxPart: function maxPart() {
      return this.zoom.time_parts[this.zoom.time_parts.length - 1];
    },
    minPart: function minPart() {
      return this.zoom.time_parts[0];
    },
    minExposition: function minExposition() {
      var wholeExposition = this.interval.width;
      var minExposition = this.minPart * 10;

      if (this.interval.firstPoint > 0) {
        wholeExposition = this.interval.width - this.interval.firstPoint;
        minExposition = wholeExposition < minExposition ? wholeExposition : minExposition;
      }

      return minExposition > 86400 ? minExposition : 86400;
    },
    maxExposition: function maxExposition() {
      var maxCandleWidth = this.availableCandleWidths[this.availableCandleWidths.length - 1];
      var expositionLimit = this.interval.width - this.interval.firstPoint;

      if (this.availableCandleWidths.length) {
        var expositionByCandles = maxCandleWidth * this.chart.width / this.minCandleWidth;
        return expositionLimit > expositionByCandles ? expositionByCandles : expositionLimit;
      }

      return this.maxPart;
    },
    minZoom: function minZoom() {
      return this.interval.width / this.maxExposition;
    },
    maxZoom: function maxZoom() {
      return this.interval.width / this.minExposition;
    }
  },
  watch: {
    'zoom.value': function zoomValue() {
      this.onRedraw();
      this.sendOffsetAndExposition(this.interval.offset, this.exposition);
    },
    'interval.offset': function intervalOffset() {
      this.onRedraw();
      this.sendOffsetAndExposition(this.interval.offset, this.exposition);
    },
    'interval.firstPoint': function intervalFirstPoint() {
      if (this.interval.firstPoint > 0) {
        this.setView(this.intervalStartOffset, this.initExposition);
      }
    },
    minExposition: function minExposition() {
      this.setView();
    },
    'initialSize.height': function initialSizeHeight() {
      this._onResize();
    },
    'initialSize.width': function initialSizeWidth() {
      this._onResize();
    },
    reloadCounter: function reloadCounter() {
      this.interval.firstPoint = 0;
      this.setView(this.intervalStartOffset, this.initExposition);
    }
  },
  created: function created() {
    window.addEventListener('resize', this._onResize);
  },
  mounted: function mounted() {
    this._onResize();
  },
  methods: {
    _onResize: function _onResize() {
      var _this = this;

      this.offsetTop = this.$el.offsetTop;
      this.offsetLeft = this.$el.offsetLeft;

      if (this.width) {
        this.clientWidth = this.$refs.chart.clientWidth || this.$refs.chart.parentNode.clientWidth;
      }

      if (this.height) {
        this.clientHeight = this.$refs.chart.clientHeight || this.$refs.chart.parentNode.clientHeight;
      }

      if (this.initialSize.width > 0) {
        this.width = this.initialSize.width;
      } else {
        this.width = this.clientWidth;
      }

      if (this.initialSize.height > 0) {
        this.height = this.initialSize.height - this.sizes.navigator.height - this.offsets.navigatorOffset;
      } else {
        this.height = this.clientHeight;
      }

      this.chart.width = this.width;
      this.chart.height = this.height - this.offsets.chartTop - this.offsets.chartBottom;

      if (!this.clientWidth && !this.clientHeight) {
        this.$nextTick(function () {
          _this.clientWidth = _this.$refs.chart.clientWidth || _this.$refs.chart.parentNode.clientWidth;
          _this.clientHeight = _this.$refs.chart.clientHeight || _this.$refs.chart.parentNode.clientHeight;
        });
      }

      if ('onRedraw' in this) {
        this.onRedraw();
      }
    },
    _rebaseZoomByParams: function _rebaseZoomByParams(params, zoom) {
      var result = zoom < this.minZoom ? this.minZoom : zoom;
      return result > this.maxZoom ? this.maxZoom : result;
    },
    rebaseZoom: function rebaseZoom(zoom) {
      return this._rebaseZoomByParams(this, zoom);
    },
    onZoom: function onZoom(zoom, targetMoment) {
      var oldExposition = this.exposition;
      var zoomValue = this.rebaseZoom(this.zoom.value * zoom);
      this.zoom.value = zoomValue < 1 ? 1 : this.rebaseZoom(this.zoom.value * zoom);
      this.interval.offset = this._rebaseOffset(this.interval.offset + (oldExposition - this.exposition) * ((targetMoment - this.interval.offset) / this.exposition));
    },
    _rebaseOffset: function _rebaseOffset(offset) {
      if (offset < 1) {
        offset = this.interval.width * (1 - offset);
      }

      if (offset < 0) {
        offset = 0;
      } else if (offset > this.interval.width - this.exposition) {
        offset = this.interval.width - this.exposition;
      }

      if (offset < this.interval.firstPoint) {
        offset = this.interval.firstPoint;
      }

      return Math.floor(offset);
    },
    setView: function setView() {
      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.interval.offset;
      var exposition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.exposition;

      if (this.interval.offset + exposition <= this.interval.width) {
        this.zoom.value = this.rebaseZoom(this.interval.width / exposition);
      } else {
        this.zoom.value = this.rebaseZoom(this.interval.width / (this.interval.width - this.interval.offset));
      }

      this.interval.offset = this._rebaseOffset(offset);
    },
    onSwipe: function onSwipe(params) {
      this.interval.offset = this._rebaseOffset(this.interval.offset + params.offsetX);
    },
    onHandle: function onHandle(data, position) {
      switch (position) {
        case 'left':
          {
            this.setView(data.offset, data.exposition);
            break;
          }

        case 'center':
          {
            this.setView(data.offset);
            break;
          }

        case 'right':
          {
            this.setView(data.offset, data.exposition);
            break;
          }

        default:
          break;
      }
    },
    sendOffsetAndExposition: function sendOffsetAndExposition(offset, exposition) {
      if (this.interval.firstPoint > 0 && this.interval.width > 0 && offset !== this.intervalStartOffset || exposition !== this.initExposition) {
        this.$emit('lastLocationInfo', offset, exposition, this.interval.firstPoint, this.interval.width);
      }
    }
  },
  destroyed: function destroyed() {
    window.removeEventListener('resize', this._onResize);
  }
});
// CONCATENATED MODULE: ./src/mixins/events-mouse.js
/* harmony default export */ var events_mouse = ({
  methods: {
    _onMixinMouse: function _onMixinMouse(event) {
      var offsets = this.$el.getBoundingClientRect();
      var additionalOffsetsY = 0;

      if (this.offsets && this.offsets.chartTop && this.offsets.chartBottom) {
        additionalOffsetsY = this.offsets.chartTop + this.offsets.chartBottom;
      }

      switch (event.type) {
        case 'mousedown':
          this.eventsMouse.scrolling.clientX = event.clientX;
          this.eventsMouse.scrolling.clientY = event.clientY;
          this.eventsMouse.scrolling.clientXWithOffset = event.clientX - offsets.left;
          this.eventsMouse.scrolling.clientYWithOffset = event.clientY - offsets.top;
          this.eventsMouse.scrolling.layerX = event.layerX;
          this.eventsMouse.scrolling.layerY = event.layerY;
          this.eventsMouse.scrolling.isScrolling = true;

          if ('onClick' in this) {
            this.onClick({
              x: event.clientX - offsets.left,
              y: event.clientY - offsets.top - additionalOffsetsY
            });
          }

          break;

        case 'mousemove':
          if ('onHover' in this) {
            this.onHover({
              x: event.clientX - offsets.left,
              y: event.clientY - offsets.top - additionalOffsetsY
            });
          }

          if (this.eventsMouse.scrolling.isScrolling) {
            this.eventsMouse.scrolling.power = this.eventsMouse.scrolling.clientX - event.clientX;
            this.eventsMouse.scrolling.clientX = event.clientX;
            this.eventsMouse.scrolling.layerX = event.layerX;

            if ('onSwipe' in this) {
              this.onSwipe({
                x: event.clientX - offsets.left,
                y: event.clientY - offsets.top - additionalOffsetsY,
                offsetX: this.eventsMouse.scrolling.power / this.dpi,
                offsetY: 0
              }, event);
            }
          }

          break;

        case 'mouseup':
        case 'mouseleave':
          this.eventsMouse.scrolling.isScrolling = false;
          break;
      }
    }
  },
  data: function data() {
    var _this = this;

    return {
      eventsMouse: {
        x: null,
        y: null,
        scrolling: {
          power: 0,
          clientX: 0,
          clientY: 0,
          layerX: 0,
          layerY: 0,
          isScrolling: false,
          inertTimer: setInterval(function () {
            if (!_this.eventsMouse.scrolling.isScrolling && Math.abs(_this.eventsMouse.scrolling.power) > 1) {
              if ('onSwipe' in _this) {
                _this.onSwipe({
                  offsetX: _this.eventsMouse.scrolling.power / _this.dpi,
                  offsetY: 0
                });
              }

              _this.eventsMouse.scrolling.power /= 1.2;
            }
          }, 20)
        }
      }
    };
  }
});
// CONCATENATED MODULE: ./src/mixins/events-touch.js
function calcDistance(touches) {
  if (touches.length) {
    var deltaX = Math.abs(touches[0].screenX - touches[1].screenX);
    var deltaY = Math.abs(touches[0].screenY - touches[1].screenY);
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  } else {
    return 0;
  }
}

/* harmony default export */ var events_touch = ({
  methods: {
    _onMixinTouch: function _onMixinTouch(evt) {
      evt.preventDefault();

      if (evt.touches.length > 1) {
        switch (evt.type) {
          case 'touchstart':
            this.eventsTouch.lastDistance = calcDistance(evt.targetTouches);
            break;

          case 'touchmove':
            if (this.eventsTouch.lastDistance >= 0) {
              var new_dist = calcDistance(evt.targetTouches);
              var targetMoment = this.interval.offset + this.exposition * (evt.targetTouches[0].screenX / this.chart.width);

              if (this.eventsTouch.lastDistance && 'onZoom' in this) {
                this.onZoom(Math.abs(new_dist / this.eventsTouch.lastDistance), targetMoment);
              }

              this.eventsTouch.lastDistance = new_dist;
            }

            break;
        }

        return;
      }

      var newEvt = document.createEvent('MouseEvents');
      var type = null;
      var touch = null;

      switch (evt.type) {
        case 'touchstart':
          type = 'mousedown';
          touch = evt.changedTouches[0];
          break;

        case 'touchmove':
          type = 'mousemove';
          touch = evt.changedTouches[0];
          break;

        case 'touchend':
          type = 'mouseup';
          touch = evt.changedTouches[0];
          this.eventsTouch.lastDistance = null;
          break;
      }

      newEvt.initMouseEvent(type, true, true, document.defaultView, 0, touch.screenX, touch.screenY, touch.clientX, touch.clientY, evt.ctrlKey, evt.altKey, evt.shiftKey, evt.metaKey, 0, null);
      evt.target.dispatchEvent(newEvt);
    }
  },
  data: function data() {
    return {
      eventsTouch: {
        lastDistance: null
      }
    };
  }
});
// CONCATENATED MODULE: ./src/mixins/events-wheel.js
var WHEEL_ZOOM_STEP = 0.1;
/* harmony default export */ var events_wheel = ({
  mounted: function mounted() {
    this.$el.addEventListener('wheel', this._onWhell);
  },
  methods: {
    _onWhell: function _onWhell(event) {
      var e = window.event || event;

      if (e.path && e.path.indexOf(this.$el) < 0) {
        return;
      }

      var targetMoment = this.interval.offset + this.exposition * (event.layerX / this.chart.width);

      switch (Math.max(-1, Math.min(1, e.deltaY || -e.detail))) {
        case 1:
          this.onZoom(1 - WHEEL_ZOOM_STEP, targetMoment);
          break;

        case -1:
          this.onZoom(1 + WHEEL_ZOOM_STEP, targetMoment);
          break;
      }

      e.preventDefault();
    }
  },
  destroyed: function destroyed() {
    this.$el.removeEventListener('wheel', this._onWhell);
  }
});
// CONCATENATED MODULE: ./src/mixins/filters.js
/* harmony default export */ var filters = ({
  filters: {
    day: function day(timestamp) {
      return (timestamp - timestamp % 86400) / 86400 + 1;
    },
    time: function time(timestamp, partTime) {
      var date = new Date(timestamp * 1e3);
      var year = date.getFullYear();
      var month = ('0' + (date.getMonth() + 1)).slice(-2);
      var day = ('0' + date.getDate()).slice(-2);
      var hours = ('0' + date.getHours()).slice(-2);
      var mins = ('0' + date.getMinutes()).slice(-2);
      var sec = ('0' + date.getSeconds()).slice(-2);

      if (partTime < 86400) {
        return "".concat(hours, ":").concat(mins, ":").concat(sec);
      } else if (partTime <= 2592000) {
        return "".concat(day, ".").concat(month, ".").concat(year);
      } else {
        return "".concat(month, ".").concat(year);
      }
    },
    price: function price(value) {
      var fraction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 4;
      return value ? value.toFixed(fraction) : 0;
    },
    moment: function moment(timestamp) {
      var date = new Date(timestamp * 1e3);
      var year = date.getUTCFullYear();
      var month = ('0' + (date.getMonth() + 1)).slice(-2);
      var day = ('0' + date.getDate()).slice(-2);
      var hours = ('0' + date.getHours()).slice(-2);
      var mins = ('0' + date.getMinutes()).slice(-2);
      return "".concat(day, ".").concat(month, ".").concat(year, " ").concat(hours, ":").concat(mins);
    }
  }
});
// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.number.constructor.js
var es6_number_constructor = __webpack_require__("c5f6");

// CONCATENATED MODULE: ./src/mixins/props.js

/* harmony default export */ var props = ({
  props: {
    initialSize: {
      type: Object,
      required: false
    },
    settings: {
      type: Object,
      required: false,
      default: function _default() {}
    },
    data: {
      type: [Array, ArrayBuffer],
      required: true
    },
    requestedParams: {
      type: Object,
      required: true,
      default: {}
    },
    intervalWidth: {
      type: Number,
      required: false,
      default: new Date().getTime() / 1e3
    },
    initExposition: {
      type: Number,
      required: false,
      default: 86400
    },
    intervalStartOffset: {
      type: Number,
      required: false,
      default: null
    },
    availableCandleWidths: {
      type: Array,
      required: false,
      default: function _default() {
        return [900, 1800, 3600, 14400, 28800, 43200, 86400, 604800, 2592000, 31536000];
      }
    },
    availableIntervals: {
      type: Array,
      required: false,
      default: function _default() {
        return [900, 1800, 3600, 14400, 28800, 43200, 86400, 604800, 2592000, 31536000];
      }
    },
    reloadCounter: {
      type: Number,
      required: false,
      default: 0
    },
    minCandleWidth: {
      type: Number,
      required: false,
      default: 3
    }
  },
  watch: {
    intervalWidth: function intervalWidth(value) {
      this.interval.width = value;
    },
    initExposition: function initExposition(value) {
      this.zoom.value = this.interval.width / value;
    },
    intervalStartOffset: function intervalStartOffset(value) {
      this.interval.offset = value;
    },
    availableCandleWidths: function availableCandleWidths(value) {
      this.candleWidths = value;
      this.zoom.value = this.rebaseZoom(this.zoom.value);

      if ('onRedraw' in this) {
        this.onRedraw();
      }
    },
    availableIntervals: function availableIntervals(value) {
      this.zoom.time_parts = value;
      this.zoom.value = this.rebaseZoom(this.zoom.value);

      if ('onRedraw' in this) {
        this.onRedraw();
      }
    },
    data: function data(value) {
      this.chartData = value;
      return {};
    }
  }
});
// EXTERNAL MODULE: ./node_modules/core-js/modules/web.dom.iterable.js
var web_dom_iterable = __webpack_require__("ac6a");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.object.keys.js
var es6_object_keys = __webpack_require__("456d");

// EXTERNAL MODULE: ./node_modules/worker-loader/dist/cjs.js?inline=true!./src/workers/BinaryDataWorker.js
var BinaryDataWorker = __webpack_require__("9c33");
var BinaryDataWorker_default = /*#__PURE__*/__webpack_require__.n(BinaryDataWorker);

// CONCATENATED MODULE: ./src/mixins/BinaryWorker.js






/* harmony default export */ var BinaryWorker = ({
  data: function data() {
    return {
      workers: {}
    };
  },
  watch: {
    requestedParams: {
      handler: function handler() {
        var availableParams = this.findRequestedParam(this.requestedParams, this.workers.binaryWorker.requestedParams);

        if (availableParams.length) {
          var task = 'SET_PARAMS';
          var params = {};

          for (var i = 0, len = availableParams.length; i < len; i++) {
            params[availableParams[i]] = this.requestedParams[availableParams[i]];
          }

          this.workers.binaryWorker.postMessage({
            task: task,
            params: params
          });
        }
      },
      deep: true
    },
    data: function data() {
      this.workers.binaryWorker.postMessage({
        task: 'APPEND',
        data: this.data
      });
    },
    reloadCounter: function reloadCounter() {
      this.workers.binaryWorker.postMessage({
        task: 'RELOAD'
      });
    },
    isLoading: function isLoading(value) {
      console.log(value);
    }
  },
  mounted: function mounted() {
    var binaryWorker = new BinaryDataWorker_default.a();
    binaryWorker.onmessage = this.onBinaryWorkerMessage;
    binaryWorker.redraw = this.render;
    this.workers.binaryWorker = binaryWorker;
    this.workers.binaryWorker.requestedParams = [];
  },
  methods: {
    onBinaryWorkerMessage: function onBinaryWorkerMessage(message) {
      switch (message.data.type) {
        case 'REQUEST_PARAMS':
          {
            this.workers.binaryWorker.requestedParams = message.data.body.outer;
            this.$emit('requestParams', message.data.body.outer);

            if (message.data.body.inner.indexOf['candleWidths'] !== -1) {
              this.setCandleWidthsParam(this.availableCandleWidths);
            }

            break;
          }

        case 'REQUEST_DATA':
          {
            this.isLoading = true;
            this.$emit('requestData', message.data.body);
            break;
          }

        case 'APPENDED':
          {
            this.isEmpty = false;

            for (var i = 0, len = message.data.body.type.length; i < len; i++) {
              switch (message.data.body.type[i]) {
                case 'candleData':
                  {
                    this.renderCandles();
                    break;
                  }

                case 'averageData':
                  {
                    this.renderAverage();
                    break;
                  }

                default:
                  break;
              }
            }

            break;
          }

        case 'RENDERED':
          {
            switch (message.data.body.type) {
              case 'average':
                {
                  this.average = message.data.body.data;

                  if (this.average.minTimestamp) {
                    this.interval.firstPoint = this.average.minTimestamp;
                  }

                  break;
                }

              case 'candles':
                {
                  var candles = {};

                  for (var field in message.data.body.data) {
                    if (field !== 'candles') {
                      candles[field] = message.data.body.data[field];
                    }
                  }

                  this.candles = candles;
                  this.candles['candles'] = message.data.body.data.candles;
                  this.isLoading = false;
                  break;
                }

              default:
                break;
            }

            break;
          }

        case 'EMPTY':
          {
            this.isLoading = false;
            this.isEmpty = true;
            break;
          }

        default:
          break;
      }
    },
    render: function render() {
      this.renderCandles();
      this.renderAverage();
    },
    renderCandles: function renderCandles() {
      if (this.chart.width && this.chart.height) {
        this.setCandleWidthsParam(this.availableCandleWidths);
        this.workers.binaryWorker.postMessage({
          task: 'RENDER',
          params: {
            type: 'candles',
            offset: this.interval.offset,
            exposition: this.exposition,
            viewWidth: this.chart.width,
            viewHeight: this.chart.height
          }
        });
      }
    },
    renderAverage: function renderAverage() {
      this.workers.binaryWorker.postMessage({
        task: 'RENDER',
        params: {
          type: 'average',
          viewWidth: this.width,
          viewHeight: this.sizes.navigator.height
        }
      });
    },
    findRequestedParam: function findRequestedParam(newParams, requestedParam) {
      var availableParams = [];
      Object.keys(newParams).map(function (param) {
        if (requestedParam.indexOf(param) !== -1) {
          availableParams.push(param);
        }
      });
      return availableParams;
    },
    setCandleWidthsParam: function setCandleWidthsParam(candleWidths) {
      if (candleWidths.length) {
        this.workers.binaryWorker.postMessage({
          task: 'SET_PARAMS',
          params: {
            candleWidths: candleWidths
          }
        });
      }
    }
  }
});
// CONCATENATED MODULE: ./src/mixins/options.js
/* harmony default export */ var options = ({
  data: function data() {
    return {
      offsets: {
        chartTop: 20,
        chartBottom: 20,
        navigatorOffset: 10
      },
      sizes: {
        navigator: {
          widthScale: 1,
          height: 50
        }
      }
    };
  }
});
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"0595ba96-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/Axis/AxisX.vue?vue&type=template&id=1458e30f&scoped=true&
var AxisXvue_type_template_id_1458e30f_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('g',[_vm._l((_vm.axisX),function(time){return _c('g',{key:time.time,attrs:{"transform":("translate(" + (time.x) + ")")}},[_c('line',{staticClass:"axis-x",attrs:{"y1":_vm.axisOffset,"y2":_vm.axisOffset + _vm.lineOffset,"x1":_vm.xOffset,"x2":_vm.xOffset,"opacity":"0.3"}}),_c('text',{staticStyle:{"text-anchor":"middle","font-family":"'Roboto', monospace"},attrs:{"y":_vm.axisOffset + _vm.dateOffset,"font-size":"10"}},[_vm._v("\n      "+_vm._s(_vm._f("time")(time.time,_vm.timePart))+"\n    ")])])}),_c('line',{attrs:{"x1":0,"x2":_vm.chartWidth,"y1":_vm.axisOffset,"y2":_vm.axisOffset,"stroke":"black","opacity":"0.3"}})],2)}
var AxisXvue_type_template_id_1458e30f_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/Axis/AxisX.vue?vue&type=template&id=1458e30f&scoped=true&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/vue-loader/lib??vue-loader-options!./src/components/Axis/AxisX.vue?vue&type=script&lang=js&

//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ var AxisXvue_type_script_lang_js_ = ({
  name: 'chart-axis-x',
  mixins: [filters],
  props: {
    timeParts: {
      type: Array,
      required: true
    },
    exposition: {
      type: Number,
      required: true
    },
    offset: {
      type: Number,
      required: true
    },
    chartOffset: {
      type: Number,
      required: true
    },
    dpi: {
      type: Number,
      required: true
    },
    chartHeight: {
      type: Number,
      required: true
    },
    chartWidth: {
      type: Number,
      required: true
    },
    candleWidth: {
      type: Number,
      required: true
    }
  },
  data: function data() {
    return {
      timePart: 0,
      lineOffset: 5,
      dateOffset: 15,
      datePickerWidth: 80
    };
  },
  computed: {
    axisOffset: function axisOffset() {
      return this.chartHeight + this.chartOffset;
    },
    availableParts: function availableParts() {
      return Math.ceil(this.chartWidth / (this.datePickerWidth * 2));
    },
    axisX: function axisX() {
      var _this = this;

      var timePart = null;
      var partsNumber = null;
      var result = [];
      this.timeParts.map(function (candidate) {
        var candidatePartsNumber = _this.exposition / (candidate * 2);

        if ((partsNumber == null || candidatePartsNumber > partsNumber) && candidatePartsNumber <= _this.timeParts.length) {
          timePart = candidate;
          partsNumber = candidatePartsNumber;
        }
      });

      if (!timePart) {
        timePart = this.timeParts[this.timeParts.length - 1] || 1;
      }

      var numOfPoints = this.exposition / timePart;

      if (numOfPoints > this.availableParts) {
        timePart = Math.ceil(this.exposition / this.availableParts / timePart) * timePart;
      }

      for (var moment = this.offset - this.offset % timePart; moment < this.offset + this.exposition; moment += timePart) {
        if (moment <= this.offset) {
          continue;
        }

        result.push({
          x: (moment - this.offset) * this.dpi,
          time: moment
        });
      }

      this.timePart = timePart;
      return result;
    },
    xOffset: function xOffset() {
      return 0;
    }
  }
});
// CONCATENATED MODULE: ./src/components/Axis/AxisX.vue?vue&type=script&lang=js&
 /* harmony default export */ var Axis_AxisXvue_type_script_lang_js_ = (AxisXvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./src/components/Axis/AxisX.vue?vue&type=style&index=0&id=1458e30f&scoped=true&lang=css&
var AxisXvue_type_style_index_0_id_1458e30f_scoped_true_lang_css_ = __webpack_require__("2e40");

// CONCATENATED MODULE: ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
/* globals __VUE_SSR_CONTEXT__ */

// IMPORTANT: Do NOT use ES2015 features in this file (except for modules).
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

function normalizeComponent (
  scriptExports,
  render,
  staticRenderFns,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier, /* server only */
  shadowMode /* vue-cli only */
) {
  // Vue.extend constructor export interop
  var options = typeof scriptExports === 'function'
    ? scriptExports.options
    : scriptExports

  // render functions
  if (render) {
    options.render = render
    options.staticRenderFns = staticRenderFns
    options._compiled = true
  }

  // functional template
  if (functionalTemplate) {
    options.functional = true
  }

  // scopedId
  if (scopeId) {
    options._scopeId = 'data-v-' + scopeId
  }

  var hook
  if (moduleIdentifier) { // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = shadowMode
      ? function () { injectStyles.call(this, this.$root.$options.shadowRoot) }
      : injectStyles
  }

  if (hook) {
    if (options.functional) {
      // for template-only hot-reload because in that case the render fn doesn't
      // go through the normalizer
      options._injectStyles = hook
      // register for functioal component in vue file
      var originalRender = options.render
      options.render = function renderWithStyleInjection (h, context) {
        hook.call(context)
        return originalRender(h, context)
      }
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate
      options.beforeCreate = existing
        ? [].concat(existing, hook)
        : [hook]
    }
  }

  return {
    exports: scriptExports,
    options: options
  }
}

// CONCATENATED MODULE: ./src/components/Axis/AxisX.vue






/* normalize component */

var component = normalizeComponent(
  Axis_AxisXvue_type_script_lang_js_,
  AxisXvue_type_template_id_1458e30f_scoped_true_render,
  AxisXvue_type_template_id_1458e30f_scoped_true_staticRenderFns,
  false,
  null,
  "1458e30f",
  null
  
)

component.options.__file = "AxisX.vue"
/* harmony default export */ var AxisX = (component.exports);
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"0595ba96-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/Axis/AxisY.vue?vue&type=template&id=4e16cadb&scoped=true&
var AxisYvue_type_template_id_4e16cadb_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('g',_vm._l((_vm.axisY),function(price,index){return _c('g',{key:index,attrs:{"transform":("translate(0, " + (price.y + _vm.chartOffset) + ")")}},[_c('line',{staticClass:"axis-x",attrs:{"x1":"0","x2":_vm.chartWidth,"opacity":"0.1"}}),_c('text',{staticStyle:{"font-family":"'Roboto', monospace"},attrs:{"x":_vm.chartWidth,"y":"-4","font-size":"10","text-anchor":"end"}},[_vm._v(" "+_vm._s(_vm._f("price")(price.price,_vm.fractionLimit))+" ")])])}))}
var AxisYvue_type_template_id_4e16cadb_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/Axis/AxisY.vue?vue&type=template&id=4e16cadb&scoped=true&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/vue-loader/lib??vue-loader-options!./src/components/Axis/AxisY.vue?vue&type=script&lang=js&




//
//
//
//
//
//
//
//
//

/* harmony default export */ var AxisYvue_type_script_lang_js_ = ({
  name: 'chart-axis-y',
  mixins: [filters],
  props: {
    candles: {
      required: true
    },
    chartHeight: {
      type: Number,
      required: true
    },
    chartWidth: {
      type: Number,
      required: true
    },
    chartOffset: {
      type: Number,
      required: true
    },
    fractionLimit: {
      type: Number,
      required: false,
      default: 4
    }
  },
  computed: {
    axisY: function axisY() {
      if (!this.candles) {
        return [];
      }

      var height = this.chartHeight;
      var stepY = height / 8;
      var stepPrice = (this.candles.high - this.candles.low) / 8;
      var result = [];

      for (var f = 0, y = height, price = this.candles.low; f < 9; y -= stepY, price += stepPrice, f++) {
        result.push({
          y: y,
          price: price
        });
      }

      return result;
    }
  }
});
// CONCATENATED MODULE: ./src/components/Axis/AxisY.vue?vue&type=script&lang=js&
 /* harmony default export */ var Axis_AxisYvue_type_script_lang_js_ = (AxisYvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./src/components/Axis/AxisY.vue?vue&type=style&index=0&id=4e16cadb&scoped=true&lang=css&
var AxisYvue_type_style_index_0_id_4e16cadb_scoped_true_lang_css_ = __webpack_require__("c58e");

// CONCATENATED MODULE: ./src/components/Axis/AxisY.vue






/* normalize component */

var AxisY_component = normalizeComponent(
  Axis_AxisYvue_type_script_lang_js_,
  AxisYvue_type_template_id_4e16cadb_scoped_true_render,
  AxisYvue_type_template_id_4e16cadb_scoped_true_staticRenderFns,
  false,
  null,
  "4e16cadb",
  null
  
)

AxisY_component.options.__file = "AxisY.vue"
/* harmony default export */ var AxisY = (AxisY_component.exports);
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"0595ba96-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/Intercative/Crosshair.vue?vue&type=template&id=08913442&scoped=true&
var Crosshairvue_type_template_id_08913442_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return (_vm.interactive.hoverCandle)?_c('g',{attrs:{"transform":("translate(0, " + _vm.chartOffset + ")")}},[_c('path',{staticClass:"cross",attrs:{"d":_vm.crossPath}}),_c('g',{staticClass:"price-label",attrs:{"transform":("translate(" + _vm.chartWidth + ", " + _vm.realY + ")")}},[_c('path',{attrs:{"d":"M-70 -10 L0 -10 L0 0 L0 10 L-70 10"}}),_c('text',{staticStyle:{"font-family":"'Roboto', monospace"},attrs:{"x":"-6","y":4,"font-size":10}},[_vm._v(_vm._s(_vm._f("price")(_vm.currentPrice,_vm.fractionLimit)))])]),_c('g',{staticClass:"moment-label",attrs:{"transform":("translate(" + (_vm.interactive.cursorX) + ", " + _vm.chartHeight + ")")}},[_c('path',{attrs:{"d":"M-50 0 L50 0 L50 24 L-50 24"}}),_c('text',{staticStyle:{"font-family":"'Roboto', monospace"},attrs:{"y":15,"font-size":10}},[_vm._v(_vm._s(_vm._f("moment")(_vm.interactive.hoverCandle.timestamp))+"\n    ")])])]):_vm._e()}
var Crosshairvue_type_template_id_08913442_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/Intercative/Crosshair.vue?vue&type=template&id=08913442&scoped=true&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/vue-loader/lib??vue-loader-options!./src/components/Intercative/Crosshair.vue?vue&type=script&lang=js&

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ var Crosshairvue_type_script_lang_js_ = ({
  name: 'chart-interactive-crosshair',
  mixins: [filters],
  props: {
    chartHeight: {
      type: Number,
      required: true
    },
    chartWidth: {
      type: Number,
      required: true
    },
    chartOffset: {
      type: Number,
      required: true
    },
    candles: {
      required: true
    },
    interactive: {
      required: true
    },
    fractionLimit: {
      type: Number,
      required: false,
      default: 4
    }
  },
  computed: {
    realY: function realY() {
      return this.interactive.cursorY + this.chartOffset;
    },
    crossPath: function crossPath() {
      if (!this.interactive.hoverCandle) {
        return '';
      }

      var x = this.interactive.hoverCandle.x;
      return "M".concat(x, " 0 L").concat(x, " ").concat(this.chartHeight, " M0 ").concat(this.realY, " L").concat(this.chartWidth, " ").concat(this.realY, " ");
    },
    currentPrice: function currentPrice() {
      return this.candles.low + (this.candles.high - this.candles.low) * (this.chartHeight - this.realY) / this.chartHeight;
    }
  }
});
// CONCATENATED MODULE: ./src/components/Intercative/Crosshair.vue?vue&type=script&lang=js&
 /* harmony default export */ var Intercative_Crosshairvue_type_script_lang_js_ = (Crosshairvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./src/components/Intercative/Crosshair.vue?vue&type=style&index=0&id=08913442&scoped=true&lang=css&
var Crosshairvue_type_style_index_0_id_08913442_scoped_true_lang_css_ = __webpack_require__("bc25");

// CONCATENATED MODULE: ./src/components/Intercative/Crosshair.vue






/* normalize component */

var Crosshair_component = normalizeComponent(
  Intercative_Crosshairvue_type_script_lang_js_,
  Crosshairvue_type_template_id_08913442_scoped_true_render,
  Crosshairvue_type_template_id_08913442_scoped_true_staticRenderFns,
  false,
  null,
  "08913442",
  null
  
)

Crosshair_component.options.__file = "Crosshair.vue"
/* harmony default export */ var Crosshair = (Crosshair_component.exports);
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"0595ba96-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/Navigator/Navigator.vue?vue&type=template&id=617e8cf5&scoped=true&
var Navigatorvue_type_template_id_617e8cf5_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('svg',{style:([_vm.grabStyle]),attrs:{"viewBox":[0, 0, _vm.width ? _vm.width : 0, _vm.height ? _vm.height : 0],"width":_vm.width ? _vm.width : 0,"height":_vm.height ? _vm.height : 0},on:{"mousedown":function($event){$event.preventDefault();return _vm._onMixinMouse($event)},"mousemove":function($event){$event.preventDefault();return _vm._onMixinMouse($event)},"mouseup":function($event){$event.preventDefault();return _vm._onMixinMouse($event)},"mouseleave":function($event){$event.preventDefault();return _vm._onMixinMouse($event)},"touchstart":function($event){$event.preventDefault();return _vm._onMixinTouch($event)},"touchmove":function($event){$event.preventDefault();return _vm._onMixinTouch($event)},"touchend":function($event){$event.preventDefault();return _vm._onMixinTouch($event)},"touchcancel":function($event){$event.preventDefault();return _vm._onMixinTouch($event)}}},[_c('line',{attrs:{"x1":"0","x2":_vm.width,"stroke":"black","opacity":"0.3"}}),_c('g',{attrs:{"transform":_vm.navigatotScale}},[_c('g',{attrs:{"transform":_vm.navigatorPathScale}},[_c('path',{attrs:{"fill":"transparent","stroke":"rgba(21,101,192,0.8)","d":_vm.navigatorPath}})]),(this.average && this.average.minTimestamp > 0)?_c('g',[_c('path',{class:{'please-stop-handle': _vm.expositionLimitLeft},attrs:{"fill":"rgba(21,101,192,0.8)","stroke":"1","d":_vm.left}}),_c('path',{class:{'please-stop-center': _vm.expositionLimit},attrs:{"fill":"rgba(21,101,192,0.1)","stroke":"1","d":_vm.center}}),_c('path',{class:{'please-stop-handle': _vm.expositionLimitRight},attrs:{"fill":"rgba(21,101,192,0.8)","stroke":"1","d":_vm.right}})]):_vm._e()]),_c('line',{attrs:{"x1":"0","x2":_vm.width,"y1":_vm.height,"y2":_vm.height,"stroke":"black","opacity":"0.3"}})])}
var Navigatorvue_type_template_id_617e8cf5_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/Navigator/Navigator.vue?vue&type=template&id=617e8cf5&scoped=true&

// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.string.fixed.js
var es6_string_fixed = __webpack_require__("d263");

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/vue-loader/lib??vue-loader-options!./src/components/Navigator/Navigator.vue?vue&type=script&lang=js&


//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


/* harmony default export */ var Navigatorvue_type_script_lang_js_ = ({
  name: 'chart-navigator',
  mixins: [events_mouse, events_touch],
  props: {
    height: {
      type: Number,
      required: false,
      default: 50
    },
    average: {
      required: true,
      default: {
        average: [],
        minTimestamp: 0
      }
    },
    offset: {
      type: Number,
      required: true
    },
    exposition: {
      type: Number,
      required: true
    },
    minZoom: {
      type: Number,
      required: false
    },
    maxZoom: {
      type: Number,
      required: false
    },
    width: {
      type: Number,
      required: false
    },
    wholeInterval: {
      type: Number,
      required: true
    }
  },
  data: function data() {
    return {
      yIndent: 3,
      handleWidth: 8,
      lastHandle: null,
      HANDLES: {
        LEFT: 0,
        CENTER: 1,
        RIGHT: 2
      },
      fixed: {
        left: 10,
        right: 10
      },
      startCenterDiff: 0,
      startLeftDiff: 0,
      startRightDiff: 0,
      startExposition: 0,
      leftStart: 0,
      rightEnd: 0,
      expositionLimit: false,
      expositionLimitLeft: false,
      expositionLimitRight: false,
      grabStyle: {
        cursor: 'default'
      }
    };
  },
  computed: {
    workAreaCoef: function workAreaCoef() {
      return (this.width - 2 * this.handleWidth) / this.width;
    },
    navigatotScale: function navigatotScale() {
      if (this.width) {
        return "translate(".concat(this.handleWidth, ") scale(").concat(this.workAreaCoef, ")");
      } else {
        return "translate(".concat(this.handleWidth, ")");
      }
    },
    navigatorPathScale: function navigatorPathScale() {
      return "translate(0, ".concat(this.yIndent, ") scale(1, ").concat((this.height - 2 * this.yIndent) / this.height, ")");
    },
    navigatorPath: function navigatorPath() {
      return this.average.path && this.average.path.join(' ') || '';
    },
    xMultiplier: function xMultiplier() {
      if (this.width && this.average.minTimestamp) {
        return this.width / (this.wholeInterval - this.average.minTimestamp);
      } else {
        return 1;
      }
    },
    leftX: function leftX() {
      if (!this.eventsMouse.scrolling.isScrolling) {
        this.fixed.left = (this.offset - this.average.minTimestamp || 0) * this.xMultiplier;
      }

      return this.fixed.left;
    },
    rightX: function rightX() {
      if (!this.eventsMouse.scrolling.isScrolling) {
        this.fixed.right = (this.offset + this.exposition - this.average.minTimestamp || 0) * this.xMultiplier;
      }

      return this.fixed.right;
    },
    left: function left() {
      return "M".concat(this.leftX, " 0 L").concat(this.leftX - this.handleWidth, " 0\n              L").concat(this.leftX - this.handleWidth, " ").concat(this.height, " L").concat(this.leftX, " ").concat(this.height);
    },
    center: function center() {
      return "M".concat(this.leftX, " 0 L").concat(this.rightX, " 0 L").concat(this.rightX, " ").concat(this.height, " L").concat(this.leftX, " ").concat(this.height);
    },
    right: function right() {
      return "M".concat(this.rightX, " 0 L").concat(this.rightX + this.handleWidth, " 0\n              L").concat(this.rightX + this.handleWidth, " ").concat(this.height, " L").concat(this.rightX, " ").concat(this.height);
    },
    isLeftHandle: function isLeftHandle() {
      return this.lastHandle !== this.HANDLES.CENTER && this.lastHandle !== this.HANDLES.RIGHT && this.isLeft(this.eventsMouse.scrolling.clientXWithOffset) || this.lastHandle === this.HANDLES.LEFT;
    },
    isCenterHandle: function isCenterHandle() {
      return this.lastHandle !== this.HANDLES.LEFT && this.lastHandle !== this.HANDLES.RIGHT && this.isCenter(this.eventsMouse.scrolling.clientXWithOffset) || this.lastHandle === this.HANDLES.CENTER;
    },
    isRightHandle: function isRightHandle() {
      return this.lastHandle !== this.HANDLES.LEFT && this.lastHandle !== this.HANDLES.CENTER && this.isRight(this.eventsMouse.scrolling.clientXWithOffset) || this.lastHandle === this.HANDLES.RIGHT;
    },
    maxExposition: function maxExposition() {
      return this.wholeInterval / this.minZoom;
    },
    minExposition: function minExposition() {
      return this.wholeInterval / this.maxZoom;
    }
  },
  watch: {
    'eventsMouse.scrolling.isScrolling': function eventsMouseScrollingIsScrolling() {
      this.lastHandle = null;
      this.expositionLimit = false;
      this.expositionLimitRight = false;
      this.expositionLimitLeft = false;
      this.computeGrabStyle(this.eventsMouse.scrolling.clientXWithOffset);
    }
  },
  methods: {
    convertXForHandler: function convertXForHandler(x) {
      return x / this.workAreaCoef - this.handleWidth;
    },
    isLeft: function isLeft(x) {
      x = this.convertXForHandler(x);
      return x >= this.leftX - 1.5 * this.handleWidth && x <= this.leftX;
    },
    isCenter: function isCenter(x) {
      x = this.convertXForHandler(x);
      return x >= this.leftX && x <= this.rightX;
    },
    isRight: function isRight(x) {
      x = this.convertXForHandler(x);
      return x >= this.rightX && x <= this.rightX + 1.5 * this.handleWidth;
    },
    computeGrabStyle: function computeGrabStyle(x) {
      if (this.isCenter(x)) {
        this.grabStyle.cursor = 'grab';
      } else if (this.isRight(x) || this.isLeft(x)) {
        this.grabStyle.cursor = 'ew-resize';
      } else {
        this.grabStyle.cursor = 'default';
      }
    },
    onHover: function onHover(event) {
      this.computeGrabStyle(event.x);
    },
    onSwipe: function onSwipe(event) {
      if (event.x && this.isLeftHandle) {
        var x = this.convertXForHandler(event.x);
        this.grabStyle.cursor = 'ew-resize';

        if (this.lastHandle === null) {
          this.rightEnd = this.offset + this.exposition;
          this.startLeftDiff = this.leftX - x;
        }

        x += this.startLeftDiff;
        this.lastHandle = this.HANDLES.LEFT;
        var offset = this.convertCurrentX(x);
        var exposition = this.rightEnd - offset;

        if (this.isExpositionValid(exposition) && this.checkForLeftEdge(offset, exposition) && x < this.rightX) {
          this.expositionLimitLeft = false;
          this.fixed.left = x;
          this.$emit('handler', {
            offset: offset,
            exposition: exposition
          }, 'left');
        } else {
          this.expositionLimitLeft = true;
        }
      } else if (event.x && this.isRightHandle) {
        var _x = this.convertXForHandler(event.x);

        this.grabStyle.cursor = 'ew-resize';

        if (this.lastHandle === null) {
          this.startRightDiff = this.rightX - _x;
        }

        _x += this.startRightDiff;
        this.grabStyle.cursor = 'ew-resize';
        this.lastHandle = this.HANDLES.RIGHT;

        var _offset = this.convertCurrentX(this.leftX);

        var _exposition = this.convertCurrentX(_x) - _offset;

        if (this.isExpositionValid(_exposition) && this.checkForRightEdge(_offset) && _x > this.leftX) {
          this.expositionLimitRight = false;
          this.fixed.right = _x;
          this.$emit('handler', {
            offset: _offset,
            exposition: _exposition
          }, 'right');
        } else {
          this.expositionLimitRight = true;
        }
      } else if (event.x && this.isCenterHandle) {
        this.grabStyle.cursor = 'grabbing';

        if (this.lastHandle === null) {
          this.startCenterDiff = this.leftX - event.x;
          this.startExposition = this.convertTimestampToX(this.exposition);
        }

        this.lastHandle = this.HANDLES.CENTER;

        var _offset2 = this.convertCurrentX(event.x, this.startCenterDiff);

        if (this.checkForRightEdge(_offset2, this.convertXToTimestamp(this.startExposition)) && this.checkForLeftEdge(_offset2)) {
          this.fixed.left = event.x + this.startCenterDiff;
          this.fixed.right = this.fixed.left + this.startExposition;
        } else if (!this.checkForRightEdge(_offset2, this.convertXToTimestamp(this.startExposition))) {
          this.fixed.right = this.width;
          this.fixed.left = this.fixed.right - this.startExposition;
          var dif = this.width - (event.x + this.startCenterDiff);
          _offset2 = _offset2 + this.convertXToTimestamp(dif);
        } else if (!this.checkForLeftEdge(_offset2)) {
          this.fixed.left = 0;
          this.fixed.right = this.startExposition;
          _offset2 = this.average.minTimestamp;
        }

        this.$emit('handler', {
          offset: _offset2
        }, 'center');
      } else {
        this.grabStyle.cursor = 'default';
        this.lastHandle = null;
      }
    },
    convertCurrentX: function convertCurrentX(x) {
      var additional = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      return this.average.minTimestamp + this.convertXToTimestamp(x + additional);
    },
    convertXToTimestamp: function convertXToTimestamp(x) {
      return x / this.xMultiplier;
    },
    convertTimestampToX: function convertTimestampToX(timestamp) {
      return timestamp * this.xMultiplier;
    },
    checkForRightEdge: function checkForRightEdge(offset) {
      var exposition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.exposition;
      return offset + exposition <= this.wholeInterval;
    },
    checkForLeftEdge: function checkForLeftEdge(offset) {
      return offset > this.average.minTimestamp - this.handleWidth;
    },
    isExpositionValid: function isExpositionValid(exposition) {
      this.expositionLimitLeft = false;
      this.expositionLimitRight = false;
      this.expositionLimit = !(exposition < this.maxExposition && exposition > this.minExposition);
      return !this.expositionLimit;
    }
  }
});
// CONCATENATED MODULE: ./src/components/Navigator/Navigator.vue?vue&type=script&lang=js&
 /* harmony default export */ var Navigator_Navigatorvue_type_script_lang_js_ = (Navigatorvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./src/components/Navigator/Navigator.vue?vue&type=style&index=0&id=617e8cf5&scoped=true&lang=css&
var Navigatorvue_type_style_index_0_id_617e8cf5_scoped_true_lang_css_ = __webpack_require__("f726");

// CONCATENATED MODULE: ./src/components/Navigator/Navigator.vue






/* normalize component */

var Navigator_component = normalizeComponent(
  Navigator_Navigatorvue_type_script_lang_js_,
  Navigatorvue_type_template_id_617e8cf5_scoped_true_render,
  Navigatorvue_type_template_id_617e8cf5_scoped_true_staticRenderFns,
  false,
  null,
  "617e8cf5",
  null
  
)

Navigator_component.options.__file = "Navigator.vue"
/* harmony default export */ var Navigator = (Navigator_component.exports);
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/vue-loader/lib??vue-loader-options!./src/App.vue?vue&type=script&lang=js&




//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//






 // import MixinWorkers from './mixins/workers';







/* harmony default export */ var Appvue_type_script_lang_js_ = ({
  name: 'crypto-chart',
  mixins: [screen, props, events_mouse, events_touch, events_wheel, filters, BinaryWorker, options],
  components: {
    AxisX: AxisX,
    AxisY: AxisY,
    Crosshair: Crosshair,
    Navigator: Navigator
  },
  data: function data() {
    return {
      chartData: this.data,
      candles: null,
      isEmpty: false,
      isLoading: false,
      average: [],
      interactive: {
        cursor: 'default',
        hoverCandle: null,
        cursorX: 0,
        cursorY: 0,
        fraction: {
          limit: 4,
          nominal: 4
        }
      },
      interactiveTool: {
        fontSize: 10
      }
    };
  },
  computed: {
    positiveCandlesPath: function positiveCandlesPath() {
      var result = this.candles.candlesPositivePath;

      if (this.interactive.hoverCandle && this.interactive.hoverCandle.class === 'positive') {
        result = lodash_clonedeep_default()(result);
        result.splice(this.interactive.hoverCandle.candlePathIndex, 1);
      }

      return result.join(' ');
    },
    negativeCandlesPath: function negativeCandlesPath() {
      var result = this.candles.candlesNegativePath;

      if (this.interactive.hoverCandle && this.interactive.hoverCandle.class === 'negative') {
        result = lodash_clonedeep_default()(result);
        result.splice(this.interactive.hoverCandle.candlePathIndex, 1);
      }

      return result.join(' ');
    },
    volumeCandlesPath: function volumeCandlesPath() {
      var result = this.candles.volumePath;

      if (this.interactive.hoverCandle) {
        result = result.slice();
        result.splice(this.interactive.hoverCandle.volumePathIndex, 1);
      }

      return result.join(' ');
    },
    fontSizeAxisY: function fontSizeAxisY() {
      return this.fontHeight < this.chart.offset.left / 6 ? this.chart.offset.left / 6 : this.fontHeight;
    },
    fontSizeAxisX: function fontSizeAxisX() {
      return this.fontHeight > this.clientWidth / 16 ? this.clientWidth / 16 : this.fontHeight;
    }
  },
  watch: {
    settings: {
      handler: function handler() {
        if (this.settings.interactiveTool && this.settings.interactiveTool.fraction) {
          Object.assign(this.interactive.fraction, this.settings.interactiveTool.fraction);
        }

        if (this.settings.interactiveTool && this.settings.interactiveTool.fontSize) {
          this.interactiveTool.fontSize = this.settings.interactiveTool.fontSize;
        }
      },
      deep: true
    },
    'eventsMouse.scrolling.isScrolling': function eventsMouseScrollingIsScrolling(value) {
      this.interactive.cursor = value ? 'grabbing' : 'default';
    }
  },
  created: function created() {
    if (this.settings.interactiveTool && this.settings.interactiveTool.fraction) {
      Object.assign(this.interactive.fraction, this.settings.interactiveTool.fraction);
    }

    if (this.settings.interactiveTool && this.settings.interactiveTool.fontSize) {
      this.interactiveTool.fontSize = this.settings.interactiveTool.fontSize;
    }
  },
  methods: {
    onRedraw: function onRedraw() {
      for (var worker in this.workers) {
        this.workers[worker].redraw();
      }
    },
    onClick: function onClick(params) {
      this.interactive.cursorX = params.x;
      this.interactive.cursorY = params.y;
      this.findHoverCandle();
    },
    onHover: function onHover(params) {
      this.interactive.cursorX = params.x;
      this.interactive.cursorY = params.y;
      this.findHoverCandle();
    },
    findHoverCandle: function findHoverCandle() {
      var _this = this;

      if (this.candles) {
        this.candles.candles.map(function (candle) {
          if (_this.interactive.cursorX >= candle.x - _this.candles.width * 0.25 && _this.interactive.cursorX <= candle.x + _this.candles.width * 0.25) {
            _this.interactive.hoverCandle = candle;
          }
        });
      }
    },
    hoverColor: function hoverColor(open, close) {
      return "fill: ".concat(open > close ? 'rgba(211, 47, 47, 0.8)' : 'rgba(104, 159, 56, 0.8)');
    }
  }
});
// CONCATENATED MODULE: ./src/App.vue?vue&type=script&lang=js&
 /* harmony default export */ var src_Appvue_type_script_lang_js_ = (Appvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./src/App.vue?vue&type=style&index=0&lang=scss&
var Appvue_type_style_index_0_lang_scss_ = __webpack_require__("5c0b");

// CONCATENATED MODULE: ./src/App.vue






/* normalize component */

var App_component = normalizeComponent(
  src_Appvue_type_script_lang_js_,
  render,
  staticRenderFns,
  false,
  null,
  null,
  null
  
)

App_component.options.__file = "App.vue"
/* harmony default export */ var App = (App_component.exports);
// CONCATENATED MODULE: ./node_modules/@vue/cli-service/lib/commands/build/entry-lib.js


/* harmony default export */ var entry_lib = __webpack_exports__["default"] = (App);



/***/ }),

/***/ "fdef":
/***/ (function(module, exports) {

module.exports = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
  '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';


/***/ })

/******/ })["default"];