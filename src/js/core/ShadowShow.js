import RenderHelper from '../renderer/RenderHelper.js';
import DeepProxy from './DeepProxy.js';
import Core from './Core.js';

let defaultOptions = {};

class ShadowShow {
    constructor(data, ext, options) {
        this.app = {
            data: data,
            ext: ext
        }
        this.options = Object.assign({}, Core.DEFAULT_OPTIONS, defaultOptions, options);
        if (options.debug) {
            console.log('ShadowShow Debug Enabled.')
        }
    }

    static create(data, ext, options) {
        return new ShadowShow(data, ext, options);
    }

    static config(options) {
        Object.assign(defaultOptions, Core.DEFAULT_OPTIONS, options);
    }

    static resetConfig() {
        defaultOptions = Object.assign({}, Core.DEFAULT_OPTIONS);
    }

    isPossessed(el) {
        return !!Core.resolveElement(el)[Core.shadowSymbol];
    }

    possess(el) {
        el = Core.resolveElement(el);
        if (this.isPossessed(el)) {
            throw new Error('The element has been possessed!');
        }
        this.element = el;
        this.app.data = Object.assign({}, this.app.data);
        this.data = DeepProxy.create(this.app.data, {
            set: (target, propKey, value, receiver) => {
                let old = target[propKey];
                target[propKey] = value;
                if (old !== value) {
                    let updaters = [];
                    if (typeof propKey !== 'symbol' && typeof old === 'object') {
                        updaters = copyShadowAndCollectUpdaters(old, value);
                    } else {
                        let shadow = Core.resolveShadow(target);
                        let watchers = Core.getWatchers(shadow, propKey);
                        if (this.options.debug) {
                            console.log((shadow.name ? shadow.name + '.' : '') + propKey.toString() + ' is changed.');
                            console.log(watchers);
                        }
                        if (watchers) {
                            if (!watchers.forEach) {
                                console.log('forEach is not function');
                            }
                            watchers.forEach(f => updaters.push(f));
                        }
                    }

                    for (let i = 0; i < updaters.length; i++) {
                        updaters[i](this.data);
                    }
                }
                return true;
            },
            get: (target, propKey, receiver) => {
                let v = target[propKey];
                if (v instanceof Function && propKey !== 'valueOf' && propKey !== 'toString') {
                    return v(this.data);
                }
                return v;
            }
        }, (obj, parent, key) => {
            let shadow = Core.resolveShadow(obj);
            shadow.key = key;
            shadow.name = (function() {
                if (!parent) {
                    return key;
                }
                let parentShadow = Core.resolveShadow(parent);
                return (parentShadow.name ? parentShadow.name + '.' : '') + key;
            })();
        }, k => k !== Core.shadowSymbol);

        RenderHelper.render(el, this.data, {}, { debug: this.options.debug });

        return this;
    }

    // Alias of `possess`
    process(el) {
        return possess(el);
    }
}

function copyShadowAndCollectUpdaters(old, value, updaters) {
    updaters = updaters || [];
    let shadow = old[Core.shadowSymbol];
    let watcherAttr = shadow.watchers = shadow.watchers || {};
    for (let k in watcherAttr) {
        watcherAttr[k].forEach(f => updaters.push(f))
    }
    value[Core.shadowSymbol] = old[Core.shadowSymbol];
    for (let k in old) {
        if (typeof k !== 'symbol' && typeof old[k] === 'object') {
            updaters.push.apply(updaters, copyShadowAndCollectUpdaters(old[k], value[k]));
        }
    }
    return updaters;
}

export default ShadowShow;