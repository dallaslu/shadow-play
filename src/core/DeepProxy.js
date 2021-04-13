import Core from './Core.js'

class DeepProxy {
    static create(obj, handler, preProscessor, keyFilter, symbol) {
        symbol = symbol || Symbol('proxy');
        let realHandler = {
            set: (target, propKey, value, receiver) => {
                if (handler.set) {
                    handler.set(target, propKey, value, receiver);
                } else {
                    target[propKey] = value;
                }
                return true;
            },
            get: (target, propKey, receiver) => {
                let v = target[propKey];
                if (needProxy(v, propKey)) {
                    let p = createProxy(v);
                    target[propKey] = p;
                    return p;
                }
                return handler.get(target, propKey, receiver);
            }
        };

        function needProxy(value, propKey) {
            return typeof value === 'object' && typeof propKey !== 'symbol' && !value[symbol];
        }

        function createProxy(value) {
            let p = proxy(value, realHandler, preProscessor, keyFilter);
            p[symbol] = true;
            return p;
        }

        return proxy(obj, realHandler, preProscessor, keyFilter);
    }
}

function proxy(obj, handler, preProscessor, keyFilter) {
    if (preProscessor) {
        preProscessor(obj);
    }
    let proxy = new Proxy(obj, handler);
    return proxy;
}
export default DeepProxy;