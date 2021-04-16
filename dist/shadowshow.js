(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ShadowData = require('./ShadowData.js');

var _ShadowData2 = _interopRequireDefault(_ShadowData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var shadowSymbol = Symbol("shadow");

var DEFAULT_OPTIONS = {
    elementAttributePrefix: '@',
    elementAttributes: {
        conditional: 'if',
        loop: 'each',
        click: 'click',
        change: 'change'
    },
    templateDef: {
        open: '{{',
        close: '}}'
    },
    debug: false
};

function getWatchers(obj, key) {
    var watcherMapper = resolveWacherMapper(obj);
    var watchers = watcherMapper[key] = watcherMapper[key] || new Set();
    return watchers;
}

function resolveWacherMapper(obj) {
    return resolveShadow(obj).watcherMapper;
}

function resolveShadow(target) {
    if (target instanceof _ShadowData2.default) {
        return target;
    }
    var shadow = target[shadowSymbol];
    if (!shadow) {
        shadow = new _ShadowData2.default();
        target[shadowSymbol] = shadow;
    }
    return shadow;
}

function resolveElement(el) {
    return typeof el === 'string' ? document.querySelector(el) : el;
}

exports.default = {
    shadowSymbol: shadowSymbol,
    getWatchers: getWatchers,
    resolveShadow: resolveShadow,
    resolveElement: resolveElement,
    DEFAULT_OPTIONS: DEFAULT_OPTIONS
};

},{"./ShadowData.js":3}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _Core = require('./Core.js');

var _Core2 = _interopRequireDefault(_Core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var deepProxyTargetSymbol = Symbol('deep.proxy.target');
var deepProxyTargetOriginalSymbol = Symbol('deep.proxy.target.original');

function create(obj, handler, preProscessor, keyFilter, parent, key) {
    key = key || '';
    var proxyHandler = {
        set: function set(target, propKey, value, receiver) {
            if (propKey !== deepProxyTargetSymbol && propKey !== deepProxyTargetOriginalSymbol) {
                Reflect.set(target, propKey, value, receiver);
            }
            return true;
        },
        get: function get(target, propKey, receiver) {
            var v = Reflect.get(target, propKey, receiver);
            if ((typeof v === 'undefined' ? 'undefined' : _typeof(v)) === 'object' && v !== null && propKey !== deepProxyTargetSymbol && propKey !== deepProxyTargetOriginalSymbol && (!keyFilter || keyFilter(propKey))) {
                return create(v, handler, preProscessor, keyFilter, target, propKey);
            }
            return v;
        }
    };

    if (preProscessor) {
        preProscessor(obj, parent, key);
    }
    var childProxy = new Proxy(obj, handler);

    if (!obj[deepProxyTargetOriginalSymbol]) {
        obj[deepProxyTargetOriginalSymbol] = obj;
    }
    var proxy = new Proxy(childProxy, proxyHandler);
    proxy[deepProxyTargetSymbol] = obj;
    return proxy;
}

exports.default = {
    create: create
};

},{"./Core.js":1}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ShadowData = function ShadowData() {
    _classCallCheck(this, ShadowData);

    this.watcherMapper = {};
};

exports.default = ShadowData;

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _RenderHelper = require('../renderer/RenderHelper.js');

var _RenderHelper2 = _interopRequireDefault(_RenderHelper);

var _DeepProxy = require('./DeepProxy.js');

var _DeepProxy2 = _interopRequireDefault(_DeepProxy);

var _Core = require('./Core.js');

var _Core2 = _interopRequireDefault(_Core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultOptions = {};

var ShadowPlay = function () {
    function ShadowPlay(data, ext, options) {
        _classCallCheck(this, ShadowPlay);

        this.app = {
            data: data,
            ext: ext
        };
        this.options = Object.assign({}, _Core2.default.DEFAULT_OPTIONS, defaultOptions, options);
        if (options.debug) {
            console.log('ShadowPlay Debug Enabled.');
        }
    }

    _createClass(ShadowPlay, [{
        key: 'isPossessed',
        value: function isPossessed(el) {
            return !!_Core2.default.resolveElement(el)[_Core2.default.shadowSymbol];
        }
    }, {
        key: 'possess',
        value: function possess(el) {
            var _this = this;

            el = _Core2.default.resolveElement(el);
            if (this.isPossessed(el)) {
                throw new Error('The element has been possessed!');
            }
            this.element = el;
            this.app.data = Object.assign({}, this.app.data);
            this.data = _DeepProxy2.default.create(this.app.data, {
                set: function set(target, propKey, value, receiver) {
                    var old = target[propKey];
                    target[propKey] = value;
                    if (old !== value) {
                        var updaters = [];
                        if ((typeof propKey === 'undefined' ? 'undefined' : _typeof(propKey)) !== 'symbol' && (typeof old === 'undefined' ? 'undefined' : _typeof(old)) === 'object') {
                            updaters = copyShadowAndCollectUpdaters(old, value);
                        } else {
                            var shadow = _Core2.default.resolveShadow(target);
                            var watchers = _Core2.default.getWatchers(shadow, propKey);
                            if (_this.options.debug) {
                                console.log((shadow.name ? shadow.name + '.' : '') + propKey.toString() + ' is changed.');
                                console.log(watchers);
                            }
                            if (watchers) {
                                if (!watchers.forEach) {
                                    console.log('forEach is not function');
                                }
                                watchers.forEach(function (f) {
                                    return updaters.push(f);
                                });
                            }
                        }

                        for (var i = 0; i < updaters.length; i++) {
                            updaters[i](_this.data);
                        }
                    }
                    return true;
                },
                get: function get(target, propKey, receiver) {
                    var v = target[propKey];
                    if (v instanceof Function && propKey !== 'valueOf' && propKey !== 'toString') {
                        return v(_this.data);
                    }
                    return v;
                }
            }, function (obj, parent, key) {
                var shadow = _Core2.default.resolveShadow(obj);
                shadow.key = key;
                shadow.name = function () {
                    if (!parent) {
                        return key;
                    }
                    var parentShadow = _Core2.default.resolveShadow(parent);
                    return (parentShadow.name ? parentShadow.name + '.' : '') + key;
                }();
            }, function (k) {
                return k !== _Core2.default.shadowSymbol;
            });

            _RenderHelper2.default.render(el, this.data, {}, { debug: this.options.debug });

            return this;
        }

        // Alias of `possess`

    }, {
        key: 'process',
        value: function process(el) {
            return possess(el);
        }
    }], [{
        key: 'create',
        value: function create(data, ext, options) {
            return new ShadowPlay(data, ext, options);
        }
    }, {
        key: 'config',
        value: function config(options) {
            Object.assign(defaultOptions, _Core2.default.DEFAULT_OPTIONS, options);
        }
    }, {
        key: 'resetConfig',
        value: function resetConfig() {
            defaultOptions = Object.assign({}, _Core2.default.DEFAULT_OPTIONS);
        }
    }]);

    return ShadowPlay;
}();

function copyShadowAndCollectUpdaters(old, value, updaters) {
    updaters = updaters || [];
    var shadow = old[_Core2.default.shadowSymbol];
    var watcherAttr = shadow.watchers = shadow.watchers || {};
    for (var k in watcherAttr) {
        watcherAttr[k].forEach(function (f) {
            return updaters.push(f);
        });
    }
    value[_Core2.default.shadowSymbol] = old[_Core2.default.shadowSymbol];
    for (var _k in old) {
        if ((typeof _k === 'undefined' ? 'undefined' : _typeof(_k)) !== 'symbol' && _typeof(old[_k]) === 'object') {
            updaters.push.apply(updaters, copyShadowAndCollectUpdaters(old[_k], value[_k]));
        }
    }
    return updaters;
}

exports.default = ShadowPlay;

},{"../renderer/RenderHelper.js":5,"./Core.js":1,"./DeepProxy.js":2}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _TextRenderer = require('./TextRenderer.js');

var _TextRenderer2 = _interopRequireDefault(_TextRenderer);

var _DeepProxy = require('../core/DeepProxy.js');

var _DeepProxy2 = _interopRequireDefault(_DeepProxy);

var _Core = require('../core/Core.js');

var _Core2 = _interopRequireDefault(_Core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RenderHelper = function () {
    function RenderHelper() {
        _classCallCheck(this, RenderHelper);
    }

    _createClass(RenderHelper, null, [{
        key: 'render',
        value: function render(node, data, context, options) {
            var _this = this;

            if (node.nodeName === '#comment' || node.nodeName === '#text' && node.data === '') {
                return;
            }
            context = context || {};
            options = options || {};

            node[_Core2.default.shadowSymbol] = node[_Core2.default.shadowSymbol] || {};
            var updater = node[_Core2.default.shadowSymbol].updater = node[_Core2.default.shadowSymbol].updater || function () {
                var func = function func(data) {
                    var nodeShadow = node[_Core2.default.shadowSymbol];
                    var proxy = _DeepProxy2.default.create(data, {
                        get: function get(target, propKey, receiver) {
                            var v = target[propKey];
                            if ((typeof propKey === 'undefined' ? 'undefined' : _typeof(propKey)) !== 'symbol' && (typeof v === 'undefined' ? 'undefined' : _typeof(v)) !== 'object') {
                                var shadow = _Core2.default.resolveShadow(target);
                                var watchers = _Core2.default.getWatchers(shadow, propKey);
                                var newUpdater = false;
                                if (options.debug) {
                                    if (!watchers.has(updater)) {
                                        newUpdater = true;
                                        console.log('adding watcher for ' + (shadow.name ? shadow.name + '.' : '') + propKey.toString() + ':');
                                        console.log(node);
                                    }
                                }
                                watchers.add(updater);
                                if (options.debug) {
                                    if (newUpdater) {
                                        console.log(watchers);
                                    }
                                }
                            }
                            return v;
                        }
                    }, function (obj) {}, function (k) {
                        return k !== _Core2.default.shadowSymbol;
                    });

                    var renderer = nodeShadow.renderer = nodeShadow.renderer || function () {
                        if (node.nodeName === '#text') {
                            return new _TextRenderer2.default({
                                template: node.data,
                                debug: options.debug
                            }).complete(function (result) {
                                return node.data = result;
                            });
                        } else {
                            return new NodeRenderer({
                                template: node,
                                debug: options.debug
                            });
                        }
                    }();

                    return renderer.render(proxy, context);
                };
                if (options.debug) {
                    func.node = node;
                    func.desc = node.nodeName + (node.id ? '#' + node.id : '');
                }
                return func;
            }();

            if (updater(data) && node.childNodes) {
                node.childNodes.forEach(function (child) {
                    _this.render(child, data, context, options);
                });
            }
        }
    }]);

    return RenderHelper;
}();

var NodeRenderer = function () {
    function NodeRenderer(options) {
        _classCallCheck(this, NodeRenderer);

        this.options = options || {};
    }

    _createClass(NodeRenderer, [{
        key: 'render',
        value: function render(data, context) {
            var _this2 = this;

            var fn = this.fn = this.fn || function () {
                var el = _this2.options.template;

                var ifExpression = el.getAttribute('@if');
                if (ifExpression) {
                    el.removeAttribute('@if');
                    var renderer = el[_Core2.default.shadowSymbol].ifRenderer = el[_Core2.default.shadowSymbol].ifRenderer || new _TextRenderer2.default({
                        template: ifExpression
                    });
                    var _author = document.createTextNode('');
                    _author[_Core2.default.shadowSymbol] = el[_Core2.default.shadowSymbol];
                    el.parentNode.insertBefore(_author, el);
                    if (renderer.render(data, context).trim() === 'false') {
                        el.remove();
                    }
                    var f = function f(data, context) {
                        if (renderer.render(data, context).trim() === 'false') {
                            el.remove();
                            return false;
                        } else {
                            _author.parentNode.insertBefore(el, _author);
                            return true;
                        }
                    };
                    return f;
                }
                var loopExpresstion = el.getAttribute('@each') || el.getAttribute('@for');
                if (!loopExpresstion) {
                    if (el.getAttribute('@href')) {
                        new _TextRenderer2.default({
                            template: el.getAttribute('@href')
                        }).complete(function (result) {
                            el.href = result;
                            el.removeAttribute('@href');
                        }).render(data, context);
                    }
                    return function () {
                        return true;
                    };
                }
                var author = document.createTextNode('');
                author[_Core2.default.shadowSymbol] = el[_Core2.default.shadowSymbol];
                el.parentNode.insertBefore(author, el);
                el.removeAttribute('@each');
                el.removeAttribute('@for');
                el.remove();

                var foo = loopExpresstion.split(/\sin\s/);
                var itemName = foo[0];
                var listName = foo[1];

                var functionBody = 'return data =>{\n    for(let i in data.' + listName + ' ){\n        let ' + itemName + ' = data.' + listName + '[i];\n        let newEl = el.cloneNode(true);\n        author.parentNode.insertBefore(newEl, author);\n        RenderHelper.render(newEl, data, Object.assign({}, context, {' + itemName + ':' + itemName + '}), options);\n    }\n    return false;\n}';
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = el.getAttributeNames()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var name = _step.value;

                        if (/^@/.test(name)) {
                            var value = el.getAttribute(name);
                            el.removeAttribute(name);
                            el.setAttribute(name.substring(1), value);
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                return new Function('context', 'el', 'data', 'RenderHelper', 'author', 'options', functionBody)(context, el, data, RenderHelper, author, { debug: _this2.options.debug });
            }();
            return fn(data, context);
        }
    }]);

    return NodeRenderer;
}();

exports.default = RenderHelper;

},{"../core/Core.js":1,"../core/DeepProxy.js":2,"./TextRenderer.js":6}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TextNodeRenderer = function () {
    function TextNodeRenderer(options) {
        _classCallCheck(this, TextNodeRenderer);

        this.options = options || {};
    }

    _createClass(TextNodeRenderer, [{
        key: 'render',
        value: function render(data, context) {
            var str = this.options.template;
            var fn = this.fn = this.fn || function () {
                var functionBody = '    let p=[];\n    with(data){\n        with(context){\n            p.push(\'' + str.replace(/\n/g, '\\n').split(/{{/).join('\');\n\t\tp.push(').split(/}}/).join(');\n\t\tp.push(\'') + '\');\n' + '\n        }\n    }\n    return p.join(\'\');\n';
                return new Function('data', 'context', functionBody);
            }();
            try {
                var result = fn(data, context);
                if (this.options.callbacks) {
                    for (var i = 0; i < this.options.callbacks.length; i++) {
                        this.options.callbacks[i](result);
                    }
                }
                return result;
            } catch (e) {
                console.log(e);
            }
        }
    }, {
        key: 'complete',
        value: function complete(callback) {
            var callbacks = this.options.callbacks = this.options.callbacks || [];
            callbacks.push(callback);
            return this;
        }
    }]);

    return TextNodeRenderer;
}();

exports.default = TextNodeRenderer;

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ShadowPlay = require('./core/ShadowPlay.js');

var _ShadowPlay2 = _interopRequireDefault(_ShadowPlay);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Add support for AMD (Asynchronous Module Definition) libraries such as require.js.
if (typeof define === 'function' && define.amd) {
    define([], function () {
        return {
            ShadowPlay: _ShadowPlay2.default
        };
    });
}
//Add support form CommonJS libraries such as browserify.
if (typeof exports !== 'undefined') {
    exports.ShadowPlay = _ShadowPlay2.default;
}
//Define globally in case AMD is not available or unused
if (typeof window !== 'undefined') {
    window.ShadowPlay = _ShadowPlay2.default;
}

exports.default = _ShadowPlay2.default;

},{"./core/ShadowPlay.js":4}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9hc3NldHMvanMvY29yZS9Db3JlLmpzIiwiYnVpbGQvYXNzZXRzL2pzL2NvcmUvRGVlcFByb3h5LmpzIiwiYnVpbGQvYXNzZXRzL2pzL2NvcmUvU2hhZG93RGF0YS5qcyIsImJ1aWxkL2Fzc2V0cy9qcy9jb3JlL1NoYWRvd1BsYXkuanMiLCJidWlsZC9hc3NldHMvanMvcmVuZGVyZXIvUmVuZGVySGVscGVyLmpzIiwiYnVpbGQvYXNzZXRzL2pzL3JlbmRlcmVyL1RleHRSZW5kZXJlci5qcyIsImJ1aWxkL2Fzc2V0cy9qcy9zaGFkb3dzaG93LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDQUE7Ozs7OztBQUVBLElBQU0sZUFBZSxPQUFPLFFBQVAsQ0FBckI7O0FBRUEsSUFBTSxrQkFBa0I7QUFDcEIsNEJBQXdCLEdBREo7QUFFcEIsdUJBQW1CO0FBQ2YscUJBQWEsSUFERTtBQUVmLGNBQU0sTUFGUztBQUdmLGVBQU8sT0FIUTtBQUlmLGdCQUFRO0FBSk8sS0FGQztBQVFwQixpQkFBYTtBQUNULGNBQU0sSUFERztBQUVULGVBQU87QUFGRSxLQVJPO0FBWXBCLFdBQU87QUFaYSxDQUF4Qjs7QUFlQSxTQUFTLFdBQVQsQ0FBcUIsR0FBckIsRUFBMEIsR0FBMUIsRUFBK0I7QUFDM0IsUUFBSSxnQkFBZ0Isb0JBQW9CLEdBQXBCLENBQXBCO0FBQ0EsUUFBSSxXQUFXLGNBQWMsR0FBZCxJQUFxQixjQUFjLEdBQWQsS0FBc0IsSUFBSSxHQUFKLEVBQTFEO0FBQ0EsV0FBTyxRQUFQO0FBQ0g7O0FBRUQsU0FBUyxtQkFBVCxDQUE2QixHQUE3QixFQUFrQztBQUM5QixXQUFPLGNBQWMsR0FBZCxFQUFtQixhQUExQjtBQUNIOztBQUVELFNBQVMsYUFBVCxDQUF1QixNQUF2QixFQUErQjtBQUMzQixRQUFJLGtCQUFrQixvQkFBdEIsRUFBa0M7QUFDOUIsZUFBTyxN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USxFQUFVO0FBQ2YsZ0JBQUksWUFBWSxLQUFLLE9BQUwsQ0FBYSxTQUFiLEdBQXlCLEtBQUssT0FBTCxDQUFhLFNBQWIsSUFBMEIsRUFBbkU7QUFDQSxzQkFBVSxJQUFWLENBQWUsUUFBZjtBQUNBLG1CQUFPLElBQVA7QUFDSDs7Ozs7O2tCQUdVLGdCOzs7Ozs7Ozs7QUMzQ2Y7Ozs7OztBQUVBO0FBQ0EsSUFBSSxPQUFPLE1BQVAsS0FBa0IsVUFBbEIsSUFBZ0MsT0FBTyxHQUEzQyxFQUFnRDtBQUM1QyxXQUFPLEVBQVAsRUFBVyxZQUFXO0FBQ2xCLGVBQU87QUFDSCx3QkFBWTtBQURULFNBQVA7QUFHSCxLQUpEO0FBS0g7QUFDRDtBQUNBLElBQUksT0FBTyxPQUFQLEtBQW1CLFdBQXZCLEVBQW9DO0FBQ2hDLFlBQVEsVUFBUixHQUFxQixvQkFBckI7QUFDSDtBQUNEO0FBQ0EsSUFBSSxPQUFPLE1BQVAsS0FBa0IsV0FBdEIsRUFBbUM7QUFDL0IsV0FBTyxVQUFQLEdBQW9CLG9CQUFwQjtBQUNIOztrQkFFYyxvQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCBTaGFkb3dEYXRhIGZyb20gJy4vU2hhZG93RGF0YS5qcyc7XHJcblxyXG5jb25zdCBzaGFkb3dTeW1ib2wgPSBTeW1ib2woXCJzaGFkb3dcIik7XHJcblxyXG5jb25zdCBERUZBVUxUX09QVElPTlMgPSB7XHJcbiAgICBlbGVtZW50QXR0cmlidXRlUHJlZml4OiAnQCcsXHJcbiAgICBlbGVtZW50QXR0cmlidXRlczoge1xyXG4gICAgICAgIGNvbmRpdGlvbmFsOiAnaWYnLFxyXG4gICAgICAgIGxvb3A6ICdlYWNoJyxcclxuICAgICAgICBjbGljazogJ2NsaWNrJyxcclxuICAgICAgICBjaGFuZ2U6ICdjaGFuZ2UnXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVEZWY6IHtcclxuICAgICAgICBvcGVuOiAne3snLFxyXG4gICAgICAgIGNsb3NlOiAnfX0nXHJcbiAgICB9LFxyXG4gICAgZGVidWc6IGZhbHNlXHJcbn07XHJcblxyXG5mdW5jdGlvbiBnZXRXYXRjaGVycyhvYmosIGtleSkge1xyXG4gICAgbGV0IHdhdGNoZXJNYXBwZXIgPSByZXNvbHZlV2FjaGVyTWFwcGVyKG9iaik7XHJcbiAgICBsZXQgd2F0Y2hlcnMgPSB3YXRjaGVyTWFwcGVyW2tleV0gPSB3YXRjaGVyTWFwcGVyW2tleV0gfHwgbmV3IFNldCgpO1xyXG4gICAgcmV0dXJuIHdhdGNoZXJzO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZXNvbHZlV2FjaGVyTWFwcGVyKG9iaikge1xyXG4gICAgcmV0dXJuIHJlc29sdmVTaGFkb3cob2JqKS53YXRjaGVyTWFwcGVyO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZXNvbHZlU2hhZG93KHRhcmdldCkge1xyXG4gICAgaWYgKHRhcmdldCBpbnN0YW5jZW9mIFNoYWRvd0RhdGEpIHtcclxuICAgICAgICByZXR1cm4gdGFyZ2V0O1xyXG4gICAgfVxyXG4gICAgbGV0IHNoYWRvdyA9IHRhcmdldFtzaGFkb3dTeW1ib2xdO1xyXG4gICAgaWYgKCFzaGFkb3cpIHtcclxuICAgICAgICBzaGFkb3cgPSBuZXcgU2hhZG93RGF0YSgpO1xyXG4gICAgICAgIHRhcmdldFtzaGFkb3dTeW1ib2xdID0gc2hhZG93O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNoYWRvdztcclxufVxyXG5cclxuZnVuY3Rpb24gcmVzb2x2ZUVsZW1lbnQoZWwpIHtcclxuICAgIHJldHVybiB0eXBlb2YgZWwgPT09ICdzdHJpbmcnID8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbCkgOiBlbDtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gICAgc2hhZG93U3ltYm9sLFxyXG4gICAgZ2V0V2F0Y2hlcnMsXHJcbiAgICByZXNvbHZlU2hhZG93LFxyXG4gICAgcmVzb2x2ZUVsZW1lbnQsXHJcbiAgICBERUZBVUxUX09QVElPTlNcclxufSIsImltcG9ydCBDb3JlIGZyb20gJy4vQ29yZS5qcydcclxuXHJcbmNvbnN0IGRlZXBQcm94eVRhcmdldFN5bWJvbCA9IFN5bWJvbCgnZGVlcC5wcm94eS50YXJnZXQnKTtcclxuY29uc3QgZGVlcFByb3h5VGFyZ2V0T3JpZ2luYWxTeW1ib2wgPSBTeW1ib2woJ2RlZXAucHJveHkudGFyZ2V0Lm9yaWdpbmFsJyk7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGUob2JqLCBoYW5kbGVyLCBwcmVQcm9zY2Vzc29yLCBrZXlGaWx0ZXIsIHBhcmVudCwga2V5KSB7XHJcbiAgICBrZXkgPSBrZXkgfHwgJyc7XHJcbiAgICBjb25zdCBwcm94eUhhbmRsZXIgPSB7XHJcbiAgICAgICAgc2V0OiAodGFyZ2V0LCBwcm9wS2V5LCB2YWx1ZSwgcmVjZWl2ZXIpID0+IHtcclxuICAgICAgICAgICAgaWYgKHByb3BLZXkgIT09IGRlZXBQcm94eVRhcmdldFN5bWJvbCAmJiBwcm9wS2V5ICE9PSBkZWVwUHJveHlUYXJnZXRPcmlnaW5hbFN5bWJvbCkge1xyXG4gICAgICAgICAgICAgICAgUmVmbGVjdC5zZXQodGFyZ2V0LCBwcm9wS2V5LCB2YWx1ZSwgcmVjZWl2ZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0OiAodGFyZ2V0LCBwcm9wS2V5LCByZWNlaXZlcikgPT4ge1xyXG4gICAgICAgICAgICBsZXQgdiA9IFJlZmxlY3QuZ2V0KHRhcmdldCwgcHJvcEtleSwgcmVjZWl2ZXIpO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHYgPT09ICdvYmplY3QnICYmIHYgIT09IG51bGwgJiYgcHJvcEtleSAhPT0gZGVlcFByb3h5VGFyZ2V0U3ltYm9sICYmIHByb3BLZXkgIT09IGRlZXBQcm94eVRhcmdldE9yaWdpbmFsU3ltYm9sICYmICgha2V5RmlsdGVyIHx8IGtleUZpbHRlcihwcm9wS2V5KSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjcmVhdGUodiwgaGFuZGxlciwgcHJlUHJvc2Nlc3Nvciwga2V5RmlsdGVyLCB0YXJnZXQsIHByb3BLZXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB2O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgaWYgKHByZVByb3NjZXNzb3IpIHtcclxuICAgICAgICBwcmVQcm9zY2Vzc29yKG9iaiwgcGFyZW50LCBrZXkpO1xyXG4gICAgfVxyXG4gICAgbGV0IGNoaWxkUHJveHkgPSBuZXcgUHJveHkob2JqLCBoYW5kbGVyKTtcclxuICAgIFxyXG4gICAgaWYgKCFvYmpbZGVlcFByb3h5VGFyZ2V0T3JpZ2luYWxTeW1ib2xdKSB7XHJcbiAgICAgICAgb2JqW2RlZXBQcm94eVRhcmdldE9yaWdpbmFsU3ltYm9sXSA9IG9iajtcclxuICAgIH1cclxuICAgIGxldCBwcm94eSA9IG5ldyBQcm94eShjaGlsZFByb3h5LCBwcm94eUhhbmRsZXIpO1xyXG4gICAgcHJveHlbZGVlcFByb3h5VGFyZ2V0U3ltYm9sXSA9IG9iajtcclxuICAgIHJldHVybiBwcm94eTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gICAgY3JlYXRlXHJcbn07IiwiY2xhc3MgU2hhZG93RGF0YSB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLndhdGNoZXJNYXBwZXIgPSB7fTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgU2hhZG93RGF0YTsiLCJpbXBvcnQgUmVuZGVySGVscGVyIGZyb20gJy4uL3JlbmRlcmVyL1JlbmRlckhlbHBlci5qcyc7XHJcbmltcG9ydCBEZWVwUHJveHkgZnJvbSAnLi9EZWVwUHJveHkuanMnO1xyXG5pbXBvcnQgQ29yZSBmcm9tICcuL0NvcmUuanMnO1xyXG5cclxubGV0IGRlZmF1bHRPcHRpb25zID0ge307XHJcblxyXG5jbGFzcyBTaGFkb3dQbGF5IHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEsIGV4dCwgb3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMuYXBwID0ge1xyXG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICBleHQ6IGV4dFxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBDb3JlLkRFRkFVTFRfT1BUSU9OUywgZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xyXG4gICAgICAgIGlmIChvcHRpb25zLmRlYnVnKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTaGFkb3dQbGF5IERlYnVnIEVuYWJsZWQuJylcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGNyZWF0ZShkYXRhLCBleHQsIG9wdGlvbnMpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFNoYWRvd1BsYXkoZGF0YSwgZXh0LCBvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgY29uZmlnKG9wdGlvbnMpIHtcclxuICAgICAgICBPYmplY3QuYXNzaWduKGRlZmF1bHRPcHRpb25zLCBDb3JlLkRFRkFVTFRfT1BUSU9OUywgb3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHJlc2V0Q29uZmlnKCkge1xyXG4gICAgICAgIGRlZmF1bHRPcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgQ29yZS5ERUZBVUxUX09QVElPTlMpO1xyXG4gICAgfVxyXG5cclxuICAgIGlzUG9zc2Vzc2VkKGVsKSB7XHJcbiAgICAgICAgcmV0dXJuICEhQ29yZS5yZXNvbHZlRWxlbWVudChlbClbQ29yZS5zaGFkb3dTeW1ib2xdO1xyXG4gICAgfVxyXG5cclxuICAgIHBvc3Nlc3MoZWwpIHtcclxuICAgICAgICBlbCA9IENvcmUucmVzb2x2ZUVsZW1lbnQoZWwpO1xyXG4gICAgICAgIGlmICh0aGlzLmlzUG9zc2Vzc2VkKGVsKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBlbGVtZW50IGhhcyBiZWVuIHBvc3Nlc3NlZCEnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWw7XHJcbiAgICAgICAgdGhpcy5hcHAuZGF0YSA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuYXBwLmRhdGEpO1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IERlZXBQcm94eS5jcmVhdGUodGhpcy5hcHAuZGF0YSwge1xyXG4gICAgICAgICAgICBzZXQ6ICh0YXJnZXQsIHByb3BLZXksIHZhbHVlLCByZWNlaXZlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IG9sZCA9IHRhcmdldFtwcm9wS2V5XTtcclxuICAgICAgICAgICAgICAgIHRhcmdldFtwcm9wS2V5XSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKG9sZCAhPT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdXBkYXRlcnMgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHByb3BLZXkgIT09ICdzeW1ib2wnICYmIHR5cGVvZiBvbGQgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZXJzID0gY29weVNoYWRvd0FuZENvbGxlY3RVcGRhdGVycyhvbGQsIHZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc2hhZG93ID0gQ29yZS5yZXNvbHZlU2hhZG93KHRhcmdldCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB3YXRjaGVycyA9IENvcmUuZ2V0V2F0Y2hlcnMoc2hhZG93LCBwcm9wS2V5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kZWJ1Zykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coKHNoYWRvdy5uYW1lID8gc2hhZG93Lm5hbWUgKyAnLicgOiAnJykgKyBwcm9wS2V5LnRvU3RyaW5nKCkgKyAnIGlzIGNoYW5nZWQuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh3YXRjaGVycyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHdhdGNoZXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXdhdGNoZXJzLmZvckVhY2gpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZm9yRWFjaCBpcyBub3QgZnVuY3Rpb24nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoZXJzLmZvckVhY2goZiA9PiB1cGRhdGVycy5wdXNoKGYpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB1cGRhdGVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVyc1tpXSh0aGlzLmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBnZXQ6ICh0YXJnZXQsIHByb3BLZXksIHJlY2VpdmVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdiA9IHRhcmdldFtwcm9wS2V5XTtcclxuICAgICAgICAgICAgICAgIGlmICh2IGluc3RhbmNlb2YgRnVuY3Rpb24gJiYgcHJvcEtleSAhPT0gJ3ZhbHVlT2YnICYmIHByb3BLZXkgIT09ICd0b1N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdih0aGlzLmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHY7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCAob2JqLCBwYXJlbnQsIGtleSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgc2hhZG93ID0gQ29yZS5yZXNvbHZlU2hhZG93KG9iaik7XHJcbiAgICAgICAgICAgIHNoYWRvdy5rZXkgPSBrZXk7XHJcbiAgICAgICAgICAgIHNoYWRvdy5uYW1lID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFwYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ga2V5O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbGV0IHBhcmVudFNoYWRvdyA9IENvcmUucmVzb2x2ZVNoYWRvdyhwYXJlbnQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChwYXJlbnRTaGFkb3cubmFtZSA/IHBhcmVudFNoYWRvdy5uYW1lICsgJy4nIDogJycpICsga2V5O1xyXG4gICAgICAgICAgICB9KSgpO1xyXG4gICAgICAgIH0sIGsgPT4gayAhPT0gQ29yZS5zaGFkb3dTeW1ib2wpO1xyXG5cclxuICAgICAgICBSZW5kZXJIZWxwZXIucmVuZGVyKGVsLCB0aGlzLmRhdGEsIHt9LCB7IGRlYnVnOiB0aGlzLm9wdGlvbnMuZGVidWcgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFsaWFzIG9mIGBwb3NzZXNzYFxyXG4gICAgcHJvY2VzcyhlbCkge1xyXG4gICAgICAgIHJldHVybiBwb3NzZXNzKGVsKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY29weVNoYWRvd0FuZENvbGxlY3RVcGRhdGVycyhvbGQsIHZhbHVlLCB1cGRhdGVycykge1xyXG4gICAgdXBkYXRlcnMgPSB1cGRhdGVycyB8fCBbXTtcclxuICAgIGxldCBzaGFkb3cgPSBvbGRbQ29yZS5zaGFkb3dTeW1ib2xdO1xyXG4gICAgbGV0IHdhdGNoZXJBdHRyID0gc2hhZG93LndhdGNoZXJzID0gc2hhZG93LndhdGNoZXJzIHx8IHt9O1xyXG4gICAgZm9yIChsZXQgayBpbiB3YXRjaGVyQXR0cikge1xyXG4gICAgICAgIHdhdGNoZXJBdHRyW2tdLmZvckVhY2goZiA9PiB1cGRhdGVycy5wdXNoKGYpKVxyXG4gICAgfVxyXG4gICAgdmFsdWVbQ29yZS5zaGFkb3dTeW1ib2xdID0gb2xkW0NvcmUuc2hhZG93U3ltYm9sXTtcclxuICAgIGZvciAobGV0IGsgaW4gb2xkKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBrICE9PSAnc3ltYm9sJyAmJiB0eXBlb2Ygb2xkW2tdID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICB1cGRhdGVycy5wdXNoLmFwcGx5KHVwZGF0ZXJzLCBjb3B5U2hhZG93QW5kQ29sbGVjdFVwZGF0ZXJzKG9sZFtrXSwgdmFsdWVba10pKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdXBkYXRlcnM7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNoYWRvd1BsYXk7IiwiaW1wb3J0IFRleHRSZW5kZXJlciBmcm9tICcuL1RleHRSZW5kZXJlci5qcydcclxuaW1wb3J0IERlZXBQcm94eSBmcm9tICcuLi9jb3JlL0RlZXBQcm94eS5qcydcclxuaW1wb3J0IENvcmUgZnJvbSAnLi4vY29yZS9Db3JlLmpzJ1xyXG5cclxuY2xhc3MgUmVuZGVySGVscGVyIHtcclxuICAgIHN0YXRpYyByZW5kZXIobm9kZSwgZGF0YSwgY29udGV4dCwgb3B0aW9ucykge1xyXG4gICAgICAgIGlmIChub2RlLm5vZGVOYW1lID09PSAnI2NvbW1lbnQnXHJcbiAgICAgICAgICAgIHx8IChub2RlLm5vZGVOYW1lID09PSAnI3RleHQnICYmIG5vZGUuZGF0YSA9PT0gJycpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29udGV4dCA9IGNvbnRleHQgfHwge307XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XHJcblxyXG4gICAgICAgIG5vZGVbQ29yZS5zaGFkb3dTeW1ib2xdID0gbm9kZVtDb3JlLnNoYWRvd1N5bWJvbF0gfHwge307XHJcbiAgICAgICAgbGV0IHVwZGF0ZXIgPSBub2RlW0NvcmUuc2hhZG93U3ltYm9sXS51cGRhdGVyID0gbm9kZVtDb3JlLnNoYWRvd1N5bWJvbF0udXBkYXRlciB8fCAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBmdW5jID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG5vZGVTaGFkb3cgPSBub2RlW0NvcmUuc2hhZG93U3ltYm9sXTtcclxuICAgICAgICAgICAgICAgIGxldCBwcm94eSA9IERlZXBQcm94eS5jcmVhdGUoZGF0YSwge1xyXG4gICAgICAgICAgICAgICAgICAgIGdldDogKHRhcmdldCwgcHJvcEtleSwgcmVjZWl2ZXIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHYgPSB0YXJnZXRbcHJvcEtleV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvcEtleSAhPT0gJ3N5bWJvbCcgJiYgdHlwZW9mIHYgIT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgc2hhZG93ID0gQ29yZS5yZXNvbHZlU2hhZG93KHRhcmdldCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgd2F0Y2hlcnMgPSBDb3JlLmdldFdhdGNoZXJzKHNoYWRvdywgcHJvcEtleSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmV3VXBkYXRlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuZGVidWcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXdhdGNoZXJzLmhhcyh1cGRhdGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdVcGRhdGVyID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2FkZGluZyB3YXRjaGVyIGZvciAnICsgKHNoYWRvdy5uYW1lID8gc2hhZG93Lm5hbWUgKyAnLicgOiAnJykgKyBwcm9wS2V5LnRvU3RyaW5nKCkgKyAnOicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhub2RlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaGVycy5hZGQodXBkYXRlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5kZWJ1Zykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdVcGRhdGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHdhdGNoZXJzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHY7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgb2JqID0+IHt9LCBrID0+IGsgIT09IENvcmUuc2hhZG93U3ltYm9sKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgcmVuZGVyZXIgPSBub2RlU2hhZG93LnJlbmRlcmVyID0gbm9kZVNoYWRvdy5yZW5kZXJlciB8fCAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUubm9kZU5hbWUgPT09ICcjdGV4dCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUZXh0UmVuZGVyZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IG5vZGUuZGF0YSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnOiBvcHRpb25zLmRlYnVnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmNvbXBsZXRlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0+IG5vZGUuZGF0YSA9IHJlc3VsdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTm9kZVJlbmRlcmVyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBub2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVidWc6IG9wdGlvbnMuZGVidWdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVuZGVyZXIucmVuZGVyKHByb3h5LCBjb250ZXh0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5kZWJ1Zykge1xyXG4gICAgICAgICAgICAgICAgZnVuYy5ub2RlID0gbm9kZTtcclxuICAgICAgICAgICAgICAgIGZ1bmMuZGVzYyA9IG5vZGUubm9kZU5hbWUgKyAobm9kZS5pZCA/ICcjJyArIG5vZGUuaWQgOiAnJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmM7XHJcbiAgICAgICAgfSkoKTtcclxuXHJcbiAgICAgICAgaWYgKHVwZGF0ZXIoZGF0YSkgJiYgbm9kZS5jaGlsZE5vZGVzKSB7XHJcbiAgICAgICAgICAgIG5vZGUuY2hpbGROb2Rlcy5mb3JFYWNoKGNoaWxkID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyKGNoaWxkLCBkYXRhLCBjb250ZXh0LCBvcHRpb25zKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBOb2RlUmVuZGVyZXIge1xyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwge307XHJcbiAgICB9XHJcbiAgICByZW5kZXIoZGF0YSwgY29udGV4dCkge1xyXG4gICAgICAgIGxldCBmbiA9IHRoaXMuZm4gPSB0aGlzLmZuIHx8ICgoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBlbCA9IHRoaXMub3B0aW9ucy50ZW1wbGF0ZTtcclxuXHJcbiAgICAgICAgICAgIGxldCBpZkV4cHJlc3Npb24gPSBlbC5nZXRBdHRyaWJ1dGUoJ0BpZicpO1xyXG4gICAgICAgICAgICBpZiAoaWZFeHByZXNzaW9uKSB7XHJcbiAgICAgICAgICAgICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoJ0BpZicpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHJlbmRlcmVyID0gZWxbQ29yZS5zaGFkb3dTeW1ib2xdLmlmUmVuZGVyZXIgPSBlbFtDb3JlLnNoYWRvd1N5bWJvbF0uaWZSZW5kZXJlciB8fCBuZXcgVGV4dFJlbmRlcmVyKHtcclxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogaWZFeHByZXNzaW9uXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGxldCBhdXRob3IgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XHJcbiAgICAgICAgICAgICAgICBhdXRob3JbQ29yZS5zaGFkb3dTeW1ib2xdID0gZWxbQ29yZS5zaGFkb3dTeW1ib2xdO1xyXG4gICAgICAgICAgICAgICAgZWwucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoYXV0aG9yLCBlbCk7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVuZGVyZXIucmVuZGVyKGRhdGEsIGNvbnRleHQpLnRyaW0oKSA9PT0gJ2ZhbHNlJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbGV0IGYgPSAoZGF0YSwgY29udGV4dCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZW5kZXJlci5yZW5kZXIoZGF0YSwgY29udGV4dCkudHJpbSgpID09PSAnZmFsc2UnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0aG9yLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGVsLCBhdXRob3IpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGY7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IGxvb3BFeHByZXNzdGlvbiA9IGVsLmdldEF0dHJpYnV0ZSgnQGVhY2gnKSB8fCBlbC5nZXRBdHRyaWJ1dGUoJ0Bmb3InKTtcclxuICAgICAgICAgICAgaWYgKCFsb29wRXhwcmVzc3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIGlmIChlbC5nZXRBdHRyaWJ1dGUoJ0BocmVmJykpIHtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgVGV4dFJlbmRlcmVyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IGVsLmdldEF0dHJpYnV0ZSgnQGhyZWYnKVxyXG4gICAgICAgICAgICAgICAgICAgIH0pLmNvbXBsZXRlKHJlc3VsdCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLmhyZWYgPSByZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnJlbW92ZUF0dHJpYnV0ZSgnQGhyZWYnKTtcclxuICAgICAgICAgICAgICAgICAgICB9KS5yZW5kZXIoZGF0YSwgY29udGV4dCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgYXV0aG9yID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpO1xyXG4gICAgICAgICAgICBhdXRob3JbQ29yZS5zaGFkb3dTeW1ib2xdID0gZWxbQ29yZS5zaGFkb3dTeW1ib2xdO1xyXG4gICAgICAgICAgICBlbC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShhdXRob3IsIGVsKTtcclxuICAgICAgICAgICAgZWwucmVtb3ZlQXR0cmlidXRlKCdAZWFjaCcpO1xyXG4gICAgICAgICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoJ0Bmb3InKTtcclxuICAgICAgICAgICAgZWwucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgZm9vID0gbG9vcEV4cHJlc3N0aW9uLnNwbGl0KC9cXHNpblxccy8pO1xyXG4gICAgICAgICAgICBsZXQgaXRlbU5hbWUgPSBmb29bMF07XHJcbiAgICAgICAgICAgIGxldCBsaXN0TmFtZSA9IGZvb1sxXTtcclxuXHJcbiAgICAgICAgICAgIGxldCBmdW5jdGlvbkJvZHkgPVxyXG4gICAgICAgICAgICAgICAgYHJldHVybiBkYXRhID0+e1xyXG4gICAgZm9yKGxldCBpIGluIGRhdGEuJHtsaXN0TmFtZX0gKXtcclxuICAgICAgICBsZXQgJHtpdGVtTmFtZX0gPSBkYXRhLiR7bGlzdE5hbWV9W2ldO1xyXG4gICAgICAgIGxldCBuZXdFbCA9IGVsLmNsb25lTm9kZSh0cnVlKTtcclxuICAgICAgICBhdXRob3IucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobmV3RWwsIGF1dGhvcik7XHJcbiAgICAgICAgUmVuZGVySGVscGVyLnJlbmRlcihuZXdFbCwgZGF0YSwgT2JqZWN0LmFzc2lnbih7fSwgY29udGV4dCwgeyR7aXRlbU5hbWV9OiR7aXRlbU5hbWV9fSksIG9wdGlvbnMpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59YDtcclxuICAgICAgICAgICAgZm9yIChsZXQgbmFtZSBvZiBlbC5nZXRBdHRyaWJ1dGVOYW1lcygpKSB7XHJcbiAgICAgICAgICAgICAgICBpZigvXkAvLnRlc3QobmFtZSkpe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB2YWx1ZSA9IGVsLmdldEF0dHJpYnV0ZShuYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlKG5hbWUuc3Vic3RyaW5nKDEpLCB2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBGdW5jdGlvbignY29udGV4dCcsICdlbCcsICdkYXRhJywgJ1JlbmRlckhlbHBlcicsICdhdXRob3InLCAnb3B0aW9ucycsXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbkJvZHkpKGNvbnRleHQsIGVsLCBkYXRhLCBSZW5kZXJIZWxwZXIsIGF1dGhvciwgeyBkZWJ1ZzogdGhpcy5vcHRpb25zLmRlYnVnIH0pO1xyXG4gICAgICAgIH0pKCk7XHJcbiAgICAgICAgcmV0dXJuIGZuKGRhdGEsIGNvbnRleHQpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBkZWZhdWx0IFJlbmRlckhlbHBlciIsImNsYXNzIFRleHROb2RlUmVuZGVyZXIge1xyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwge307XHJcbiAgICB9XHJcbiAgICByZW5kZXIoZGF0YSwgY29udGV4dCkge1xyXG4gICAgICAgIGxldCBzdHIgPSB0aGlzLm9wdGlvbnMudGVtcGxhdGU7XHJcbiAgICAgICAgbGV0IGZuID0gdGhpcy5mbiA9IHRoaXMuZm4gfHwgKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgZnVuY3Rpb25Cb2R5ID0gYCAgICBsZXQgcD1bXTtcclxuICAgIHdpdGgoZGF0YSl7XHJcbiAgICAgICAgd2l0aChjb250ZXh0KXtcclxuICAgICAgICAgICAgcC5wdXNoKCdgICtcclxuICAgICAgICAgICAgICAgIHN0ci5yZXBsYWNlKC9cXG4vZywgJ1xcXFxuJylcclxuICAgICAgICAgICAgICAgIC5zcGxpdCgve3svKVxyXG4gICAgICAgICAgICAgICAgLmpvaW4oJ1xcJyk7XFxuXFx0XFx0cC5wdXNoKCcpXHJcbiAgICAgICAgICAgICAgICAuc3BsaXQoL319LylcclxuICAgICAgICAgICAgICAgIC5qb2luKCcpO1xcblxcdFxcdHAucHVzaChcXCcnKSArICdcXCcpO1xcbicgK1xyXG4gICAgICAgICAgICAgICAgYFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBwLmpvaW4oJycpO1xyXG5gO1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEZ1bmN0aW9uKCdkYXRhJywgJ2NvbnRleHQnLCBmdW5jdGlvbkJvZHkpO1xyXG4gICAgICAgIH0pKCk7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IGZuKGRhdGEsIGNvbnRleHQpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNhbGxiYWNrcykge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm9wdGlvbnMuY2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLmNhbGxiYWNrc1tpXShyZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29tcGxldGUoY2FsbGJhY2spIHtcclxuICAgICAgICBsZXQgY2FsbGJhY2tzID0gdGhpcy5vcHRpb25zLmNhbGxiYWNrcyA9IHRoaXMub3B0aW9ucy5jYWxsYmFja3MgfHwgW107XHJcbiAgICAgICAgY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUZXh0Tm9kZVJlbmRlcmVyOyIsImltcG9ydCBTaGFkb3dQbGF5IGZyb20gJy4vY29yZS9TaGFkb3dQbGF5LmpzJ1xyXG5cclxuLy8gQWRkIHN1cHBvcnQgZm9yIEFNRCAoQXN5bmNocm9ub3VzIE1vZHVsZSBEZWZpbml0aW9uKSBsaWJyYXJpZXMgc3VjaCBhcyByZXF1aXJlLmpzLlxyXG5pZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XHJcbiAgICBkZWZpbmUoW10sIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIFNoYWRvd1BsYXk6IFNoYWRvd1BsYXlcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG59XHJcbi8vQWRkIHN1cHBvcnQgZm9ybSBDb21tb25KUyBsaWJyYXJpZXMgc3VjaCBhcyBicm93c2VyaWZ5LlxyXG5pZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICBleHBvcnRzLlNoYWRvd1BsYXkgPSBTaGFkb3dQbGF5O1xyXG59XHJcbi8vRGVmaW5lIGdsb2JhbGx5IGluIGNhc2UgQU1EIGlzIG5vdCBhdmFpbGFibGUgb3IgdW51c2VkXHJcbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgd2luZG93LlNoYWRvd1BsYXkgPSBTaGFkb3dQbGF5O1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTaGFkb3dQbGF5OyJdfQ==
