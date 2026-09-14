# hexo-theme-febirdy

基于 Aomori 1.36.0 演进的独立 Hexo 主题。视觉目标为深色背景、青蓝强调色与适合中文长文阅读的布局，同时支持浅色、自动和深色三档主题模式；设计基准见 [ui-design/README.md](ui-design/README.md)。

## 当前阶段

已导入 Aomori 源码、预构建资源与原始 MIT 许可证，建立独立 master 仓库和隔离生成工具。当前已完成首页、文章详情、归档、分类/标签列表的 FEBIRDY 视觉迁移，并提供分类/标签总览、关于页、404、搜索弹层和可配置侧栏模板；首页宽屏布局与分页视觉、文章详情页真实图片查看器、无障碍交互、Algolia 搜索和真实内容回归均已完成。主题已通过博客 Submodule 接入 `tech-blogs`，并随博客 `master` 部署到线上；当前版本准备通过 GitHub Release 对外提供。

原始作者：LIN HONG。上游：https://github.com/lh1me/hexo-theme-aomori 。原始使用文档见 [docs/AOMORI-UPSTREAM.md](docs/AOMORI-UPSTREAM.md)。主题配置以 `febirdy_*` 为正式命名；除已移除的 `aomori_widgets` 外，其他历史 Aomori 字段暂时保留读取回退。

## 安装主题

当前版本通过 GitHub 源码或 Release 使用，暂未发布到 npm；`package.json` 继续保留 `private: true`，避免误执行 npm 发布。把主题放入 Hexo 站点的 `themes/febirdy` 目录，并在站点 `_config.yml` 中指定：

```sh
# 方案一：作为 Git Submodule（便于跟踪主题版本）
git submodule add https://github.com/sandy1108/hexo-theme-febirdy.git themes/febirdy

# 方案二：直接克隆到主题目录
git clone https://github.com/sandy1108/hexo-theme-febirdy.git themes/febirdy
```

```yml
theme: febirdy
```

主题按 `master` 维护。更新 Submodule 后，需要在博客仓库提交新的子模块指针；不要把主题仓库的文件复制到博客文章目录，也不要提交主题预览生成的 `.preview/` 内容。

## 版本与发布

- 当前版本：`0.1.0`。
- GitHub：源码和 Release 是当前推荐的使用方式；Release 会固定对应的主题提交，便于站点锁定版本。
- npm：当前暂不发布。若未来发布 npm，需要先移除 `private: true`，再单独完成包安装、版本和发布凭据验收。
- 衍生关系：主题保留 Aomori 的 MIT 许可证、原作者和来源说明；FEBIRDY 的新增和重做部分按本仓库维护。

## 兼容版本

- Hexo：已使用 8.1.2 的最小样例站点验证生成流程。
- Node.js：`>=20.19.0`（主题维护工具链中的 Sass、压缩插件要求 Node 20）；主题 CI 当前检查 Node.js 20 和 22。
- 主题包已包含可直接运行的 `source/dist` 预构建资源；Hexo 站点仍需按自己的工程安装 Hexo、渲染器和生成器依赖。

## 本地验证

相邻 `../tech-blogs` 需已安装依赖。主题作为独立仓库或 `tech-blogs/themes/febirdy` Submodule 时均可运行：

```sh
npm run preview:build
# 或指定另一个已安装依赖的博客目录
node tools/preview.cjs /absolute/path/to/blog
```

每次在 `.preview/site-*` 新建隔离副本，复制文章、配置和主题运行文件，只读复用博客依赖；生成结果路径由命令输出。不会修改原博客配置、文章或 public 目录，也不会执行部署。预览副本含博客内容，不应发布或提交。修改主题后需重新运行生成命令；如果自动识别失败，也可以显式传入博客绝对路径。
预览还会逐个解析生成页面中的 JSON-LD；任一结构化数据无效时命令会失败，避免错误直到上线后才被搜索引擎发现。

主题 `npm run build` 是 Gulp 资源编译流程，需先安装主题自身开发依赖。当前 ESLint、Stylelint、CSS 和 JavaScript 构建均可通过；Dart Sass 仍会输出 legacy API 与 `@import` 的未来弃用警告，后续单独处理，不与视觉功能改动混合。

主题维护者可以用下面的命令执行与 CI 相同的本地检查：

```sh
npm ci --ignore-scripts
npm run test
npm pack --dry-run
```

`npm run test` 会验证代码风格、资源构建和 `examples/minimal-site` 最小站点。现有构建流程按项目约定更新时间戳写入 `_config.yml` 的 `version` 字段；这是已知副作用，检查结束后不要把这次自动更新时间误提交。

## 兼容性模板说明

仓库仍保留 `layout/_partial/article-tweet.ejs`，用于兼容早期 Aomori 站点的 tweet 文章片段。当前 FEBIRDY 的 `layout/post.ejs` 默认渲染标准文章模板，并不会自动调用这个片段；需要 tweet 布局时，请在站点中显式覆盖文章模板或手动引用该 partial。这样可以保留旧站点的可迁移性，同时避免使用者误以为 tweet 模板已经自动接入。

## 入口页接入

分类、标签、关于和 404 是 Hexo 页面模板，主题不会凭空创建博客页面。真实博客需要在 `source/` 中添加对应页面，例如：

```markdown
---
title: 关于
layout: about
sidebar: false
---

在这里填写自己的介绍。
```

`categories`、`tags` 和 `404` 页面只需把 `layout` 分别改为 `categories`、`tags`、`404`。关于页还可以在站点配置中按需填写 `febirdy_about` 的 `focus`、`tools` 和 `links`；不填写时主题只使用真实的作者、描述、分类、RSS 和站点 URL。

## 站点文案配置

