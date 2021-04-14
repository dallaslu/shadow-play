import ShadowData from './ShadowData.js';

const shadowSymbol = Symbol("shadow");

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

export default {
    shadowSymbol,
    getWatchers,
    resolveShadow 
}