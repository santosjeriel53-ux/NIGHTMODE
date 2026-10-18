(() => {
 document.getElementById("nightmode-panel")?.remove();

 const host = document.createElement("div");
 host.id = "nightmode-panel";
 host.style.cssText = "position:fixed;top:80px;left:80px;z-index:2147483647;";
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
 border-radius:9px;min-height:60px;overflow-wrap:anywhere}
 iframe{width:100%;aspect-ratio:16/9;border:0;border-radius:10px}
 .bottom{padding:9px;text-align:center;color:#777;font-size:11px}
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
 </section>
 <section class="page" id="ai">
 <h3>AI Assistant <span class="purple">✦</span></h3>
 <textarea id="question" placeholder="Ask something..."></textarea>
 <button class="action" id="ask">Open Gemini with my question</button>
 <p class="muted">This opens Gemini in a new tab with your question. It does not generate answers inside this panel yet.</p>
 </section>
 <section class="page" id="music">
 <h3>Music Search</h3>
 <input id="song" placeholder="Search any song or artist...">
 <button class="action" id="search">Search YouTube</button>
 <div id="player"></div>
 <p class="muted">Search opens results in a new tab. To play a specific video inside this panel, paste its YouTube video ID below.</p>
 <input id="videoId" placeholder="YouTube video ID">
 <button class="action" id="play">Play in mini-player</button>
 </section>
 <section class="page" id="games">
 <h3>Games</h3>
 <p class="muted">Find browser games without leaving your current setup.</p>
 <button class="action" id="gameSearch">Find browser games</button>
 </section>
 </div>
 <div class="bottom">NIGHTMODE • FLOATING WORKSPACE</div>
 </div>
 </div>
 `;

 const $ = id => root.getElementById(id);

 root.querySelectorAll("[data-tab]").forEach(button => {
 button.addEventListener("click", () => {
 root.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
 $(button.dataset.tab).classList.add("active");
 });
 });

 $("close").onclick = () => host.remove();
 $("min").onclick = () => {
 const body = $("body");
 body.style.display = body.style.display === "none" ? "" : "none";
 };

 $("ask").onclick = () => {
 const q = $("question").value.trim();
 if (q) window.open(
 "https://gemini.google.com/app?q=" + encodeURIComponent(q),
 "_blank"
 );
 };

 $("search").onclick = () => {
 const q = $("song").value.trim();
 if (q) window.open(
 "https://www.youtube.com/results?search_query=" + encodeURIComponent(q),
 "_blank"
 );
 };

 $("play").onclick = () => {
 const id = $("videoId").value.trim();
 if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) {
 $("player").textContent = "Enter a valid 11-character YouTube video ID.";
 return;
 }
 $("player").innerHTML =
 '<iframe allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
 $("player").querySelector("iframe").src =
 "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1";
 };

 $("gameSearch").onclick = () => window.open(
 "https://www.google.com/search?q=free+browser+games",
 "_blank"
 );

 let startX, startY, startLeft, startTop;
 $("drag").addEventListener("pointerdown", e => {
 if (e.target.tagName === "BUTTON") return;
 startX = e.clientX;
 startY = e.clientY;
 const rect = host.getBoundingClientRect();
 startLeft = rect.left;
 startTop = rect.top;
 $("drag").setPointerCapture(e.pointerId);
 $("drag").onpointermove = ev => {
 host.style.left = Math.max(0, startLeft + ev.clientX - startX) + "px";
 host.style.top = Math.max(0, startTop + ev.clientY - startY) + "px";
 };
 $("drag").onpointerup = () => {
 $("drag").onpointermove = null;
 $("drag").onpointerup = null;
 };
 });

 console.log("NIGHTMODE loaded.");
})();