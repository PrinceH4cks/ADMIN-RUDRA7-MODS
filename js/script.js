/* GANDU PANEL — shared admin UI behaviors */
(function() {
    "use strict";

    var lastEmail = null;

    function pad(n) { return String(n).padStart(2, "0"); }

    function refreshUserUI() {
        var email = window.adminEmailAddr || sessionStorage.getItem("adminEmail") || "";
        if (email === lastEmail) return;
        lastEmail = email;
        var letter = (email && email.trim().charAt(0).toUpperCase()) || "A";
        document.querySelectorAll(".uc-av").forEach(function(el) { el.textContent = letter; });
        document.querySelectorAll(".su-av").forEach(function(el) { el.textContent = letter; });
        document.querySelectorAll(".su-email").forEach(function(el) {
            el.textContent = email || "admin@panel";
        });
    }

    function tickClock() {
        var el = document.getElementById("liveClock");
        if (el) {
            var d = new Date();
            el.querySelector(".clk-time").textContent = pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
            el.querySelector(".clk-dt").textContent = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
        }
        refreshUserUI();
    }

    function ensureClock() {
        var right = document.querySelector(".topbar-right");
        if (right && !document.getElementById("liveClock")) {
            var el = document.createElement("div");
            el.className = "clock";
            el.id = "liveClock";
            el.innerHTML = '<span class="clk-time">--:--:--</span><span class="clk-dt">-- --- ----</span>';
            right.insertBefore(el, right.firstChild);
        }
    }

    function clampFab(fab) {
        var r = fab.getBoundingClientRect();
        var maxX = window.innerWidth - r.width;
        var maxY = window.innerHeight - r.height;
        if (maxX < 0 || maxY < 0) return;
        var l = parseFloat(fab.style.left) || 0;
        var t = parseFloat(fab.style.top) || 0;
        fab.style.left = Math.max(0, Math.min(l, maxX)) + "px";
        fab.style.top = Math.max(0, Math.min(t, maxY)) + "px";
    }

    var dragState = null;

    function initDraggableFab() {
        var fab = document.querySelector(".dev-fab, .float-btn");
        if (!fab) return;

        fab.setAttribute("draggable", "false");
        fab.addEventListener("dragstart", function(e) { e.preventDefault(); });
        fab.addEventListener("mouseenter", function() { fab.style.setProperty("animation-play-state", "running"); });

        fab.addEventListener("pointerdown", function(e) {
            if (dragState) return;
            if (e.button !== undefined && e.button !== 0) return;
            e.preventDefault();
            var r = fab.getBoundingClientRect();
            dragState = {
                fab: fab,
                sx: e.clientX,
                sy: e.clientY,
                ox: r.left,
                oy: r.top,
                w: r.width || 50,
                h: r.height || 50,
                moved: false
            };
            fab.classList.add("fab-dragging");
            document.body.classList.add("ui-fab-dragging");
        });

        document.addEventListener("pointermove", function(e) {
            if (!dragState) return;
            var st = dragState;
            var dx = e.clientX - st.sx, dy = e.clientY - st.sy;
            if (Math.abs(dx) + Math.abs(dy) > 4) st.moved = true;
            var nx = Math.max(0, Math.min(st.ox + dx, window.innerWidth - st.w));
            var ny = Math.max(0, Math.min(st.oy + dy, window.innerHeight - st.h));
            st.fab.style.left = nx + "px";
            st.fab.style.top = ny + "px";
            st.fab.style.right = "auto";
            st.fab.style.bottom = "auto";
        });

        function endDrag(e) {
            if (!dragState) return;
            var st = dragState;
            dragState = null;
            st.fab.classList.remove("fab-dragging");
            document.body.classList.remove("ui-fab-dragging");
            if (e && typeof e.preventDefault === "function") e.preventDefault();
            if (st.moved) {
                var suppress = function(ev) { ev.preventDefault(); ev.stopPropagation(); };
                st.fab.addEventListener("click", suppress, { once: true, capture: true });
            }
        }
        document.addEventListener("pointerup", endDrag);
        document.addEventListener("pointercancel", endDrag);

        window.addEventListener("resize", function() { clampFab(fab); });
    }

    window.addEventListener("load", function() {
        try {
            ensureClock();
            tickClock();
            setInterval(tickClock, 1000);
            initDraggableFab();
            document.body.classList.add("ui-ready");
        } catch (e) { /* noop */ }
    });

    window.refreshUserUI = refreshUserUI;
})();


/* ---------- Skeleton loading controller ---------- */
(function () {
    "use strict";

    var overlay = document.getElementById("pageSkeleton");
    var root = document.documentElement;
    var settled = false;
    var shown = false;
    var showTimer = null;
    var hideTimer = null;
    var hardTimer = null;

    // Content turant chhupaya jata hai, isliye skeleton bhi turant chahiye.
    // Ye chhota grace period sirf instant loads ke liye hai - unme
    // skeleton flash na ho.
    var SHOW_DELAY = 150;
    var HARD_LIMIT = 20000;

    function showSkeleton() {
        if (!overlay || settled || shown) return;
        shown = true;
        overlay.classList.remove("is-hidden");
        overlay.setAttribute("aria-hidden", "false");
        hardTimer = window.setTimeout(hideSkeleton, HARD_LIMIT);
    }

    function hideSkeleton() {
        window.clearTimeout(showTimer);
        window.clearTimeout(hardTimer);
        if (!overlay) return;
        settled = true;
        shown = false;
        overlay.classList.add("is-fading");
        overlay.setAttribute("aria-hidden", "true");
        window.clearTimeout(hideTimer);
        hideTimer = window.setTimeout(function () {
            overlay.classList.add("is-hidden");
        }, 320);
    }

    window.hideSkeleton = hideSkeleton;
    window.showSkeleton = showSkeleton;

    window.skeletonSettled = false;

    // Har page apne Firebase listener me ye call karta hai jaise hi
    // pehla data render hota hai.
    window.markSkeletonSettled = function () {
        if (window.skeletonSettled) return;
        window.skeletonSettled = true;
        window.clearTimeout(showTimer);
        root.classList.remove("skel-pending");
        window.setTimeout(hideSkeleton, shown ? 60 : 0);
    };

    if (overlay) {
        overlay.classList.add("is-hidden");
        overlay.setAttribute("aria-hidden", "true");
        showTimer = window.setTimeout(showSkeleton, SHOW_DELAY);
        overlay.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
        }, true);
    }

    // Safety net - kisi bhi haalat me content zaroor dikhe.
    window.setTimeout(function () {
        root.classList.remove("skel-pending");
        hideSkeleton();
    }, HARD_LIMIT);
})();
