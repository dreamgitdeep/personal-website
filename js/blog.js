/**
 * 日志页面脚本
 * ------------------------------------------------------------------
 * 形态：表格目录 + 整页阅读视图
 *   · 目录以表格呈现（序号 / 日期 / 标题 / 分类 / 标签 / 阅读时长）
 *   · 点击任意一行 → 同页切换到阅读视图，网址写入 #日志id
 *     （可分享、可刷新保持、浏览器后退可回到目录）
 *   · 日志数据优先读 Supabase，未配置 / 失败时回退到下方内嵌数据
 *
 *   注意：整体包在 IIFE 里，避免与本页同时加载的 main.js 出现全局重名
 *   （main.js 也定义了 debounce，曾因此把搜索功能打挂）
 */

(function () {
'use strict';

// ========== 兜底数据（Supabase 未配置或读取失败时使用）==========
let journalsData = [
    {
        "id": "journal-20260329",
        "title": "论文落幕，人在旅途",
        "category": "life",
        "categoryName": "生活",
        "excerpt": "毕业论文终于全部搞定了，查重一次性通过，盲审也顺利提交。放下论文的那一刻，转身就要面对找工作的现实。去广州参加了招聘会，教育学专业真的不好找……",
        "content": "毕业论文终于全部搞定了！查重一次性通过，盲审也已经顺利提交。悬着的那颗心终于可以放下来了。\n\n放下论文的那一刻，转身就要面对找工作的现实。我去参加了广州的招聘会，逛了一圈，只投出了五份简历，呜呜呜。教育学专业真的不好找工作，合适的岗位太少了，这也让我更加坚定了想要转行的想法。\n\n之后辗转来到了上海，在这里待了一段时间。换了个城市，换了个心情，但找工作的焦虑还是如影随形。\n\n不过最近有一件让我觉得有意思的事——我开始捣鼓一个小程序！目前已经有了一些成果，虽然还不完善，离正式上线还有一大段距离，但能看到雏形就已经很开心了。继续加油吧！",
        "tags": ["毕业论文", "找工作", "广州", "上海", "小程序"],
        "coverImage": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
        "createdAt": "2026-03-29",
        "readTime": 2,
        "isTop": true
    },
    {
        "id": "journal-20260308",
        "title": "毕业季的忙碌与焦虑",
        "category": "work",
        "categoryName": "工作",
        "excerpt": "最近正在撰写毕业论文还有准备预答辩的相关事项，因此一直没有更新个人网站。这一两周下来，感觉要碎了。毕业真的好忙！...",
        "content": "最近正在撰写毕业论文还有准备预答辩的相关事项，因此一直没有更新个人网站。这一两周下来，感觉要碎了。毕业真的好忙！\n\n预答辩之后专家又提出了新的修改建议，因此，在休息了一天多之后，今天又重新开始投入进去。但是总会有不想写的时刻，于是我在抖音平台上发布了我的网站视频，分享一下。现在正在更新日志。\n\n之后，我还想着在个人网站里加上歌单，这样就更好啦！\n\n哦，对了，今天还特别着急，担心找不到工作。所以也一直在看招聘信息，很担心找不到工作。",
        "tags": ["毕业论文", "预答辩", "找工作", "个人网站"],
        "coverImage": "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=600&h=400&fit=crop",
        "createdAt": "2026-03-08",
        "readTime": 2,
        "isTop": false
    },
    {
        "id": "journal-20260226",
        "title": "个人网页优化记 - 细节打磨与功能完善",
        "category": "study",
        "categoryName": "学习",
        "excerpt": "这两天优化了一下个人网页的细节。发现用codebuddy制作网页时会限制频率和额度，所以使用了两个账号交替进行设计...",
        "content": "这两天优化了一下个人网页的细节。我发现用codebuddy制作网页时会限制频率和额度，所以使用了两个账号交替进行设计。但是，两个账号之间会出现不连贯的情况，有时候会把设计好的东西搞乱了。最近就在调整这个。还没有找到一个好的解决办法。\n\n其次，我还想有一个邮箱功能，后面觉得有些多余，便修改成了留言功能，还有点赞小功能，很满意。\n\n到今天，我的小网页终于bug少了很多。使用起来越来越流畅了。太棒啦！",
        "tags": ["网站优化", "留言功能", "点赞", "CodebuddyCN"],
        "coverImage": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
        "createdAt": "2026-02-26",
        "readTime": 1,
        "isTop": false
    },
    {
        "id": "journal-20260223",
        "title": "我的网站制作初体验",
        "category": "study",
        "categoryName": "学习",
        "excerpt": "今天，我突然在抖音上刷到了一位博主她自己做了一个属于自己的网站，页面很美观，我感觉十分吸引人！所以我也想做一个属于自己的网站...",
        "content": "今天，我突然在抖音上刷到了一位博主她自己做了一个属于自己的网站，页面很美观，我感觉十分吸引人！所以我也想做一个属于自己的网站。这位博主分享了自己的制作过程，但是我想用自己的方法制作，所以没有采纳她的方法。我前段时间下载了CodebuddyCN这个软件，虽然我不清楚它目前在AI界的地位，但对于目前我的水平而言，足够了。\n\n我新建了一个文件夹，命名为\"学习制作个人网站\"。之后，用Codebuddy打开文件夹，开始和它聊天。首先用plan模式，并且用语音输入的方式快速的说明了我的想法，它很快为我制定了计划，我让它执行。\n\n过了一会，一个网站制作出来了。我仔细看了一下，发现有很多细节之处需要调整，但是没有关系，因为它已经想的很全面了！\n\n所以我就像一个顾客一样浏览自己的主页，总结了一些问题告诉了它。它持续的进行完善修改。",
        "tags": ["网站制作", "学习", "CodebuddyCN"],
        "coverImage": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop",
        "createdAt": "2026-02-23",
        "readTime": 2,
        "isTop": false
    },
    {
        "id": "journal-20260225",
        "title": "网站制作进阶 - 清理与优化",
        "category": "study",
        "categoryName": "学习",
        "excerpt": "继续完善个人网站，清理了不再需要的后台管理系统文件，采用JSON数据驱动方案...",
        "content": "继续完善个人网站，清理了不再需要的后台管理系统文件，采用JSON数据驱动方案。\n\n这个方案更加轻量实用，只需要修改JSON文件就能更新网站内容，非常适合我的需求。\n\n接下来我需要测试各个页面功能是否正常。",
        "tags": ["网站优化", "学习", "JSON"],
        "coverImage": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop",
        "createdAt": "2026-02-25",
        "readTime": 1,
        "isTop": false
    }
];

// ========== 状态 ==========
let currentFilter = 'all';   // all / study / life / work
let currentSearch = '';
let currentList = [];        // 当前目录中显示的日志（含筛选、排序后）
let listScrollY = 0;         // 进入阅读前的滚动位置
const BASE_TITLE = '日志 - 我的个人空间';

/* ---------- 小工具 ---------- */
function esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
/** 置顶优先，其次按日期倒序 */
function sortJournals(list) {
    return [...list].sort((a, b) => {
        if (a.isTop && !b.isTop) return -1;
        if (!a.isTop && b.isTop) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
}

/* ================== 初始化 ================== */
document.addEventListener('DOMContentLoaded', function () {
    // ① 先用内嵌日志把目录渲染出来 —— 首屏零等待，不看网络脸色。
    //    以前是「先 await 云端数据（最长 6 秒）再渲染」，网络一慢，
    //    用户就要盯着「正在加载…」发呆。
    renderJournals();
    initBlogFilters();
    initBlogSearch();
    initReaderControls();
    applyHash();   // 支持带 #id 直接打开某篇日志
    console.log('✅ 日志目录加载成功:', journalsData.length, '篇');

    // ② 云端数据在后台慢慢取，取到了再替换。
    //    DataService 内部已有 4 秒上限，慢或失败都会回退本地，不影响首屏。
    if (!window.DataService) return;
    window.DataService.getJournals().then(function (remote) {
        if (!remote || !remote.length) return;
        if (JSON.stringify(remote) === JSON.stringify(journalsData)) return;  // 无变化就不折腾
        journalsData = remote;
        renderJournals();
        applyHash();   // 若此刻正打开某篇，保持阅读视图
        console.log('☁️ 日志已换成 Supabase 数据:', remote.length, '篇');
    }).catch(function () {
        console.warn('云端日志读取失败，继续使用内嵌数据');
    });
});

/* ================== 目录表格 ================== */
function renderJournals() {
    const tbody = document.getElementById('journalBody');
    if (!tbody) return;

    // 筛选
    let list = sortJournals(journalsData);
    if (currentFilter !== 'all') {
        list = list.filter(j => j.category === currentFilter);
    }
    if (currentSearch) {
        const kw = currentSearch.toLowerCase();
        list = list.filter(j =>
            (j.title || '').toLowerCase().includes(kw) ||
            (j.excerpt || '').toLowerCase().includes(kw) ||
            (j.content || '').toLowerCase().includes(kw) ||
            (j.tags || []).some(t => String(t).toLowerCase().includes(kw))
        );
    }
    currentList = list;

    const subEl = document.getElementById('journalSub');
    if (subEl) {
        subEl.innerHTML = '共 <b>' + list.length + '</b> 篇 · 点击任意一行即可阅读全文';
    }

    const emptyEl = document.getElementById('journalEmpty');
    const wrapEl = document.querySelector('.journal-table-wrap');

    if (!list.length) {
        tbody.innerHTML = '';
        if (wrapEl) wrapEl.hidden = true;
        if (emptyEl) emptyEl.hidden = false;
        return;
    }
    if (wrapEl) wrapEl.hidden = false;
    if (emptyEl) emptyEl.hidden = true;

    tbody.innerHTML = list.map((j, i) => {
        // 标签列只显示前 3 个，多的折成 +N（保持单行、行高一致）
        const allTags = j.tags || [];
        const shown = allTags.slice(0, 3);
        const rest = allTags.length - shown.length;
        const tags = shown.map(t => `<span class="j-tag">#${esc(t)}</span>`).join('') +
            (rest > 0 ? `<span class="j-tag more" title="${esc(allTags.map(t => '#' + t).join(' '))}">+${rest}</span>` : '');
        return `
        <tr class="journal-row" data-id="${esc(j.id)}" tabindex="0" role="link"
            aria-label="阅读日志：${esc(j.title)}" style="animation-delay:${Math.min(i * 40, 400)}ms">
            <td class="col-idx">${String(i + 1).padStart(2, '0')}</td>
            <td class="col-date">${esc(j.createdAt || '')}</td>
            <td class="col-title">
                <a class="j-title" href="#${esc(j.id)}">${esc(j.title || '(无标题)')}</a>
                ${j.isTop ? '<span class="j-top">置顶</span>' : ''}
                <p class="j-excerpt">${esc(j.excerpt || '')}</p>
            </td>
            <td class="col-cat"><span class="j-cat ${esc(j.category || '')}">${esc(j.categoryName || '')}</span></td>
            <td class="col-tags" title="${esc(allTags.map(t => '#' + t).join(' '))}">${tags}</td>
            <td class="col-time">${esc(j.readTime || 1)} 分钟</td>
        </tr>`;
    }).join('');
}

/* ================== 筛选 / 搜索 ================== */
function initBlogFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    if (!buttons.length) return;
    buttons.forEach(btn => {
        btn.addEventListener('click', function () {
            buttons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderJournals();
        });
    });
}

function initBlogSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    // 直接闭包引用 input，不依赖 this（更稳）
    input.addEventListener('input', debounce(function () {
        currentSearch = input.value.trim();
        renderJournals();
    }, 250));
}

/* ================== 目录 ↔ 阅读 切换 ================== */
function initReaderControls() {
    const listView = document.getElementById('listView');
    const readerView = document.getElementById('readerView');
    if (!listView || !readerView) return;

    // 整行可点击（标题本身是 <a href="#id">，这里让空白处也能点）
    const tbody = document.getElementById('journalBody');
    if (tbody) {
        tbody.addEventListener('click', function (e) {
            const row = e.target.closest('.journal-row');
            if (!row) return;
            const id = row.dataset.id;
            if (e.target.closest('.j-title')) return; // 交给原生锚点
            e.preventDefault();
            location.hash = id;
        });
        tbody.addEventListener('keydown', function (e) {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            const row = e.target.closest('.journal-row');
            if (!row) return;
            e.preventDefault();
            location.hash = row.dataset.id;
        });
    }

    const backBtn = document.getElementById('readerBack');
    if (backBtn) backBtn.addEventListener('click', backToList);

    window.addEventListener('hashchange', applyHash);
}

/** 根据当前网址 hash 决定显示目录还是阅读 */
function applyHash() {
    const id = decodeURIComponent((location.hash || '').replace(/^#/, ''));
    if (id) {
        const j = journalsData.find(x => x.id === id);
        if (j) { showReader(j); return; }
    }
    showList();
}

function showList() {
    const listView = document.getElementById('listView');
    const readerView = document.getElementById('readerView');
    if (!listView || !readerView) return;

    readerView.hidden = true;
    listView.hidden = false;
    document.body.classList.remove('reading');
    document.title = BASE_TITLE;

    // 还原进入阅读前的滚动位置
    window.scrollTo({ top: listScrollY, behavior: 'auto' });
}

function showReader(journal) {
    const listView = document.getElementById('listView');
    const readerView = document.getElementById('readerView');
    if (!listView || !readerView) return;

    // 记录目录滚动位置：仅在「从目录进入」时记一次，
    // 若是在阅读视图内点上一篇/下一篇，则保持原来的目录位置
    if (readerView.hidden) {
        listScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    }

    // 分类
    const catEl = document.getElementById('readerCat');
    if (catEl) {
        catEl.textContent = journal.categoryName || '';
        catEl.className = 'j-cat ' + (journal.category || '');
    }

    // 标题
    const titleEl = document.getElementById('readerTitle');
    if (titleEl) titleEl.textContent = journal.title || '(无标题)';

    // 元信息
    const metaEl = document.getElementById('readerMeta');
    if (metaEl) {
        metaEl.innerHTML =
            `<span><i class="far fa-calendar"></i> ${esc(journal.createdAt || '')}</span>` +
            `<span><i class="far fa-clock"></i> ${esc(journal.readTime || 1)} 分钟阅读</span>`;
    }

    // 正文
    const bodyEl = document.getElementById('readerBody');
    if (bodyEl) {
        bodyEl.innerHTML = String(journal.content || '')
            .split('\n\n')
            .map(p => `<p>${esc(p)}</p>`)
            .join('');
    }

    // 标签
    const tagsEl = document.getElementById('readerTags');
    if (tagsEl) {
        tagsEl.innerHTML = (journal.tags || [])
            .map(t => `<span class="j-tag">#${esc(t)}</span>`).join('');
    }

    // 上一篇 / 下一篇（依据当前目录顺序）
    const idx = currentList.findIndex(x => x.id === journal.id);
    const prev = idx > 0 ? currentList[idx - 1] : null;
    const next = idx >= 0 && idx < currentList.length - 1 ? currentList[idx + 1] : null;
    const navEl = document.getElementById('readerNav');
    if (navEl) {
        navEl.innerHTML =
            (prev
                ? `<a class="reader-pn prev" href="#${esc(prev.id)}"><small>上一篇</small><span>${esc(prev.title)}</span></a>`
                : `<span class="reader-pn disabled"><small>上一篇</small><span>已经是第一篇了</span></span>`) +
            (next
                ? `<a class="reader-pn next" href="#${esc(next.id)}"><small>下一篇</small><span>${esc(next.title)}</span></a>`
                : `<span class="reader-pn disabled next"><small>下一篇</small><span>已经是最后一篇了</span></span>`);
    }

    listView.hidden = true;
    readerView.hidden = false;
    document.body.classList.add('reading');
    document.title = (journal.title || '日志') + ' - 我的个人空间';

    window.scrollTo({ top: 0, behavior: 'auto' });
}

function backToList() {
    if (location.hash) {
        // 清掉 hash（用 pushState 避免多留一条历史；hashchange 不会触发，手动切换）
        history.pushState(null, '', location.pathname + location.search);
        showList();
    } else {
        showList();
    }
}

})();
