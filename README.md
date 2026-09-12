# hexo-theme-febirdy

基于 Aomori 1.36.0 的独立 Hexo 主题。视觉目标为深色背景、青蓝强调色与适合中文长文阅读的布局，设计基准见 [ui-design/README.md](ui-design/README.md)。

## 当前阶段

已导入本机博客曾使用的 Aomori 源码、预构建资源与原始 MIT 许可证，建立独立 master 仓库和隔离生成工具。当前已完成首页、文章详情、归档、分类/标签列表的 FEBIRDY 视觉迁移，并提供分类/标签总览、关于页、404 和搜索弹层模板；首页宽屏布局与分页视觉、文章详情页真实图片查看器均已完成真实内容回归。主题已通过博客 Submodule 接入 `tech-blogs`，并随博客 `master` 部署到线上；后续进入构建质量、移动端交互和搜索能力优化阶段。

原始作者：LIN HONG。上游：https://github.com/lh1me/hexo-theme-aomori 。原始使用文档见 [docs/AOMORI-UPSTREAM.md](docs/AOMORI-UPSTREAM.md)。主题配置以 `febirdy_*` 为正式命名；除已移除的 `aomori_widgets` 外，其他历史 Aomori 字段暂时保留读取回退。

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

1. 补充移动端导航、文章目录抽屉、搜索弹层状态和键盘/无障碍回归检查。
2. 直接配置 Algolia 后，回归搜索弹层的命中、无结果和键盘操作状态；当前优先级低于构建与移动端体验。
3. 真实内容验收持续稳定后，再评估 Aomori 可选模块的针对性清理。

当前博客已启用 Giscus，线上评论已验证可发布和显示；Algolia 仍未配置启用，搜索不能视为已经可用。站点地图属于博客插件，继续由博客生成。
