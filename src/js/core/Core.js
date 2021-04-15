import ShadowData from './ShadowData.js';

const shadowSymbol = Symbol("shadow");

const DEFAULT_OPTIONS = {
    elementAttributePrefix: '@',
    elementAttributes: {
        conditional: 'if',
        loop: 'each',
        click: 'click',
        change: 'change'
    },
    templateDef: {
        open: '{{',
        close: '}}'
    },
    debug: false
};

function getWatchers(obj, key) {
    let watcherMapper = resolveWacherMapper(obj);
    let watchers = watcherMapper[key] = watcherMapper[key] || new Set();
    return watchers;
}

function resolveWacherMapper(obj) {
    return resolveShadow(obj).watcherMapper;
}

function resolveShadow(target) {
    if (target instanceof ShadowData) {
        return target;
    }
    let shadow = target[shadowSymbol];
    if (!shadow) {
        shadow = new ShadowData();
        target[shadowSymbol] = shadow;
    }
    return shadow;
}

function resolveElement(el) {
    return typeof el === 'string' ? document.querySelector(el) : el;
}

export default {
    shadowSymbol,
    getWatchers,
    resolveShadow,
    resolveElement,
    DEFAULT_OPTIONS
}