'use strict';

// 移动端导航保持原生、轻量，不依赖主题旧菜单结构。
document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('.fb-menu-button');
  const menu = document.querySelector('.fb-mobile-nav');
  if (button && menu) {
    button.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(open));
      button.textContent = open ? '×' : '☰';
    });
  }

  // 搜索弹层同时服务 Algolia 已配置和未配置两种状态，避免按钮变成无响应装饰。
  const searchModal = document.querySelector('#fb-search-modal');
  const searchTriggers = document.querySelectorAll('.fb-search-trigger');
  const closeSearch = () => {
    if (!searchModal) return;
    searchModal.hidden = true;
    document.body.classList.remove('fb-search-open');
  };
  const openSearch = () => {
    if (!searchModal) return;
    searchModal.hidden = false;
    document.body.classList.add('fb-search-open');
    const input = searchModal.querySelector('#search');
    if (input) input.focus();
  };
  searchTriggers.forEach((trigger) => trigger.addEventListener('click', openSearch));
  if (searchModal) {
    searchModal.querySelectorAll('[data-search-close]').forEach((trigger) => {
      trigger.addEventListener('click', closeSearch);
    });
  }
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      openSearch();
    }
    if (event.key === 'Escape' && searchModal && !searchModal.hidden) closeSearch();
  });

  // 标签总览的本地筛选只控制当前页面 DOM，不改变 Hexo 生成的数据。
  document.querySelectorAll('[data-taxonomy-filter]').forEach((input) => {
    const items = Array.from(document.querySelectorAll('[data-taxonomy-item]'));
    const empty = document.querySelector('[data-taxonomy-empty]');
    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      let visible = 0;
      items.forEach((item) => {
        const matches = !query || (item.dataset.taxonomyName || '').includes(query);
        item.hidden = !matches;
        if (matches) visible += 1;
      });
      if (empty) empty.hidden = visible !== 0;
    });
  });

  // 移动端复用桌面目录节点，以抽屉方式提供目录，不重复运行 Tocbot。
  const tocTriggers = document.querySelectorAll('.fb-mobile-toc-trigger');
  const tocClose = document.querySelector('.fb-toc-close');
  const closeToc = () => {
    document.body.classList.remove('fb-toc-open');
    tocTriggers.forEach((trigger) => trigger.setAttribute('aria-expanded', 'false'));
  };
  tocTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const open = document.body.classList.toggle('fb-toc-open');
      trigger.setAttribute('aria-expanded', String(open));
    });
  });
  if (tocClose) tocClose.addEventListener('click', closeToc);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('fb-toc-open')) closeToc();
  });
});
