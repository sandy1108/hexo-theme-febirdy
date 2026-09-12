;(function () {
    const themeRuntime = window.febirdy || window.aomori || {}
    // DisqusJS
    if (themeRuntime.disqusjs && themeRuntime.disqusjs.enable) {
        const dsqjs = new DisqusJS({
            shortname: themeRuntime.disqusjs.shortname,
            siteName: themeRuntime.disqusjs.siteName,
            api: themeRuntime.disqusjs.api,
            apikey: themeRuntime.disqusjs.apikey,
            nesting: themeRuntime.disqusjs.nesting,
            nocomment: themeRuntime.disqusjs.nocomment,
            admin: themeRuntime.disqusjs.admin,
            adminLabel: themeRuntime.disqusjs.adminLabel,
        })
    }
})()
