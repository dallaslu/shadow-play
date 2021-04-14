import TextRenderer from './TextRenderer.js'
import DeepProxy from '../core/DeepProxy.js'
import Core from '../core/Core.js'

class RenderHelper {
    static render(el, data, context) {
        if (el.nodeName === '#comment') {
            return;
        }
        context = context || {};
        el.childNodes.forEach(node => {
            if (node.nodeName === '#comment') {
                return;
            }
            node[Core.shadowSymbol] = node[Core.shadowSymbol] || {};
            let updater = node[Core.shadowSymbol].updater = node[Core.shadowSymbol].updater || function(data) {
                let nodeShadow = node[Core.shadowSymbol];
                let proxy = DeepProxy.create(data, {
                    get: (target, propKey, receiver) => {
                        let v = target[propKey];
                        if (typeof propKey !== 'symbol' && typeof v !== 'object') {
                            let shadow = target[Core.shadowSymbol];
                            let watcherAttr = shadow.watchers = shadow.watchers || {};
                            let watchers = watcherAttr[propKey] = watcherAttr[propKey] || new Set();
                            watchers.add(updater);
                        }
                        return v;
                    }
                }, obj => {}, k => k !== Core.shadowSymbol, Symbol('watch'));

                let renderer = nodeShadow.renderer = nodeShadow.renderer || (node.nodeName === '#text' ? new TextRenderer({
                    template: node.data
                }).complete(
                    result => node.data = result
                ) : new NodeRenderer({
                    template: node
                }));
                return renderer.render(proxy, context);
            };
            if (updater(data) && node.nodeName !== '#text') {
                this.render(node, data, context);
            }
        });
    }
}

class NodeRenderer {
    constructor(options) {
        this.options = options || {};
    }
    render(data, context) {
        let fn = this.fn = this.fn || (() => {
            let el = this.options.template;
            let loopExpresstion = el.getAttribute('@each') || el.getAttribute('@for');
            if (!loopExpresstion) {
                if (el.getAttribute('@href')) {
                    new TextRenderer({
                        template: el.getAttribute('@href')
                    }).complete(result => {
                        el.href = result;
                        el.removeAttribute('@href');
                    }).render(data, context);
                }
                return () => true;
            }
            let author = document.createTextNode('');
            // author[Core.shadowSymbol] = el[Core.shadowSymbol];
            el.parentNode.insertBefore(author, el);
            el.removeAttribute('@each');
            el.removeAttribute('@for');
            el.remove();

            let foo = loopExpresstion.split(/\sin\s/);
            let itemName = foo[0];
            let listName = foo[1];

            let functionBody =
                `return data =>{
    for(let i in data.${listName} ){
        let ${itemName} = data.${listName}[i];
        let newEl = el.cloneNode(true);
        author.parentNode.insertBefore(newEl, author);
        RenderHelper.render(newEl, data, Object.assign({}, context, {${itemName}:${itemName}}));
    }
    return false;
}`;
            return new Function('context', 'el', 'data', 'RenderHelper', 'author',
                functionBody)(context, el, data, RenderHelper, author);
        })();
        return fn(data, context);
    }
}
export default RenderHelper