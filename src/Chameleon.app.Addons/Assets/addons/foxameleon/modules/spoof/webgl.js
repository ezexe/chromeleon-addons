const webglConfig = {
  noise: {
    low: 0.1,
    medium: 0.3,
    high: 0.6,
  },
};

const webglMethods = {
  WebGLBuffer: async function (tab) {
    const noiseLevel = webglConfig.noise[settings.noiseLevel];
    await browser.tabs.executeScript(tab.id, {
      code: `
        (function() {
            // Spoof bufferData
            const originalBufferData = WebGLRenderingContext.prototype.bufferData;
            WebGLRenderingContext.prototype.bufferData = function(target, srcData, usage) {
              if (srcData instanceof ArrayBuffer || ArrayBuffer.isView(srcData)) {
                const length = srcData.byteLength;
                const dataView = new DataView(srcData.buffer || srcData);
                for (let i = 0; i < length; i += 4) {
                  if (Math.random() < ${noiseLevel}) {
                    const value = dataView.getFloat32(i, true);
                    const noise = ${noiseLevel} * (Math.random() * 2 - 1) * value;
                    dataView.setFloat32(i, value + noise, true);
                  }
                }
              }
              return originalBufferData.apply(this, arguments);
            };

            // Repeat for WebGL2RenderingContext if available
            if (window.WebGL2RenderingContext) {
              // Spoof getParameter
              WebGL2RenderingContext.prototype.getParameter = WebGLRenderingContext.prototype.getParameter;
              
              // Spoof getExtension
              WebGL2RenderingContext.prototype.getExtension = WebGLRenderingContext.prototype.getExtension;

              // Spoof bufferData
              WebGL2RenderingContext.prototype.bufferData = WebGLRenderingContext.prototype.bufferData;
            }
        })();
      `,
      runAt: "document_start",
    });
  },
  WebGLParams: async function (tab) {
    await browser.tabs.executeScript(tab.id, {
      code: `
        (function() {
            // Spoof getParameter
            const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
            WebGLRenderingContext.prototype.getParameter = function(parameter) {
              const spoofedParameters = {
                3415: 0,
                3414: 24,
                7936: "WebKit",
                7937: "WebGL",
                7938: "WebGL 1.0",
                35724: "WebGL GLSL ES",
                37445: "Google Inc.",
                37446: "Graphics",
                // Add other parameters as needed
              };
              if (spoofedParameters.hasOwnProperty(parameter)) {
                return spoofedParameters[parameter];
              }
              return originalGetParameter.apply(this, arguments);
            };
        })();
      `,
      runAt: "document_start",
    });
  },
  WebGLExtensions: async function (tab) {
    await browser.tabs.executeScript(tab.id, {
      code: `
        (function() {
            // Spoof getExtension
            const originalGetExtension = WebGLRenderingContext.prototype.getExtension;
            WebGLRenderingContext.prototype.getExtension = function(name) {
              // Randomly nullify extensions based on noiseLevel
              if (Math.random() < ${noiseLevel}) {
                return null;
              }
              return originalGetExtension.apply(this, arguments);
            };
        })();
      `,
      runAt: "document_start",
    });
  },
};

async function applyWebglSpoofing(tab) {
  if (tab.url && tab.url.indexOf("about:") < 0 && settings.webglSpoofing) {
    log.info(`Applying WebGL spoofing for tab ${tab.id}`);
    try {
      await webglMethods.WebGLBuffer(tab);
      await webglMethods.WebGLParams(tab);
      await webglMethods.WebGLExtensions(tab);
    } catch (error) {
      log.error(`Failed to apply WebGL spoofing for tab ${tab.id}:`, error);
    }
  }
}