/**
 * 简历页面脚本
 * 数据来源：优先 data/resume.json（后续可切换到 Supabase，见 js/data-service.js）
 * 内容全部由 data/resume.json 驱动，改内容不需要动代码
 */

document.addEventListener('DOMContentLoaded', async function () {
    const data = await loadResumeData();
    if (!data) return;

    renderProfile(data.profile);
    renderKpis(data.kpis);
    renderSummary(data.summary);
    renderCapabilities(data.capabilities);
    renderExperience(data.experience);
    renderEducation(data.education);
    renderResearch(data.research);
    renderCampus(data.campus);
    renderSkills(data.skills);

    initReveal();
    document.body.classList.add('resume-ready');
});

/* ---------- 数据加载 ---------- */
async function loadResumeData() {
    try {
        // 若接入了 Supabase，走统一数据层；否则回退本地 JSON
        if (window.DataService && typeof window.DataService.getResume === 'function') {
            const d = await window.DataService.getResume();
            if (d) return d;
        }
        const res = await fetch('data/resume.json');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return await res.json();
    } catch (e) {
        console.error('❌ 简历数据加载失败:', e);
        const box = document.getElementById('resumeContent');
        if (box) box.innerHTML = '<p class="resume-error">简历数据加载失败，请检查 data/resume.json 是否存在。</p>';
        return null;
    }
}

/* ---------- 工具：把 {22} 渲染成高亮数字 ---------- */
function highlight(text) {
    return String(text).replace(/\{([^}]+)\}/g, '<span class="hl">$1</span>');
}
function esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ---------- 各区块渲染 ---------- */
function renderProfile(p) {
    if (!p) return;
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML = val; };
    set('rName', esc(p.name || ''));
    set('rIntent', esc(p.intent || ''));
    set('rLocation', esc(p.location || ''));
    set('rStatus', esc(p.status || ''));

    const avatar = document.getElementById('rAvatar');
    if (avatar && p.avatar) avatar.src = p.avatar;

    // 名片里的电话 / 邮箱：文本与链接同时设置
    const tel = document.getElementById('rTelLink');
    if (tel && p.phone) { tel.textContent = p.phone; tel.href = 'tel:' + p.phone; }
    const mail = document.getElementById('rMailLink');
    if (mail && p.email) { mail.textContent = p.email; mail.href = 'mailto:' + p.email; }
    // 顶部「邮件联系」按钮
    const btn = document.getElementById('rMailBtn');
    if (btn && p.email) btn.href = 'mailto:' + p.email;

    document.title = '关于我 - ' + (p.name || '我的个人空间');
}

function renderKpis(list) {
    const box = document.getElementById('rKpis');
    if (!box || !Array.isArray(list)) return;
    box.innerHTML = list.map(k => `
        <div class="rkpi">
            <div class="rkpi-n">${esc(k.n)}<small>${esc(k.unit || '')}</small></div>
            <div class="rkpi-t">${esc(k.label || '')}</div>
            <div class="rkpi-s">${esc(k.sub || '')}</div>
        </div>`).join('');
}

function renderSummary(html) {
    const box = document.getElementById('rSummary');
    if (box && html) box.innerHTML = html;
}

function renderCapabilities(list) {
    const box = document.getElementById('rCaps');
    if (!box || !Array.isArray(list)) return;
    box.innerHTML = list.map(c => `
        <div class="rcap reveal">
            <div class="rcap-num">${esc(c.num || '')}</div>
            <h3>${esc(c.title || '')}</h3>
            <div class="rcap-en">${esc(c.en || '')}</div>
            <ul>${(c.items || []).map(i => `<li>${i}</li>`).join('')}</ul>
        </div>`).join('');
}

function renderExperience(exp) {
    const box = document.getElementById('rExp');
    if (!box || !exp) return;
    const blocks = (exp.blocks || []).map(b => `
        <div class="rblock reveal">
            <h4>${esc(b.title || '')}<em>${esc(b.en || '')}</em></h4>
            <ul>${(b.items || []).map(i => `<li>${highlight(i)}</li>`).join('')}</ul>
        </div>`).join('');

    box.innerHTML = `
        <div class="rjob reveal">
            <div class="rjob-hd">
                <h3>${esc(exp.role || '')}</h3>
                <span class="rjob-co">${esc(exp.company || '')}</span>
                <span class="rjob-tm">${esc(exp.period || '')}</span>
            </div>
            <div class="rjob-tag">${esc(exp.tagline || '')}</div>
            <div class="rblocks">${blocks}</div>
        </div>`;
}

function renderEducation(list) {
    const box = document.getElementById('rEdu');
    if (!box || !Array.isArray(list)) return;
    box.innerHTML = list.map(e => `
        <div class="reduc reveal">
            <div class="reduc-top">
                <h3>${esc(e.school || '')}</h3>
                <span class="reduc-deg">${esc(e.degree || '')}</span>
                <span class="reduc-tm">${esc(e.period || '')}</span>
            </div>
            ${e.note ? `<div class="reduc-note">${esc(e.note)}</div>` : ''}
            <ul>${(e.items || []).map(i => `<li>${highlight(i)}</li>`).join('')}</ul>
            ${(e.honors && e.honors.length) ? `<div class="rhonors">${e.honors.map(h => `<span>${esc(h)}</span>`).join('')}</div>` : ''}
        </div>`).join('');
}

function renderResearch(list) {
    const box = document.getElementById('rResearch');
    if (!box || !Array.isArray(list)) return;
    const cls = ['', 'alt', 'third'];
    box.innerHTML = list.map((r, i) => `
        <div class="rpaper reveal">
            <span class="rpaper-lv ${cls[i] || ''}">${esc(r.level || '')}</span>
            <p>${esc(r.title || '')}</p>
        </div>`).join('');
}

function renderCampus(list) {
    const box = document.getElementById('rCampus');
    if (!box || !Array.isArray(list)) return;
    box.innerHTML = list.map(c => `
        <div class="rblock reveal">
            <h4>${esc(c.title || '')}<em>${esc(c.period || '')}</em></h4>
            <ul><li>${esc(c.text || '')}</li></ul>
        </div>`).join('');
}

function renderSkills(list) {
    const box = document.getElementById('rSkills');
    if (!box || !Array.isArray(list)) return;
    box.innerHTML = list.map(s => `
        <div class="rskill reveal">
            <h4>${esc(s.name || '')}</h4>
            <div class="rtags">
                ${(s.tags || []).map(t => `<span class="${t.hi ? 'hi' : ''}">${esc(t.text)}</span>`).join('')}
            </div>
        </div>`).join('');
}

/* ---------- 滚动入场动画 ----------
   注意：站内 css/style.css 定义的是 .reveal（初始隐藏）+ .reveal.active（显示），
   这里必须用 active，不能写成 show，否则内容会一直不可见。
*/
function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
        items.forEach(el => el.classList.add('active'));
        return;
    }
    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('active'), i * 80);
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    items.forEach(el => io.observe(el));
}

/* ---------- 打印 / 导出 PDF ---------- */
function printResume() {
    window.print();
}
window.printResume = printResume;
