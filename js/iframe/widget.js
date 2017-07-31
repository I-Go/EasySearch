var Widget = (function() {
	// variables ----------------------------------------------------------------
	var _this = {};
	var _iframe = null;

	// initialize ---------------------------------------------------------------
	_this.init = function() {
		_iframe = new IframeManager();
		_iframe.setListener(onMessage);
		$('.widget').on('click', widget_onClick);
	};

	// private functions --------------------------------------------------------

	// events -------------------------------------------------------------------
	function onMessage(request) {
		switch (request.message) {
			case 'website-is-hearted':
				message_onIsHearted(request.data);
				break;
		}
	};

	function widget_onClick(event) {
		$('.widget').addClass('active');
		_iframe.tell('widget-clicked');
	};

	// messages -----------------------------------------------------------------
	function message_onIsHearted(data) {
		$('.search').addClass('active');
	};

	// public functions ---------------------------------------------------------

	return _this;
}());

document.addEventListener("DOMContentLoaded", function() {
	new Widget.init();
}, false);
