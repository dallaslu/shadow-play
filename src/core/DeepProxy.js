import Core from './Core.js'

const deepProxyTargetSymbol = Symbol('deep.proxy.target');
const deepProxyTargetOriginalSymbol = Symbol('deep.proxy.target.original');

function create(obj, handler, preProscessor, keyFilter, parent, key) {
    key = key || '';
    const proxyHandler = {
        set: (target, propKey, value, receiver) => {
            if (propKey !== deepProxyTargetSymbol && propKey !== deepProxyTargetOriginalSymbol) {
                Reflect.set(target, propKey, value, receiver);
            }
            return true;
        },
        get: (target, propKey, receiver) => {
            let v = Reflect.get(target, propKey, receiver);
            if (typeof v === 'object' && v !== null && propKey !== deepProxyTargetSymbol && propKey !== deepProxyTargetOriginalSymbol && (!keyFilter || keyFilter(propKey))) {
                return create(v, handler, preProscessor, keyFilter, target, propKey);
            }
            return v;
        }
    };

    if (preProscessor) {
        preProscessor(obj, parent, key);
    }
    let childProxy = new Proxy(obj, handler);
    
    if (!obj[deepProxyTargetOriginalSymbol]) {
        obj[deepProxyTargetOriginalSymbol] = obj;
    }
    let proxy = new Proxy(childProxy, proxyHandler);
    proxy[deepProxyTargetSymbol] = obj;
    return proxy;
}

export default {
    create
};