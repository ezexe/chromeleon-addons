var background = {
    "port": null,
    "message": {},
    "receive": function (id, callback) {
        if (id) {
            background.message[id] = callback;
        }
    },
    "send": function (id, data) {
        if (id) {
            chrome.runtime.sendMessage({
                "method": id,
                "data": data,
                "path": "popup-to-background"
            }, function () {
                return chrome.runtime.lastError;
            });
        }
    },
    "connect": function (port) {
        chrome.runtime.onMessage.addListener(background.listener);
        
        if (port) {
            background.port = port;
            background.port.onMessage.addListener(background.listener);
            background.port.onDisconnect.addListener(function () {
                background.port = null;
            });
        }
    },
    "post": function (id, data) {
        if (id) {
            if (background.port) {
                background.port.postMessage({
                    "method": id,
                    "data": data,
                    "path": "popup-to-background",
                    "port": background.port.name
                });
            }
        }
    },
    "listener": function (e) {
        if (e) {
            for (let id in background.message) {
                if (background.message[id]) {
                    if ((typeof background.message[id]) === "function") {
                        if (e.path === "background-to-popup") {
                            if (e.method === id) {
                                background.message[id](e.data);
                            }
                        }
                    }
                }
            }
        }
    }
};

var config = {
    "render": function (e) {
        const name = document.querySelector(".name");
        const notifications = document.querySelector(".notifications");
        
        name.textContent = chrome.runtime.getManifest().name;
        notifications.textContent = e.notifications ? '☑' : '☐';
    },
    "send": function () {
        var data = {
            domRectValue: localStorage.getItem('DOMRect') || 0.00000001,
            domRectReadOnlyValue: localStorage.getItem('DOMRectReadOnly') || 0.000001,
            isEnabledDomRect: localStorage.getItem('IsEnabledDOMRect') || true,
            isEnabledDomRectReadOnly: localStorage.getItem('IsEnabledDOMRectReadOnly') || true
        };

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, data);
        });
    },
    "load": function () {
        var DOMRectValue = document.querySelector("#DOMRectValue");
        var DOMRectReadOnlyValue = document.querySelector("#DOMRectReadOnlyValue");

        var DOMRect = document.querySelector("#DOMRect");
        DOMRect.onchange = function (e) {
            var value = parseFloat(e.target.value).toFixed(8);
            DOMRectValue.textContent = value;
            localStorage.setItem('DOMRect', value);
            config.send();
        };

        var DOMRectReadOnly = document.querySelector("#DOMRectReadOnly");
        DOMRectReadOnly.onchange = function (e) {
            var value = parseFloat(e.target.value).toFixed(6);
            DOMRectReadOnlyValue.textContent = value;
            localStorage.setItem('DOMRectReadOnly', value);
            config.send();
        };

        var toggleDOMRect = document.querySelector("#toggleDOMRect");
        toggleDOMRect.onchange = function (e) {
            var value = e.target.checked;
            DOMRect.disabled = !value;
            localStorage.setItem('IsEnabledDOMRect', value);
            config.send();
        };

        var toggleDOMRectReadOnly = document.querySelector("#toggleDOMRectReadOnly");
        toggleDOMRectReadOnly.onchange = function (e) {
            var value = e.target.checked;
            DOMRectReadOnly.disabled = !value;
            localStorage.setItem('IsEnabledDOMRectReadOnly', value);
            config.send();
        };

        DOMRect.value = localStorage.getItem('DOMRect') || 0.00000001;
        DOMRectReadOnly.value = localStorage.getItem('DOMRectReadOnly') || 0.000001;

        var isEnabledDOMRect = localStorage.getItem('IsEnabledDOMRect');
        if (isEnabledDOMRect === undefined || isEnabledDOMRect === null || isEnabledDOMRect === '') {
            isEnabledDOMRect = true;
        } else {
            isEnabledDOMRect = isEnabledDOMRect === 'true';
        }

        var isEnabledDOMRectReadOnly = localStorage.getItem('IsEnabledDOMRect');
        if (isEnabledDOMRectReadOnly === undefined || isEnabledDOMRectReadOnly === null || isEnabledDOMRectReadOnly === '') {
            isEnabledDOMRectReadOnly = true;
        } else {
            isEnabledDOMRectReadOnly = isEnabledDOMRectReadOnly === 'true';
        }

        toggleDOMRect.checked = isEnabledDOMRect;
        toggleDOMRectReadOnly.checked = isEnabledDOMRectReadOnly;

        DOMRect.disabled = !isEnabledDOMRect;
        DOMRectReadOnly.disabled = !isEnabledDOMRectReadOnly;

        DOMRectValue.textContent = parseFloat(DOMRect.value).toFixed(8);
        DOMRectReadOnlyValue.textContent = parseFloat(DOMRectReadOnly.value).toFixed(6);        
    }
};

background.receive("storage", config.render);
window.addEventListener("load", config.load, false);
background.connect(chrome.runtime.connect({ "name": "popup" }));
