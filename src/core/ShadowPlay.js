import RenderHelper from '../renderer/RenderHelper.js'
import DeepProxy from './DeepProxy.js'
import Core from './Core.js'

const DEFAULT_OPTIONS = {
    elementAttributePrefix: '@'
};

class ShadowPlay {
    constructor(data, ext, options) {
        this.app = {
            data: data,
            ext: ext
        }
        this.options = Object.assign({}, DEFAULT_OPTIONS, options);
    }

    static create(data, ext, options) {
        return new ShadowPlay(data, ext, options);
    }

    possess(el) {
        el = typeof el === 'string' ? document.querySelector(el) : el;
        this.element = el;
        this.app.data = Object.assign({}, this.app.data);
        this.data = DeepProxy.create(this.app.data, {
            set: (target, propKey, value, receiver) => {
                let old = target[propKey];
                target[propKey] = value;
                if (old !== value) {
                    let updaters = [];
                    if (typeof propKey !== 'symbol' && typeof old === 'object') {
                        updaters = copyWatchers(old, value);
                    } else {
                        let shadow = target[Core.shadowSymbol];
                        let watcherAttr = shadow.watchers = shadow.watchers || {};
                        let watchers = watcherAttr[propKey];
                        if (watchers) {
                            watchers.forEach(f => updaters.push(f));
                        }
                    }

                    for (let i = 0; i < updaters.length; i++) {
                        updaters[i](this.app.data);
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
        }, (obj) => obj[Core.shadowSymbol] = {}, k => k !== Core.shadowSymbol, Symbol('data'));

        RenderHelper.render(el, this.data);

        return this;
    }

    // Alias of `possess`
    process(el) {
        return possess(el);
    }
}

function copyWatchers(old, value, updaters) {
    updaters = updaters || [];
    let shadow = old[Core.shadowSymbol];
    let watcherAttr = shadow.watchers = shadow.watchers || {};
    for(let k in watcherAttr){
        watcherAttr[k].forEach(f => updaters.push(f))
    }
    value[Core.shadowSymbol] = old[Core.shadowSymbol];
    for (let k in old) {
        if (typeof k !== 'symbol' && typeof old[k] === 'object') {
            updaters.push.apply(updaters, copyWatchers(old[k], value[k]));
        }
    }
    return updaters;
}

export default ShadowPlay;