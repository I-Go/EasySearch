var Background = (function() {
	// variables ----------------------------------------------------------------
	var _this = {};

	var _requestFilter = {
		urls: [
			'https://www.google.com/*',
			'https://www.baidu.com/*',
			'http://cn.bing.com/*'
		]
	};
	var _ua = 'Mozilla/5.0 (iPad; CPU OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1';

	// initialize ---------------------------------------------------------------
	_this.init = function() {
		// receive post messages from "inject.js" and any iframes
		chrome.extension.onRequest.addListener(onPostMessage);

		// manage when a user change tabs
		// chrome.tabs.onActivated.addListener(onTabActivated);

		//linstening hotkey press events
		chrome.commands.onCommand.addListener(onHotkeyPressed);

		//set x-frame-options for load google into iframe
		chrome.webRequest.onHeadersReceived.addListener(setResponseHeader, _requestFilter, ["blocking", "responseHeaders"]);

		//rewrite  user agent before request
		// chrome.webRequest.onBeforeSendHeaders.addListener(setUserAgentBeforeRequest, _requestFilter, ['requestHeaders', 'blocking']);

		//rewrite  google search url
		// chrome.webRequest.onBeforeSendHeaders.addListener(setUserAgentBeforeRequest, _requestFilter, ['requestHeaders', 'blocking']);

	}
	// private functions --------------------------------------------------------
	function upateCurrentTab() {};

	function processMessage(request) {
		// process the request
		switch (request.message) {
			case 'search-button-clicked':
				message_onSearchButtonClicked(request.data);
				break;
			case 'all-iframes-loaded':
				message_allIframesLoaded(request.data);
				break;
			case 'inject-script-to-iframe':
				message_onAppFrameLoaded(request.data);
				break;
		}
	};

	// start up easy search
	function startEasySearch() {
		_this.tell('start_up_easy_search', {});
	}

	// stop EasySearch
	function stopEasySearch() {
		_this.tell('stop_easy_search', {});
	}

	//set the style of body for iframe
	function injectScript2Iframe() {
		chrome.windows.getCurrent(function(currentWindow) {
			chrome.tabs.query({
				active: true,
				windowId: currentWindow.id
			}, function(activeTabs) {
				console.log("TabId:" + activeTabs[0].id + ", And windowId:" + activeTabs[0].windowId);
				//The first parameter indicates which tag is injected
				//The second argument is an option object, file that should be injected into the file, it can be code, such as: code: "alert (1);"
				//AllFrames means that if the page has an iframe, is it also injected into the iframe script
				chrome.tabs.executeScript(activeTabs[0].id, {
					// file: "iframeInject.js",
					// code: "alert(window.id);window.body.style.backgroundColor = 'blue';",
					code: 'alert(1);',
					allFrames: true
				});
			});
		});
	}


	//set user agent before request
	function setUserAgentBeforeRequest(d) {
		var headers = d.requestHeaders;
		for (var i = 0; i < headers.length; i++) {
			if (headers[i].name.toLowerCase() == "user-agent") {
				headers[i].value = _ua;
				break;
			}
		}
		return {
			requestHeaders: headers
		};
	}

	//set x-frame-options for load google into iframe
	function setResponseHeader(details) {
		for (var i = 0; i < details.responseHeaders.length; ++i) {
			if (details.responseHeaders[i].name.toLowerCase() == 'x-frame-options') {
				details.responseHeaders.splice(i, 1);
				return {
					responseHeaders: details.responseHeaders
				};
			}
		}
	}

	// events -------------------------------------------------------------------
	function onPostMessage(request, sender, sendResponse) {
		if (!request.message) return;

		// if it has a "view", it resends the message to all the frames in the current tab
		if (request.data.view) {
			_this.tell(request.message, request.data);
			return;
		}

		processMessage(request);
	};

	function onTabActivated() {
		upateCurrentTab();
	};

	function onHotkeyPressed(command) {
		switch (command) {
			case 'start_up_easy_search':
				startEasySearch();
				break;
			case 'stop_easy_search':
				stopEasySearch();
				break;
			default:
				console.log(command);
				break;
		}

	};

	// messages -----------------------------------------------------------------
	function message_onSearchButtonClicked(data) {
		console.log('background receive messages: ..begin search keyword== ' + data.keyword);
		return;
		// create new tab for show search result
		chrome.tabs.create({
			url: "https://www.google.com/search?q=" + data.keyword
		});
	};

	function message_allIframesLoaded(data) {
		upateCurrentTab();
	};

	function message_onAppFrameLoaded(data) {
		injectScript2Iframe()
	}

	// public functions ---------------------------------------------------------
	_this.tell = function(message, data) {
		var data = data || {};

		// find the current tab and send a message to "inject.js" and all the iframes
		chrome.tabs.getSelected(null, function(tab) {
			if (!tab) return;

			chrome.tabs.sendMessage(tab.id, {
				message: message,
				data: data
			});
		});
	};

	return _this;
}());

window.addEventListener("load", function() {
	Background.init();
}, false);
