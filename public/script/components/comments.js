// Comments component
// - Mock (LocalStorage) when baseUrl is empty
// - API-ready when baseUrl is set

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function toRelativeTime(ts) {
  const d = new Date(ts);
  const diffMs = Date.now() - d.getTime();
  const s = Math.max(1, Math.floor(diffMs / 1000));
  if (s < 60) return `${s} ثانیه پیش`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} دقیقه پیش`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ساعت پیش`;
  const days = Math.floor(h / 24);
  return `${days} روز پیش`;
}

function iconHeart(className = "size-4") {
  return `
    <svg class="${className}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 21s-7.2-4.6-9.6-8.7C.5 8.7 2.1 5.6 5.3 4.7c1.8-.5 3.7.1 4.9 1.4 1.2-1.3 3.1-1.9 4.9-1.4 3.2.9 4.8 4 2.9 7.6C19.2 16.4 12 21 12 21z"/>
    </svg>
  `;
}

function iconReply(className = "size-4") {
  return `
    <svg class="${className}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M10 9V5l-7 7 7 7v-4.1c5.1 0 8.5 1.6 11 5.1-1-5.1-4-11-11-11z"/>
    </svg>
  `;
}

// ---------------- API / Mock client ----------------

function getStorageKey(entityType, entityId) {
  return `sevra:comments:${entityType}:${entityId}`;
}

function loadMock(entityType, entityId) {
  const key = getStorageKey(entityType, entityId);
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}

  // seed
  const seed = {
    comments: [
      {
        id: uid("c"),
        authorName: "مریم",
        text: "تجربه‌ی خوبی بود. برخورد پرسنل عالی و محیط خیلی تمیز!",
        createdAt: Date.now() - 1000 * 60 * 30,
        likesCount: 12,
        likedByMe: false,
        replies: [
          {
            id: uid("r"),
            authorName: "مدیر سالن",
            text: "خیلی خوشحالیم که راضی بودید 🌿",
            createdAt: Date.now() - 1000 * 60 * 10,
            likesCount: 4,
            likedByMe: false,
          },
        ],
      },
      {
        id: uid("c"),
        authorName: "علی",
        text: "برای رنگ مو رفتم، نتیجه دقیقاً همون چیزی شد که می‌خواستم.",
        createdAt: Date.now() - 1000 * 60 * 60 * 5,
        likesCount: 7,
        likedByMe: false,
        replies: [],
      },
    ],
  };

  saveMock(entityType, entityId, seed);
  return seed;
}

