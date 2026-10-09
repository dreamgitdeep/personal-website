# 内容管理指南（Supabase 版）

> 目标：**以后改日志、传照片、改简历，都不用再改代码，也不用 git push。**
> 全程在浏览器里点几下，保存后刷新网页就能看到。

---

## 一、先搞清楚一件事

你的网站是**纯静态网站**（HTML + CSS + JS，托管在 GitHub Pages），本身没有服务器，所以没法像 WordPress 那样自带后台。

解决办法是把「内容」搬到一个**云端数据库**里：网站每次打开时去云端取最新内容。你只需要在 Supabase 的网页后台里改内容，网站就自动变了。

```
你（浏览器改内容）→ Supabase 云端数据库 → 网站自动显示
```

**好消息**：在你配置好之前，网站会继续使用原来的本地数据，**不会白屏、不会报错**。可以随时中断、随时继续。

---

## 二、配置步骤（只需做一次，约 15 分钟）

### 第 1 步：创建 Supabase 项目

1. 打开 https://supabase.com ，用 GitHub 账号登录
2. 点 **New project**
3. 填：
   - Name：随便起，比如 `my-website`
   - Database Password：**设置一个密码并记下来**（后面基本用不到，但丢了很麻烦）
   - Region：选 **Singapore（新加坡）**，国内访问相对最快
4. 点 **Create new project**，等约 2 分钟

### 第 2 步：建表

1. 左侧菜单点 **SQL Editor**
2. 点 **New query**
3. 把仓库里的 `supabase-schema.sql` **全部内容**复制进去
4. 点右下角 **Run**（或按 Ctrl + Enter）

看到 `Success. No rows returned` 就成功了。

这一步创建了 5 张表：

| 表名 | 存什么 |
|---|---|
| `journals` | 日志 / 文章 |
| `plans` | 计划目标 |
| `photos` | 相册照片 |
| `profile` | 个人信息 |
| `resume` | 简历（整份存一行） |

同时开启了 RLS 安全策略：**所有人只能读，只有你自己登录后台才能改**。所以前端暴露密钥也不会被人篡改内容。

### 第 3 步：拿到密钥并填进配置

1. 左侧菜单点 **Settings**（齿轮图标）→ **API**
2. 找到两个值：
   - **Project URL**：形如 `https://abcdefgh.supabase.co`
   - **anon public**：一长串 `eyJhbGciOi...`
3. 打开仓库里的 `js/supabase-config.js`，填进去：

```js
window.SUPABASE_CONFIG = {
    url: 'https://abcdefgh.supabase.co',
    anonKey: 'eyJhbGciOi...粘贴你的那一长串...',
};
```

4. 保存、提交、推送到 GitHub
5. 等 1–2 分钟，刷新网页

打开网页按 F12 看控制台，看到 `✅ DataService：已连接 Supabase` 就成功了。

> ⚠️ 只填 **anon public** 这个，**千万不要**填 `service_role` 那个（它是最高权限密钥，泄露等于把数据库交给别人）。

### 第 4 步：建相册存储空间

1. 左侧点 **SQL Editor** → **New query**
2. 把仓库里的 `init-storage.sql` 全部内容粘贴进去 → **Run**

这一步会建好 `photos` 公开存储桶，并配好权限（所有人能看图，只有登录后能传图）。

> 也可以手动建：Storage → New bucket → 名字 `photos` → 勾 Public。
> 但**手动建完仍要执行 `init-storage.sql`**，否则上传会被安全策略拦下。

### 第 5 步：进管理端设一个密码（不用建账号）

打开 `admin.html`，**直接想一个密码输进去就行**——第一次输入时系统会自动用它建好你的账号并登录，
以后都用同一个密码进入。不需要去后台创建用户。

> 万一提示「需要邮箱验证」：Supabase → **Authentication** → **Sign In / Providers** →
> **Email** → 关掉 `Confirm email`，回来重试一次就好。这是项目默认设置，关掉不影响安全，
> 因为管理端没有公开注册入口。

---

## 三、日常怎么用（推荐：网页管理端）

管理端地址（建议存书签）：

```
https://dreamgitdeep.github.io/personal-website/admin.html
```

更方便的做法：网站**任何一个页面**滚到最底部，点「内容管理」就能进，不用记网址。
管理端本身也带网站的导航栏和页脚，来回切换和站内翻页一样。

输入管理密码即可进入（第一次输的密码会自动成为你的账号密码，之后沿用）。
登录状态会记住一段时间，下次打开通常不用重输。登录后有四个页签：

| 页签 | 能做什么 |
|---|---|
| 简历 / 关于我 | 改姓名、意向、电话、邮箱、城市、状态、个人概述、6 项数据看板；下方还有完整的 JSON 可改经历、教育、科研、技能 |
| 日志 | 新建 / 编辑 / 删除日志，填标题、分类、日期、摘要、正文、标签即可 |
| 相册 | 一次选多张照片批量上传，自动进对应相册；也能删 |
| 个人信息 | 直接编辑 JSON |

保存后**刷新网站页面**就能看到最新内容，不用改代码、不用 git push。

> 简历页表单只覆盖常用字段；工作经历、教育背景、科研成果、技能这些在「完整数据（高级）」的 JSON 里改，
> 改之前可以先点「格式化」确认 JSON 没写错。不确定就别动这块，只改上面表单也够用。

