'use strict'

// 使用不含真实文章的最小 Hexo 站点验证主题的公共安装契约。
const fs = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const Hexo = require('hexo')

const themeRoot = path.resolve(__dirname, '..')
const fixtureRoot = path.join(themeRoot, 'examples/minimal-site')

async function validateFixtureMarkup(tempRoot, routes) {
    const htmlRoutes = Array.from(routes).filter((route) => route.endsWith('.html'))
    const failures = []
    for (const route of htmlRoutes) {
        const html = await fs.readFile(path.join(tempRoot, 'public', route), 'utf8')
        if (!/<html\b[^>]*\blang="zh-CN"/i.test(html)) {
            failures.push(`${route}: 缺少 lang="zh-CN"`)
        }
        if ((html.match(/<main\b/gi) || []).length !== 1) {
            failures.push(`${route}: main landmark 数量不是 1`)
        }
        for (const match of html.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/gi)) {
            const rel = match[0].match(/\brel=["']([^"']+)["']/i)
            const relValues = rel ? rel[1].split(/\s+/) : []
            if (!relValues.includes('noopener') || !relValues.includes('noreferrer')) {
                failures.push(`${route}: target=_blank 链接缺少 noopener noreferrer`)
            }
        }
    }

    const articleHtml = await fs.readFile(
        path.join(tempRoot, 'public', '2026/01/01/example/index.html'),
        'utf8'
    )
    if (!/<button\b[^>]*id="backtop"/i.test(articleHtml)) {
        failures.push('文章页：返回顶部不是 button')
    }
    if (!/<button\b[^>]*class="[^"]*fb-search-trigger[^\"]*"[^>]*aria-controls="fb-search-modal"[^>]*aria-expanded="false"/i.test(articleHtml)) {
        failures.push('文章页：搜索触发按钮缺少 aria-controls/aria-expanded')
    }
    if (!/<div\s+class="fb-search-modal"[^>]*id="fb-search-modal"[^>]*aria-hidden="true"/i.test(articleHtml)) {
        failures.push('文章页：搜索弹层缺少初始 aria-hidden 状态')
    }
    if (!/<meta\s+property="algolia:search"[\s\S]*data-application-id="FIXTURE_APP"[\s\S]*data-api-key="fixture-search-only"[\s\S]*data-index-name="fixture-index"/i.test(articleHtml)) {
        failures.push('文章页：Algolia 公开配置 meta 缺失或字段不完整')
    }
    if (/adminApiKey|ALGOLIA_ADMIN_API_KEY|fixture-admin/i.test(articleHtml)) {
        failures.push('文章页：不应向浏览器输出 Algolia indexing/admin key')
    }
    if (!/<button\b[^>]*class="[^"]*fb-mobile-toc-trigger[^\"]*"[^>]*aria-controls="fb-toc-panel"[^>]*aria-expanded="false"/i.test(articleHtml)) {
        failures.push('文章页：移动端目录触发按钮缺少初始 ARIA 状态')
    }
    if (!/<div\s+class="swiper-slide"[^>]*>\s*<img\b[^>]*\balt="FEBIRDY 示例文章"/i.test(articleHtml)) {
        failures.push('文章页：gallery 图片缺少文章标题 alt 回退')
    }
    if (!/<script\b[^>]*src="https:\/\/giscus\.app\/client\.js"[^>]*data-theme="dark"/i.test(articleHtml)) {
        failures.push('文章页：Giscus 初始主题没有跟随主题默认值')
    }
    if (!/<script\b[^>]*src="https:\/\/unpkg\.com\/gitalk\/dist\/gitalk\.min\.js"/i.test(articleHtml)) {
        failures.push('文章页：Gitalk 已启用但没有加载客户端脚本')
    }
    if (!/<div\s+class="widget-wrap widget-tags"[\s\S]*?<span\s+class="tag-list-count">1<\/span>/i.test(articleHtml)) {
        failures.push('侧栏 Tags：未显示标签关联文章数量')
    }

    const friendsHtml = await fs.readFile(
        path.join(tempRoot, 'public', 'friends/index.html'),
        'utf8'
    )
    if (!/暂无友情链接。/.test(friendsHtml)) {
        failures.push('友链页：缺少无数据空状态')
    }
    const photographyHtml = await fs.readFile(
        path.join(tempRoot, 'public', 'photography/index.html'),
        'utf8'
    )
    if (!/暂无摄影作品。/.test(photographyHtml)) {
        failures.push('摄影页：缺少无数据空状态')
    }
    if (failures.length) {
        throw new Error(`fixture 无障碍/第三方回归失败：\n${failures.join('\n')}`)
    }
}

async function main() {
    const tempRoot = await fs.mkdtemp(
        path.join(os.tmpdir(), 'febirdy-theme-fixture-')
    )
    let hexo

    try {
        await fs.cp(path.join(fixtureRoot, 'source'), path.join(tempRoot, 'source'), {
            recursive: true,
        })
        await fs.copyFile(
            path.join(fixtureRoot, '_config.yml'),
            path.join(tempRoot, '_config.yml')
        )
        await fs.copyFile(
            path.join(fixtureRoot, 'package.json'),
            path.join(tempRoot, 'package.json')
        )
        // 模拟样例站点安装 Hexo 及其生成器后的 node_modules。
        await fs.symlink(
            path.join(themeRoot, 'node_modules'),
            path.join(tempRoot, 'node_modules'),
            'dir'
        )

        const themeCopy = path.join(tempRoot, 'themes/febirdy')
        await fs.mkdir(themeCopy, { recursive: true })
        for (const entry of [
            'layout',
            'languages',
            'scripts',
            'source',
            'tools',
            'docs/AOMORI-UPSTREAM.md',
            '_config.yml',
            'LICENSE',
            'README.md',
            'package.json',
        ]) {
            const source = path.join(themeRoot, entry)
            const destination = path.join(themeCopy, entry)
            await fs.mkdir(path.dirname(destination), { recursive: true })
            await fs.cp(source, destination, { recursive: true })
        }

        hexo = new Hexo(tempRoot, { silent: true })
        await hexo.init()
        await hexo.call('generate')

        const routes = new Set(hexo.route.list())
        const requiredRoutes = [
            'index.html',
            '2026/01/01/example/index.html',
            'categories/index.html',
            'tags/index.html',
            'about/index.html',
            'friends/index.html',
            'photography/index.html',
            '404.html',
        ]
        const missingRoutes = requiredRoutes.filter(route => !routes.has(route))
        if (missingRoutes.length) {
            throw new Error(`样例站点缺少路由：${missingRoutes.join(', ')}`)
        }

        await validateFixtureMarkup(tempRoot, routes)

        console.log(
            JSON.stringify(
                {
                    posts: hexo.locals.get('posts').length,
                    routes: routes.size,
                    requiredRoutes: requiredRoutes.length,
                    missingRoutes: 0,
                },
                null,
                2
            )
        )
    } finally {
        if (hexo) await hexo.exit()
        await fs.rm(tempRoot, { recursive: true, force: true })
    }
}

main().catch(error => {
    console.error(error)
    process.exitCode = 1
})
