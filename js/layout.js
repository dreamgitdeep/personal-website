/**
 * ============================================================
 *  站点公共布局（导航栏 / 页脚）—— 全站唯一来源
 * ============================================================
 *
 *  为什么要有这个文件：
 *  原来导航栏和页脚是在每个 html 里各复制一份，改菜单要改 4 个文件，
 *  漏改一个就会出现「某个页面导航栏不一致」。现在只在这里定义一次，
 *  所有页面自动同步。
 *
 *  用法：页面里放占位元素即可
 *      <nav class="navbar" data-layout="nav"></nav>
 *      <footer class="footer" data-layout="footer"></footer>
 *
 *  想改菜单：只改下面的 MENU 数组。
 *  想加新页面：在 MENU 里加一项，并在 data-layout.js 里不用动。
 */

(function () {
    'use strict';

    /* ---------- 菜单配置（唯一来源）----------
       key   : 与文件名的对应，用于判断「当前页」高亮
       href  : 链接地址
       label : 显示文字
       admin : true 表示仅管理端显示（访客看不到）
    */
    var MENU = [
        { key: 'index.html',  href: 'index.html',  label: '首页' },
        { key: 'blog.html',   href: 'blog.html',   label: '日志' },
        { key: 'resume.html', href: 'resume.html', label: '关于我' },
        { key: 'admin.html',  href: 'admin.html',  label: '管理', admin: true }
    ];

    var SITE_NAME = '我的空间';
    var FOOTER_COPY = 'Copyright © 2026 秋千的个人空间. All Rights Reserved.';
    var FOOTER_NOTE = '本站内容未经授权禁止转载、复制或建立镜像';

    /** 当前页面文件名，如 index.html / resume.html */
    function currentFile() {
        var p = location.pathname.split('/').pop();
        return p || 'index.html';
    }

    /** 是否处在管理端页面 */
    function isAdminPage() {
        return currentFile() === 'admin.html';
    }

    function renderNav() {
        var host = document.querySelector('[data-layout="nav"]');
        if (!host) return;
        var here = currentFile();
        var html = '<div class="nav-container">' +
            '<a href="index.html" class="nav-logo">' +
                '<i class="fas fa-heart"></i><span>' + SITE_NAME + '</span>' +
            '</a>' +
            '<ul class="nav-menu">';

        MENU.forEach(function (m) {
            // admin 项只在管理端显示
            if (m.admin && !isAdminPage()) return;
            var cls = 'nav-link' + (m.key === here ? ' active' : '');
            html += '<li><a href="' + m.href + '" class="' + cls + '">' + m.label + '</a></li>';
        });

        html += '</ul>' +
            '<div class="hamburger"><span class="bar"></span><span class="bar"></span><span class="bar"></span></div>' +
        '</div>';

        // 保留原 class（如 navbar），只替换内部结构
        host.innerHTML = html;
    }

    function renderFooter() {
        var host = document.querySelector('[data-layout="footer"]');
        if (!host) return;
        host.innerHTML =
            '<div class="container"><div class="footer-content">' +
                '<p class="footer-text">' + FOOTER_COPY + '</p>' +
                '<p class="footer-disclaimer">' + FOOTER_NOTE + '</p>' +
                '<p class="footer-admin"><a href="admin.html">内容管理</a></p>' +
            '</div></div>';
    }

    function render() {
        renderNav();
        renderFooter();
    }

    // 关键：本脚本在 </body> 前引入，DOM 已解析完毕，必须【同步】渲染，
    // 否则 main.js 的 DOMContentLoaded 里找不到 .hamburger，移动端菜单会失效。
    render();

    // 供调试
    window.SiteLayout = { render: render, MENU: MENU, rendered: true };
})();
