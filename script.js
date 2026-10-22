(() => {
  "use strict";

  const examples = {
    apps: [
      { icon: "A", name: "Atlas Notes", detail: "Sample app · local example", match: "atlas notes notes app" },
      { icon: "C", name: "Canvas Studio", detail: "Sample app · local example", match: "canvas studio design" },
      { icon: "T", name: "Terminal", detail: "Sample app · local example", match: "terminal shell console" },
      { icon: "M", name: "Music Player", detail: "Sample app · local example", match: "music player audio" }
    ],
    files: [
      { icon: "PDF", name: "invoice-april.pdf", detail: "Example document · not on your device", match: "invoice april pdf document" },
      { icon: "TXT", name: "project-notes.txt", detail: "Example document · not on your device", match: "project notes txt" },
      { icon: "CSV", name: "monthly-budget.csv", detail: "Example document · not on your device", match: "monthly budget csv" }
    ],
    web: [
      { icon: "↗", name: "Search the web for “Rust desktop apps”", detail: "Preview only · no search will open", match: "rust desktop apps search web" },
      { icon: "↗", name: "Search the web for “keyboard workflow”", detail: "Preview only · no search will open", match: "keyboard workflow search web" },
      { icon: "↗", name: "Search the web for “Windows launcher”", detail: "Preview only · no search will open", match: "windows launcher search web" }
    ],
    system: [
      { icon: ">", name: "Lock screen", detail: "Safe example · not executed", match: "lock screen system" },
      { icon: ">", name: "Open Settings", detail: "Safe example · not executed", match: "open settings system" },
      { icon: ">", name: "Show system information", detail: "Safe example · not executed", match: "system information system" }
    ]
  };

  const modeInfo = {
    apps: { caption: "SUGGESTED APPS", placeholder: "Find an app…", mark: "›" },
    files: { caption: "SAMPLE FILES", placeholder: "Try “invoice”…", mark: ":" },
    calc: { caption: "SAFE CALCULATOR", placeholder: "Try (12+3)*2…", mark: "=" },
    web: { caption: "WEB SEARCH PREVIEW", placeholder: "What would you search?…", mark: "?" },
    system: { caption: "SYSTEM ACTION EXAMPLES", placeholder: "Type a safe example…", mark: ">" }
  };

  const input = document.getElementById("demo-query");
  const resultList = document.getElementById("demo-results");
  const status = document.getElementById("demo-status");
  const count = document.getElementById("result-count");
  const caption = document.getElementById("mode-caption");
  const mark = document.getElementById("query-mark");
  const tabs = Array.from(document.querySelectorAll(".mode-tab"));
  const themeToggle = document.getElementById("theme-toggle");
  const themeLabel = document.getElementById("theme-label");
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");

  if (!input || !resultList || !status) return;

  let mode = "apps";
  let selectedIndex = -1;
  let visibleItems = [];

  function getItems() {
    const raw = input.value.slice(0, 96).trim();
    const query = raw.toLowerCase();

    if (mode === "calc") {
      if (!raw) return [];
      const calculated = calculateExpression(raw);
      if (calculated === null) return [];
      return [{ icon: "=", name: `${raw} = ${formatNumber(calculated)}`, detail: "Calculated in this page · no code execution", match: "" }];
    }

    if (!query) return examples[mode] || [];
    return (examples[mode] || []).filter((item) =>
      `${item.name} ${item.detail} ${item.match}`.toLowerCase().includes(query)
    );
  }

  function render() {
    const config = modeInfo[mode];
    input.placeholder = config.placeholder;
    mark.textContent = config.mark;
    caption.textContent = config.caption;
    visibleItems = getItems();
    selectedIndex = visibleItems.length ? Math.min(Math.max(selectedIndex, 0), visibleItems.length - 1) : -1;
    resultList.replaceChildren();
    count.textContent = `${visibleItems.length} ${visibleItems.length === 1 ? "EXAMPLE" : "EXAMPLES"}`;

    if (!visibleItems.length) {
      const empty = document.createElement("div");
      empty.className = "demo-result";
      empty.setAttribute("role", "option");
      empty.setAttribute("aria-selected", "false");
      const copy = document.createElement("span");
      copy.className = "result-copy";
      const title = document.createElement("strong");
      const detail = document.createElement("span");
      if (mode === "calc" && input.value.trim()) {
        title.textContent = "That expression isn’t supported";
        detail.textContent = "Use numbers, parentheses, +, −, ×, ÷ or %.";
      } else {
        title.textContent = "No matching examples";
        detail.textContent = "Try another short query, or switch modes.";
      }
      copy.append(title, detail);
      empty.append(copy);
      resultList.append(empty);
      return;
    }

    visibleItems.forEach((item, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "demo-result";
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", String(index === selectedIndex));
      button.dataset.index = String(index);

      const icon = document.createElement("span");
      icon.className = "result-icon";
      icon.textContent = item.icon;

      const copy = document.createElement("span");
      copy.className = "result-copy";
      const title = document.createElement("strong");
      title.textContent = item.name;
      const detail = document.createElement("span");
      detail.textContent = item.detail;
      copy.append(title, detail);

      const tail = document.createElement("span");
      tail.className = "result-tail";
      tail.textContent = "↵";
      button.append(icon, copy, tail);
      button.addEventListener("click", () => previewItem(index));
      resultList.append(button);
    });
  }

  function previewItem(index) {
    if (!visibleItems[index]) return;
    selectedIndex = index;
    render();
    status.textContent = `Preview: ${visibleItems[index].name}. This website demo does not launch, search, or execute anything.`;
  }

  function setMode(nextMode) {
    if (!modeInfo[nextMode]) return;
    mode = nextMode;
    selectedIndex = -1;
    status.textContent = "Website demo only — nothing is launched or searched.";
    tabs.forEach((tab) => tab.setAttribute("aria-pressed", String(tab.dataset.mode === mode)));
    input.value = "";
    render();
    input.focus();
  }

  function calculateExpression(source) {
    if (source.length > 64 || !/^[\d\s()+\-*/%.]+$/.test(source)) return null;
    const tokens = source.match(/\d+(?:\.\d+)?|[()+\-*/%]/g);
    if (!tokens || tokens.join("").length !== source.replace(/\s/g, "").length) return null;
    let cursor = 0;

    function parsePrimary() {
      const token = tokens[cursor];
      if (token === "+" || token === "-") {
        cursor += 1;
        const value = parsePrimary();
        return value === null ? null : token === "-" ? -value : value;
      }
      if (token === "(") {
        cursor += 1;
        const value = parseExpression();
        if (tokens[cursor] !== ")") return null;
        cursor += 1;
        return value;
      }
      if (token && /^\d/.test(token)) {
        cursor += 1;
        return Number(token);
      }
      return null;
    }

    function parseTerm() {
      let value = parsePrimary();
      if (value === null) return null;
      while (tokens[cursor] === "*" || tokens[cursor] === "/" || tokens[cursor] === "%") {
        const operator = tokens[cursor++];
        const right = parsePrimary();
        if (right === null || ((operator === "/" || operator === "%") && right === 0)) return null;
        if (operator === "*") value *= right;
        if (operator === "/") value /= right;
        if (operator === "%") value %= right;
      }
      return Number.isFinite(value) ? value : null;
    }

    function parseExpression() {
      let value = parseTerm();
      if (value === null) return null;
      while (tokens[cursor] === "+" || tokens[cursor] === "-") {
        const operator = tokens[cursor++];
        const right = parseTerm();
        if (right === null) return null;
        value = operator === "+" ? value + right : value - right;
      }
      return Number.isFinite(value) ? value : null;
    }

    const result = parseExpression();
    return result !== null && cursor === tokens.length ? result : null;
  }

  function formatNumber(number) {
    return String(Number(number.toPrecision(10)));
  }

  tabs.forEach((tab) => tab.addEventListener("click", () => setMode(tab.dataset.mode)));
  input.addEventListener("input", () => {
    selectedIndex = 0;
    status.textContent = "Website demo only — nothing is launched or searched.";
    render();
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (visibleItems.length) {
        const direction = event.key === "ArrowDown" ? 1 : -1;
        selectedIndex = (selectedIndex + direction + visibleItems.length) % visibleItems.length;
        render();
      }
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (visibleItems.length) previewItem(selectedIndex < 0 ? 0 : selectedIndex);
    } else if (event.key === "Escape") {
      event.preventDefault();
      input.value = "";
      selectedIndex = -1;
      status.textContent = "Selection cleared. Website demo only.";
      render();
    }
  });

  function setTheme(theme) {
    const graphite = theme === "graphite";
    document.documentElement.dataset.theme = graphite ? "graphite" : "pearl";
    themeLabel.textContent = graphite ? "Graphite" : "Pearl";
    themeToggle.setAttribute("aria-label", `Switch to ${graphite ? "Pearl" : "Graphite"} theme`);
    document.querySelector('meta[name="theme-color"]').setAttribute("content", graphite ? "#151922" : "#f2f0e9");
    try { localStorage.setItem("throw-site-theme", graphite ? "graphite" : "pearl"); } catch { /* Storage may be unavailable. */ }
  }

  let savedTheme = "pearl";
  try {
    const stored = localStorage.getItem("throw-site-theme");
    if (stored === "graphite" || stored === "pearl") savedTheme = stored;
  } catch { /* Storage may be unavailable. */ }
  setTheme(savedTheme);
  themeToggle.addEventListener("click", () => {
    setTheme(document.documentElement.dataset.theme === "pearl" ? "graphite" : "pearl");
  });

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
    navLinks.classList.toggle("is-open", !isOpen);
  });
  navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    navLinks.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
  }));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navLinks.classList.contains("is-open")) {
      navLinks.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation menu");
      menuToggle.focus();
    }
  });

  render();
})();
