"use strict";

const state = {
  matrix: null,
  filters: { agent: "", model: "", effort: "", family: "" },
  color: "source_lines",
};

const debug = { codeFetches: 0, cellFetches: 0 };
window.modeltestsDebug = debug;

const CHECKS = [
  ["tests", "Tests"],
  ["readme", "README"],
  ["other_markdown", "Other notes"],
  ["package_json", "package.json"],
  ["lockfile", "Lockfile"],
  ["tsconfig", "tsconfig"],
  ["eslint", "ESLint"],
  ["prettier", "Prettier"],
  ["ci", "CI"],
  ["dockerfile", "Dockerfile"],
];

const PARTS = [
  ["input", "Input"],
  ["output", "Output"],
  ["cache_read", "Cache read"],
  ["cache_write", "Cache write"],
  ["reasoning", "Reasoning"],
];

function hasNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function formatTime(value) {
  if (!hasNumber(value)) return "not reported";
  if (value < 60) return value.toFixed(1) + "s";
  const minutes = Math.floor(value / 60);
  const seconds = Math.round(value % 60);
  return minutes + "m " + String(seconds).padStart(2, "0") + "s";
}

function formatTokens(value) {
  if (!hasNumber(value)) return "not reported";
  return Math.round(value).toLocaleString("en-US");
}

