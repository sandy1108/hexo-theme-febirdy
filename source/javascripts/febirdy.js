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
});
