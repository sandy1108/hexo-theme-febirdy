'use strict'

const focusableSelector = [
    'a[href]',
    'area[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',')

// 只返回当前可操作的控件，供抽屉打开时的焦点恢复和 Tab 循环使用。
const getFocusable = (container) =>
    Array.from(container.querySelectorAll(focusableSelector)).filter((item) => {
        if (item.hidden || item.getAttribute('aria-hidden') === 'true') {
            return false
        }
        return (
            item.offsetWidth > 0 ||
            item.offsetHeight > 0 ||
            item === document.activeElement
        )
    })

const isMobileViewport = () => window.matchMedia('(max-width: 900px)').matches

const themeModes = ['auto', 'light', 'dark']
const themeLabels = {
    auto: '自动跟随系统',
    light: '浅色主题',
    dark: '深色主题',
}

// 主题选择同时写入 data-theme 和 data-theme-effective，前者保存用户意图，后者供 CSS 使用。
const getThemeSelection = () => {
    const selection = document.documentElement.getAttribute('data-theme')
    return themeModes.includes(selection) ? selection : 'dark'
}

const getEffectiveTheme = (selection) => {
    if (selection !== 'auto') return selection
    const systemIsLight =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: light)').matches
    return systemIsLight ? 'light' : 'dark'
}

let themeTransitionTimer

// 主题切换时重新触发一次短暂的渐变光晕；首次加载不触发，避免页面闪烁。
const startThemeTransition = () => {
    const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches
    if (prefersReducedMotion) return

    const root = document.documentElement
    root.classList.remove('fb-theme-transitioning')
    void root.offsetWidth
    root.classList.add('fb-theme-transitioning')
    window.clearTimeout(themeTransitionTimer)
    themeTransitionTimer = window.setTimeout(() => {
        root.classList.remove('fb-theme-transitioning')
    }, 1000)
}

const updateThemeControls = (selection, effective) => {
    document.querySelectorAll('[data-theme-option]').forEach((option) => {
        const isActive = option.dataset.themeOption === selection
        option.classList.toggle('is-active', isActive)
        option.setAttribute('aria-checked', String(isActive))
        const modeLabel = themeLabels[option.dataset.themeOption]
        option.setAttribute(
            'title',
            selection === 'auto' && option.dataset.themeOption === 'auto'
                ? `${modeLabel}（当前${themeLabels[effective].replace(
                      '主题',
                      ''
                  )}）`
                : modeLabel
        )
    })
}

const applyTheme = (selection, { animate = false } = {}) => {
    const normalizedSelection = themeModes.includes(selection)
        ? selection
        : 'dark'
    const effectiveTheme = getEffectiveTheme(normalizedSelection)
    const root = document.documentElement
    if (animate) startThemeTransition()
    root.setAttribute('data-theme', normalizedSelection)
    root.setAttribute('data-theme-effective', effectiveTheme)
    root.style.colorScheme =
        normalizedSelection === 'auto' ? 'light dark' : normalizedSelection
    updateThemeControls(normalizedSelection, effectiveTheme)
}

