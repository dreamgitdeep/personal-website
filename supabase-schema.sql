-- ============================================================
--  个人网站数据库结构（Supabase / PostgreSQL）
--  用法：Supabase 控制台 → 左侧 SQL Editor → 新建查询 →
--        粘贴全部内容 → 点 Run
--  说明：可以整段重复执行（已用 IF NOT EXISTS / DROP POLICY IF EXISTS）
-- ============================================================

-- 1. 日志表
create table if not exists public.journals (
    id          uuid primary key default gen_random_uuid(),
    data        jsonb       not null,          -- 整篇日志：标题、正文、标签、封面等
    status      text        default 'published',
    created_at  timestamptz default now()
);
create index if not exists journals_created_idx on public.journals (created_at desc);

-- 2. 计划表（plan_type = short-term / medium-term / long-term；__stats__ 存统计）
create table if not exists public.plans (
    id          uuid primary key default gen_random_uuid(),
    plan_type   text        not null,
    data        jsonb       not null,
    created_at  timestamptz default now()
);
create index if not exists plans_type_idx on public.plans (plan_type);

-- 3. 个人信息表（只保留一行）
create table if not exists public.profile (
    id          uuid primary key default gen_random_uuid(),
    data        jsonb       not null,
    updated_at  timestamptz default now()
);

-- 4. 简历表（整份简历存一行，改简历只改这一行）
create table if not exists public.resume (
    id          uuid primary key default gen_random_uuid(),
    data        jsonb       not null,
    updated_at  timestamptz default now()
);

-- ============================================================
--  安全策略（RLS）
--  策略含义：任何访客都能「读」，但只有登录了 Supabase 后台账号的人才能「写」。
--  这样即使 anon key 暴露在前端，别人也无法篡改你的内容。
-- ============================================================

alter table public.journals enable row level security;
alter table public.plans    enable row level security;
alter table public.profile  enable row level security;
alter table public.resume   enable row level security;

-- 先清理旧策略，避免重复执行报错
drop policy if exists "public read journals" on public.journals;
drop policy if exists "public read plans"    on public.plans;
drop policy if exists "public read profile"  on public.profile;
drop policy if exists "public read resume"   on public.resume;

create policy "public read journals" on public.journals for select using (status = 'published');
create policy "public read plans"    on public.plans    for select using (true);
create policy "public read profile"  on public.profile  for select using (true);
create policy "public read resume"   on public.resume   for select using (true);

-- 写入权限：仅限 authenticated（即你在 Supabase 后台登录后的身份）
drop policy if exists "auth write journals" on public.journals;
drop policy if exists "auth write plans"    on public.plans;
drop policy if exists "auth write profile"  on public.profile;
drop policy if exists "auth write resume"   on public.resume;

create policy "auth write journals" on public.journals for all to authenticated using (true) with check (true);
create policy "auth write plans"    on public.plans    for all to authenticated using (true) with check (true);
create policy "auth write profile"  on public.profile  for all to authenticated using (true) with check (true);
create policy "auth write resume"   on public.resume   for all to authenticated using (true) with check (true);

-- ============================================================
--  示例数据（可选，执行后网站立刻有内容；不需要可删掉这一段）
-- ============================================================

insert into public.resume (data)
select '{"version":"1.0","profile":{"name":"吴佳梦","intent":"AI 教育产品经理","phone":"18037021369","email":"1208376659@qq.com","location":"上海","status":"已毕业 · 可快速到岗","avatar":"images/profile/avatar.jpg"}}'::jsonb
where not exists (select 1 from public.resume);