function saveMock(entityType, entityId, data) {
  const key = getStorageKey(entityType, entityId);
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

export function createCommentsClient({ baseUrl = "", routes = {} } = {}) {
  const hasApi = Boolean(baseUrl);

  const defaultRoutes = {
    list: ({ entityType, entityId, sort = "new", limit = 10, offset = 0 }) =>
      `${baseUrl}/comments?entityType=${encodeURIComponent(entityType)}&entityId=${encodeURIComponent(
        entityId
      )}&sort=${encodeURIComponent(sort)}&limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`,
    createComment: () => `${baseUrl}/comments`,
    createReply: ({ commentId }) => `${baseUrl}/comments/${encodeURIComponent(commentId)}/replies`,
    likeComment: ({ commentId }) => `${baseUrl}/comments/${encodeURIComponent(commentId)}/like`,
    likeReply: ({ commentId, replyId }) =>
      `${baseUrl}/comments/${encodeURIComponent(commentId)}/replies/${encodeURIComponent(replyId)}/like`,
  };

  const r = { ...defaultRoutes, ...routes };

  async function apiFetch(url, options) {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
      ...options,
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      throw new Error(msg || `HTTP ${res.status}`);
    }
    // اگر بک‌اندت 204 برمی‌گردونه
    if (res.status === 204) return null;
    return res.json();
  }

  return {
    async list({ entityType, entityId, sort = "new", limit = 10, offset = 0 } = {}) {
      if (hasApi) return apiFetch(r.list({ entityType, entityId, sort, limit, offset }));

      const db = loadMock(entityType, entityId);
      const items = [...(db.comments || [])];

      if (sort === "top") items.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
      else items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      return { items: items.slice(offset, offset + limit), total: items.length };
    },

    async createComment({ entityType, entityId, text, authorName = "شما" } = {}) {
      if (hasApi) {
        return apiFetch(r.createComment(), {
          method: "POST",
          body: JSON.stringify({ entityType, entityId, text }),
        });
      }

      const db = loadMock(entityType, entityId);
      const newItem = {
        id: uid("c"),
        authorName,
        text,
        createdAt: Date.now(),
        likesCount: 0,
        likedByMe: false,
        replies: [],
      };
      db.comments = [newItem, ...(db.comments || [])];
      saveMock(entityType, entityId, db);
      return newItem;
    },

    async createReply({ entityType, entityId, commentId, text, authorName = "شما" } = {}) {
      if (hasApi) {
        return apiFetch(r.createReply({ commentId }), {
          method: "POST",
          body: JSON.stringify({ text }),
        });
      }

      const db = loadMock(entityType, entityId);
      const comment = (db.comments || []).find((c) => c.id === commentId);
      if (!comment) throw new Error("Comment not found");

      const reply = {
        id: uid("r"),
        authorName,
        text,
        createdAt: Date.now(),
        likesCount: 0,
        likedByMe: false,
      };
      comment.replies = [...(comment.replies || []), reply];
      saveMock(entityType, entityId, db);
      return reply;
    },

    async toggleLikeComment({ entityType, entityId, commentId } = {}) {
      if (hasApi) {
        return apiFetch(r.likeComment({ commentId }), { method: "POST" });
      }

      const db = loadMock(entityType, entityId);
      const c = (db.comments || []).find((x) => x.id === commentId);
      if (!c) throw new Error("Comment not found");
      c.likedByMe = !c.likedByMe;
      c.likesCount = Math.max(0, (c.likesCount || 0) + (c.likedByMe ? 1 : -1));
      saveMock(entityType, entityId, db);
      return { likedByMe: c.likedByMe, likesCount: c.likesCount };
    },

    async toggleLikeReply({ entityType, entityId, commentId, replyId } = {}) {
      if (hasApi) {
        return apiFetch(r.likeReply({ commentId, replyId }), { method: "POST" });
      }

      const db = loadMock(entityType, entityId);
      const c = (db.comments || []).find((x) => x.id === commentId);
      const rpl = (c?.replies || []).find((x) => x.id === replyId);
      if (!rpl) throw new Error("Reply not found");
      rpl.likedByMe = !rpl.likedByMe;
      rpl.likesCount = Math.max(0, (rpl.likesCount || 0) + (rpl.likedByMe ? 1 : -1));
      saveMock(entityType, entityId, db);
      return { likedByMe: rpl.likedByMe, likesCount: rpl.likesCount };
    },
  };
}

// ---------------- UI ----------------

