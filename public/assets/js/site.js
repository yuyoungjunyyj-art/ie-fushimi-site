/* Ie Fushimi — v01 site script */

/* ------------------------------------------------------------------
   PROVISIONAL CONTENT — well water in tea
   Every sentence claiming that well water goes into tea is marked
   data-provisional="well-to-tea". If water testing fails, set this
   to false and all of them disappear from every page at once.
   ------------------------------------------------------------------ */
const SHOW_WELL_TO_TEA = true;

/* Enquiry form endpoint — [TO CONFIRM]. Leave empty until a form
   service (e.g. Formspree, Basin, a CMS form) is chosen. */
const ENQUIRY_ENDPOINT = "";
const ENQUIRY_EMAIL = "[email TO CONFIRM]";

/* Form messages, by language */
const MESSAGES = {
  en: { offline: "The form is not connected yet. For now, write to {email}.", sending: "Sending…", sent: "Thank you. Your note has reached the house. We read every one, and reply when we have something useful to say.", failed: "Something went wrong. Please write to {email}.", listOffline: "The list is not open yet. For now, write to {email}.", listed: "Thank you. We will write when the first editions are ready." },
  ja: { offline: "フォームはまだ接続されていません。お手数ですが {email} までご連絡ください。", sending: "送信しています…", sent: "ありがとうございます。お便りは家に届きました。すべて拝読し、お伝えできることがあればお返事いたします。", failed: "送信できませんでした。{email} までご連絡ください。", listOffline: "リストはまだ受付を始めていません。{email} までご連絡ください。", listed: "ありがとうございます。最初のエディションができましたらお知らせします。" },
  zh: { offline: "表单尚未接通。请暂时发邮件至 {email}。", sending: "正在发送…", sent: "谢谢。您的来信已送达这座房子。每一封我们都会读，有值得说的时候会回复您。", failed: "发送失败。请发邮件至 {email}。", listOffline: "名单尚未开放。请暂时发邮件至 {email}。", listed: "谢谢。首批作品完成时我们会写信告诉您。" },
  ko: { offline: "아직 폼이 연결되지 않았습니다. 우선 {email}(으)로 보내주세요.", sending: "보내는 중…", sent: "감사합니다. 보내주신 글이 집에 닿았습니다. 모두 읽고, 전할 말이 생기면 답장드리겠습니다.", failed: "전송하지 못했습니다. {email}(으)로 보내주세요.", listOffline: "아직 신청을 받지 않습니다. 우선 {email}(으)로 보내주세요.", listed: "감사합니다. 첫 에디션이 준비되면 알려드리겠습니다." },
};
function msg(el, key) {
  const l = ((el.closest("[lang]") || document.documentElement).getAttribute("lang") || "en").slice(0, 2);
  return (MESSAGES[l] || MESSAGES.en)[key].replace("{email}", ENQUIRY_EMAIL);
}

(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!SHOW_WELL_TO_TEA) {
    document.querySelectorAll('[data-provisional="well-to-tea"]').forEach((el) => el.remove());
  }

  /* Mobile menu */
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* Header: slides away while scrolling down, returns on the way up */
  const header = document.querySelector(".site-header");
  if (header) {
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      const menuOpen = nav && nav.classList.contains("is-open");
      const focused = header.contains(document.activeElement);
      if (y < 80 || menuOpen || focused) header.classList.remove("is-hidden");
      else if (y > lastY + 6) header.classList.add("is-hidden");
      else if (y < lastY - 6) header.classList.remove("is-hidden");
      if (Math.abs(y - lastY) > 6 || y < 80) lastY = y;
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    header.addEventListener("focusin", () => header.classList.remove("is-hidden"));
  }

  /* Slow fades on scroll */
  const reveals = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px" });
    reveals.forEach((el) => io.observe(el));
  }

  /* Films: no autoplay when reduced motion is requested — the poster stays */
  document.querySelectorAll("video[data-autoplay]").forEach((video) => {
    if (reduceMotion) {
      video.removeAttribute("autoplay");
      video.pause();
      return;
    }
    video.muted = true;
    const play = video.play();
    if (play && play.catch) play.catch(() => {});
  });

  /* Map loads only when asked (no third-party requests before consent) */
  document.querySelectorAll("[data-map-src]").forEach((slot) => {
    const btn = slot.querySelector("button");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const iframe = document.createElement("iframe");
      iframe.src = slot.getAttribute("data-map-src");
      iframe.title = slot.getAttribute("data-map-title") || "Map";
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      slot.replaceChildren(iframe);
    });
  });

  /* Enquiry form */
  document.querySelectorAll("form.enquiry-form").forEach((form) => {
    const status = form.querySelector(".form-status");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (form.querySelector(".hp input") && form.querySelector(".hp input").value) return; // honeypot
      if (!form.reportValidity()) return;
      if (!ENQUIRY_ENDPOINT) {
        status.textContent = msg(form, "offline");
        return;
      }
      status.textContent = msg(form, "sending");
      try {
        const res = await fetch(ENQUIRY_ENDPOINT, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        status.textContent = msg(form, "sent");
      } catch (err) {
        status.textContent = msg(form, "failed");
      }
    });
  });

  /* Waitlist (Atelier) — same endpoint, no checkout in v01 */
  document.querySelectorAll("form.waitlist-form").forEach((form) => {
    const status = form.querySelector(".form-status");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      status.textContent = msg(form, ENQUIRY_ENDPOINT ? "listed" : "listOffline");
    });
  });
})();
