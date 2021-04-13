import ShadowPlay from './core/ShadowPlay.js'

// Add support for AMD (Asynchronous Module Definition) libraries such as require.js.
if (typeof define === 'function' && define.amd) {
    define([], function() {
        return {
            ShadowPlay: ShadowPlay
        }
    })
}
//Add support form CommonJS libraries such as browserify.
if (typeof exports !== 'undefined') {
    exports.ShadowPlay = ShadowPlay;
}
//Define globally in case AMD is not available or unused
if (typeof window !== 'undefined') {
    window.ShadowPlay = ShadowPlay;
}

export default ShadowPlay;