var Search = (function () {
    // variables ----------------------------------------------------------------
    var _this = {},
        _iframe = null;

    // initialize ---------------------------------------------------------------
    _this.init = function () {
        _iframe = new IframeManager();
        _iframe.setListener(onMessage);


        $('#search-button').on('click', onSearchButtonClick);
        $('#close-button').on('click', onCloseButtonClick);

        $(document).keyup(onEnterKeyUp);

        $("#keyword").focus();
    };

    // private functions --------------------------------------------------------
    function loadGoogleSearch(keyword) {
        iframe = $('<iframe />', {
            id: 'google',
            src: "https://www.google.com/search?q=" + keyword,
            scrolling: true
        });
        $('#left-search').append(iframe);
    }

    function loadBingSearch(keyword) {
        iframe = $('<iframe />', {
            id: 'bing',
            src: "https://cn.bing.com/search?q=" + keyword,
            scrolling: true
        });
        $('#right-search').append(iframe);
    }


    // events -------------------------------------------------------------------
    function onMessage(request) {
        switch (request.message) {
            case 'open-search':
                message_onOpenSearch(request.data);
                break;
        }
    };


    function onEnterKeyUp(e) {
        var curKey = e.which;
        if (curKey == 13) {
            onSearchButtonClick();
        }
    }

    // start search
    function onSearchButtonClick(event) {
        var keyword = $('#keyword').val() || '';
        if (keyword.length == 0) return;

        loadGoogleSearch(keyword);
        loadBingSearch(keyword);

        $('#search-box').hide();

        // hide iframe and delete app-container
        _iframe.tell('search-button-clicked', {
            keyword: keyword
        });

        // inject Script to Iframe
        // _iframe.tell('inject-script-to-iframe', {});

    };

    // logout app and close  search view
    function onCloseButtonClick(event) {
        //delete app-container
        _iframe.tell('close-app-view', {});
    };

    // messages -----------------------------------------------------------------
    function message_onOpenSearch(data) {
        $('.page-title').html(data.title);
    };


    // public functions ---------------------------------------------------------

    return _this;
}());

document.addEventListener("DOMContentLoaded", function () {
    new Search.init();
}, false);