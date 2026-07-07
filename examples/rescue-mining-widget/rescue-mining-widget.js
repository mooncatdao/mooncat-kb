(function attachMoonCatRescueMiner(global) {
  "use strict";

  var ORIGINAL_SEARCH_SEED =
    "0xd14b1349b8662386a0002c6dbc7f8ced11312226af1da67a1be7b28f66fed6cd";
  var ORIGINAL_DIFFICULTY_PREFIX = "000000";
  var DEMO_DIFFICULTY_PREFIX = "0000";
  var MASK_64 = (1n << 64n) - 1n;
  var KECCAK_ROUNDS = [
    1n, 32898n, 9223372036854808714n, 9223372039002292224n,
    32907n, 2147483649n, 9223372039002292353n, 9223372036854808585n,
    138n, 136n, 2147516425n, 2147483658n, 2147516555n,
    9223372036854775947n, 9223372036854808713n, 9223372036854808579n,
    9223372036854808578n, 9223372036854775936n, 32778n,
    9223372039002259466n, 9223372039002292353n, 9223372036854808704n,
    2147483649n, 9223372039002292232n
  ];
  var ROTATION_OFFSETS = [
    0, 1, 62, 28, 27,
    36, 44, 6, 55, 20,
    3, 10, 43, 25, 39,
    41, 45, 15, 21, 8,
    18, 2, 61, 56, 14
  ];
  var PI_2 = Math.PI * 2;

  function mountMoonCatRescueMiner(target, options) {
    var root = typeof target === "string" ? document.querySelector(target) : target;
    if (!root) {
      throw new Error("mountMoonCatRescueMiner target not found");
    }

    var settings = Object.assign({
      searchSeed: ORIGINAL_SEARCH_SEED,
      batchSize: 180,
      tickDelay: 0,
      difficultyPrefix: ORIGINAL_DIFFICULTY_PREFIX,
      knownRescuedCatIds: null,
      keccak256: null,
      randomBytes: randomSeed32
    }, options || {});
    var searchSeedBytes = hexToBytes32(settings.searchSeed, "searchSeed");
    settings.difficultyPrefix = normalizeDifficultyPrefix(settings.difficultyPrefix);
    var knownRescued = normalizeKnownCatIds(settings.knownRescuedCatIds);
    var state = {
      running: false,
      startedAt: 0,
      iterations: 0,
      timer: null,
      animationFrame: null,
      animationStart: 0
    };

    root.innerHTML = renderShell();

    var canvas = root.querySelector("[data-mcr-scan]");
    var catCanvas = root.querySelector("[data-mcr-cat]");
    var stages = {
      idle: root.querySelector("[data-mcr-stage='idle']"),
      mine: root.querySelector("[data-mcr-stage='mine']"),
      found: root.querySelector("[data-mcr-stage='found']")
    };
    var intensitySelect = root.querySelector("[data-mcr-intensity]");
    var difficultySelect = root.querySelector("[data-mcr-difficulty]");
    var difficultySummary = root.querySelector("[data-mcr-difficulty-summary]");
    var status = root.querySelector("[data-mcr-status]");
    var iterations = root.querySelector("[data-mcr-iterations]");
    var rate = root.querySelector("[data-mcr-rate]");
    var resultType = root.querySelector("[data-mcr-result-type]");
    var seedOut = root.querySelector("[data-mcr-seed]");
    var hashOut = root.querySelector("[data-mcr-hash]");
    var catIdOut = root.querySelector("[data-mcr-catid]");
    var timeOut = root.querySelector("[data-mcr-time]");

    populateIntensityOptions(intensitySelect);
    populateDifficultyOptions(difficultySelect, settings.difficultyPrefix);
    updateDifficultySummary();
    drawScanner(canvas, 0);

    root.querySelector("[data-mcr-start]").addEventListener("click", start);
    root.querySelector("[data-mcr-stop]").addEventListener("click", stop);
    root.querySelector("[data-mcr-reset]").addEventListener("click", reset);
    difficultySelect.addEventListener("change", function changeDifficulty() {
      if (state.running) {
        stop();
      }
      settings.difficultyPrefix = difficultySelect.value;
      updateDifficultySummary();
      drawScanner(canvas, 0);
    });

    showStage(stages, "idle");

    return {
      start: start,
      stop: stop,
      reset: reset,
      destroy: function destroy() {
        stop();
        root.innerHTML = "";
      }
    };

    function start() {
      if (state.running) {
        return;
      }
      state.running = true;
      state.startedAt = performance.now();
      state.iterations = 0;
      status.textContent = scanStatusText();
      iterations.textContent = "0";
      rate.textContent = "0 Kh/s";
      showStage(stages, "mine");
      startAnimation();
      scheduleMine();
    }

    function stop() {
      state.running = false;
      clearTimeout(state.timer);
      cancelAnimationFrame(state.animationFrame);
      status.textContent = "Scan stopped before a candidate was found.";
      showStage(stages, "idle");
    }

    function reset() {
      stop();
      seedOut.textContent = "";
      hashOut.textContent = "";
      catIdOut.textContent = "";
      timeOut.textContent = "";
      resultType.textContent = "";
      clearCanvas(catCanvas);
      drawScanner(canvas, 0);
    }

    function scheduleMine() {
      state.timer = setTimeout(runBatch, settings.tickDelay);
    }

    function runBatch() {
      var found = null;
      var batchSize = Math.max(1, Number(settings.batchSize) || 1);
      var intensity = Math.max(1, Number(intensitySelect.value) || 1);
      var work = batchSize * intensity;

      for (var i = 0; i < work && !found; i += 1) {
        state.iterations += 1;
        var seed = bytes32From(settings.randomBytes(), "seed");
        var hash = normalizeHash(hashBytes(concatBytes(seed, searchSeedBytes), settings.keccak256));
        if (hash.slice(2, 2 + settings.difficultyPrefix.length) === settings.difficultyPrefix) {
          var catId = "0x00" + hash.slice(-8);
          if (knownRescued && knownRescued.has(catId.toLowerCase())) {
            continue;
          }
          found = {
            seed: bytesToHex(seed),
            hash: hash,
            catId: catId
          };
        }
      }

      updateProgress();

      if (found) {
        finish(found);
      } else if (state.running) {
        scheduleMine();
      }
    }

    function finish(found) {
      state.running = false;
      clearTimeout(state.timer);
      cancelAnimationFrame(state.animationFrame);
      var seconds = Math.max(0.001, (performance.now() - state.startedAt) / 1000);
      seedOut.textContent = found.seed;
      hashOut.textContent = found.hash;
      catIdOut.textContent = found.catId;
      timeOut.textContent = seconds.toFixed(2) + " seconds, " + state.iterations + " seeds";
      resultType.textContent = knownRescued ?
        "Valid unlisted candidate found." :
        "Valid candidate found.";
      drawCandidateCat(catCanvas, found.catId);
      showStage(stages, "found");
      if (typeof settings.onFound === "function") {
        settings.onFound(Object.assign({ iterations: state.iterations, seconds: seconds }, found));
      }
    }

    function updateProgress() {
      var seconds = Math.max(0.001, (performance.now() - state.startedAt) / 1000);
      iterations.textContent = String(state.iterations);
      rate.textContent = (state.iterations / seconds / 1000).toFixed(2) + " Kh/s";
    }

    function startAnimation() {
      state.animationStart = performance.now();
      function frame(now) {
        drawScanner(canvas, (now - state.animationStart) / 1000);
        if (state.running) {
          state.animationFrame = requestAnimationFrame(frame);
        }
      }
      state.animationFrame = requestAnimationFrame(frame);
    }

    function updateDifficultySummary() {
      difficultySummary.textContent = difficultyDescription(settings.difficultyPrefix);
    }

    function scanStatusText() {
      return "Scanning for adorable mooncats with prefix " +
        settings.difficultyPrefix +
        " (" +
        expectedAttemptsText(settings.difficultyPrefix) +
        " expected average attempts).";
    }
  }

  function renderShell() {
    return [
      '<section class="mcr-miner" aria-label="MoonCat rescue miner">',
      '  <h1 class="mcr-miner__title">MoonCat<wbr>Rescue</h1>',
      '  <div class="mcr-miner__stage" data-mcr-stage="idle" aria-hidden="true">',
      '    <div class="mcr-miner__panel">',
      '      <div>All slots on the ship are now filled.</div>',
      '      <div><em>The mission was a success</em></div>',
      '      <div>You can still scan to see cats who got left behind.</div>',
      '    </div>',
      '    <div class="mcr-miner__controls">',
      '      <select class="mcr-miner__select" data-mcr-intensity aria-label="Scan intensity"></select>',
      '      <select class="mcr-miner__select" data-mcr-difficulty aria-label="Difficulty mode"></select>',
      '      <button class="mcr-miner__button mcr-miner__button--ok" data-mcr-start>Scan for Cats</button>',
      '    </div>',
      '    <p class="mcr-miner__notice" data-mcr-difficulty-summary></p>',
      '    <p class="mcr-miner__notice">Wallet-free demo. No chain-state check is performed.</p>',
      '  </div>',
      '  <div class="mcr-miner__stage" data-mcr-stage="mine" aria-hidden="true">',
      '    <div class="mcr-miner__panel"><div data-mcr-status>Scanning for adorable mooncats...</div></div>',
      '    <canvas class="mcr-miner__scan" width="400" height="400" data-mcr-scan></canvas>',
      '    <dl class="mcr-miner__output">',
      '      <dt>seeds</dt><dd data-mcr-iterations>0</dd>',
      '      <dt>rate</dt><dd data-mcr-rate>0 Kh/s</dd>',
      '    </dl>',
      '    <div class="mcr-miner__controls">',
      '      <button class="mcr-miner__button mcr-miner__button--cancel" data-mcr-stop>Stop Scan</button>',
      '    </div>',
      '  </div>',
      '  <div class="mcr-miner__stage" data-mcr-stage="found" aria-hidden="true">',
      '    <div class="mcr-miner__panel">',
      '      <div>Cat Found!</div>',
      '      <div><em data-mcr-result-type></em></div>',
      '      <div>This widget does not check whether the cat is currently rescuable.</div>',
      '    </div>',
      '    <canvas class="mcr-miner__cat" width="190" height="190" data-mcr-cat></canvas>',
      '    <dl class="mcr-miner__output">',
      '      <dt>id</dt><dd data-mcr-catid></dd>',
      '      <dt>seed</dt><dd data-mcr-seed></dd>',
      '      <dt>hash</dt><dd data-mcr-hash></dd>',
      '      <dt>found in</dt><dd data-mcr-time></dd>',
      '    </dl>',
      '    <div class="mcr-miner__controls">',
      '      <button class="mcr-miner__button mcr-miner__button--ok" data-mcr-reset>Scan For Another Cat</button>',
      '    </div>',
      '    <p class="mcr-miner__notice">No wallet, provider, rescueCat call, or transaction submission is included.</p>',
      '  </div>',
      '</section>'
    ].join("");
  }

  function showStage(stages, active) {
    Object.keys(stages).forEach(function setStage(name) {
      stages[name].setAttribute("aria-hidden", name === active ? "false" : "true");
    });
  }

  function populateIntensityOptions(select) {
    var maxIntensity = Math.max(1, Math.min(8, navigator.hardwareConcurrency || 1));
    for (var i = 1; i <= maxIntensity; i += 1) {
      var option = document.createElement("option");
      option.value = String(i);
      option.textContent = "Scan intensity " + i;
      if (i === Math.max(1, maxIntensity - 1)) {
        option.selected = true;
      }
      select.appendChild(option);
    }
  }

  function populateDifficultyOptions(select, currentPrefix) {
    addDifficultyOption(
      select,
      ORIGINAL_DIFFICULTY_PREFIX,
      "Original difficulty",
      currentPrefix === ORIGINAL_DIFFICULTY_PREFIX
    );
    addDifficultyOption(
      select,
      DEMO_DIFFICULTY_PREFIX,
      "Demo mode",
      currentPrefix === DEMO_DIFFICULTY_PREFIX
    );
    if (
      currentPrefix !== ORIGINAL_DIFFICULTY_PREFIX &&
      currentPrefix !== DEMO_DIFFICULTY_PREFIX
    ) {
      addDifficultyOption(select, currentPrefix, "Custom prefix " + currentPrefix, true);
    }
  }

  function addDifficultyOption(select, value, label, selected) {
    var option = document.createElement("option");
    option.value = value;
    option.textContent = label + " (" + value + ")";
    option.selected = selected;
    select.appendChild(option);
  }

  function difficultyDescription(prefix) {
    if (prefix === ORIGINAL_DIFFICULTY_PREFIX) {
      return "Original difficulty prefix " + prefix + "; expected average ~16.8M attempts.";
    }
    if (prefix === DEMO_DIFFICULTY_PREFIX) {
      return "Demo mode prefix " + prefix + "; expected average " +
        expectedAttemptsText(prefix) +
        " attempts. Demo mode is not original rescue difficulty.";
    }
    return "Custom difficulty prefix " + prefix + "; expected average " +
      expectedAttemptsText(prefix) +
      " attempts. Custom prefixes are not original rescue difficulty.";
  }

  function expectedAttemptsText(prefix) {
    var attempts = Math.pow(16, prefix.length);
    if (attempts >= 1000000) {
      return "~" + (attempts / 1000000).toFixed(1) + "M";
    }
    return "~" + attempts.toLocaleString("en-US");
  }

  function drawScanner(canvas, elapsed) {
    if (!canvas) {
      return;
    }
    var ctx = canvas.getContext("2d");
    clearCanvas(canvas);
    drawStars(ctx, canvas.width, canvas.height, elapsed);
    drawMoon(ctx, 200, 152, 74, elapsed);

    var y = Math.sin(elapsed * 2.2) * 120 + 192;
    ctx.fillStyle = "rgba(0, 100, 0, 0.3)";
    ctx.fillRect(0, 380, 400, 400);
    ctx.fillRect(224, y - 30, 122, 22);
    ctx.strokeStyle = "#00cc00";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "bevel";
    ctx.strokeRect(180, y, 25, 25);
    ctx.beginPath();
    ctx.moveTo(205, y + 12);
    ctx.lineTo(225, y - 8);
    ctx.lineTo(346, y - 8);
    ctx.stroke();

    var sample = Math.abs(Math.sin(elapsed * 3.7)).toString(16).slice(2, 10).padEnd(8, "0");
    ctx.font = "20px Courier New";
    ctx.fillStyle = "rgba(255, 0, 0, 0.72)";
    ctx.fillText("0x00" + sample, 232, y - 15);
    ctx.font = "14px Courier New";
    ctx.fillStyle = "rgba(255, 255, 0, 0.74)";
    ctx.fillText("keccak256(seed || searchSeed)", 8, 395);
  }

  function drawStars(ctx, width, height, elapsed) {
    ctx.fillStyle = "#000011";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#fff";
    for (var i = 0; i < 55; i += 1) {
      var x = (i * 73) % width;
      var y = ((i * 151) + Math.floor(elapsed * 12)) % height;
      var alpha = 0.35 + ((i % 7) / 10);
      ctx.globalAlpha = Math.min(alpha, 1);
      ctx.fillRect(x, y, i % 5 === 0 ? 2 : 1, i % 6 === 0 ? 2 : 1);
    }
    ctx.globalAlpha = 1;
  }

  function drawMoon(ctx, cx, cy, radius, elapsed) {
    var gradient = ctx.createRadialGradient(cx - 24, cy - 28, 12, cx, cy, radius);
    gradient.addColorStop(0, "#e1e1d8");
    gradient.addColorStop(0.55, "#8f938d");
    gradient.addColorStop(1, "#333743");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, PI_2);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, PI_2);
    ctx.clip();
    ctx.fillStyle = "rgba(20, 22, 26, 0.28)";
    for (var i = 0; i < 16; i += 1) {
      var angle = elapsed * 0.55 + i * 1.91;
      var r = 12 + (i % 5) * 12;
      var x = cx + Math.cos(angle) * r;
      var y = cy + Math.sin(angle * 0.7) * r * 0.55;
      ctx.beginPath();
      ctx.arc(x, y, 4 + (i % 4) * 2, 0, PI_2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawCandidateCat(canvas, catId) {
    var ctx = canvas.getContext("2d");
    clearCanvas(canvas);
    ctx.fillStyle = "#080824";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var bytes = hexToBytes(catId);
    var colors = ["#88ee88", "#bbffbb", "#f2f2f2", "#55aa55"];
    var pixel = 10;
    var ox = 35;
    var oy = 45;
    var body = [
      "0011111100",
      "0121111210",
      "1111111111",
      "1111111111",
      "1111111111",
      "0111111110",
      "0011001100",
      "0011001100"
    ];
    for (var y = 0; y < body.length; y += 1) {
      for (var x = 0; x < body[y].length; x += 1) {
        var value = Number(body[y][x]);
        if (!value) {
          continue;
        }
        ctx.fillStyle = colors[(value + bytes[(x + y) % bytes.length]) % colors.length];
        ctx.fillRect(ox + x * pixel, oy + y * pixel, pixel, pixel);
      }
    }
    ctx.fillStyle = "#202020";
    ctx.fillRect(ox + 30, oy + 30, pixel, pixel);
    ctx.fillRect(ox + 60, oy + 30, pixel, pixel);
  }

  function clearCanvas(canvas) {
    if (!canvas) {
      return;
    }
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  }

  function hashBytes(bytes, customKeccak) {
    return getKeccak(customKeccak)(bytes);
  }

  function getKeccak(customKeccak) {
    if (typeof customKeccak === "function") {
      return customKeccak;
    }
    if (global.keccak_256 && typeof global.keccak_256.array === "function") {
      return jsSha3Keccak256;
    }
    if (typeof global.keccak_256 === "function") {
      return global.keccak_256;
    }
    return keccak256Bytes;
  }

  function jsSha3Keccak256(bytes) {
    return "0x" + global.keccak_256(Array.from(bytes));
  }

  function randomSeed32() {
    var bytes = new Uint8Array(32);
    if (global.crypto && global.crypto.getRandomValues) {
      global.crypto.getRandomValues(bytes);
      return bytes;
    }
    for (var i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return bytes;
  }

  function normalizeKnownCatIds(value) {
    if (!value) {
      return null;
    }
    var set = value instanceof Set ? value : new Set(value);
    var normalized = new Set();
    set.forEach(function addCatId(catId) {
      if (typeof catId === "string") {
        normalized.add(catId.toLowerCase());
      }
    });
    return normalized;
  }

  function normalizeDifficultyPrefix(value) {
    if (typeof value !== "string") {
      throw new TypeError("difficultyPrefix must be a hex string");
    }
    var prefix = value.startsWith("0x") ? value.slice(2) : value;
    if (!/^[0-9a-fA-F]+$/.test(prefix)) {
      throw new Error("difficultyPrefix must contain only hex characters");
    }
    return prefix.toLowerCase();
  }

  function hexToBytes32(value, label) {
    var bytes = hexToBytes(value);
    if (bytes.length !== 32) {
      throw new Error(label + " must be 32 bytes");
    }
    return bytes;
  }

  function hexToBytes(value) {
    if (typeof value !== "string") {
      throw new TypeError("hex value must be a string");
    }
    var hex = value.startsWith("0x") ? value.slice(2) : value;
    if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2 !== 0) {
      throw new Error("invalid hex string");
    }
    var bytes = new Uint8Array(hex.length / 2);
    for (var i = 0; i < bytes.length; i += 1) {
      bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
  }

  function bytes32From(value, label) {
    if (typeof value === "string") {
      return hexToBytes32(value, label);
    }
    if (!value || typeof value.length !== "number" || value.length !== 32) {
      throw new Error(label + " must be 32 bytes");
    }
    return Uint8Array.from(value);
  }

  function concatBytes(a, b) {
    var out = new Uint8Array(a.length + b.length);
    out.set(a, 0);
    out.set(b, a.length);
    return out;
  }

  function normalizeHash(value) {
    if (typeof value === "string") {
      var hash = value.startsWith("0x") ? value : "0x" + value;
      if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) {
        throw new Error("keccak256 returned an invalid 32-byte hash hex string");
      }
      return hash.toLowerCase();
    }
    if (!value || typeof value.length !== "number" || value.length !== 32) {
      throw new Error("keccak256 must return 32 bytes or a 32-byte hash hex string");
    }
    return bytesToHex(value);
  }

  function bytesToHex(bytes) {
    return "0x" + Array.from(bytes, function toHex(byte) {
      return byte.toString(16).padStart(2, "0");
    }).join("");
  }

  function keccak256Bytes(bytes) {
    var state = new Array(25).fill(0n);
    var rate = 136;
    var padded = new Uint8Array(Math.ceil((bytes.length + 1) / rate) * rate || rate);
    padded.set(bytes);
    padded[bytes.length] = 0x01;
    padded[padded.length - 1] ^= 0x80;

    for (var offset = 0; offset < padded.length; offset += rate) {
      for (var i = 0; i < rate / 8; i += 1) {
        state[i] ^= readLane(padded, offset + i * 8);
      }
      keccakF1600(state);
    }

    var out = new Uint8Array(32);
    for (var j = 0; j < 4; j += 1) {
      writeLane(out, j * 8, state[j]);
    }
    return bytesToHex(out);
  }

  function readLane(bytes, offset) {
    var lane = 0n;
    for (var i = 0; i < 8; i += 1) {
      lane |= BigInt(bytes[offset + i]) << BigInt(8 * i);
    }
    return lane;
  }

  function writeLane(bytes, offset, lane) {
    for (var i = 0; i < 8; i += 1) {
      bytes[offset + i] = Number((lane >> BigInt(8 * i)) & 0xffn);
    }
  }

  function keccakF1600(state) {
    for (var round = 0; round < 24; round += 1) {
      var c = new Array(5);
      var d = new Array(5);
      for (var x = 0; x < 5; x += 1) {
        c[x] = state[x] ^ state[x + 5] ^ state[x + 10] ^ state[x + 15] ^ state[x + 20];
      }
      for (var dx = 0; dx < 5; dx += 1) {
        d[dx] = c[(dx + 4) % 5] ^ rotl64(c[(dx + 1) % 5], 1);
      }
      for (var tx = 0; tx < 5; tx += 1) {
        for (var ty = 0; ty < 5; ty += 1) {
          state[tx + 5 * ty] ^= d[tx];
        }
      }

      var b = new Array(25);
      for (var bx = 0; bx < 5; bx += 1) {
        for (var by = 0; by < 5; by += 1) {
          var from = bx + 5 * by;
          var toX = by;
          var toY = (2 * bx + 3 * by) % 5;
          b[toX + 5 * toY] = rotl64(state[from], ROTATION_OFFSETS[from]);
        }
      }

      for (var cx = 0; cx < 5; cx += 1) {
        for (var cy = 0; cy < 5; cy += 1) {
          state[cx + 5 * cy] =
            b[cx + 5 * cy] ^ ((~b[((cx + 1) % 5) + 5 * cy]) & b[((cx + 2) % 5) + 5 * cy]);
          state[cx + 5 * cy] &= MASK_64;
        }
      }
      state[0] ^= KECCAK_ROUNDS[round];
    }
  }

  function rotl64(value, shift) {
    var n = BigInt(shift);
    if (n === 0n) {
      return value & MASK_64;
    }
    return ((value << n) | (value >> (64n - n))) & MASK_64;
  }

  global.mountMoonCatRescueMiner = mountMoonCatRescueMiner;
  global.MoonCatRescueMiner = {
    ORIGINAL_SEARCH_SEED: ORIGINAL_SEARCH_SEED,
    ORIGINAL_DIFFICULTY_PREFIX: ORIGINAL_DIFFICULTY_PREFIX,
    DEMO_DIFFICULTY_PREFIX: DEMO_DIFFICULTY_PREFIX,
    mount: mountMoonCatRescueMiner,
    hashBytes: hashBytes,
    keccak256Bytes: keccak256Bytes
  };
})(typeof window !== "undefined" ? window : globalThis);
