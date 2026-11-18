"use strict";
/* Contact function survey: static page. Answers: localStorage (resume), POST to a Google Apps Script web app (no-cors) after every question and once more as a whole at the end, JSON download as a backup. */
const SUBMIT_URL = "PASTE_APPS_SCRIPT_WEB_APP_URL_HERE";      // <- replace with the /exec URL of the deployed web app (see DEPLOY_zh.md)
const STORE = "cfs_v1";
const FUNCS = ["support", "brace", "rest", "manipulate", "incidental", "unclear"];
const NEEDS = ["yes", "no", "unsure"];
const T = {
  zh: {
    title: "接触功能问卷", lang: "English", guide: "查看说明", dl: "下载我的答案 JSON",
    lede: "每一题给出一段人物动作里的一次接触：被标红的身体部位，和物体上与它接近的部位（橙色）。请判断这次接触在这个动作里起什么作用，以及这次接触对完成这个动作是否必要。没有标准答案，按你看到的判断即可；拿不准就选“不确定”。大约需要 30–40 分钟，可以随时关闭页面，进度保存在本机浏览器里，回来后点“继续”。",
    defsH: "六种作用和“是否必要”的含义",
    defs: [["支撑 Support", "身体的一部分重量压在物体上：坐在座面上、向后靠在靠背上并把重量交给它、用手撑扶手或台面把身体撑住、踩在踏板上。"],
           ["撑扶 Brace", "动作过渡中用来保持平衡或借力，不长时间承重：坐下时手扶一下座面，起身时手推扶手。"],
           ["搭靠 Rest", "放松地搭着，几乎不承重：前臂搭在扶手上，手放在桌面上。"],
           ["操作 Manipulate", "抓住并移动、搬运、拉、推或调整物体：搬箱子、拖椅子、扶正凳子。"],
           ["偶然 Incidental", "无意的轻碰、擦过，对动作没有作用：小腿碰到椅子前沿，手背蹭到桌边。"],
           ["不确定 Unsure", "图里看不出真的有接触，高亮的不是真正接触的部位，或者你无法判断。"],
           ["必要 Necessary", "没有这次接触，这个动作就没法用同样的方式完成（例如坐下时臀部和座面的接触）。"],
           ["不必要 Not necessary", "去掉这次接触，动作基本不受影响，换个自然的姿势就行（例如手臂搭在扶手上）。"]],
    exH: "示例（只是说明题目怎么看，不是你要回答的题）",
    ex1: "示例 1：红色是臀部/大腿，物体上橙色是座面。人从弯腰到坐下，重量落在座面上。作用 = 支撑，必要 = 是。",
    ex2: "示例 2：红色是手臂（含手），人抓着箱子并搬动。作用 = 操作，必要 = 是。",
    ex3: "另外几个例子：手臂放松地搭在扶手上、前臂不用力 → 搭靠，不必要；坐下时手扶一下座面再松开 → 撑扶，通常不必要；走过时小腿蹭到椅子边 → 偶然，不必要。上面的图每题都是：上排斜前方、下排侧面，三列依次是这段接触的开始、中间、结束。",
    nameL: "你的名字或代号（用来区分不同的人，不需要真名）", start: "开始", resume: "继续上次的进度", restart: "重新开始（清除本机进度）",
    privacy: "页面会把你的代号、每题的选择和用时发送到项目的表格里；不收集其他信息。",
    what: (g, r) => `<em>${g}</em> 与物体的 <em>${r}</em> 接触`, when: (a, b, c) => `时间 ${a}–${b} s（整段 ${c} s）`, cap: "上：斜前方；下：侧面。三列：这段接触的开始、中间、结束。来源序列：",
    leg1: "红色 = 接触的身体部位", leg2: "橙色 = 此刻物体上离该部位 3 cm 以内的区域（没有橙色表示此刻不到 3 cm）",
    q1: "1. 这次接触的作用", q2: "2. 这次接触对完成这个动作是否必要",
    fo: { support: ["支撑", "重量压在物体上"], brace: ["撑扶", "过渡中扶、推、借力"], rest: ["搭靠", "放松搭着，几乎不承重"], manipulate: ["操作", "抓住并移动物体"], incidental: ["偶然", "无意碰到，没有作用"], unclear: ["不确定", "看不出接触 / 拿不准"] },
    no: { yes: ["必要", "没有它动作做不成"], no: ["不必要", "去掉也能自然完成"], unsure: ["不确定", "信息不够"] },
    prev: "← 上一题", next: "下一题 →", nextLast: "完成", pos: (k, n) => `第 ${k} / ${n} 题`, saved: "已保存", pickBoth: "请选择作用和是否必要",
    endH: "全部完成", endP: "谢谢！请点“整卷提交”把全部答案再提交一次（每题其实已经提交过），并建议同时下载一份 JSON 留底。", final: "整卷提交", back: "回到最后一题", finalOk: "已提交（浏览器无法确认服务器是否收到，请保留下载的 JSON）。", finalNoUrl: "提交地址尚未配置：答案只保存在本机，请下载 JSON 发给负责人。",
    foot: "本页面只在你的浏览器里保存进度；“下载我的答案 JSON”可随时导出。"
  },
  en: {
    title: "Contact function survey", lang: "中文", guide: "Instructions", dl: "Download my answers (JSON)",
    lede: "Each question shows one contact in a person's motion: a highlighted body part (red) and the part of the object that is close to it (amber). Please judge what role the contact plays in the motion and whether it is necessary for doing the motion. There is no official answer; answer from what you see, and choose “Unsure” when you cannot tell. It takes about 30–40 minutes. You can close the page at any time: progress is kept in this browser, press “Resume” when you come back.",
    defsH: "The six roles and what “necessary” means",
    defs: [["Support", "Part of the body weight is carried by the object: sitting on a seat, leaning back with weight on a backrest, pushing on an armrest or a table top to hold the body up, standing on a step."],
           ["Brace", "Steadying or levering during a transition, not a long-lasting load: a hand steadying on the seat while sitting down, pushing off an armrest when standing up."],
           ["Rest", "A relaxed resting, almost no weight: a forearm laid on an armrest, a hand lying on a table."],
           ["Manipulate", "Grasping and moving, carrying, pulling, pushing or adjusting the object: carrying a box, dragging a chair, setting a stool upright."],
           ["Incidental", "An unintended light touch or brush with no role in the motion: a shin touching the front edge of a chair, the back of a hand brushing a table edge."],
           ["Unsure", "No real contact can be seen, the highlighted part is not what touches, or you cannot judge."],
           ["Necessary", "Without this contact the motion could not be done the same way (e.g. hips on the seat when sitting down)."],
           ["Not necessary", "Without this contact the motion would hardly change; the person would just use another natural pose (e.g. an arm resting on an armrest)."]],
    exH: "Examples (to show how to read a question, not questions to answer)",
    ex1: "Example 1: red = hips / thighs, amber = the seat. The person bends down and sits; the weight ends up on the seat. Role = Support, Necessary = yes.",
    ex2: "Example 2: red = arm (incl. hand); the person grips and carries the box. Role = Manipulate, Necessary = yes.",
    ex3: "More examples: an arm lying relaxed on an armrest → Rest, not necessary; a hand steadying on the seat while sitting down, then released → Brace, usually not necessary; a shin brushing a chair edge while walking past → Incidental, not necessary. In every picture the top row is seen obliquely from the front and the bottom row from the side; the three columns are the start, middle and end of the contact.",
    nameL: "Your name or a code (to tell people apart; no real name needed)", start: "Start", resume: "Resume where I left off", restart: "Start over (clear local progress)",
    privacy: "The page sends your code, your choice for each question and the time spent to the project's spreadsheet; nothing else is collected.",
    what: (g, r) => `<em>${g}</em> touching the <em>${r}</em>`, when: (a, b, c) => `time ${a}–${b} s (clip ${c} s)`, cap: "Top: oblique front; bottom: side. Three columns: start, middle and end of the contact. Source sequence: ",
    leg1: "red = the touching body part", leg2: "amber = the region of the object within 3 cm of that part at that moment (none = farther than 3 cm at that moment)",
    q1: "1. Role of this contact", q2: "2. Is this contact necessary for doing the motion?",
    fo: { support: ["Support", "weight on the object"], brace: ["Brace", "steadying / levering in a transition"], rest: ["Rest", "relaxed, almost no weight"], manipulate: ["Manipulate", "grasp and move the object"], incidental: ["Incidental", "unintended touch, no role"], unclear: ["Unsure", "no real contact / cannot tell"] },
    no: { yes: ["Necessary", "the motion fails without it"], no: ["Not necessary", "natural alternative exists"], unsure: ["Unsure", "not enough information"] },
    prev: "← Previous", next: "Next →", nextLast: "Finish", pos: (k, n) => `Question ${k} / ${n}`, saved: "saved", pickBoth: "choose a role and necessity",
    endH: "All done", endP: "Thank you! Press “Submit all” to submit the whole set once more (every answer was already sent), and please also download a JSON copy.", final: "Submit all", back: "Back to the last question", finalOk: "Submitted (the browser cannot confirm that the server received it, so keep the downloaded JSON).", finalNoUrl: "The submit address is not configured yet: answers are stored only in this browser, please download the JSON and send it to the organiser.",
    foot: "Progress is kept only in your browser; “Download my answers (JSON)” exports it at any time."
  }
};
const $ = (id) => document.getElementById(id);
let lang = (navigator.language || "zh").toLowerCase().startsWith("zh") ? "zh" : "en";
let ITEMS = [], S = null, shownAt = 0;
function load() { try { return JSON.parse(localStorage.getItem(STORE) || "null"); } catch (e) { return null; } }
function save() { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) { /* private mode: keep going in memory */ } }
function uuid() { const a = new Uint8Array(16); (crypto || window.msCrypto).getRandomValues(a); return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join(""); }
function shuffle(arr) { const a = arr.slice(), r = new Uint32Array(a.length); crypto.getRandomValues(r); for (let i = a.length - 1; i > 0; i--) { const j = r[i] % (i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function post(obj) {
  if (!SUBMIT_URL || SUBMIT_URL.startsWith("PASTE_")) return false;
  try { fetch(SUBMIT_URL, { method: "POST", mode: "no-cors", keepalive: true, headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(obj) }).catch(() => {}); return true; } catch (e) { return false; }
}
function applyLang() {
  const t = T[lang]; document.documentElement.lang = lang === "zh" ? "zh" : "en";
  $("t-title").textContent = t.title; $("btn-lang").textContent = t.lang; $("btn-guide").textContent = t.guide; $("btn-dl").textContent = t.dl; $("btn-dl2").textContent = t.dl;
  $("t-lede").textContent = t.lede; $("t-ex-h").textContent = t.exH; $("t-ex1").textContent = t.ex1; $("t-ex2").textContent = t.ex2; $("t-ex3").textContent = t.ex3;
  $("t-name-l").textContent = t.nameL; $("btn-start").textContent = t.start; $("btn-resume").textContent = t.resume; $("btn-restart").textContent = t.restart; $("t-privacy").textContent = t.privacy;
  const d = $("t-defs"); d.textContent = ""; const h = document.createElement("h2"); h.textContent = t.defsH; d.appendChild(h);
  const g = document.createElement("div"); g.className = "defs";
  for (let k = 0; k < t.defs.length; k++) { const dl = document.createElement("dl"), dt = document.createElement("dt"), dd = document.createElement("dd"); dt.textContent = t.defs[k][0]; dd.textContent = t.defs[k][1]; dl.append(dt, dd); g.appendChild(dl); }
  d.appendChild(g);
  $("t-leg1").textContent = t.leg1; $("t-leg2").textContent = t.leg2; $("t-q1").textContent = t.q1; $("t-q2").textContent = t.q2; $("btn-prev").textContent = t.prev;
  $("t-end-h").textContent = t.endH; $("t-end-p").textContent = t.endP; $("btn-final").textContent = t.final; $("btn-back").textContent = t.back; $("t-foot").textContent = t.foot;
  buildOpts(); if (S && !$("screen-q").hidden) render();
}
function buildOpts() {
  const t = T[lang];
  const mk = (box, keys, dict, field) => { box.textContent = ""; keys.forEach((k) => { const b = document.createElement("button"); b.type = "button"; b.className = "opt"; b.dataset.val = k; b.setAttribute("aria-pressed", "false");
    const bb = document.createElement("b"); bb.textContent = dict[k][0]; const s = document.createElement("small"); s.textContent = dict[k][1]; b.append(bb, s); b.addEventListener("click", () => choose(field, k)); box.appendChild(b); }); };
  mk($("opts-f"), FUNCS, t.fo, "f"); mk($("opts-n"), NEEDS, t.no, "n");
}
function show(id) { for (const s of ["screen-intro", "screen-q", "screen-end"]) $(s).hidden = s !== id; window.scrollTo(0, 0); }
function cur() { return ITEMS.find((x) => x.id === S.order[S.pos]); }
function render() {
  const t = T[lang], it = cur(), a = S.answers[it.id] || {};
  const g = lang === "zh" ? it.group_zh : it.group_en, r = lang === "zh" ? it.region_zh : it.region_en;
  $("m-what").innerHTML = t.what(g, r); $("m-when").textContent = t.when(it.t0, it.t1, it.clip_s);
  const img = $("img"); img.alt = ""; if (img.dataset.id !== it.id) { img.dataset.id = it.id; img.src = it.img; }
  $("t-cap").textContent = t.cap + it.seq;
  $("pos").textContent = t.pos(S.pos + 1, S.order.length); $("bar").style.width = (100 * Object.keys(S.answers).filter((k) => S.answers[k].f && S.answers[k].n).length / S.order.length) + "%";
  document.querySelectorAll("#opts-f .opt").forEach((b) => b.setAttribute("aria-pressed", String(a.f === b.dataset.val)));
  document.querySelectorAll("#opts-n .opt").forEach((b) => b.setAttribute("aria-pressed", String(a.n === b.dataset.val)));
  $("btn-prev").disabled = S.pos === 0; const done = !!(a.f && a.n); $("btn-next").disabled = !done; $("btn-next").textContent = S.pos === S.order.length - 1 ? t.nextLast : t.next;
  $("state").textContent = done ? t.saved : t.pickBoth;
  const nx = ITEMS.find((x) => x.id === S.order[S.pos + 1]); if (nx) { const p = new Image(); p.src = nx.img; }      // preload only the next one
  shownAt = Date.now();
}
function choose(field, val) {
  const it = cur(); const a = S.answers[it.id] || (S.answers[it.id] = {});
  if (field === "f") a.f = val; else a.n = val;
  a.ms = (a.ms || 0) + (Date.now() - shownAt); shownAt = Date.now(); a.t = new Date().toISOString(); save(); render();
  if (a.f && a.n) post({ type: "answer", ts: a.t, rater: S.rater, session: S.session, item_id: it.id, function: a.f, necessary: a.n, dur_ms: a.ms, index: S.pos + 1, lang });
}
function go(d) { const n = S.pos + d; if (n < 0) return; if (n >= S.order.length) { show("screen-end"); return; } S.pos = n; save(); render(); }
function startNew() {
  const name = $("rater").value.trim(); if (!name) { $("rater").focus(); return; }
  S = { rater: name, session: uuid(), order: shuffle(ITEMS.map((x) => x.id)), pos: 0, answers: {}, started: new Date().toISOString() }; save(); show("screen-q"); render();
}
function exportJSON() {
  const out = { rater: S ? S.rater : "", session: S ? S.session : "", started: S ? S.started : "", exported: new Date().toISOString(), n_items: ITEMS.length, answers: [] };
  if (S) S.order.forEach((id, i) => { const a = S.answers[id]; if (a && a.f && a.n) out.answers.push({ item_id: id, function: a.f, necessary: a.n, dur_ms: a.ms || 0, ts: a.t, index: i + 1 }); });
  const blob = new Blob([JSON.stringify(out, null, 1)], { type: "application/json" }), url = URL.createObjectURL(blob), a = document.createElement("a");
  a.href = url; a.download = "my_answers_" + (out.rater || "anon").replace(/[^\w\-]+/g, "_") + ".json"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function wire() {
  $("btn-lang").onclick = () => { lang = lang === "zh" ? "en" : "zh"; applyLang(); };
  $("btn-guide").onclick = () => show("screen-intro"); $("btn-dl").onclick = exportJSON; $("btn-dl2").onclick = exportJSON;
  $("btn-start").onclick = startNew; $("btn-prev").onclick = () => go(-1); $("btn-next").onclick = () => go(1); $("btn-back").onclick = () => { S.pos = S.order.length - 1; save(); show("screen-q"); render(); };
  $("btn-resume").onclick = () => { show("screen-q"); render(); };
  $("btn-restart").onclick = () => { if (confirm(lang === "zh" ? "清除本机进度并重新开始？（已提交到表格的答案不受影响）" : "Clear the local progress and start over? (answers already submitted are not affected)")) { try { localStorage.removeItem(STORE); } catch (e) { /* ignore */ } S = null; $("btn-resume").hidden = true; $("btn-restart").hidden = true; $("btn-start").hidden = false; $("rater").value = ""; } };
  $("btn-final").onclick = () => { const all = []; S.order.forEach((id, i) => { const a = S.answers[id]; if (a && a.f && a.n) all.push({ item_id: id, function: a.f, necessary: a.n, dur_ms: a.ms || 0, ts: a.t, index: i + 1 }); });
    const ok = post({ type: "final", ts: new Date().toISOString(), rater: S.rater, session: S.session, answers: all, lang }); $("final-state").textContent = ok ? T[lang].finalOk : T[lang].finalNoUrl; };
  document.addEventListener("keydown", (e) => { if ($("screen-q").hidden || e.target.tagName === "INPUT") return; const k = e.key; if (k >= "1" && k <= "6") choose("f", FUNCS[+k - 1]); else if (k === "q" || k === "Q") choose("n", "yes"); else if (k === "w" || k === "W") choose("n", "no"); else if (k === "e" || k === "E") choose("n", "unsure"); else if (k === "ArrowRight" && !$("btn-next").disabled) go(1); else if (k === "ArrowLeft") go(-1); });
}
function lazyExamples() { document.querySelectorAll("img[data-src]").forEach((im) => { im.src = im.dataset.src; }); }
fetch("items.json").then((r) => r.json()).then((items) => {
  ITEMS = items; wire(); applyLang(); lazyExamples();
  const st = load(); if (st && st.order && st.order.length === ITEMS.length) { S = st; $("rater").value = S.rater; $("btn-start").hidden = true; $("btn-resume").hidden = false; $("btn-restart").hidden = false; $("btn-resume").textContent = T[lang].resume + ` (${Object.keys(S.answers).filter((k) => S.answers[k].f && S.answers[k].n).length}/${ITEMS.length})`; }
}).catch(() => { document.querySelector("main").textContent = "items.json could not be loaded."; });
