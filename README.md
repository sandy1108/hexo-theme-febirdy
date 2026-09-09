# hexo-theme-febirdy

基于 Aomori 1.36.0 的独立 Hexo 主题。视觉目标为深色背景、青蓝强调色与适合中文长文阅读的布局，设计基准见 [ui-design/README.md](ui-design/README.md)。

## 当前阶段

已导入本机博客曾使用的 Aomori 源码、预构建资源与原始 MIT 许可证，建立独立 master 仓库和隔离生成工具。当前已完成首页、文章详情、归档、分类/标签列表的 FEBIRDY 视觉迁移，并提供分类/标签总览、关于页、404 和搜索弹层模板；首页宽屏布局与分页视觉、文章详情页真实图片查看器均已完成真实内容回归。主题已通过博客 Submodule 接入 `tech-blogs`，并随博客 `master` 部署到线上；后续进入构建质量、移动端交互和搜索能力优化阶段。

原始作者：LIN HONG。上游：https://github.com/lh1me/hexo-theme-aomori 。原始使用文档见 [docs/AOMORI-UPSTREAM.md](docs/AOMORI-UPSTREAM.md)。保留已有 aomori_* 配置兼容性。

## 本地验证

相邻 `../tech-blogs` 需已安装依赖。主题作为独立仓库或 `tech-blogs/themes/febirdy` Submodule 时均可运行：

```sh
npm run preview:build
# 或指定另一个已安装依赖的博客目录
node tools/preview.cjs /absolute/path/to/blog
```

每次在 `.preview/site-*` 新建隔离副本，复制文章、配置和主题运行文件，只读复用博客依赖；生成结果路径由命令输出。不会修改原博客配置、文章或 public 目录，也不会执行部署。预览副本含博客内容，不应发布或提交。修改主题后需重新运行生成命令；如果自动识别失败，也可以显式传入博客绝对路径。

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

## 后续步骤

1. 补充移动端导航、文章目录抽屉、搜索弹层状态和键盘/无障碍回归检查。
2. 直接配置 Algolia 后，回归搜索弹层的命中、无结果和键盘操作状态；当前优先级低于构建与移动端体验。
3. 真实内容验收持续稳定后，再评估 Aomori 可选模块的针对性清理。

当前博客已启用 Giscus，线上评论已验证可发布和显示；Algolia 仍未配置启用，搜索不能视为已经可用。站点地图属于博客插件，继续由博客生成。
