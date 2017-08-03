var IframeInject = (function() {
	// variables ----------------------------------------------------------------
	var _this = {};
	var _iframeInject = null;

	// initialize ---------------------------------------------------------------
	_this.init = function() {
		_iframeInject = new IframeInject();
		_changeScrollbar();
		$('body').on('click', search_onClick);
	};

	// private functions --------------------------------------------------------
	var _changeScrollbar = function() {
		$('body').addClass('iframe-scrollbar');
	}
	// events -------------------------------------------------------------------
	function search_onClick(event) {
		console.log(event);
	};


	// public functions ---------------------------------------------------------

	return _this;
}());

document.addEventListener("DOMContentLoaded", function() {
	new IframeInject.init();
}, false);
