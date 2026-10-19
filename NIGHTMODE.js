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

 root.innerHTML = `
 <style>
 *{box-sizing:border-box}
 .panel{width:350px;height:490px;background:#09090d;color:#f5f5ff;
 border:1px solid #7652ff;border-radius:18px;overflow:hidden;
 box-shadow:0 12px 50px #000b;font:14px Arial,sans-serif;
 display:flex;flex-direction:column}
 .top{padding:15px;background:#111018;border-bottom:1px solid #292333;
 display:flex;justify-content:space-between;align-items:center;cursor:move}
 .brand{font-size:18px;font-weight:bold;letter-spacing:2px}
 .purple{color:#a88aff}
 button{background:#17151f;color:#eee;border:1px solid #332a48;
 border-radius:9px;padding:9px;cursor:pointer}
 button:hover{border-color:#9b79ff;background:#241b35}
 button:disabled{opacity:.55;cursor:wait}
 .tabs{display:flex;gap:6px;padding:10px}
 .tabs button{flex:1}
 .content{padding:12px;overflow:auto;flex:1}
 .page{display:none}.page.active{display:block}
 textarea,input{width:100%;background:#111018;color:white;
 border:1px solid #393047;border-radius:9px;padding:10px;
 outline:none;margin:8px 0}
 textarea{height:110px;resize:vertical}
 .action{width:100%;margin:5px 0}
 .muted{color:#aaa;font-size:12px;line-height:1.5}
 .answer{white-space:pre-wrap;background:#13111b;padding:10px;
 border-radius:9px;min-height:40px;overflow-wrap:anywhere}
 iframe{width:100%;aspect-ratio:16/9;border:0;border-radius:10px}
 .bottom{padding:9px;text-align:center;color:#777;font-size:11px}
 .video{display:flex;gap:9px;padding:8px;margin:8px 0;
 background:#13111b;border:1px solid #332a48;border-radius:9px;
 text-align:left;width:100%;align-items:center}
 .video img{width:105px;border-radius:6px}
 .video-title{font-size:12px;line-height:1.4;overflow-wrap:anywhere}
 </style>

 <div class="panel">
 <div class="top" id="drag">
 <div class="brand">NIGHT<span class="purple">MODE</span></div>
 <div>
 <button id="min">—</button>
 <button id="close">×</button>
 </div>
 </div>

 <div id="body">
 <div class="tabs">
 <button data-tab="home">Home</button>
 <button data-tab="ai">AI</button>
 <button data-tab="music">Music</button>
 <button data-tab="games">Games</button>
 </div>

 <div class="content">
 <section class="page active" id="home">
 <h2>Welcome back.</h2>
 <p class="muted">Your space. Your music. Your tools.</p>
 <p>Choose a section above to get started.</p>
 <p class="muted" id="status">NIGHTMODE is ready.</p>
 <button class="action" id="connect">Connect NIGHTMODE</button>
 </section>

 <section class="page" id="ai">
 <h3>AI Assistant <span class="purple">✦</span></h3>
 <textarea id="question" placeholder="Ask something..."></textarea>
 <button class="action" id="ask">Ask AI</button>
 <div class="answer" id="answer">Your answer will appear here.</div>
 <p class="muted">Powered by your NIGHTMODE backend.</p>
 </section>

 <section class="page" id="music">
 <h3>Music Search</h3>
 <input id="song" placeholder="Search any song or artist...">
 <button class="action" id="search">Search YouTube</button>
 <div id="results"></div>
 <div id="player"></div>
 <input id="videoId" placeholder="Or enter a YouTube video ID">
 <button class="action" id="play">Play in mini-player</button>
 </section>

 <section class="page" id="games">
 <h3>Games</h3>
 <p class="muted">Find browser games without leaving your setup.</p>
 <button class="action" id="gameSearch">Find browser games</button>
 </section>
 </div>

 <div class="bottom">NIGHTMODE • FLOATING WORKSPACE</div>
 </div>
 </div>`;

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
 if (!(await connect())) throw new Error("Connect to NIGHTMODE first.");

 let response = await fetch(API + path, {
 ...options,
 headers: {
 ...(options.headers || {}),
 Authorization: "Bearer " + authToken
 }
 });

 // A token may expire. Ask for the access code again once.
 if (response.status === 401) {
 authToken = null;
 if (!(await connect())) throw new Error("Please reconnect.");
 response = await fetch(API + path, {
 ...options,
 headers: {
 ...(options.headers || {}),
 Authorization: "Bearer " + authToken
 }
 });
 }

 const data = await response.json().catch(() => ({}));
 if (!response.ok) {
 throw new Error(data.error || "The backend request failed.");
 }
 return data;
 }

 root.querySelectorAll("[data-tab]").forEach(button => {
 button.addEventListener("click", () => {
 root.querySelectorAll(".page").forEach(page =>
 page.classList.remove("active")
 );
 $(button.dataset.tab).classList.add("active");
 });
 });

 $("close").onclick = () => host.remove();

 $("min").onclick = () => {
 const body = $("body");
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
 const question = $("question").value.trim();
 if (!question) {
 $("answer").textContent = "Type a question first.";
 return;
 }

 $("ask").disabled = true;
 $("answer").textContent = "Thinking...";

 try {
 const data = await apiFetch("/api/ask", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ prompt: question })
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
 const data = await apiFetch(
 "/api/search?q=" + encodeURIComponent(query)
 );
 const videos = data.videos || [];
 $("results").replaceChildren();

 if (!videos.length) {
 $("results").textContent = "No videos found.";
 return;
 }

 videos.forEach(video => {
 const button = document.createElement("button");
 button.className = "video";

 if (video.thumbnail) {
 const img = document.createElement("img");
 img.src = video.thumbnail;
 img.alt = "";
 button.appendChild(img);
 }

 const details = document.createElement("span");
 details.className = "video-title";

 const title = document.createElement("strong");
 title.textContent = video.title || "Untitled video";

 const channel = document.createElement("div");
 channel.className = "muted";
 channel.textContent = video.channel || "";

 details.append(title, channel);
 button.appendChild(details);

 button.onclick = () => {
 if (!/^[a-zA-Z0-9_-]{11}$/.test(video.videoId || "")) return;
 $("player").replaceChildren();
 const iframe = document.createElement("iframe");
 iframe.allow = "autoplay; encrypted-media; picture-in-picture";
 iframe.allowFullscreen = true;
 iframe.src =
 "https://www.youtube-nocookie.com/embed/" +
 video.videoId + "?autoplay=1";
 $("player").appendChild(iframe);
 $("player").scrollIntoView({ block: "nearest" });
 };

 $("results").appendChild(button);
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
 $("player").textContent =
 "Enter a valid 11-character YouTube video ID.";
 return;
 }

 $("player").replaceChildren();
 const iframe = document.createElement("iframe");
 iframe.allow = "autoplay; encrypted-media; picture-in-picture";
 iframe.allowFullscreen = true;
 iframe.src =
 "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1";
 $("player").appendChild(iframe);
 };

 $("gameSearch").onclick = () => window.open(
 "https://www.google.com/search?q=free+browser+games",
 "_blank",
 "noopener"
 );

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
 host.style.left =
 Math.max(0, startLeft + moveEvent.clientX - startX) + "px";
 host.style.top =
 Math.max(0, startTop + moveEvent.clientY - startY) + "px";
 };

 $("drag").onpointerup = () => {
 $("drag").onpointermove = null;
 $("drag").onpointerup = null;
 };
 });

 console.log("NIGHTMODE loaded.");
})();
