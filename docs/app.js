/* Cashier Change: UI wiring. Depends on change.js (window.CashierChange). */
(function () {
  "use strict";

  var CC = window.CashierChange;
  var $ = function (id) { return document.getElementById(id); };

  var form = $("calc");
  var dueEl = $("due");
  var tenderedEl = $("tendered");
  var quickEl = $("quick");
  var resultEl = $("result");
  var errors = { due: $("due-error"), tendered: $("tendered-error") };

  var announceEl = $("announce");
  var EMPTY_HTML = resultEl.innerHTML;
  var announceTimer = 0;

  // Speak a short summary once typing pauses, not on every keystroke.
  function announce(text) {
    clearTimeout(announceTimer);
    announceTimer = setTimeout(function () { announceEl.textContent = text; }, 700);
  }

  function summary(r) {
    switch (r.status) {
      case "change":
        return "Change due " + CC.formatCents(r.change) + ": " +
          r.lines.map(function (l) { return l.count + " " + l.name; }).join(", ") + ".";
      case "exact": return "Exact payment. No change due.";
      case "short": return "Payment is short. Collect " + CC.formatCents(r.shortBy) + " more.";
      default: return "";
    }
  }
  var lastKey = "";

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function num(n) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // On small screens the result sits below the fold: bring it into view.
  function revealResult() {
    var rect = resultEl.getBoundingClientRect();
    if (rect.top > window.innerHeight - 120) {
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      resultEl.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  }

  function setError(field, msg) {
    var input = field === "due" ? dueEl : tenderedEl;
    errors[field].textContent = msg || "";
    input.parentNode.classList.toggle("is-invalid", !!msg);
    if (msg) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  }

  function renderQuick(dueCents, tenderedCents) {
    var options = CC.suggestTenders(dueCents);
    if (!options.length) {
      quickEl.hidden = true;
      quickEl.innerHTML = "";
      return;
    }
    quickEl.hidden = false;
    var html = '<button type="button" class="chip" data-cents="' + dueCents + '" aria-pressed="' +
      (tenderedCents === dueCents) + '">Exact</button>';
    html += options.map(function (c) {
      var label = CC.formatCents(c).replace(/\.00$/, "");
      return '<button type="button" class="chip" data-cents="' + c + '" aria-pressed="' +
        (tenderedCents === c) + '">' + label + "</button>";
    }).join("");
    quickEl.innerHTML = html;
  }

  function tileFor(d) {
    return '<span class="tile tile--' + d.kind + '" aria-hidden="true">' + esc(d.label) + "</span>";
  }

  function render() {
    var r = CC.calculate(dueEl.value, tenderedEl.value);

    var dueParsed = CC.parseCents(dueEl.value);
    var tenParsed = CC.parseCents(tenderedEl.value);
    setError("due", dueParsed !== null && isNaN(dueParsed) ? "Enter an amount like 13.27 (up to $1,000,000)." : "");
    setError("tendered", tenParsed !== null && isNaN(tenParsed) ? "Enter an amount like 20.00 (up to $1,000,000)." : "");
    renderQuick(isNaN(dueParsed) ? null : dueParsed, isNaN(tenParsed) ? null : tenParsed);

    // Skip re-rendering (and re-announcing) when nothing meaningful changed.
    var key = JSON.stringify([r.status, r.due, r.tendered]);
    if (key === lastKey) return;
    lastKey = key;

    var html;
    switch (r.status) {
      case "change":
        html =
          '<div class="card">' +
            '<p class="eyebrow">Change due</p>' +
            '<p class="amount">' + CC.formatCents(r.change) + "</p>" +
            '<p class="summary">' +
              "<span><b>" + num(r.bills) + "</b> " + (r.bills === 1 ? "bill" : "bills") + " · <b>" + num(r.coins) + "</b> " +
              (r.coins === 1 ? "coin" : "coins") + "</span>" +
              '<span class="sep" aria-hidden="true"></span>' +
              "<span>" + CC.formatCents(r.tendered) + " − " + CC.formatCents(r.due) + "</span>" +
            "</p>" +
            '<ul class="lines" aria-label="Change to hand back">' +
              r.lines.map(function (l) {
                return '<li class="line">' + tileFor(l.denomination) +
                  "<div><p class=\"line-name\">" +
                    '<span class="sr-only">' + num(l.count) + " </span>" + esc(cap(l.name)) + "</p>" +
                  '<p class="line-sub">' + (l.count > 1 ? num(l.count) + " × " + CC.formatCents(l.denomination.cents) + " = " : "") +
                    CC.formatCents(l.subtotal) + "</p></div>" +
                  '<span class="count" aria-hidden="true">×' + num(l.count) + "</span></li>";
              }).join("") +
            "</ul>" +
          "</div>";
        break;
      case "exact":
        html =
          '<div class="card card--mint">' +
            '<p class="eyebrow">Exact payment</p>' +
            '<p class="amount">$0.00</p>' +
            '<p class="status-note">No change due. The customer paid exactly ' + CC.formatCents(r.due) + ".</p>" +
          "</div>";
        break;
      case "short":
        html =
          '<div class="card card--short">' +
            '<p class="eyebrow">Still due</p>' +
            '<p class="amount">' + CC.formatCents(r.shortBy) + "</p>" +
            '<p class="status-note">' + CC.formatCents(r.tendered) + " doesn’t cover " + CC.formatCents(r.due) +
            ". Collect " + CC.formatCents(r.shortBy) + " more.</p>" +
          "</div>";
        break;
      default:
        html = EMPTY_HTML;
    }
    resultEl.innerHTML = html;
    announce(summary(r));
  }

  dueEl.addEventListener("input", render);
  tenderedEl.addEventListener("input", render);

  quickEl.addEventListener("click", function (e) {
    var btn = e.target.closest(".chip");
    if (!btn) return;
    tenderedEl.value = (Number(btn.dataset.cents) / 100).toFixed(2);
    render();
    revealResult();
  });

  // Tidy a valid value into 0.00 form when the field loses focus.
  [dueEl, tenderedEl].forEach(function (el) {
    el.addEventListener("blur", function () {
      var c = CC.parseCents(el.value);
      if (c !== null && !isNaN(c)) {
        el.value = (c / 100).toFixed(2);
        render();
      }
    });
  });

  // Enter moves from "due" to "received", then shows the result.
  // (A form with two fields and no submit button never submits implicitly.)
  function onEnter(e) {
    if (e.key !== "Enter" || e.isComposing) return;
    e.preventDefault();
    if (e.target === dueEl) {
      tenderedEl.focus();
    } else {
      e.target.blur();
      revealResult();
    }
  }
  dueEl.addEventListener("keydown", onEnter);
  tenderedEl.addEventListener("keydown", onEnter);
  form.addEventListener("submit", function (e) { e.preventDefault(); });

  form.addEventListener("reset", function () {
    setTimeout(function () {
      render();
      dueEl.focus();
    }, 0);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && (dueEl.value || tenderedEl.value)) {
      form.reset();
    }
  });

  // Prefill from the URL, e.g. ?due=13.27&tendered=20
  var params = new URLSearchParams(location.search);
  if (params.has("due")) dueEl.value = params.get("due");
  if (params.has("tendered")) tenderedEl.value = params.get("tendered");
  render();

  // ---------- PWA ----------
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () { /* offline support is optional */ });
    });
  }

  var deferredPrompt = null;
  var installBtn = $("install");
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.hidden = false;
  });
  installBtn.addEventListener("click", function () {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.finally(function () {
      deferredPrompt = null;
      installBtn.hidden = true;
    });
  });
  window.addEventListener("appinstalled", function () { installBtn.hidden = true; });
})();
