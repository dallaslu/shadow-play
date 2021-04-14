import Core from './Core.js'

function create(obj, handler, preProscessor, keyFilter, parent, key) {
    key = key || '';
    const proxyHandler = {
        get: (target, propKey, receiver) => {
            let v = Reflect.get(target, propKey, receiver);
            if (typeof v === 'object' && v !== null && (!keyFilter || keyFilter(propKey))) {
                return create(v, handler, preProscessor, keyFilter, target, propKey);
            }
            return v;
        }
    };

    if (preProscessor) {
        preProscessor(obj, parent, key);
    }
    let childProxy = new Proxy(obj, handler);

    return new Proxy(childProxy, proxyHandler);
}

export default {
    create
};