function renderSkeleton(container) {
  container.innerHTML = `
    <div class="space-y-3" aria-hidden="true">
      ${Array.from({ length: 2 })
        .map(
          () => `
            <div class="rounded-2xl border border-neutral-50 bg-neutral-0 p-4">
              <div class="flex items-center gap-3">
                <div class="size-10 rounded-full bg-neutral-50"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-3 w-24 rounded bg-neutral-50"></div>
                  <div class="h-3 w-40 rounded bg-neutral-50"></div>
                </div>
              </div>
              <div class="mt-3 h-3 w-[90%] rounded bg-neutral-50"></div>
              <div class="mt-2 h-3 w-[70%] rounded bg-neutral-50"></div>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function commentCardTemplate(c) {
  const initials = escapeHtml((c.authorName || "?").trim().slice(0, 1));
  const time = toRelativeTime(c.createdAt);

  const replies = (c.replies || [])
    .map((r) => replyTemplate(c.id, r))
    .join("");

  return `
    <article class="rounded-2xl border border-neutral-50 bg-neutral-0 p-4" data-comment-id="${escapeHtml(
      c.id
    )}">
      <div class="flex items-start gap-3">
        <div class="size-10 rounded-full bg-neutral-50 grid place-items-center text-primary-600 font-bold">${initials}</div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-2">
            <div class="min-w-0">
              <div class="text-sm font-bold text-neutral-900 truncate">${escapeHtml(c.authorName || "کاربر")}</div>
              <div class="text-xs text-neutral-700">${escapeHtml(time)}</div>
            </div>

            <div class="shrink-0 flex items-center gap-2">
              <button
                type="button"
                class="inline-flex items-center gap-1 rounded-full border border-neutral-50 bg-neutral-0 px-3 py-1 text-sm ${
                  c.likedByMe ? "text-primary-900" : "text-neutral-700"
                }"
                data-like-comment
                aria-label="لایک کردن نظر"
              >
                <span class="${c.likedByMe ? "text-primary-900" : "text-neutral-700"}">${iconHeart(
    "size-4"
  )}</span>
                <span>${Number(c.likesCount || 0)}</span>
              </button>

              <button
                type="button"
                class="inline-flex items-center gap-1 rounded-full border border-neutral-50 bg-neutral-0 px-3 py-1 text-sm text-neutral-700"
                data-reply-toggle
                aria-label="پاسخ دادن"
              >
                <span class="text-neutral-700">${iconReply("size-4")}</span>
                <span>پاسخ</span>
              </button>
            </div>
          </div>

          <p class="mt-3 text-sm text-neutral-700 leading-7 whitespace-pre-wrap">${escapeHtml(
            c.text || ""
          )}</p>

          <div class="mt-4 space-y-3" data-replies>
            ${replies}
          </div>

          <form class="mt-3 hidden" data-reply-form>
            <div class="rounded-2xl border border-neutral-50 bg-neutral-50 p-3">
              <label class="block text-xs text-neutral-700 mb-2">پاسخ شما</label>
              <textarea
                rows="2"
                class="w-full rounded-2xl border border-neutral-50 bg-neutral-0 p-3 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-primary-900/20"
                placeholder="پاسخ خود را بنویسید..."
                data-reply-input
              ></textarea>
              <div class="mt-2 flex items-center gap-2">
                <button
                  type="submit"
                  class="h-10 rounded-2xl bg-primary-900 px-4 text-sm font-bold text-neutral-0 active:scale-[0.99] transition"
                >
                  ارسال
                </button>
                <button
                  type="button"
                  class="h-10 rounded-2xl border border-neutral-50 bg-neutral-0 px-4 text-sm font-bold text-neutral-900"
                  data-reply-cancel
                >
                  انصراف
                </button>
              </div>
              <p class="mt-2 text-xs text-primary-600 hidden" data-reply-error></p>
            </div>
          </form>
        </div>
      </div>
    </article>
  `;
}

function replyTemplate(commentId, r) {
  const initials = escapeHtml((r.authorName || "?").trim().slice(0, 1));
  const time = toRelativeTime(r.createdAt);

  return `
    <div class="ms-10 rounded-2xl border border-neutral-50 bg-neutral-50 p-3" data-reply-id="${escapeHtml(
      r.id
    )}" data-comment-id="${escapeHtml(commentId)}">
      <div class="flex items-start gap-3">
        <div class="size-9 rounded-full bg-neutral-0 grid place-items-center text-primary-600 font-bold">${initials}</div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-2">
            <div class="min-w-0">
              <div class="text-sm font-bold text-neutral-900 truncate">${escapeHtml(r.authorName || "کاربر")}</div>
              <div class="text-xs text-neutral-700">${escapeHtml(time)}</div>
            </div>
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-full border border-neutral-50 bg-neutral-0 px-3 py-1 text-sm ${
                r.likedByMe ? "text-primary-900" : "text-neutral-700"
              }"
              data-like-reply
              aria-label="لایک کردن پاسخ"
            >
              <span class="${r.likedByMe ? "text-primary-900" : "text-neutral-700"}">${iconHeart(
    "size-4"
  )}</span>
              <span>${Number(r.likesCount || 0)}</span>
            </button>
          </div>

          <p class="mt-2 text-sm text-neutral-700 leading-7 whitespace-pre-wrap">${escapeHtml(
            r.text || ""
          )}</p>
        </div>
      </div>
    </div>
  `;
}

function containerTemplate() {
  return `
    <section class="mt-6" dir="rtl">
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-sm font-bold text-neutral-900">نظرات کاربران</h2>
        <div class="text-xs text-neutral-700" data-total></div>
      </div>

      <div class="mt-3" data-state></div>

      <!-- Order requested: comments list -> view more -> new comment form -->
      <div class="mt-4">
        <div class="flex justify-center">
          <button
            type="button"
            class="h-11 rounded-2xl bg-primary-900 px-5 text-sm font-bold text-neutral-0 active:scale-[0.99] transition"
            data-view-more
          >
            مشاهده بیشتر
          </button>
        </div>
      </div>

      <form class="mt-4" data-new-comment-form>
        <div class="rounded-2xl border border-neutral-50 bg-neutral-50 p-4">
          <div class="text-sm font-bold text-neutral-900">ثبت نظر</div>
          <p class="mt-1 text-xs text-neutral-700">تجربه‌تون رو کوتاه و مفید بنویسید 🌿</p>

          <textarea
            rows="3"
            class="mt-3 w-full rounded-2xl border border-neutral-50 bg-neutral-0 p-3 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-primary-900/20"
            placeholder="نظر شما..."
            data-new-comment-input
          ></textarea>

          <div class="mt-2 flex items-center gap-2">
            <button
              type="submit"
              class="h-11 rounded-2xl bg-primary-900 px-5 text-sm font-bold text-neutral-0 active:scale-[0.99] transition"
            >
              ارسال نظر
            </button>
          </div>

          <p class="mt-2 text-xs text-primary-600 hidden" data-new-comment-error></p>
        </div>
      </form>
    </section>
  `;
}

export function mountComments(rootEl, { entityType, entityId, client, currentUser } = {}) {
  if (!rootEl || !entityType || !entityId || !client) return;

  rootEl.innerHTML = containerTemplate();

  const stateEl = rootEl.querySelector("[data-state]");
  const formEl = rootEl.querySelector("[data-new-comment-form]");
  const inputEl = rootEl.querySelector("[data-new-comment-input]");
  const errorEl = rootEl.querySelector("[data-new-comment-error]");
  const totalEl = rootEl.querySelector("[data-total]");
  const viewMoreBtn = rootEl.querySelector("[data-view-more]");
  const renderErrorState = (message) => {
    stateEl.innerHTML = `
      <div class="rounded-2xl border border-neutral-50 bg-neutral-0 p-4">
        <div class="text-sm font-bold text-neutral-900">مشکل در دریافت نظرات</div>
        <div class="mt-1 text-sm text-neutral-700">${escapeHtml(message || "لطفاً دوباره تلاش کنید")}</div>
        <button type="button" class="mt-3 h-10 rounded-2xl bg-primary-900 px-4 text-sm font-bold text-neutral-0" data-retry>
          تلاش مجدد
        </button>
      </div>
    `;
    stateEl.querySelector("[data-retry]")?.addEventListener("click", () => load());
  };

  const renderEmptyState = () => {
    stateEl.innerHTML = `
      <div class="rounded-2xl border border-neutral-50 bg-neutral-0 p-4">
        <div class="text-sm font-bold text-neutral-900">هنوز نظری ثبت نشده</div>
        <div class="mt-1 text-sm text-neutral-700">اولین نفر باشید 🙂</div>
      </div>
    `;
  };

  const wireInteractions = () => {
    // like comment
    stateEl.querySelectorAll("[data-like-comment]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const commentEl = btn.closest("[data-comment-id]");
        const commentId = commentEl?.dataset.commentId;
        if (!commentId) return;
        try {
          await client.toggleLikeComment({ entityType, entityId, commentId });
          load({ keepScroll: true });
        } catch (e) {
          console.warn(e);
        }
      });
    });

    // reply toggle
    stateEl.querySelectorAll("[data-reply-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const commentEl = btn.closest("[data-comment-id]");
        const form = commentEl?.querySelector("[data-reply-form]");
        if (!form) return;
        form.classList.toggle("hidden");
        const input = form.querySelector("[data-reply-input]");
        if (!form.classList.contains("hidden")) input?.focus();
      });
    });

    // reply cancel
    stateEl.querySelectorAll("[data-reply-cancel]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const form = btn.closest("[data-reply-form]");
        if (!form) return;
        form.classList.add("hidden");
        form.querySelector("[data-reply-input]").value = "";
        form.querySelector("[data-reply-error]")?.classList.add("hidden");
      });
    });

    // reply submit
    stateEl.querySelectorAll("[data-reply-form]").forEach((form) => {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const commentEl = form.closest("[data-comment-id]");
        const commentId = commentEl?.dataset.commentId;
        const input = form.querySelector("[data-reply-input]");
        const err = form.querySelector("[data-reply-error]");
        const text = (input?.value || "").trim();

        err?.classList.add("hidden");

        if (!text) {
          if (err) {
            err.textContent = "متن پاسخ نمی‌تواند خالی باشد.";
            err.classList.remove("hidden");
          }
          return;
        }

        try {
          await client.createReply({
            entityType,
            entityId,
            commentId,
            text,
            authorName: currentUser?.name || "شما",
          });
          input.value = "";
          form.classList.add("hidden");
          load({ keepScroll: true });
        } catch (ex) {
          if (err) {
            err.textContent = "ارسال پاسخ ناموفق بود.";
            err.classList.remove("hidden");
          }
        }
      });
    });

    // like reply
    stateEl.querySelectorAll("[data-like-reply]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const replyEl = btn.closest("[data-reply-id]");
        const replyId = replyEl?.dataset.replyId;
        const commentId = replyEl?.dataset.commentId;
        if (!replyId || !commentId) return;
        try {
          await client.toggleLikeReply({ entityType, entityId, commentId, replyId });
          load({ keepScroll: true });
        } catch (e) {
          console.warn(e);
        }
      });
    });
  };

  async function load({ keepScroll = false } = {}) {
    const prevY = keepScroll ? window.scrollY : 0;

    renderSkeleton(stateEl);
    totalEl.textContent = "";

    try {
      const { items, total } = await client.list({ entityType, entityId, sort: "new", limit: 10, offset: 0 });

      if (!items?.length) {
        renderEmptyState();
      } else {
        stateEl.innerHTML = `
          <div class="space-y-3" data-comments-list>
            ${items.map((c) => commentCardTemplate(c)).join("\n")}
          </div>
        `;
        wireInteractions();
      }

      totalEl.textContent = total ? `${total} نظر` : "";

      if (keepScroll) window.scrollTo({ top: prevY });
    } catch (e) {
      renderErrorState(e?.message);
    }
  }
  // view more (stub only)
  viewMoreBtn?.addEventListener("click", () => {
    // منطقش بعداً وقتی API و pagination آماده شد.
    console.log("View more clicked (stub)");
  });

  // new comment submit
  formEl?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = (inputEl?.value || "").trim();
    errorEl.classList.add("hidden");

    if (!text) {
      errorEl.textContent = "متن نظر نمی‌تواند خالی باشد.";
      errorEl.classList.remove("hidden");
      inputEl?.focus();
      return;
    }

    try {
      await client.createComment({ entityType, entityId, text, authorName: currentUser?.name || "شما" });
      inputEl.value = "";
      load({ keepScroll: true });
    } catch (ex) {
      errorEl.textContent = "ارسال نظر ناموفق بود.";
      errorEl.classList.remove("hidden");
    }
  });

  load();
}
