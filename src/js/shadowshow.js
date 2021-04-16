import ShadowShow from './core/ShadowShow.js'

// Add support for AMD (Asynchronous Module Definition) libraries such as require.js.
if (typeof define === 'function' && define.amd) {
    define([], function() {
        return {
            ShadowShow: ShadowShow
        }
    })
}
//Add support form CommonJS libraries such as browserify.
if (typeof exports !== 'undefined') {
    exports.ShadowShow = ShadowShow;
}
//Define globally in case AMD is not available or unused
if (typeof window !== 'undefined') {
    window.ShadowShow = ShadowShow;
}

export default ShadowShow;