// 移动端导航保持原生、轻量，不依赖主题旧菜单结构。
document.addEventListener('DOMContentLoaded', () => {
    const site = document.body
    const themeOptions = document.querySelectorAll('[data-theme-option]')
    const systemThemeMediaQuery = window.matchMedia(
        '(prefers-color-scheme: light)'
    )
    const menuButton = document.querySelector('.fb-menu-button')
    const mobileMenu = document.querySelector('.fb-mobile-nav')
    const menuMediaQuery = window.matchMedia('(max-width: 900px)')

    applyTheme(getThemeSelection())
    themeOptions.forEach((option) => {
        option.addEventListener('click', () => {
            const selection = option.dataset.themeOption
            applyTheme(selection, { animate: true })
            try {
                window.localStorage.setItem('febirdy-theme', selection)
            } catch (error) {
                // 存储不可用时仍保留本次页面会话中的主题选择。
            }
        })
    })
    const syncSystemTheme = () => {
        if (getThemeSelection() === 'auto') {
            applyTheme('auto', { animate: true })
        }
    }
    if (systemThemeMediaQuery.addEventListener) {
        systemThemeMediaQuery.addEventListener('change', syncSystemTheme)
    } else if (systemThemeMediaQuery.addListener) {
        systemThemeMediaQuery.addListener(syncSystemTheme)
    }

    // 导航打开时把焦点交给第一个链接，关闭时回到触发按钮，避免键盘用户迷失位置。
    const setMobileMenuState = (open, { restoreFocus = true } = {}) => {
        if (!menuButton || !mobileMenu) return
        mobileMenu.classList.toggle('is-open', open)
        menuButton.setAttribute('aria-expanded', String(open))
        menuButton.setAttribute('aria-label', open ? '关闭导航' : '打开导航')
        mobileMenu.setAttribute('aria-hidden', String(!open))
        menuButton.textContent = open ? '×' : '☰'

        if (open) {
            const firstLink = getFocusable(mobileMenu)[0]
            if (firstLink) firstLink.focus()
        } else if (restoreFocus) {
            menuButton.focus()
        }
    }

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', () => {
            setMobileMenuState(
                menuButton.getAttribute('aria-expanded') !== 'true'
            )
        })
        mobileMenu.addEventListener('click', (event) => {
            const link =
                event.target.closest && event.target.closest('[data-menu-link]')
            if (link) setMobileMenuState(false, { restoreFocus: false })
        })
    }

    // 搜索弹层同时服务 Algolia 已配置和未配置两种状态，避免按钮变成无响应装饰。
    const searchModal = document.querySelector('#fb-search-modal')
    const searchTriggers = document.querySelectorAll('.fb-search-trigger')
    const closeSearch = () => {
        if (!searchModal) return
        searchModal.hidden = true
        site.classList.remove('fb-search-open')
    }
    const openSearch = () => {
        if (!searchModal) return
        searchModal.hidden = false
        site.classList.add('fb-search-open')
        const input = searchModal.querySelector('#search')
        if (input) input.focus()
    }
    searchTriggers.forEach((trigger) =>
        trigger.addEventListener('click', openSearch)
    )
    if (searchModal) {
        searchModal
            .querySelectorAll('[data-search-close]')
            .forEach((trigger) => {
                trigger.addEventListener('click', closeSearch)
            })
    }

    // 标签总览的本地筛选只控制当前页面 DOM，不改变 Hexo 生成的数据。
    document.querySelectorAll('[data-taxonomy-filter]').forEach((input) => {
        const items = Array.from(
            document.querySelectorAll('[data-taxonomy-item]')
        )
        const empty = document.querySelector('[data-taxonomy-empty]')
        input.addEventListener('input', () => {
            const query = input.value.trim().toLowerCase()
            let visible = 0
            items.forEach((item) => {
                const matches =
                    !query || (item.dataset.taxonomyName || '').includes(query)
                item.hidden = !matches
                if (matches) visible += 1
            })
            if (empty) empty.hidden = visible !== 0
        })
    })

    // 移动端复用桌面目录节点，以抽屉方式提供目录，不重复运行 Tocbot。
    const tocTrigger = document.querySelector('.fb-mobile-toc-trigger')
    const tocPanel = document.querySelector('#fb-toc-panel')
    const tocClose = document.querySelector('[data-toc-close]')
    const tocSidebar = tocPanel && tocPanel.closest('.sidebar')

    // 桌面端目录始终可见；移动端关闭时同步 aria-hidden，防止隐藏内容进入阅读顺序。
    const syncTocAccessibility = () => {
        if (!tocPanel) return
        if (isMobileViewport()) {
            tocPanel.setAttribute(
                'aria-hidden',
                String(!site.classList.contains('fb-toc-open'))
            )
        } else {
            tocPanel.removeAttribute('aria-hidden')
        }
    }

    // 目录抽屉的唯一状态入口，负责滚动锁定、ARIA 状态和焦点交接。
    const closeToc = ({ restoreFocus = true } = {}) => {
        if (!tocPanel) return
        site.classList.remove('fb-toc-open')
        if (tocTrigger) tocTrigger.setAttribute('aria-expanded', 'false')
        syncTocAccessibility()
        if (restoreFocus && tocTrigger) tocTrigger.focus()
    }

    const openToc = () => {
        if (!tocPanel || !tocTrigger || !isMobileViewport()) return
        site.classList.add('fb-toc-open')
        tocTrigger.setAttribute('aria-expanded', 'true')
        tocPanel.setAttribute('aria-hidden', 'false')
        const initialFocus = tocClose || tocPanel
        initialFocus.focus()
    }

    if (tocTrigger) tocTrigger.addEventListener('click', openToc)
    if (tocClose) tocClose.addEventListener('click', () => closeToc())
    if (tocSidebar) {
        tocSidebar.addEventListener('click', (event) => {
            if (
                site.classList.contains('fb-toc-open') &&
                !tocPanel.contains(event.target)
            ) {
                closeToc()
            }
        })
    }
    if (tocPanel) {
        tocPanel.addEventListener('click', (event) => {
            const link = event.target.closest && event.target.closest('.toc a')
            if (link && isMobileViewport()) closeToc({ restoreFocus: false })
        })
    }

    const syncResponsiveState = () => {
        if (!isMobileViewport()) {
            setMobileMenuState(false, { restoreFocus: false })
            closeToc({ restoreFocus: false })
        }
        syncTocAccessibility()
    }
    if (menuMediaQuery.addEventListener) {
        menuMediaQuery.addEventListener('change', syncResponsiveState)
    } else if (menuMediaQuery.addListener) {
        menuMediaQuery.addListener(syncResponsiveState)
    }
    syncResponsiveState()

    document.addEventListener('keydown', (event) => {
        if (
            (event.metaKey || event.ctrlKey) &&
            event.key.toLowerCase() === 'k'
        ) {
            event.preventDefault()
            openSearch()
            return
        }

        if (event.key === 'Escape') {
            if (site.classList.contains('fb-toc-open')) {
                closeToc()
                return
            }
            if (
                menuButton &&
                menuButton.getAttribute('aria-expanded') === 'true'
            ) {
                setMobileMenuState(false)
                return
            }
            if (searchModal && !searchModal.hidden) closeSearch()
            return
        }

        // 目录作为临时抽屉时循环 Tab，焦点不会跳到被遮挡的正文。
        if (
            event.key === 'Tab' &&
            site.classList.contains('fb-toc-open') &&
            tocPanel
        ) {
            const focusable = getFocusable(tocPanel)
            if (!focusable.length) {
                event.preventDefault()
                tocPanel.focus()
                return
            }
            const first = focusable[0]
            const last = focusable[focusable.length - 1]
            if (!tocPanel.contains(document.activeElement)) {
                event.preventDefault()
                first.focus()
            } else if (event.shiftKey && document.activeElement === first) {
                event.preventDefault()
                last.focus()
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault()
                first.focus()
            }
        }
    })
})
