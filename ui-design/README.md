# FEBIRDY 主题 V1 设计基线

本目录保留已选定的桌面深色页面与品牌 Logo。每个子目录包含原始 `screen.png` 和 Stitch 导出的 `code.html`；HTML 是设计参考，不是可直接发布的 Hexo 主题实现。

| 目录 | 页面 | 原始画板 |
| --- | --- | --- |
| 01-home | 首页，统一视觉基准 | febirdy_blog_desktop_5 |
| 02-article | 文章详情 | febirdy_blog_desktop_6 |
| 03-search | 搜索结果弹层 | febirdy_blog_desktop_7 |
| 04-archives | 归档 | febirdy_blog_desktop_dark_1 |
| 05-categories | 分类总览与当前分类文章 | febirdy_blog_desktop_dark_2 |
| 06-about | 关于 | febirdy_blog_desktop_dark_3 |
| 07-tags | 标签总览与当前标签文章 | febirdy_blog_desktop_dark_4 |
| 08-404 | 页面不存在 | febirdy_blog_404_desktop_dark |
| 09-brand-logo | 品牌标识 | febirdy_geometric_brand_logo |

来源：`stitch_futuristic_developer_portal_landing_page (2).zip`。历史 ZIP 和未选稿不作为开发依据，已从工程中清理。

## 定稿边界

- 采用克制的未来科技感，以首页的深色背景、青蓝强调色、导航、边框和间距统一其余页面。
- 保留 Aomori 功能，全面重做视觉和布局。设计中的额外按钮不代表已授权增加对应功能。
- 尚未完成独立设计验收：博客移动端、浅色主题、搜索初始/加载/无结果状态、移动导航与目录展开状态。
- 归档长标题允许合理换行；文章封面保持可选。
- 移除没有功能依据的账户入口、虚构浏览量、缓存指标和调试信息。
- 文章与统计使用真实 Hexo 数据；标签出现次数之和不能作为文章总数。
- 关于页的经历、头像、联系方式、GitHub 和 RSS 地址须按真实资料核对，不能照搬示例。
- 404 文案使用“链接可能已变更，或页面不存在”，移除“尚未被索引”的错误解释。
- 原始设计文件保留原貌，上述修正于主题实现时落实。
