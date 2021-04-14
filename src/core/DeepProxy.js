import Core from './Core.js'

class DeepProxy {
    static create(obj, handler, preProscessor, keyFilter, symbol) {
        symbol = symbol || Symbol('proxy');
        let realHandler = {
            set: (target, propKey, value, receiver) => {
                if (handler.set) {
                    return handler.set(target, propKey, value, receiver);
                } else {
                    return Reflect.set(target, propKey, value, receiver)
                }
            },
            get: (target, propKey, receiver) => {
                let v = Reflect.get(target, propKey, receiver);
                if (needProxy(v, propKey)) {
                    let p = createProxy(v);
                    return p;
                }
                return handler.get(target, propKey, receiver);
            }
        };

        function needProxy(value, propKey) {
            return typeof value === 'object' && typeof propKey !== 'symbol' && propKey !== symbol && !value[symbol];
        }

        function createProxy(value) {
            let p = proxy(value, realHandler, preProscessor, keyFilter);
            p[symbol] = {
                target: value
            };
            return p;
        }

        function proxy(obj, handler, preProscessor, keyFilter) {
            if (preProscessor) {
                preProscessor(obj);
            }
            let proxy = new Proxy(obj, handler);
            return proxy;
        }

        return proxy(obj, realHandler, preProscessor, keyFilter);
    }

    static isDeepProxy(obj, symbol) {
        return !!obj[symbol];
    }

    static getTarget(proxy, symbol) {
        return isDeepProxy(proxy, symbol) ? proxy[symbol].target : undefined;
    }
}


export default DeepProxy;