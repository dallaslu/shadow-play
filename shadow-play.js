const DEFAULT_OPTIONS = {};

class ShadowPlay {
	constructor(app, options) {
		this.app = Object.assign({}, app);
		this.options = Object.assign({}, DEFAULT_OPTIONS, options);
	}

	static create(app, options) {
		return new ShadowPlay(app, options);
	}

	possess(el) {
		el = typeof els === 'string' ? document.querySelector(el) : el;
		return this;
	}

	// Alias of `possess`
	process(el){
		return possess(el);
	}
}

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