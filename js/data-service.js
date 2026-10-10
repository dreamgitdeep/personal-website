/**
 * ============================================================
 *  统一数据层 DataService
 * ============================================================
 *  作用：所有页面都通过它取数据，数据来源可以是
 *        ① Supabase 云端数据库（配置了 js/supabase-config.js 时）
 *        ② 本地 data/*.json 或脚本内嵌数据（未配置或云端失败时）
 *
 *  设计原则：任何一个环节出错都自动回退，绝不让页面白屏。
 *
 *  性能说明（2026-10-10 优化）：
 *  原来这里没有任何超时保护。整条链路是
 *  「动态插入 <script> 拉 jsdelivr 上的 supabase-js(102KB)」
 *  →「请求 supabase.co 的 REST 接口」，两个都可能在网络不畅时长时间挂起。
 *  调用方 await 在这里，页面就一直停在「—」或「正在加载…」。
 *  现在给整条链路套了 TIMEOUT 上限，超时立刻改用本地数据。
 */

(function () {
    'use strict';

    var client = null;        // Supabase 客户端
    var ready = null;         // 初始化 Promise
    var enabled = false;      // 是否启用了 Supabase

    // 单次取数的总时限（毫秒）。超过就放弃云端、改用本地数据，
    // 保证页面最多只等这么久，不会无限期停在加载态。
    var TIMEOUT = 4000;

    /* ---------- 超时包装：到点就用兜底值，不阻塞调用方 ---------- */
    function withTimeout(promise, ms, fallbackValue) {
        return new Promise(function (resolve) {
            var done = false;
            var timer = setTimeout(function () {
                if (done) return;
                done = true;
                console.warn('⏱ DataService：超过 ' + ms + 'ms 未返回，改用本地数据');
                resolve(fallbackValue);
            }, ms);

            Promise.resolve(promise).then(function (v) {
                if (done) return;
                done = true;
                clearTimeout(timer);
                resolve(v);
            }, function () {
                if (done) return;
                done = true;
                clearTimeout(timer);
                resolve(fallbackValue);
            });
        });
    }

    /* ---------- 初始化：动态加载 supabase-js（只在需要时） ---------- */
    function init() {
        if (ready) return ready;

        ready = new Promise(function (resolve) {
            var cfg = window.SUPABASE_CONFIG || {};
            if (!cfg.url || !cfg.anonKey) {
                console.info('ℹ️ DataService：未配置 Supabase，使用本地数据');
                resolve(false);
                return;
            }

            loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/dist/umd/supabase.min.js')
                .then(function () {
                    if (!window.supabase || !window.supabase.createClient) throw new Error('SDK 加载失败');
                    client = window.supabase.createClient(cfg.url, cfg.anonKey);
                    enabled = true;
                    console.info('✅ DataService：已连接 Supabase');
                    resolve(true);
                })
                .catch(function (e) {
                    console.warn('⚠️ DataService：Supabase 连接失败，回退本地数据', e);
                    enabled = false;
                    resolve(false);
                });
        });

        return ready;
    }

    function loadScript(src) {
        var p = new Promise(function (resolve, reject) {
            var s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = function () { reject(new Error('无法加载 ' + src)); };
            document.head.appendChild(s);
        });
        // SDK 脚本本身也可能一直挂着，同样限时
        return withTimeout(p, TIMEOUT, null).then(function (v) {
            if (v === null) throw new Error('SDK 加载超时：' + src);
            return v;
        });
    }

    /* ---------- 本地 JSON 兜底 ---------- */
    function localJson(path) {
        return withTimeout(
            fetch(path).then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            }),
            TIMEOUT,
            null
        ).catch(function () { return null; });
    }

    /* ---------- 通用查询：Supabase 优先，失败回退本地 ---------- */
    function query(table, options, localPath, transform) {
        var remote = init().then(function (ok) {
            if (!ok) return null;

            var q = client.from(table).select(options.select || '*');
            if (options.order) q = q.order(options.order, { ascending: false });
            if (options.eq) q = q.eq(options.eq[0], options.eq[1]);

            return q.then(function (res) {
                if (res.error) throw res.error;
                var rows = res.data || [];
                if (!rows.length) return null;         // 云端空表 → 用本地数据
                var out = transform ? transform(rows) : rows;
                // 云端数据存在但不完整（缺关键字段）→ 同样回退本地，避免页面半空
                if (!out || (Array.isArray(out) && !out.length)) return null;
                return out;
            });
        }).catch(function (e) {
            console.warn('⚠️ ' + table + ' 云端读取失败，回退本地', e);
            return null;
        });

        // 整条链路（加载 SDK + 请求接口）统一限时，超时直接用本地数据
        return withTimeout(remote, TIMEOUT, null).then(function (v) {
            if (v) return v;
            return localPath ? localJson(localPath) : Promise.resolve(null);
        });
    }

    /* ============================================================
     *  对外接口
     * ============================================================ */

    window.DataService = {

        /** 是否启用了云端 */
        isEnabled: function () { return enabled; },

        /** 日志列表 */
        getJournals: function () {
            return query('journals', { order: 'created_at' }, 'data/journals.json', function (rows) {
                return rows.map(function (r) { return r.data || r; });
            });
        },

        /** 简历（整份 JSON 存在一行里）
         *  注意：云端那行如果缺主体字段，视为无效并回退本地 JSON，
         *  否则简历页会只剩姓名和联系方式。 */
        getResume: function () {
            return query('resume', { order: 'updated_at' }, 'data/resume.json', function (rows) {
                var d = (rows[0] && rows[0].data) || null;
                if (!d || !d.kpis || !d.experience || !d.capabilities) return null;
                return d;
            });
        }
    };
})();
