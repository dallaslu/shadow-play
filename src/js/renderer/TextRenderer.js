class TextNodeRenderer {
    constructor(options) {
        this.options = options || {};
    }
    render(data, context) {
        let str = this.options.template;
        let fn = this.fn = this.fn || (function() {
            let functionBody = `    let p=[];
    with(data){
        with(context){
            p.push('` +
                str.replace(/\n/g, '\\n')
                .split(/{{/)
                .join('\');\n\t\tp.push(')
                .split(/}}/)
                .join(');\n\t\tp.push(\'') + '\');\n' +
                `
        }
    }
    return p.join('');
`;
            return new Function('data', 'context', functionBody);
        })();
        try {
            let result = fn(data, context);
            if (this.options.callbacks) {
                for (let i = 0; i < this.options.callbacks.length; i++) {
                    this.options.callbacks[i](result);
                }
            }
            return result;
        } catch (e) {
            console.log(e);
        }
    }

    complete(callback) {
        let callbacks = this.options.callbacks = this.options.callbacks || [];
        callbacks.push(callback);
        return this;
    }
}

export default TextNodeRenderer;