const defaultNoise = {
    DOMRect: 0.00000001, 
    DOMRectReadOnly: 0.000001 
};

let config = {
    "noise": {
        "DOMRect": defaultNoise.DOMRect,
        "DOMRectReadOnly": defaultNoise.DOMRectReadOnly
    },
    "metrics": {
        "DOMRect": ['x', 'y', "width", "height"],
        "DOMRectReadOnly": ["top", "right", "bottom", "left"]
    },
    "method": {
        "DOMRect": function (e) {
            try {
                Object.defineProperty(DOMRect.prototype, e, {
                    "get": new Proxy(Object.getOwnPropertyDescriptor(DOMRect.prototype, e).get, {
                        apply(target, self, args) {
                            const result = Reflect.apply(target, self, args);
                            const _result = result * (1 + (Math.random() < 0.5 ? -1 : +1) * config.noise.DOMRect);
                            return _result;
                        }
                    })
                });
            } catch (e) {
                //console.error(e);
            }
        },
        "DOMRectReadOnly": function (e) {
            try {
                Object.defineProperty(DOMRectReadOnly.prototype, e, {
                    "get": new Proxy(Object.getOwnPropertyDescriptor(DOMRectReadOnly.prototype, e).get, {
                        apply(target, self, args) {
                            const result = Reflect.apply(target, self, args);
                            const _result = result * (1 + (Math.random() < 0.5 ? -1 : +1) * config.noise.DOMRectReadOnly);
                            return _result;
                        }
                    })
                });
            } catch (e) {
                //console.error(e);
            }
        }
    }
};

{
    const mkey = "clientrects-defender-sandboxed-frame";
    document.documentElement.setAttribute(mkey, '');
    
    window.addEventListener("message", function (e) {
        if (e.data && e.data === mkey) {
            e.preventDefault();
            e.stopPropagation();

            try {
                if (e.source.DOMRect) {
                    const metrics = ['x', 'y', "width", "height"];
                    for (let i = 0; i < metrics.length; i++) {
                        Object.defineProperty(e.source.DOMRect.prototype, metrics[i], {
                            "get": Object.getOwnPropertyDescriptor(DOMRect.prototype, metrics[i]).get
                        });
                    }
                }
            } catch (e) {
                //console.error(e);
            }

            try {
                if (e.source.DOMRectReadOnly) {
                    const metrics = ["top", "right", "bottom", "left"];
                    for (let i = 0; i < metrics.length; i++) {
                        Object.defineProperty(e.source.DOMRectReadOnly.prototype, metrics[i], {
                            "get": Object.getOwnPropertyDescriptor(DOMRectReadOnly.prototype, metrics[i]).get
                        });
                    }
                }
            } catch (e) {
                //console.error(e);
            }
        }
    }, false);
}

chrome.runtime.onMessage.addListener(function (data, sender, sendResponse) {
    if (!data || !data.domRectValue) {
        return;
    }

    config.noise.DOMRect = data.isEnabledDomRect === 'true'
        ? parseFloat(data.domRectValue).toFixed(8)
        : parseFloat(defaultNoise.DOMRect).toFixed(8);

    config.noise.DOMRectReadOnly = data.isEnabledDomRectReadOnly === 'true'
        ? parseFloat(data.domRectReadOnlyValue).toFixed(8)
        : parseFloat(defaultNoise.DOMRectReadOnly).toFixed(6);

    console.log(config.noise.DOMRect);
    console.log(config.noise.DOMRectReadOnly);

    localStorage.setItem('noise', JSON.stringify(config.noise));
});

var initialization = function () {
    var noise = localStorage.getItem('noise');
    if (!noise) {
        return;
    }

    var data = JSON.parse(noise);
    config.noise.DOMRect = parseFloat(data.DOMRect).toFixed(8);
    config.noise.DOMRectReadOnly = parseFloat(data.DOMRectReadOnly).toFixed(6);
    
};

initialization();