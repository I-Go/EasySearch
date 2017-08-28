var Inject = (function() {
	// constants ----------------------------------------------------------------
	var ID = {
		CONTAINER: 'x-container',
		IFRAME_PREFIX: 'x-iframe-'
	};

	// variables ----------------------------------------------------------------
	var _this = {},
		_views = {},
		_container = null;

	// initialize ---------------------------------------------------------------
	_this.init = function() {
		// create the widget container
		_container = $('<div />', {
			id: ID.CONTAINER
		});
		_container.appendTo(document.body);

		// add the "widget" and "search" iframes
		loadWidget('widget', _container);
		// loadView('search', _container);

		// listen to the iframes/webpages message
		window.addEventListener("message", dom_onMessage, false);

		// listen to the Control Center (background.js) messages
		chrome.extension.onMessage.addListener(background_onMessage);

	};

	// private functions --------------------------------------------------------
	function loadWidget(id) {
		// return the view if it's already created
		if (_views[id]) return _views[id];

		// iframe initial details
		var src = chrome.extension.getURL('html/iframe/' + id + '.html?view=' + id + '&_' + (new Date().getTime())),
			iframe = $('<iframe />', {
				id: ID.IFRAME_PREFIX + id,
				src: src,
				scrolling: false
			});

		// view
		_views[id] = {
			isLoaded: false,
			iframe: iframe
		};

		// add to the container
		_container.append(iframe);

		return _views[id];
	};

	// loading search view
	function loadEasySearchView(id) {
		var APP = {
			CONTAINER: 'app-container',
			IFRAME_PREFIX: 'app-iframe-'
		};
		// return the view if it's already created
		if (_views[id]) return _views[id];

		// iframe initial details
		var src = chrome.extension.getURL('html/iframe/' + id + '.html?view=' + id + '&_' + (new Date().getTime()));
		var iframe = $('<iframe />', {
			id: APP.IFRAME_PREFIX + id,
			src: src,
			scrolling: false
		});

		// view
		_views[id] = {
			isLoaded: false,
			iframe: iframe
		};

		// create the main container
		app_container = $('<div />', {
			id: APP.CONTAINER
		});
		app_container.appendTo(document.body);

		// add to the container
		app_container.append(iframe);

		return _views[id];
	};

	// remove app view
	function removeAppView() {
		// $("#app-iframe-search").hide();
		$("#app-container").remove();
		delete _views.search;
		$("#x-container").show();
	}

	// send a message to "background.js"
	function tell(message, data) {
		var data = data || {};

		// send a message to "background.js"
		chrome.extension.sendRequest({
			message: message,
			data: data
		});
	};

	function processMessage(request) {
		if (!request.message) return;

		switch (request.message) {
			case 'iframe-loaded':
				message_onIframeLoaded(request.data);
				$('body').addClass('body-scrollbar');
				break;
			case 'widget-clicked':
				message_onWidgetClicked(request.data);
				break;
			case 'start_up_easy_search':
				message_onWidgetClicked(request.data);
				break;
			case 'search-button-clicked':
				message_onSearchButtonClicked(request.data);
				break;
			case 'inject-script-to-iframe':
				message_onAppFrameLoaded(request.data);
				break;
			case 'stop_easy_search':
				removeAppView();
				break;
			case 'close-app-view':
				removeAppView();
				break;
		}
	};

	// events -------------------------------------------------------------------
	// messages coming from iframes and the current webpage
	function dom_onMessage(event) {
		if (!event.data.message) return;

		// tell another iframe a message
		if (event.data.view) {
			tell(event.data);
		} else {
			processMessage(event.data);
		}
	};

	// messages coming from "background.js"
	function background_onMessage(request, sender, sendResponse) {
		if (request.data.view) return;
		processMessage(request);
	};

	// messages -----------------------------------------------------------------
	function message_onIframeLoaded(data) {
		var view = loadWidget(data.source);
		var allLoaded = true;

		view.isLoaded = true;

		for (var i in _views) {
			if (_views[i].isLoaded === false) allLoaded = false;
		}

		// tell "background.js" that all the frames are loaded
		if (allLoaded) tell('all-iframes-loaded');
	};

	function message_onWidgetClicked(data) {
		removeAppView();
		var search = loadEasySearchView('search');
		search.iframe.show();
		$("#x-container").hide();
	};

	function message_onSearchButtonClicked(data) {
		// removeAppView();
		if (data.keyword.length == 0) return;

		// tell "background.js" to begin search
		tell('search-button-clicked', {
			url: window.location.href,
			title: document.title,
			keyword: data.keyword
		});
	};

	function message_onAppFrameLoaded(data) {
		// tell "background.js" to inject Script to Iframe
		tell('inject-script-to-iframe', {
			url: window.location.href,
			title: document.title
		});
	};



	return _this;
}());
document.addEventListener("DOMContentLoaded", function() {
	Inject.init();
}, false);
