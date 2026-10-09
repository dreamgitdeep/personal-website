/**
 * ============================================================
 *  统一数据层 DataService
 * ============================================================
 *  作用：所有页面都通过它取数据，数据来源可以是
 *        ① Supabase 云端数据库（配置了 js/supabase-config.js 时）
 *        ② 本地 data/*.json 或脚本内嵌数据（未配置或云端失败时）
 *
 *  设计原则：任何一个环节出错都自动回退，绝不让页面白屏。
 */

(function () {
    'use strict';

    var client = null;        // Supabase 客户端
    var ready = null;         // 初始化 Promise
    var enabled = false;      // 是否启用了 Supabase

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
        return new Promise(function (resolve, reject) {
            var s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = function () { reject(new Error('无法加载 ' + src)); };
            document.head.appendChild(s);
        });
    }

    /* ---------- 本地 JSON 兜底 ---------- */
    function localJson(path) {
        return fetch(path).then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        });
    }

    /* ---------- 通用查询：Supabase 优先，失败回退本地 ---------- */
    function query(table, options, localPath, transform) {
        return init().then(function (ok) {
            if (!ok) return fallback();

            var q = client.from(table).select(options.select || '*');
            if (options.order) q = q.order(options.order, { ascending: false });
            if (options.eq) q = q.eq(options.eq[0], options.eq[1]);

            return q.then(function (res) {
                if (res.error) throw res.error;
                var rows = res.data || [];
                if (!rows.length) return fallback();   // 云端空表 → 用本地数据
                return transform ? transform(rows) : rows;
            }).catch(function (e) {
                console.warn('⚠️ ' + table + ' 云端读取失败，回退本地', e);
                return fallback();
            });
        });

        function fallback() {
            return localPath ? localJson(localPath).catch(function () { return null; }) : Promise.resolve(null);
        }
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

        /** 计划数据（结构：{ plans: {...}, stats: {...} }） */
        getPlans: function () {
            return query('plans', { order: 'created_at' }, 'data/plans.json', function (rows) {
                var out = { plans: { 'short-term': [], 'medium-term': [], 'long-term': [] }, stats: null };
                rows.forEach(function (r) {
                    var d = r.data || r;
                    if (r.plan_type && out.plans[r.plan_type]) out.plans[r.plan_type].push(d);
                });
                var s = rows.find(function (r) { return r.plan_type === '__stats__'; });
                if (s) out.stats = s.data;
                return out;
            });
        },

        /** 个人信息 */
        getAbout: function () {
            return query('profile', { select: '*' }, 'data/about.json', function (rows) {
                return (rows[0] && rows[0].data) || rows[0] || null;
            });
        },

        /** 简历（整份 JSON 存在一行里） */
        getResume: function () {
            return query('resume', { order: 'updated_at' }, 'data/resume.json', function (rows) {
                return (rows[0] && rows[0].data) || null;
            });
        },

        /** 相册照片 */
        getPhotos: function (album) {
            return query('photos',
                { order: 'sort_order', eq: album ? ['album', album] : null },
                album ? 'data/gallery/' + album + '.json' : null,
                function (rows) {
                    return { photos: rows.map(function (r) { return r.data || r; }) };
                });
        }
    };
})();
