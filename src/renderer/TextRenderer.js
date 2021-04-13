class TextNodeRenderer {
    constructor(options) {
        this.options = options || {};
    }
    render(data, context) {
        let str = this.options.template;
        let fn = this.fn = this.fn || new Function('data', 'context',
            `   let p=[];
    ` +
            (() => {
                let list = [];
                for (let c in context) {
                    list.push('let ' + c + ' = context.' + c + ';');
                }
                return list.join('\n');
            })() + `
    with(data){
        p.push('` +
            str.replace(/\n/g, '\\n')
            .split(/{{/)
            .join('\');\n\t\tp.push(')
            .split(/}}/)
            .join(');\n\t\tp.push(\'') + '\');\n' +
            `
    }
    return p.join('');
`);
        let result = fn(data, context);
        if (this.options.callbacks) {
            for (let i = 0; i < this.options.callbacks.length; i++) {
                this.options.callbacks[i](result);
            }
        }
        return result;
    }

    complete(callback) {
        let callbacks = this.options.callbacks = this.options.callbacks || [];
        callbacks.push(callback);
        return this;
    }
}

export default TextNodeRenderer;