---

## 四、备用方案：直接改数据库

不想用管理端时，可以直接在 Supabase 后台改表。

### 写日志 / 改日志

1. Supabase 左侧点 **Table Editor** → 选 `journals` 表
2. 点 **Insert row** → **Insert a new row**
3. 只需要填两个字段：
   - `data`：一条日志的完整 JSON（见下面模板）
   - `status`：`published`（想 temporarily 隐藏就填 `draft`）
   - `id` 和 `created_at` 不用管，会自动生成
4. 点 **Save**

日志 JSON 模板（复制改内容即可）：

```json
{
  "id": "journal-20261009",
  "title": "我的新日志标题",
  "category": "study",
  "categoryName": "学习",
  "excerpt": "摘要，150 字以内",
  "content": "正文第一段。\n\n正文第二段。",
  "tags": ["标签1", "标签2"],
  "coverImage": "images/blog/my-cover.jpg",
  "createdAt": "2026-10-09",
  "readTime": 3,
  "isTop": false
}
```

改已有日志：直接点那一行，双击 `data` 单元格编辑，改完点 Save。

### 上传照片（重点，这是你最想要的）

1. 左侧点 **Storage** → **New bucket**
   - Name 填 `photos`
   - **勾上 Public bucket**（必须勾，否则网站读不到图）
2. 进入 `photos` bucket → **Upload files** → 选中你的照片上传
3. 上传完点照片名 → 点 **Get URL** → 复制那个链接
4. 回到 **Table Editor** → `photos` 表 → Insert row：
   - `album`：填 `hiking` / `travel` / `cycling` / `crocheting` / `painting`
   - `data`：填 JSON，把刚才复制的 URL 粘进去

```json
{
  "url": "https://xxxx.supabase.co/storage/v1/object/public/photos/xxx.jpg",
  "caption": "照片描述",
  "location": "拍摄地点",
  "takenAt": "2026-10-09"
}
```

**为什么这样更好**：照片不再进 GitHub 仓库，仓库不会越来越大；手机上也能直接上传。

### 改简历

`resume` 表里只有一行，`data` 字段是整份简历的 JSON。

最简单的做法：把仓库里 `data/resume.json` 的内容整段复制，粘到 `data` 字段里，以后想改就在 Supabase 里改这一行。

### 改个人信息 / 计划

同理，改 `profile` 表和 `plans` 表。

---

## 五、常见问题

**Q：配置了但网页没变化？**
A：按顺序排查——
1. F12 控制台有没有报错
2. Supabase 表里是不是真的有数据（**空表会自动回退到本地数据**，这是设计好的）
3. GitHub Pages 有 1–2 分钟缓存，等一会儿再刷新
4. 浏览器硬刷新：Ctrl + F5

**Q：想临时停用云端，回退到本地数据？**
A：把 `js/supabase-config.js` 里两个值清空即可，网站立刻恢复原来的样子。

**Q：数据会不会丢？**
A：Supabase 免费版足够个人使用，但建议偶尔导出一次：Table Editor → 右上角 **Export** → 下载 CSV/JSON 备份。

**Q：免费版有什么限制？**
A：数据库 500MB、存储 1GB、每月 5GB 流量，个人网站远远用不完。唯一要注意：连续 7 天没人访问项目会被暂停，去控制台点一下就能恢复。

**Q：能不能不用数据库？**
A：可以，但体验会差很多。替代方案是 Decap CMS（在仓库上加一个 /admin 页面，改完自动 git commit），它不用数据库，但图片仍然存仓库，长期会让仓库变大，且需要配 GitHub 授权登录。

---

## 六、文件说明

| 文件 | 作用 |
|---|---|
| `admin.html` | **网页管理端**，登录后改内容 |
| `js/supabase-config.js` | 填 URL 和密钥（已填好，一般不用再动） |
| `js/data-service.js` | 统一数据层，自动判断用云端还是本地数据 |
| `supabase-schema.sql` | 建表脚本，只需执行一次 |
| `init-storage.sql` | 建相册存储桶 + 权限，只需执行一次 |
| `init-resume-data.sql` | 把简历初始内容写入云端，只需执行一次 |
| `data/resume.json` | 简历内容（云端没数据时的兜底来源） |
| `resume.html` | 关于我 / 简历页面 |

**Q：管理端进不去 / 提示密码不对？**
A：按顺序排查——
1. 密码至少 6 位，且必须和你第一次设的那个**完全一致**
2. 提示「需要邮箱验证」→ 按第 5 步关掉 `Confirm email` 再试
3. 提示「项目关闭了自助注册」→ Supabase → Authentication → Sign In / Providers → 打开 `Allow new users to sign up`
4. 换过 `adminEmail` 等于换了账号，需要用新密码重新设一次

**Q：忘了密码？**
A：Supabase → Authentication → Users → 点你的账号 → 右上角 **Send password recovery**
（或直接在那里 `Reset password`）；也可以删掉该用户，回管理端重新设一次密码。

**Q：管理端保存时提示权限错误（row-level security）？**
A：说明没登录成功，或 `supabase-schema.sql` 的写入策略没执行到。重新执行一次该脚本即可（它可重复执行）。
