/**
 * A simple and lighweight auto complete library. It works without any framework and supported
 * on most mordern browsers.
 * @author: Dhiraj Chawla
 */
(function(){

"use strict";
var _autocomplete = function (input, options){
    var myself = this;
    var _index = -1;
    var _dataList = [];

    options = options || {};

    // initalization
    input.setAttribute("autocomplete", "off");

    var _container = createTag("div", {
        where: "around",
        ref: input,
        class: "auto-complete"
    });

    var _dropdown = createTag("ul", {
        where: "inside",
        ref: _container,
        attrib: "hidden"
    });

    registerEvents(input, {
        "input": _onSuggestOptions.bind(this),
        "blur": _onClose.bind(this),
        "keydown": _onKeyDown.bind(this)
    });

    registerEvents(_dropdown, {
        "mousedown": _onMouseClick.bind(_dropdown)
    });

    // public methods
    this.addOptions = function(data){
        if (data instanceof Array){
            for (var i=0; i<data.length; i++){
                if (_dataList.indexOf(data[i]) === -1){
                    _dataList.push(data[i]);
                }
            }
        }
    };

    // private callback functions
    function _urlOptionsDataCallback(status, response){
        if (status === 200){
            _dataList.push.apply(_dataList, response);
        }
    }

    // private functions
    function _close(){
        _dropdown.setAttribute("hidden", "hidden");
        _index = -1;
    }

    function _open(){
        _dropdown.removeAttribute("hidden");
    }

    function _highlight(idx){
        var lis = _dropdown.children;
        if (_index > -1){
            lis[_index].removeAttribute("selected");
        }

        _index = idx;

        if (idx > -1 && lis.length > 0){
            lis[idx].setAttribute("selected", "selected");
        }
    }

    function _next(){
        var count = _dropdown.children.length;
        _highlight(_index < count - 1 ? _index + 1 : 0);
    }

    function _previous(){
        var count = _dropdown.children.length;
        _highlight(_index > 0 ? _index - 1 : count - 1);
    }

    function _select(){
        if (_index > -1 && _index < _dropdown.children.length){
            var selected = _dropdown.children[_index];
            var text = selected.innerText;
            input.value = text;
            _close();
        }
    }

    function _suggestOptions(value){
        var data = _dataList.filter(function(opt){
            return opt.toLowerCase().indexOf(value.toLowerCase()) !== -1;
        })
        .sort();
        return data;
    }

    function _opened() {
        return !_dropdown.hasAttribute("hidden");
    }

    // event listeners
    function _onSuggestOptions(){
        var value = input.value;
        if (value.length >= options.minChars){
            _index = -1;
            _dropdown.innerHTML = "";
            var results = _suggestOptions(value);
            results.forEach(function(data){
                var li = createTag("li", {
                    where: "inside",
                    ref: _dropdown
                });
                li.innerHTML = data;
            });

            if (_dropdown.children.length === 0){
                _close();
            }
            else{
                _open();
            }
        }
        else{
            _close();
        }
    }

    function _onClose(){
        _close();
    }

    function _onKeyDown(evt){
        var code = evt.keyCode;
        if (_opened()){
            if (code === 13 && _index > -1){
                evt.preventDefault();
                _select();
            }
            else if (code === 27){
                _close();
            }
            else if (code === 38 || code === 40){
                evt.preventDefault();
                code === 38? _previous() : _next();
            }
        }
    }

    function _onMouseClick(evt){
        var li = evt.target;
        var lis = evt.target.parentNode.children;
        for (var i=0; i<lis.length; i++){
            if (li === lis[i]){
                evt.preventDefault();
                _highlight(i);
                _select();
                break;
            }
        }
    }

    // setting the options
    if (options.list !== undefined){
        _dataList.push.apply(_dataList, options.list);
    }

    if (options.url !== undefined){
        fetchOptionsFromUrl(options.url, _urlOptionsDataCallback);
    }

    if (options.minChars === undefined){
        options.minChars = 1;
    }
};

// Helper Functions

// returns a dom element based the input requested
function $(tag) {
    return typeof tag === "string"? document.querySelector(tag) : tag || null;
}

// creates a dom element given name of tag and options (where to put, attributes, class)
var createTag = function(tag, option) {
    var element = document.createElement(tag);

    if (option !== undefined){
        if (option.where !== undefined && option.ref !== undefined){
            if (option.where === "around"){
                var ref = $(option.ref);
                ref.parentNode.insertBefore(element, ref);
                element.appendChild(ref);
            }
            else if (option.where === "inside"){
                var ref = $(option.ref);
                ref.appendChild(element);
            }
        }

        if (option.class !== undefined){
            element.className = option.class;
        }

        if (option.attrib !== undefined){
            element.setAttribute(option.attrib, option.attrib);
        }
    }

    return element;
};

// registers event handlers to the element for given events
var registerEvents = function(element, events){
    if (element !== undefined){
        for (var evt in events){
            var callback = events[evt];
            element.addEventListener(evt, callback);
        }
    }
};

// fetches json data from url and returns it to callback
var fetchOptionsFromUrl = function(url, callback){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "json";
    xhr.onload = function() {
        var status = xhr.status;
        if (status == 200) {
            callback(status, xhr.response);
        } else {
            callback(status);
        }
    };
    xhr.send();
};

// register AutoComplete to window.self on the browser
if (typeof self !== "undefined"){
    self.AutoComplete = _autocomplete;
}

return _autocomplete;

}());