主题不会把某个博客的个人介绍、传送门地址或首页宣传语写死在模板中。请在博客工程的 `_config.yml` 中覆盖这些配置；博客配置优先于主题 `_config.yml` 的通用占位值：

```yml
febirdy_site:
  brand: YOUR BLOG
  brand_suffix: BLOG
  brand_mark: TB
  tagline: 在这里填写博客的一句话介绍
  portal:
    url: https://example.com
    label: 个人传送门

febirdy_home:
  eyebrow: 在这里填写博客定位或技术方向
  title: 在这里填写博客首页主标题
  description: 在这里填写博客简介、内容范围和写作方向。
  feed_title: 最新文章
  feed_count_suffix: 篇文章

febirdy_about:
  name: ''
  tagline: ''
  quote: 在这里填写想对读者说的一句话。
  focus: []
  tools: []
  links: []
```

如果不需要个人传送门，将 `febirdy_site.portal.url` 留空即可。导航、搜索、分类、标签等属于主题界面文字，不需要写入站点配置。

## 侧栏组件配置

侧栏组件可以在博客工程的 `_config.yml` 中通过 `febirdy_widgets` 覆盖主题默认顺序：

```yml
febirdy_widgets:
  - category
  - tag
  - recent_posts
  # - archive
```

目前支持 `category`（分类）、`tag`（标签）、`recent_posts`（最近文章）和 `archive`（按年份归档）。重复项会自动去重，未知组件会被忽略；配置为空数组时可以隐藏这些可选组件，但个人信息卡片仍会保留。文章目录由文章页独立渲染为桌面目录和移动端抽屉，因此不应加入 `toc`。
标签组件默认在每个标签后显示该标签关联的文章数量；数量来自 Hexo 的标签集合，不需要在主题或文章之外维护第二份数据。

## Algolia 搜索（可选）

主题内置 Algolia Lite 客户端，但不会替博客创建索引，也不会要求主题仓库保存写入凭据。需要启用搜索时，在博客工程的 `_config.yml` 中填写公开配置并显式打开开关：

```yml
febirdy_search_algolia:
  enable: true

algolia:
  appId: YOUR_APPLICATION_ID
  apiKey: YOUR_SEARCH_ONLY_API_KEY
  indexName: tech-blogs-production
  fields:
    - title
    - excerpt:strip:truncate,0,500
    - tags
    - categories
    - permalink
    - date
```

`appId`、Search-only `apiKey` 和 `indexName` 会以 HTML `data-*` 属性提供给浏览器，因此 Search-only key 不属于需要隐藏的写入凭据；不要把 Admin API key 或 indexing key 写入站点配置、主题仓库或生成的 HTML。索引字段示例刻意不包含 `content`，只上传标题、摘要、分类、标签、链接和日期。

索引插件使用 `hexo-algoliasearch`，在博客工程安装后可手动执行：

```sh
ALGOLIA_ADMIN_API_KEY='YOUR_RESTRICTED_INDEXING_KEY' npx hexo algolia
```

这里的环境变量名沿用插件约定，但值应是只授予目标索引写入权限的受限 indexing key，不是完整 Admin API key。命令默认会先清空再重建索引；确认无误后可用 `npx hexo algolia --no-clear` 做增量写入。持续集成时建议把同一个受限 key 保存为 GitHub Actions Secret `ALGOLIA_ADMIN_API_KEY`，工作流仅在 Secret 存在时运行索引步骤。

若缺少开关、Application ID、Search-only key 或索引名，主题会关闭 Algolia 搜索并显示未启用提示，不会输出不完整的 meta 配置。

## 配置命名迁移

为便于主题公共化，主题配置逐步从 Aomori 前缀迁移到 FEBIRDY 前缀。博客工程应优先使用右侧的新名称：

| 历史名称 | 正式名称 |
| --- | --- |
| `aomori_logo` | `febirdy_logo` |
| `aomori_logo_typed_animated` | `febirdy_logo_typed_animated` |
| `aomori_search_algolia` | `febirdy_search_algolia` |
| `aomori_social` | `febirdy_social` |
| `aomori_favicon` | `febirdy_favicon` |
| `aomori_google_site` | `febirdy_google_site` |
| `aomori_gitalk` | `febirdy_gitalk` |
| `aomori_valine` | `febirdy_valine` |
| `aomori_disqusjs` | `febirdy_disqusjs` |
| `aomori_disqus_shortname` | `febirdy_disqus_shortname` |
| `aomori_remark42` | `febirdy_remark42` |
| `aomori_giscus` | `febirdy_giscus` |
| `aomori_google_ads` | `febirdy_google_ads` |
| `aomori_copyright` | `febirdy_copyright` |
| `aomori_busuanzi` | `febirdy_busuanzi` |

除 `aomori_widgets` 外，当前版本会通过 `scripts/config-normalizer.js` 在生成前读取历史名称作为回退，布局层还保留同样的兜底逻辑；新配置优先级更高。浏览器端正式命名空间为 `window.febirdy`，同时保留 `window.aomori` 兼容别名。后续稳定版本可再评估移除兼容层。

## 后续步骤

1. 持续维护 FEBIRDY 配置命名和 Aomori 兼容回退；删除兼容层前先完成资源引用矩阵和陌生站点迁移验证。
2. 继续观察 Algolia 索引、Search Console 收录和真实站点性能；索引写入凭据只保存在 GitHub Actions Secret 中。
3. 依赖漏洞按依赖链逐项评估，不使用 `npm audit fix --force` 一次性升级。
4. GitHub Release 稳定后，再单独评估 npm 发布和陌生站点安装验收。

当前博客已启用 Giscus，线上评论已验证可发布和显示；Algolia 搜索已完成首次真实索引并验证可用。站点地图属于博客插件，继续由博客生成。