function formatCost(value) {
  if (!hasNumber(value)) return "not reported";
  return "$" + value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

function formatLines(value) {
  if (!hasNumber(value)) return "not reported";
  return value.toLocaleString("en-US");
}

function metricValue(day, name) {
  if (!day) return null;
  const value = day[name];
  return hasNumber(value) ? value : null;
}

function byDateDesc(left, right) {
  if (left.date === right.date) return left.slug < right.slug ? 1 : -1;
  return left.date < right.date ? 1 : -1;
}

function daysFor(variantId, suffixId) {
  return (state.matrix.cells || []).filter(function (day) {
    return day.variant_id === variantId && day.suffix_id === suffixId;
  });
}

function uniqueDays(days) {
  const chosen = new Map();
  days.slice().sort(byDateDesc).forEach(function (day) {
    const current = chosen.get(day.date);
    if (!current || (current.sample && !day.sample)) chosen.set(day.date, day);
  });
  return Array.from(chosen.values()).sort(byDateDesc);
}

function latestLive(days) {
  return uniqueDays(days).filter(function (day) { return !day.sample; })[0] || null;
}

function latestSample(days) {
  return uniqueDays(days).filter(function (day) { return day.sample; })[0] || null;
}

function displayDay(days) {
  return latestLive(days) || latestSample(days);
}

function visibleVariants() {
  return state.matrix.variants.filter(function (variant) {
    if (state.filters.agent && variant.agent !== state.filters.agent) return false;
    if (state.filters.model && variant.model !== state.filters.model) return false;
    if (state.filters.effort && variant.effort !== state.filters.effort) return false;
    return true;
  });
}

function visibleSuffixes() {
  return state.matrix.suffixes.filter(function (suffix) {
    return !state.filters.family || suffix.family === state.filters.family;
  });
}

function familyGroups(suffixes) {
  const groups = [];
  suffixes.forEach(function (suffix) {
    const last = groups[groups.length - 1];
    if (!last || last.family !== suffix.family) {
      groups.push({ family: suffix.family, suffixes: [suffix] });
    } else {
      last.suffixes.push(suffix);
    }
  });
  return groups;
}

function colorable(day) {
  return Boolean(day) && !day.sample && day.status !== "error" && metricValue(day, state.color) !== null;
}

function heatScale(pairs) {
  const values = [];
  pairs.forEach(function (pair) {
    if (colorable(pair.day)) values.push(metricValue(pair.day, state.color));
  });
  if (!values.length) return { min: 0, max: 0, on: false };
  return { min: Math.min.apply(null, values), max: Math.max.apply(null, values), on: true };
}

function heatFor(day, scale) {
  if (!scale.on || !colorable(day)) return null;
  const value = metricValue(day, state.color);
  if (scale.max === scale.min) return 0.28;
  return 0.12 + ((value - scale.min) / (scale.max - scale.min)) * 0.5;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function addChip(parent, text, kind) {
  parent.append(el("span", "chip " + kind, text));
}

function chipsFor(day) {
  const row = el("div", "chips");
  if (!day) return row;
  if (day.sample) addChip(row, "sample", "sample");
  if (day.stale) addChip(row, "stale", "stale");
  if (day.status === "timeout") addChip(row, "timeout", "timeout");
  if (day.status === "error") addChip(row, "error", "error");
  if (day.compile_status === "pass") addChip(row, "pass", "pass");
  else if (day.compile_status === "fail") addChip(row, "fail", "fail");
  else if (day.compile_status === "no-typescript") addChip(row, "no TypeScript", "neutral");
  else if (day.compile_status === "error") addChip(row, "compile error", "neutral");
  if (day.tests) addChip(row, "tests", "neutral");
  if (day.docs) addChip(row, "docs", "neutral");
  return row;
}

function metricLines(day) {
  const wrap = el("div", "metrics nums");
  [
    ["Time", formatTime(day.total_time_seconds)],
    ["Tokens", formatTokens(day.total_tokens)],
    ["Cost", formatCost(day.cost_usd)],
    ["Lines", formatLines(day.source_lines)],
  ].forEach(function (pair) {
    const line = el("p", "metric");
    line.append(el("span", "", pair[0] + " "));
    line.append(document.createTextNode(pair[1]));
    wrap.append(line);
  });
  return wrap;
}

function listed(cell, rel) {
  if (typeof rel !== "string" || rel === "") return false;
  if (rel.charAt(0) === "/" || rel.indexOf("\\") !== -1 || rel.split("/").indexOf("..") !== -1) return false;
  return (cell.files || []).some(function (file) { return file.path === rel; });
}

function codeUrl(slug, rel) {
  if (!rel || rel.charAt(0) === "/" || rel.indexOf("\\") !== -1 || rel.split("/").indexOf("..") !== -1) return null;
  const parts = rel.split("/").map(encodeURIComponent);
  if (parts.some(function (part) { return part === ""; })) return null;
  return "code/" + encodeURIComponent(slug) + "/" + parts.join("/");
}

function route() {
  const hash = location.hash || "#/matrix";
  if (hash === "#/" || hash === "#/matrix") return { name: "matrix" };
  if (hash === "#/table") return { name: "table" };
  if (hash.indexOf("#/cell/") === 0) {
    return { name: "cell", slug: decodeURIComponent(hash.slice("#/cell/".length)) };
  }
  return { name: "missing" };
}

function knownSlug(slug) {
  return (state.matrix.cells || []).some(function (day) { return day.slug === slug; });
}

function fillSelect(id, values) {
  const select = document.getElementById(id);
  select.replaceChildren();
  const all = el("option", "", "All");
  all.value = "";
  select.append(all);
  values.forEach(function (value) {
    const option = el("option", "", value);
    option.value = value;
    select.append(option);
  });
}

function uniqueValues(items, key) {
  const seen = [];
  items.forEach(function (item) {
    if (seen.indexOf(item[key]) === -1) seen.push(item[key]);
  });
  return seen;
}

function fillFilters() {
  fillSelect("filter-agent", uniqueValues(state.matrix.variants, "agent"));
  fillSelect("filter-model", uniqueValues(state.matrix.variants, "model"));
  fillSelect("filter-effort", uniqueValues(state.matrix.variants, "effort"));
  fillSelect("filter-family", uniqueValues(state.matrix.suffixes, "family"));
  document.getElementById("controls").hidden = false;
}

function visiblePairs() {
  const pairs = [];
  visibleVariants().forEach(function (variant) {
    visibleSuffixes().forEach(function (suffix) {
      pairs.push({
        variant: variant,
        suffix: suffix,
        day: displayDay(daysFor(variant.id, suffix.id)),
      });
    });
  });
  return pairs;
}

function renderStrip(pairs) {
  const strip = document.getElementById("strip");
  strip.replaceChildren();
  const complete = pairs
    .map(function (pair) { return pair.day; })
    .filter(function (day) { return day && !day.sample && !day.stale && day.status === "complete"; });
  if (!complete.length) {
    strip.append(el("p", "note", "No complete tests in this view. Totals add the newest live complete test of each visible cell. Samples are not included."));
    return;
  }
  let time = 0;
  let tokens = 0;
  let cost = 0;
  let timeCount = 0;
  let tokenCount = 0;
  let costCount = 0;
  let pass = 0;
  let fail = 0;
  let noTs = 0;
  complete.forEach(function (day) {
    if (hasNumber(day.total_time_seconds)) {
      time += day.total_time_seconds;
      timeCount += 1;
    }
    if (hasNumber(day.total_tokens)) {
      tokens += day.total_tokens;
      tokenCount += 1;
    }
    if (hasNumber(day.cost_usd)) {
      cost += day.cost_usd;
      costCount += 1;
    }
    if (day.compile_status === "pass") pass += 1;
    else if (day.compile_status === "fail") fail += 1;
    else if (day.compile_status === "no-typescript") noTs += 1;
  });
  strip.append(figure("Complete tests", String(complete.length)));
  strip.append(figure("Time", timeCount ? formatTime(time) : "not reported"));
  strip.append(figure("Tokens", tokenCount ? formatTokens(tokens) : "not reported"));
  strip.append(figure("Cost", costCount ? formatCost(cost) : "not reported"));
  strip.append(figure("Compile", pass + " compiled, " + fail + " failed, " + noTs + " had no TypeScript"));
  const notes = el("div");
  notes.append(el("p", "note", "Totals add the newest live complete test of each visible cell. Samples are not included. Compile time is not included in the test time."));
  if (tokenCount < complete.length) {
    notes.append(el("p", "note", "Token sum is partial: " + (complete.length - tokenCount) + " complete tests did not report tokens."));
  }
  if (costCount < complete.length) {
    notes.append(el("p", "note", "Cost sum is partial: " + (complete.length - costCount) + " complete tests did not report cost."));
  }
  if (timeCount < complete.length) {
    notes.append(el("p", "note", "Time sum is partial: " + (complete.length - timeCount) + " complete tests did not report time."));
  }
  strip.append(notes);
}

function figure(label, value) {
  const card = el("article");
  card.append(el("h2", "", label));
  card.append(el("p", "figure nums", value));
  return card;
}

function renderMatrix(pairs) {
  const suffixes = visibleSuffixes();
  const variants = visibleVariants();
  const scale = heatScale(pairs);
  const wrap = el("div", "matrix-wrap");
  const table = document.createElement("table");
  const head = document.createElement("thead");
  const groups = familyGroups(suffixes);
  const familyRow = document.createElement("tr");
  const corner = el("th", "sticky", "Agent");
  corner.rowSpan = 2;
  familyRow.append(corner);
  groups.forEach(function (group) {
    const cell = el("th", "family", group.family);
    cell.colSpan = group.suffixes.length;
    familyRow.append(cell);
  });
  const labelRow = document.createElement("tr");
  suffixes.forEach(function (suffix) {
    labelRow.append(el("th", "", suffix.label));
  });
  head.append(familyRow, labelRow);
  const body = document.createElement("tbody");
  variants.forEach(function (variant) {
    const row = document.createElement("tr");
    const title = el("th", "sticky");
    title.append(el("span", "agent", variant.label));
    title.append(el("span", "model", variant.model));
    title.append(el("span", "effort", variant.effort));
    row.append(title);
    suffixes.forEach(function (suffix) {
      const day = displayDay(daysFor(variant.id, suffix.id));
      const cell = el("td", "cell");
      const heat = heatFor(day, scale);
      if (heat !== null) cell.style.setProperty("--heat", String(heat));
      if (heat !== null) cell.classList.add("heat");
      if (!day) {
        cell.append(el("p", "metric", "not run"));
      } else {
        const link = document.createElement("a");
        link.href = "#/cell/" + encodeURIComponent(day.slug);
        link.append(metricLines(day), chipsFor(day));
        cell.append(link);
      }
      row.append(cell);
    });
    body.append(row);
  });
  table.append(head, body);
  wrap.append(table);
  return wrap;
}

function renderTable(pairs) {
  const table = document.createElement("table");
  const head = document.createElement("tr");
  ["Agent", "Model", "Effort", "Suffix", "Time", "Tokens", "Cost", "Lines", "Compile", "Status"].forEach(function (label) {
    head.append(el("th", "", label));
  });
  table.append(head);
  pairs.forEach(function (pair) {
    const row = document.createElement("tr");
    const day = pair.day;
    const values = [
      pair.variant.label,
      pair.variant.model,
      pair.variant.effort,
      pair.suffix.label,
    ];
    values.forEach(function (value) { row.append(el("td", "", value)); });
    if (!day) {
      ["not run", "not run", "not run", "not run", "", "not run"].forEach(function (value) {
        row.append(el("td", "nums", value));
      });
    } else {
      const link = document.createElement("a");
      link.href = "#/cell/" + encodeURIComponent(day.slug);
      link.textContent = formatTime(day.total_time_seconds);
      const timeCell = el("td", "nums");
      timeCell.append(link);
      row.append(timeCell);
      [formatTokens(day.total_tokens), formatCost(day.cost_usd), formatLines(day.source_lines), day.compile_status || "not reported"].forEach(function (value) {
        row.append(el("td", "nums", value));
      });
      const status = el("td");
      status.append(chipsFor(day));
      row.append(status);
    }
    table.append(row);
  });
  return table;
}

function previousOfKind(days, current) {
  return uniqueDays(days).filter(function (day) {
    return day.sample === current.sample && day.date < current.date;
  })[0] || null;
}

function renderDays(cell) {
  const section = el("section");
  section.append(el("h2", "", "Published days"));
  const list = el("ol", "days");
  uniqueDays(daysFor(cell.variant_id, cell.suffix_id)).forEach(function (day) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = "#/cell/" + encodeURIComponent(day.slug);
    if (day.slug === cell.slug) link.setAttribute("aria-current", "page");
    const kind = day.sample ? "sample" : "live";
    link.textContent = day.date + " " + kind + " · " + formatLines(day.source_lines) + " lines · " + (day.compile_status || "not reported");
    item.append(link);
    list.append(item);
  });
  section.append(list);
  const previous = previousOfKind(daysFor(cell.variant_id, cell.suffix_id), cell);
  if (previous && hasNumber(cell.source_lines) && hasNumber(previous.source_lines)) {
    const delta = cell.source_lines - previous.source_lines;
    const sign = delta > 0 ? "+" : "";
    section.append(el("p", "", "Source lines " + sign + delta + " since " + previous.date + " (" + (previous.compile_status || "not reported") + ")."));
  } else if (previous) {
    section.append(el("p", "", "Previous " + previous.date + " compiled as " + (previous.compile_status || "not reported") + "."));
  }
  return section;
}

function renderFiles(cell) {
  const section = el("section");
  section.append(el("h2", "", "Files"));
  const list = el("ul", "tree");
  (cell.files || []).forEach(function (file) {
    const item = document.createElement("li");
    if (file.text && listed(cell, file.path)) {
      const button = document.createElement("button");
      button.className = "linkish";
      button.type = "button";
      button.textContent = file.path;
      button.addEventListener("click", function () { openFile(cell, file); });
      item.append(button);
    } else {
      item.append(el("span", "binary", file.path + (file.text ? "" : " · binary")));
    }
    list.append(item);
  });
  section.append(list);
  const omitted = cell.omitted || {};
  ["size", "symlink", "secret", "web", "count"].forEach(function (key) {
    if (omitted[key]) section.append(el("p", "", omitted[key] + " omitted (" + key + "). Names of omitted secret files are not shown."));
  });
  section.append(el("div", "", ""));
  const view = el("div");
  view.id = "file-view";
  section.append(view);
  return section;
}

async function openFile(cell, file) {
  const slot = document.getElementById("file-view");
  if (!slot) return;
  slot.replaceChildren();
  slot.append(el("h3", "", file.path));
  if (!file.text || !listed(cell, file.path)) {
    slot.append(el("p", "", "Binary file. It is not shown."));
    return;
  }
  const url = codeUrl(cell.slug, file.path);
  if (!url) return;
  debug.codeFetches += 1;
  const response = await fetch(url, { cache: "no-store" });
  const pre = document.createElement("pre");
  pre.textContent = await response.text();
  slot.append(pre);
}

function renderDetail(cell) {
  const view = el("article");
  const title = el("h2", "", cell.label + ", model " + cell.model + ", effort " + cell.effort);
  view.append(title);
  view.append(el("p", "", (cell.suffix_label || cell.suffix_id) + " · " + cell.slug));
  const cards = el("div", "cards");
  cards.append(figure("Time", formatTime(cell.total_time_seconds)));
  const tokens = figure("Tokens", formatTokens(cell.total_tokens));
  const source = cell.total_tokens_source === "summed_parts"
    ? "Sum of reported parts"
    : cell.total_tokens_source === "cli"
      ? "CLI total"
      : "not reported";
  tokens.append(el("p", "", source));
  const partList = document.createElement("ul");
  PARTS.forEach(function (pair) {
    const value = (cell.token_parts || {})[pair[0]];
    if (!hasNumber(value)) return;
    partList.append(el("li", "nums", pair[1] + " " + formatTokens(value)));
  });
  tokens.append(partList);
  cards.append(tokens);
  cards.append(figure("Cost", formatCost(cell.cost_usd)));
  const compile = figure("Compile", cell.compile_status || "not reported");
  compile.append(el("p", "", "TypeScript " + (cell.typescript_version || "not reported")));
  compile.append(el("p", "nums", (cell.compile_error_count || 0) + " errors"));
  compile.append(el("p", "nums", "Compile time " + formatTime(cell.compile_seconds) + ". This is not included in the test time."));
  const options = document.createElement("ul");
  (cell.compiler_options || []).forEach(function (option) {
    options.append(el("li", "", option));
  });
  compile.append(options);
  if ((cell.diagnostics || []).length) {
    const diagnostics = document.createElement("pre");
    diagnostics.textContent = cell.diagnostics.join("\n");
    compile.append(diagnostics);
  }
  cards.append(compile);
  view.append(cards);
  if (cell.reported_model && cell.reported_model !== cell.model) {
    view.append(el("p", "", "The CLI reported model " + cell.reported_model + "."));
  }
  if (cell.global_rules_present) {
    view.append(el("p", "", "A global rules file was present on the machine that ran this test."));
  }
  view.append(el("h2", "", "Prompt"));
  const prompt = document.createElement("pre");
  prompt.textContent = cell.prompt || "";
  view.append(prompt);
  view.append(el("p", "nums", "Turns " + (hasNumber(cell.turn_count) ? formatTokens(cell.turn_count) : "not reported") + ". Final text " + (hasNumber(cell.final_text_chars) ? formatTokens(cell.final_text_chars) : "not reported") + " characters."));
  const finalWrap = document.createElement("details");
  finalWrap.append(el("summary", "", "Final text"));
  const finalText = document.createElement("pre");
  finalText.textContent = cell.final_text || "";
  finalWrap.append(finalText);
  view.append(finalWrap);
  view.append(el("h2", "", "Shape"));
  const dirs = (cell.top_dirs || []).join(", ") || "None";
  view.append(el("p", "", "Top-level directories: " + dirs));
  view.append(el("p", "", "Names found: " + ((cell.names_found || []).join(", ") || "None") + ". These names are not proof that the architecture was followed."));
  view.append(el("p", "", "Contract imports: " + ((cell.imports || []).join(", ") || "None")));
  view.append(renderDays(cell));
  view.append(el("h2", "", "Included"));
  const checklist = el("ul", "checklist");
  const marks = cell.checklist || {};
  CHECKS.forEach(function (pair) {
    checklist.append(el("li", "", pair[1] + ": " + (marks[pair[0]] ? "included" : "not included")));
  });
  view.append(checklist);
  if (cell.error_text) view.append(el("pre", "", cell.error_text));
  view.append(renderFiles(cell));
  return view;
}

function showMessage(title, text) {
  const box = el("section", "empty");
  box.append(el("h2", "", title));
  box.append(el("p", "", text));
  return box;
}

async function render() {
  const view = document.getElementById("view");
  const current = route();
  document.getElementById("nav-matrix").removeAttribute("aria-current");
  document.getElementById("nav-table").removeAttribute("aria-current");
  if (!state.matrix) {
    document.getElementById("strip").replaceChildren();
    view.replaceChildren(showMessage("No results yet", "The results file could not be loaded."));
    return;
  }
  const variants = state.matrix.variants || [];
  const suffixes = state.matrix.suffixes || [];
  if (!variants.length || !suffixes.length) {
    document.getElementById("strip").replaceChildren();
    view.replaceChildren(showMessage("No cells are published", "The matrix has no cells. Enable a variant and a suffix, then publish."));
    return;
  }
  document.getElementById("task").textContent = state.matrix.task_text || "";
  document.getElementById("constraints").textContent = state.matrix.constraints || "";
  const pairs = visiblePairs();
  renderStrip(pairs);
  if (!(state.matrix.cells || []).length) {
    view.replaceChildren(showMessage("No results are published yet", "Every cell says not run until a result is published."));
    view.append(renderMatrix(pairs));
    document.getElementById("nav-matrix").setAttribute("aria-current", "page");
    return;
  }
  if (current.name === "table") {
    document.getElementById("nav-table").setAttribute("aria-current", "page");
    view.replaceChildren(renderTable(pairs));
    return;
  }
  if (current.name === "cell") {
    if (!knownSlug(current.slug)) {
      view.replaceChildren(showMessage("Not found", "This result was not found."));
      return;
    }
    debug.cellFetches += 1;
    const response = await fetch("data/cells/" + encodeURIComponent(current.slug) + ".json", { cache: "no-store" });
    if (!response.ok) {
      view.replaceChildren(showMessage("Not found", "This result was not found."));
      return;
    }
    view.replaceChildren(renderDetail(await response.json()));
    return;
  }
  if (current.name === "missing") {
    view.replaceChildren(showMessage("Not found", "This result was not found."));
    return;
  }
  document.getElementById("nav-matrix").setAttribute("aria-current", "page");
  view.replaceChildren(renderMatrix(pairs));
}

function bind() {
  ["agent", "model", "effort", "family"].forEach(function (name) {
    document.getElementById("filter-" + name).addEventListener("change", function (event) {
      state.filters[name] = event.target.value;
      render();
    });
  });
  document.getElementById("color-metric").addEventListener("change", function (event) {
    state.color = event.target.value;
    render();
  });
  window.addEventListener("hashchange", function () { render(); });
}

async function init() {
  bind();
  try {
    const response = await fetch("data/matrix.json", { cache: "no-store" });
    if (!response.ok) throw new Error("missing");
    state.matrix = await response.json();
    fillFilters();
  } catch (error) {
    state.matrix = null;
  }
  render();
}

init();
