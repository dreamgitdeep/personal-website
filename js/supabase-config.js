/**
 * ============================================================
 *  Supabase 配置 —— 只需要改这一个文件
 * ============================================================
 *
 *  第一步：到 https://supabase.com 新建项目（免费）
 *  第二步：进入项目 → Settings → API
 *          · Project URL       → 填到下面的 SUPABASE_URL
 *          · anon public key   → 填到下面的 SUPABASE_ANON_KEY
 *  第三步：到 SQL Editor 执行仓库里的 supabase-schema.sql 建表
 *  第四步：保存本文件，推送到 GitHub，等一两分钟刷新网页即可
 *
 *  两个值都留空 = 不启用 Supabase，网站照常使用本地数据（不会报错）
 *
 *  说明：anon key 是「公开可读」的匿名密钥，放在前端是 Supabase 官方支持的用法，
 *        安全性靠数据库的 RLS 策略控制（建表脚本里已配好：所有人只读，只有登录后台才能写）。
 *        千万不要把 service_role key 填到这里。
 */

window.SUPABASE_CONFIG = {
    // 例：'https://abcdefghijklmnop.supabase.co'
    url: '',

    // 例：'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx'
    anonKey: '',
};
