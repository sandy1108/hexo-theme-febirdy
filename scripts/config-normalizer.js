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

function isPlainObject(value) {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function normalizedString(value) {
    return typeof value === 'string' ? value.trim() : ''
}

function readAlgoliaConfig() {
    const algolia = isPlainObject(config.algolia) ? config.algolia : {}
    return {
        // applicationID/applicationId 是旧配置中可能出现的写法，appId 为插件文档中的正式写法。
        applicationId: normalizedString(
            algolia.appId || algolia.applicationId || algolia.applicationID
        ),
        // 这里只读取前端 Search-only key；绝不把 adminApiKey 暴露给模板。
        apiKey: normalizedString(algolia.apiKey || algolia.searchOnlyApiKey),
        indexName: normalizedString(algolia.indexName),
    }
}

function featureEnabled(value) {
    if (value === true) return true
    return isPlainObject(value) && value.enable !== false
}

// 兼容旧版“存在配置对象即启用”的写法，同时确保显式 enable: false 一定生效。
hexo.extend.helper.register('febirdy_feature_enabled', function (value) {
    return featureEnabled(value)
})

// Algolia 只有在显式开关和三项公开配置都有效时才输出，缺配置时安全降级为未启用。
hexo.extend.helper.register('febirdy_algolia_config', function () {
    return readAlgoliaConfig()
})

hexo.extend.helper.register('febirdy_algolia_enabled', function () {
    const algolia = readAlgoliaConfig()
    return (
        featureEnabled(config.febirdy_search_algolia) &&
        Boolean(algolia.applicationId && algolia.apiKey && algolia.indexName)
    )
})
