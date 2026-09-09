# hexo-theme-febirdy

基于 Aomori 1.36.0 的独立 Hexo 主题。视觉目标为深色背景、青蓝强调色与适合中文长文阅读的布局，设计基准见 [ui-design/README.md](ui-design/README.md)。

## 当前阶段

已导入本机博客正在使用的 Aomori 源码、预构建资源与原始 MIT 许可证，建立独立 master 仓库和隔离生成工具。当前仍呈现 Aomori 原始 UI，尚未完成 FEBIRDY 设计实现；没有线上切换或远端发布。

原始作者：LIN HONG。上游：https://github.com/lh1me/hexo-theme-aomori 。原始使用文档见 [docs/AOMORI-UPSTREAM.md](docs/AOMORI-UPSTREAM.md)。保留已有 aomori_* 配置兼容性。

## 本地验证

相邻 `../tech-blogs` 需已安装依赖。运行：

```sh
npm run preview:build
# 或指定另一个已安装依赖的博客目录
node tools/preview.cjs /absolute/path/to/blog
```

每次在 `.preview/site-*` 新建隔离副本，复制文章、配置和主题运行文件，只读复用博客依赖；生成结果路径由命令输出。不会修改原博客配置、文章或 public 目录，也不会执行部署。预览副本含博客内容，不应发布或提交。修改主题后需重新运行生成命令。

原有 `npm run build` 是 Aomori 的 Gulp 资源编译流程，需先安装主题自身开发依赖；目前保留但尚未验证。预览生成使用已导入的 dist 资源，不代表 Gulp 构建已通过。

## 后续步骤

1. 首页与全站基础样式、导航、文章卡片。
2. 文章详情、目录、代码、图片与 Giscus 兼容。
3. 归档、分类、标签、关于和 404。
4. 搜索方案落实、移动端、浅色和无障碍状态。
5. 真实内容回归、用户预览验收，再处理提交与发布。

当前博客已启用 Giscus；Aomori 搜索依赖 Algolia，当前博客未配置启用。搜索需要额外实现或配置，不能视为已经可用。站点地图属于博客插件，继续由博客生成。
