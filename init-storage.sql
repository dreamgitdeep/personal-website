-- ============================================================
--  相册存储空间：建桶 + 访问策略
--  用法：Supabase 控制台 → SQL Editor → 新建查询 →
--        粘贴全部内容 → 点 Run
--  只需执行一次；重复执行也不会报错
-- ============================================================

-- ------------------------------------------------------------
-- 第 1 步：建公开存储桶（名字必须是 photos，管理端里写死了）
--   放在最前面，保证即使后面策略部分报错，桶也已经建好
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do update set public = true;

-- 自检：下面这条执行后应返回 1 行（photos | true）
select id, public from storage.buckets where id = 'photos';

-- ------------------------------------------------------------
-- 第 2 步：访问策略
--   · 所有人都能看图（公开读）
--   · 只有登录后台的人能传图、改图、删图
-- ------------------------------------------------------------
drop policy if exists "public read photos" on storage.objects;
drop policy if exists "auth insert photos" on storage.objects;
drop policy if exists "auth update photos" on storage.objects;
drop policy if exists "auth delete photos" on storage.objects;

create policy "public read photos"
  on storage.objects for select
  using (bucket_id = 'photos');

create policy "auth insert photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'photos');

create policy "auth update photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'photos');

create policy "auth delete photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'photos');

-- ------------------------------------------------------------
-- 自检：应返回 4 行，全是 photos 相关策略
-- ------------------------------------------------------------
select policyname, cmd from pg_policies
where schemaname = 'storage' and tablename = 'objects'
  and policyname like '%photos%';
