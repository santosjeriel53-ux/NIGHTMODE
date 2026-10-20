(() => {
 document.getElementById("nightmode-panel")?.remove();

 const API = "https://nightmode-backend.onrender.com";
 let authToken = null;
 let loginPromise = null;

 const host = document.createElement("div");
 host.id = "nightmode-panel";
 host.style.cssText =
 "position:fixed;top:80px;left:80px;z-index:2147483647;";
 document.body.appendChild(host);

 const root = host.attachShadow({ mode: "open" });

 const style = document.createElement("style");
 style.textContent = `
 * { box-sizing: border-box; }
 .panel {
 width:350px;height:490px;background:#09090d;color:#f5f5ff;
 border:1px solid #7652ff;border-radius:18px;overflow:hidden;
 box-shadow:0 12px 50px #000b;font:14px Arial,sans-serif;
 display:flex;flex-direction:column;
 }
 .top {
 padding:15px;background:#111018;border-bottom:1px solid #292333;
 display:flex;justify-content:space-between;align-items:center;
 cursor:move;
 }
 .brand {font-size:18px;font-weight:bold;letter-spacing:2px}
 .purple {color:#a88aff}
 button {
 background:#17151f;color:#eee;border:1px solid #332a48;
 border-radius:9px;padding:9px;cursor:pointer;
 }
 button:hover {border-color:#9b79ff;background:#241b35}
 button:disabled {opacity:.55;cursor:wait}
 .tabs {display:flex;gap:6px;padding:10px}
 .tabs button {flex:1}
 .content {padding:12px;overflow:auto;flex:1}
 .page {display:none}
 .page.active {display:block}
 textarea,input {
 width:100%;background:#111018;color:white;border:1px solid #393047;
 border-radius:9px;padding:10px;outline:none;margin:8px 0;
 }
 textarea {height:110px;resize:vertical}
 .action {width:100%;margin:5px 0}
 .muted {color:#aaa;font-size:12px;line-height:1.5}
 .answer {
 white-space:pre-wrap;background:#13111b;padding:10px;border-radius:9px;
 min-height:40px;overflow-wrap:anywhere;
 }
 iframe {width:100%;aspect-ratio:16/9;border:0;border-radius:10px}
 .bottom {padding:9px;text-align:center;color:#777;font-size:11px}
 .video {
 display:flex;gap:9px;padding:8px;margin:8px 0;background:#13111b;
 border:1px solid #332a48;border-radius:9px;text-align:left;
 width:100%;align-items:center;
 }
 .video img {width:105px;border-radius:6px}
 .video-title {font-size:12px;line-height:1.4;overflow-wrap:anywhere}
 `;
 root.appendChild(style);

 function el(tag, options = {}, children = []) {
 const node = document.createElement(tag);

 if (options.id) node.id = options.id;
 if (options.className) node.className = options.className;
 if (options.text !== undefined) node.textContent = options.text;
 if (options.placeholder) node.placeholder = options.placeholder;
 if (options.type) node.type = options.type;
 if (options.tab) node.dataset.tab = options.tab;

 for (const child of children) {
 node.appendChild(child);
 }

 return node;
 }

 function button(id, text, className = "") {
 return el("button", { id, text, className });
 }

 function field(tag, id, placeholder, className = "") {
 return el(tag, { id, placeholder, className });
 }

 function actionButton(id, text) {
 return button(id, text, "action");
 }

 const panel = el("div", { className: "panel" });
 const top = el("div", { id: "drag", className: "top" });

 const brand = el("div", { className: "brand" });
 brand.append(
 document.createTextNode("NIGHT"),
 el("span", { className: "purple", text: "MODE" })
 );

 const topButtons = el("div");
 topButtons.append(button("min", "—"), button("close", "×"));
 top.append(brand, topButtons);

 const body = el("div", { id: "body" });
 const tabs = el("div", { className: "tabs" });

 for (const [id, text] of [
 ["home", "Home"],
 ["ai", "AI"],
 ["music", "Music"],
 ["games", "Games"]
 ]) {
 tabs.appendChild(button("", text, "").setAttribute
 ? (() => {
 const b = button("", text);
 b.dataset.tab = id;
 return b;
 })()
 : document.createElement("button"));
 }

 // Rebuild the tab row with normal DOM elements.
 tabs.replaceChildren();
 for (const [id, text] of [
 ["home", "Home"], ["ai", "AI"], ["music", "Music"], ["games", "Games"]
 ]) {
 const b = button("", text);
 b.dataset.tab = id;
 tabs.appendChild(b);
 }

 const content = el("div", { className: "content" });

 const home = el("section", { id: "home", className: "page active" });
 home.append(
 el("h2", { text: "Welcome back." }),
 el("p", { className: "muted", text: "Your space. Your music. Your tools." }),
 el("p", { text: "Choose a section above to get started." }),
 el("p", { id: "status", className: "muted", text: "NIGHTMODE is ready." }),
 actionButton("connect", "Connect NIGHTMODE")
 );

 const ai = el("section", { id: "ai", className: "page" });
 const aiHeading = el("h3");
 aiHeading.append(
 document.createTextNode("AI Assistant "),
 el("span", { className: "purple", text: "✦" })
 );
 ai.append(
 aiHeading,
 field("textarea", "question", "Ask something..."),
 actionButton("ask", "Ask AI"),
 el("div", {
 id: "answer",
 className: "answer",
 text: "Your answer will appear here."
 }),
 el("p", { className: "muted", text: "Powered by your NIGHTMODE backend." })
 );

 const music = el("section", { id: "music", className: "page" });
 music.append(
 el("h3", { text: "Music Search" }),
 field("input", "song", "Search any song or artist..."),
 actionButton("search", "Search YouTube"),
 el("div", { id: "results" }),
 el("div", { id: "player" }),
 field("input", "videoId", "Or enter a YouTube video ID"),
 actionButton("play", "Play in mini-player")
 );

 const games = el("section", { id: "games", className: "page" });
 games.append(
 el("h3", { text: "Games" }),
 el("p", {
 className: "muted",
 text: "Find browser games without leaving your setup."
 }),
 actionButton("gameSearch", "Find browser games")
 );

 content.append(home, ai, music, games);
 body.append(tabs, content);
 panel.append(
 top,
 body,
 el("div", { className: "bottom", text: "NIGHTMODE • FLOATING WORKSPACE" })
 );
 root.appendChild(panel);

 const $ = id => root.getElementById(id);

 function say(message) {
 $("status").textContent = message;
 }

 async function connect() {
 if (authToken) return true;
 if (loginPromise) return loginPromise;

 loginPromise = (async () => {
 const code = window.prompt("Enter your NIGHTMODE access code:");

 if (code === null || !code.trim()) {
 say("Connection cancelled.");
 return false;
 }

 say("Connecting to NIGHTMODE...");

 try {
 const response = await fetch(API + "/api/login", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ code: code.trim() })
 });

 const data = await response.json().catch(() => ({}));

 if (!response.ok || !data.token) {
 throw new Error(data.error || "Login failed. Check your access code.");
 }

 authToken = data.token;
 say("Connected successfully.");
 return true;
 } catch (error) {
 say(error.message || "Could not connect. Try again.");
 return false;
 } finally {
 loginPromise = null;
 }
 })();

 return loginPromise;
 }

 async function apiFetch(path, options = {}) {
 if (!(await connect())) {
 throw new Error("Connect to NIGHTMODE first.");
 }

 const send = () => fetch(API + path, {
 ...options,
 headers: {
 ...(options.headers || {}),
 Authorization: "Bearer " + authToken
 }
 });

 let response = await send();

 if (response.status === 401) {
 authToken = null;
 if (!(await connect())) throw new Error("Please reconnect.");
 response = await send();
 }

 const data = await response.json().catch(() => ({}));

 if (!response.ok) {
 throw new Error(data.error || "The backend request failed.");
 }

 return data;
 }

 root.querySelectorAll("[data-tab]").forEach(b => {
 b.addEventListener("click", () => {
 root.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
 $(b.dataset.tab).classList.add("active");
 });
 });

 $("close").onclick = () => host.remove();

 $("min").onclick = () => {
 body.style.display = body.style.display === "none" ? "" : "none";
 };

 $("connect").onclick = async () => {
 $("connect").disabled = true;
 try {
 await connect();
 } finally {
 $("connect").disabled = false;
 }
 };

 $("ask").onclick = async () => {
 const prompt = $("question").value.trim();

 if (!prompt) {
 $("answer").textContent = "Type a question first.";
 return;
 }

 $("ask").disabled = true;
 $("answer").textContent = "Thinking...";

 try {
 const data = await apiFetch("/api/ask", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ prompt })
 });

 $("answer").textContent = data.answer || "No answer was returned.";
 } catch (error) {
 $("answer").textContent = error.message;
 } finally {
 $("ask").disabled = false;
 }
 };

 $("search").onclick = async () => {
 const query = $("song").value.trim();

 if (!query) {
 $("results").textContent = "Enter a song or artist first.";
 return;
 }

 $("search").disabled = true;
 $("results").textContent = "Searching YouTube...";

 try {
 const data = await apiFetch("/api/search?q=" + encodeURIComponent(query));
 const videos = data.videos || [];
 $("results").replaceChildren();

 if (!videos.length) {
 $("results").textContent = "No videos found.";
 return;
 }

 videos.forEach(video => {
 const b = button("", "");
 b.className = "video";

 if (video.thumbnail) {
 const img = el("img");
 img.src = video.thumbnail;
 img.alt = "";
 b.appendChild(img);
 }

 const details = el("span", { className: "video-title" });
 details.append(
 el("strong", { text: video.title || "Untitled video" }),
 el("div", { className: "muted", text: video.channel || "" })
 );
 b.appendChild(details);

 b.onclick = () => {
 if (!/^[a-zA-Z0-9_-]{11}$/.test(video.videoId || "")) return;
 $("player").replaceChildren();
 const iframe = el("iframe");
 iframe.allow = "autoplay; encrypted-media; picture-in-picture";
 iframe.allowFullscreen = true;
 iframe.src = "https://www.youtube-nocookie.com/embed/" +
 video.videoId + "?autoplay=1";
 $("player").appendChild(iframe);
 $("player").scrollIntoView({ block: "nearest" });
 };

 $("results").appendChild(b);
 });
 } catch (error) {
 $("results").textContent = error.message;
 } finally {
 $("search").disabled = false;
 }
 };

 $("play").onclick = () => {
 const id = $("videoId").value.trim();

 if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) {
 $("player").textContent = "Enter a valid 11-character YouTube video ID.";
 return;
 }

 $("player").replaceChildren();
 const iframe = el("iframe");
 iframe.allow = "autoplay; encrypted-media; picture-in-picture";
 iframe.allowFullscreen = true;
 iframe.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1";
 $("player").appendChild(iframe);
 };

 $("gameSearch").onclick = () => {
 window.open("https://www.google.com/search?q=free+browser+games", "_blank", "noopener");
 };

 let startX, startY, startLeft, startTop;

 $("drag").addEventListener("pointerdown", event => {
 if (event.target.tagName === "BUTTON") return;

 startX = event.clientX;
 startY = event.clientY;

 const rect = host.getBoundingClientRect();
 startLeft = rect.left;
 startTop = rect.top;

 $("drag").setPointerCapture(event.pointerId);

 $("drag").onpointermove = moveEvent => {
 host.style.left = Math.max(0, startLeft + moveEvent.clientX - startX) + "px";
 host.style.top = Math.max(0, startTop + moveEvent.clientY - startY) + "px";
 };

 $("drag").onpointerup = () => {
 $("drag").onpointermove = null;
 $("drag").onpointerup = null;
 };
 });

 console.log("NIGHTMODE loaded.");
})();
