;(function () {
    const themeRuntime = window.febirdy || window.aomori || {}
    if (themeRuntime.gitalk && themeRuntime.gitalk.enable) {
        themeRuntime.gitalk.id = md5(window.location.href)
        const gitalk = new Gitalk(themeRuntime.gitalk)
        gitalk.render('gitalk-container')
    }
})()
