import Core from '../core/Core.js';

class NodeAttributeRenderer {
    createAnchor() {
        let anchor = document.createTextNode('');
        anchor[Core.shadowSymbol] = el[Core.shadowSymbol];
        el.parentNode.insertBefore(anchor, el);
        return anchor;
    }
}

export default NodeAttributeRenderer;