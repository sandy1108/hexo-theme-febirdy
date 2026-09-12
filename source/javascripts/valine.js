;(function () {
    const themeRuntime = window.febirdy || window.aomori || {}
    if (themeRuntime.valine && themeRuntime.valine.enable) {
        new Valine({
            el: '#valine-container',
            appId: themeRuntime.valine.appId,
            appKey: themeRuntime.valine.appKey,
            placeholder: themeRuntime.valine.placeholder,
            avatar: themeRuntime.valine.avatar,
            pageSize: themeRuntime.valine.pageSize,
            lang: themeRuntime.valine.lang,
            visitor: themeRuntime.valine.visitor,
            highlight: themeRuntime.valine.highlight,
            recordIP: themeRuntime.valine.recordIP,
            emojiCDN: themeRuntime.valine.emojiCDN,
            enableQQ: themeRuntime.valine.enableQQ,
            requiredFields: themeRuntime.valine.requiredFields,
        })
    }
})()
