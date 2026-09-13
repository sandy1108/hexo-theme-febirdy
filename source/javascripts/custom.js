import $ from 'jquery'
import dayjs from 'dayjs'
import { addNewClass, removeClass, throttle } from './class-module'
;(function () {
    // 主题开关优先从 FEBIRDY 命名读取，同时兼容外部旧脚本注入的 Aomori 全局变量。
    const logoTypedAnimated =
        typeof window.febirdy_logo_typed_animated !== 'undefined'
            ? window.febirdy_logo_typed_animated
            : window.aomori_logo_typed_animated
    const searchAlgoliaEnabled =
        typeof window.febirdy_search_algolia !== 'undefined'
            ? window.febirdy_search_algolia
            : window.aomori_search_algolia

    let toggles = document.querySelectorAll('.cases .item')
    toggles.forEach((toggle) => {
        toggle.addEventListener(
            'mouseover',
            function (e) {
                // Prevent the default link behavior
                e.preventDefault()

                // 移除上一次的选中状态
                removeClass(
                    document.getElementsByClassName('img__active'),
                    'img__active'
                )
                removeClass(
                    document.getElementsByClassName('sub__active'),
                    'sub__active'
                )
                // 设置新的选中状态
                addNewClass(toggle.children[0], 'img__active')
                addNewClass(
                    document.getElementById('sub-' + toggle.dataset.icon),
                    'sub__active'
                )
            },
            false
        )
    })

    // 代码高亮
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block)
    })

    // TOC
    document.querySelector('.post-toc-html') &&
        document.querySelector('.post-inner-html') &&
        tocbot.init({
            tocSelector: '.post-toc-html',
            contentSelector: '.post-inner-html',
            headingSelector: 'h1, h2, h3',
        })

    // NProgress：短页面没有可滚动距离时不写入 NaN，并把进度限制在 0～1。
    const updateNProgress = () => {
        const totalH = Math.max(
            document.body.scrollHeight || 0,
            document.documentElement.scrollHeight || 0
        )
        const clientH =
            window.innerHeight || document.documentElement.clientHeight
        const validH = totalH - clientH
        if (validH <= 0) {
            NProgress.remove()
            return
        }
        const scrollH =
            document.body.scrollTop || document.documentElement.scrollTop
        const result = Math.min(1, Math.max(0, scrollH / validH))
        if (Number.isFinite(result)) NProgress.set(result)
    }
    NProgress.configure({
        showSpinner: false,
        minimum: 0,
    })
    window.addEventListener('scroll', throttle(updateNProgress))
    window.addEventListener('resize', throttle(updateNProgress))
    updateNProgress()

    // Back to Top
    const backtop = $('#backtop')
    backtop.click(function () {
        $('html, body').animate({ scrollTop: 0 }, 800)
    })

    // Share
    $('.share > .share-item').hover(
        function () {
            addNewClass(
                $(this).children('.n-icon'),
                $(this).children('.n-icon')[0].classList[1] + '-select'
            )
        },
        function () {
            removeClass(
                $(this).children('.n-icon'),
                $(this).children('.n-icon')[0].classList[2]
            )
        }
    )

    // Social
    $('.footer-info > .social').hover(
        function () {
            addNewClass(
                $(this).children('.n-icon'),
                $(this).children('.n-icon')[0].classList[1] + '-select'
            )
        },
        function () {
            removeClass(
                $(this).children('.n-icon'),
                $(this).children('.n-icon')[0].classList[2]
            )
        }
    )

    // Mobile Menu
    $('#mobile-menu-open').click(function () {
        $('.header-menu-mobile-menu').fadeIn(300)
        addNewClass($('body'), 'mobile-menu-fixed')
    })
    $('#mobile-menu-close').click(function () {
        $('.header-menu-mobile-menu').fadeOut(300)
        removeClass($('body'), 'mobile-menu-fixed')
    })

    // 监听屏幕滚动修改边栏
    window.addEventListener(
        'scroll',
        throttle(() => {
            const _top =
                document.documentElement.scrollTop || document.body.scrollTop
            if (_top > 100) {
                // 边栏绝对定位
                addNewClass('.sidebar', 'sidebar-fixed')
                // 返回顶部按钮显示
                backtop.attr('aria-hidden', 'false').fadeIn(300)
            } else {
                // 取消边栏定位
                removeClass('.sidebar', 'sidebar-fixed')
                // 返回顶部按钮消失
                backtop.attr('aria-hidden', 'true').fadeOut(300)
            }
        })
    )

    // Perfect Scrollbar
    const _widget = document.querySelector('#widget')
    _widget && new PerfectScrollbar(_widget)

    // Typed
    if (logoTypedAnimated) {
        const typed = new Typed('#typed', {
            stringsElement: '#typed-strings',
            fadeOut: true,
            fadeOutDelay: 800,
            typeSpeed: 100,
            showCursor: false,
        })
    }

    // Algolia
    if (searchAlgoliaEnabled) {
        const _searchPs = document.querySelector('#search-ps')
        _searchPs && new PerfectScrollbar(_searchPs)

        const algoliaConfig = document.querySelector(
            'meta[property="algolia:search"]'
        ).dataset

        const algoliaClient = algoliasearch(
            algoliaConfig.applicationId,
            algoliaConfig.apiKey
        )
        const algoliaIndex = algoliaClient.initIndex(algoliaConfig.indexName)

        $('#search').on(
            'keyup',
            throttle((event) => {
                algoliaIndex.search($('#search').val()).then(({ hits }) => {
                    $('.search-result').slideDown()

                    if (hits.length) {
                        const searchOutput = document.createDocumentFragment()
                        hits.forEach((item) => {
                            if (!item || !item.permalink) return

                            const resultItem = document.createElement('a')
                            const resultTitle = document.createElement('h1')
                            const resultDate = document.createElement('p')
                            let resultUrl

                            try {
                                resultUrl = new URL(
                                    String(item.permalink || ''),
                                    window.location.origin
                                )
                            } catch (error) {
                                return
                            }
                            if (
                                !['http:', 'https:'].includes(
                                    resultUrl.protocol
                                )
                            ) {
                                return
                            }

                            resultItem.className = 'search-result-item'
                            resultItem.href = resultUrl.href
                            resultTitle.textContent = String(item.title || '')
                            resultDate.textContent = dayjs(item.date).format(
                                'YYYY-MM-DD'
                            )
                            resultItem.append(resultTitle, resultDate)
                            searchOutput.appendChild(resultItem)
                        })
                        const searchResult =
                            document.querySelector('.search-result')
                        if (searchOutput.childNodes.length) {
                            searchResult.replaceChildren(searchOutput)
                        } else {
                            searchResult.textContent = 'Nothing at all.'
                        }
                    } else {
                        document.querySelector('.search-result').textContent =
                            'Nothing at all.'
                    }
                })
            })
        )
        $('#search').on('focusin', () => {
            addNewClass($('.search'), 'search-focus')
        })
        $('#search').on('focusout', () => {
            removeClass($('.search'), 'search-focus')
            $('.search-result').slideUp()
        })
    }

    // Swiper
    const mySwiper = new Swiper('.swiper-container', {
        autoplay: {
            delay: 10000,
        },
        autoHeight: true,
        pagination: {
            el: '.swiper-pagination',
            bulletActiveClass: 'article-gallery-active',
        },
    })
    if (mySwiper.slides && mySwiper.slides.length <= 1) {
        mySwiper.destroy()
    }

    // Viewer
    // 全局 reduced-motion 规则会禁用 CSS transition，而 Viewer.js 的显示/关闭状态机
    // 依赖 transitionend；在该偏好下关闭 Viewer.js 过渡，避免遮罩和图片状态卡住。
    const prefersReducedMotion =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const viewerConfig = {
        title: false,
        transition: !prefersReducedMotion,
        toolbar: {
            zoomIn: true,
            zoomOut: true,
            reset: true,
            prev: true,
            next: true,
        },
        keyboard: false,
    }
    const galleryViewer = $('.article-gallery')
    if (galleryViewer && galleryViewer.length > 0) {
        galleryViewer.viewer(viewerConfig)
    }
    // 同时兼容 Aomori 原始文章容器和 FEBIRDY 自定义正文容器。
    const articleContentViewer = $('.article-entry, .fb-post-content')
    if (articleContentViewer && articleContentViewer.length > 0) {
        articleContentViewer.viewer(viewerConfig)
    }
    const photographyViewer = $('.photography-item')
    if (photographyViewer && photographyViewer.length > 0) {
        const temp = Object.assign(viewerConfig, {
            url(image) {
                return image.dataset.original
            },
            toolbar: {
                zoomIn: true,
                zoomOut: true,
                reset: true,
                prev: false,
                next: false,
            },
            navbar: false,
        })
        photographyViewer.viewer(temp)
    }

    // Plyr
    if (window.isPost) {
        const plyrsInPost = Array.from($('article video')).map(
            (ele) => new Plyr(ele)
        )
    }
    const plyrsInIndex = Array.from($('article .article-video-plyr')).map(
        (ele) => new Plyr(ele)
    )

    // LazyLoad
    const lazyLoad = new LazyLoad()

    // Fxxk adblock
    const ads = $('.adsbygoogle')
    if (
        window.isPost &&
        ads.length > 0 &&
        window.getComputedStyle(ads[0]).display === 'none'
    ) {
        $('.intersection-observer-ad').css('display', 'flex')
    }
})()
