'use strict'

// 在 Hexo 生成页面前把历史 Aomori 配置映射到 FEBIRDY 正式名称。
// 文章页的评论、广告等 partial 可能先于最外层 layout 渲染，因此不能只依赖 layout.ejs。
const legacyConfigAliases = {
    febirdy_logo: 'aomori_logo',
    febirdy_logo_typed_animated: 'aomori_logo_typed_animated',
    febirdy_search_algolia: 'aomori_search_algolia',
    febirdy_social: 'aomori_social',
    febirdy_favicon: 'aomori_favicon',
    febirdy_google_site: 'aomori_google_site',
    febirdy_gitalk: 'aomori_gitalk',
    febirdy_valine: 'aomori_valine',
    febirdy_disqusjs: 'aomori_disqusjs',
    febirdy_disqus_shortname: 'aomori_disqus_shortname',
    febirdy_remark42: 'aomori_remark42',
    febirdy_giscus: 'aomori_giscus',
    febirdy_google_ads: 'aomori_google_ads',
    febirdy_copyright: 'aomori_copyright',
    febirdy_busuanzi: 'aomori_busuanzi'
}

const config = hexo.config
Object.keys(legacyConfigAliases).forEach(function (newKey) {
    const legacyKey = legacyConfigAliases[newKey]
    if (typeof config[newKey] === 'undefined' && typeof config[legacyKey] !== 'undefined') {
        config[newKey] = config[legacyKey]
    }
})
