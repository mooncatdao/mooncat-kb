(function attachMoonCatRenderAdapter(global) {
  "use strict";

  function renderMoonCatToCanvas(canvas, catId, options) {
    if (!canvas || typeof canvas.getContext !== "function") {
      throw new TypeError("renderMoonCatToCanvas requires a canvas");
    }
    var parser = getMoonCatParser();
    var settings = Object.assign({ pixelSize: 10 }, options || {});
    var pixelSize = Math.max(1, Number(settings.pixelSize) || 10);
    var data = parser(catId);
    canvas.width = pixelSize * data.length;
    canvas.height = pixelSize * data[1].length;
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    for (var i = 0; i < data.length; i += 1) {
      for (var j = 0; j < data[i].length; j += 1) {
        var color = data[i][j];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(i * pixelSize, j * pixelSize, pixelSize, pixelSize);
        }
      }
    }

    return canvas;
  }

  function renderMoonCatDataUrl(catId, options) {
    var canvas = document.createElement("canvas");
    renderMoonCatToCanvas(canvas, catId, options);
    return canvas.toDataURL();
  }

  function getMoonCatParser() {
    if (typeof global.mooncatparser !== "function") {
      throw new Error("mooncatparser.js must be loaded before mooncat-render-adapter.js");
    }
    return global.mooncatparser;
  }

  global.MoonCatRenderAdapter = {
    renderMoonCatToCanvas: renderMoonCatToCanvas,
    renderMoonCatDataUrl: renderMoonCatDataUrl
  };
})(typeof window !== "undefined" ? window : globalThis);
