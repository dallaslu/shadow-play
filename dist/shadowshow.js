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
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _NodeAttributeRenderer = require('./NodeAttributeRenderer.js');

var _NodeAttributeRenderer2 = _interopRequireDefault(_NodeAttributeRenderer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var IfRenderer = function (_NodeAttributeRendere) {
	_inherits(IfRenderer, _NodeAttributeRendere);

	function IfRenderer() {
		_classCallCheck(this, IfRenderer);

		return _possibleConstructorReturn(this, (IfRenderer.__proto__ || Object.getPrototypeOf(IfRenderer)).apply(this, arguments));
	}

	_createClass(IfRenderer, [{
		key: 'render',
		value: function render() {}
	}]);

	return IfRenderer;
}(_NodeAttributeRenderer2.default);

exports.default = IfRenderer;
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Core = require('../core/Core.js');

var _Core2 = _interopRequireDefault(_Core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NodeAttributeRenderer = function () {
    function NodeAttributeRenderer() {
        _classCallCheck(this, NodeAttributeRenderer);
    }

    _createClass(NodeAttributeRenderer, [{
        key: 'createAnchor',
        value: function createAnchor() {
            var anchor = document.createTextNode('');
            anchor[_Core2.default.shadowSymbol] = el[_Core2.default.shadowSymbol];
            el.parentNode.insertBefore(anchor, el);
            return anchor;
        }
    }]);

    return NodeAttributeRenderer;
}();

exports.default = NodeAttributeRenderer;
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