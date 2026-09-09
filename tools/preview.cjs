'use strict';

// 将真实博客复制到独立临时目录，避免生成器改写原文章或生产配置。
const fs = require('node:fs/promises');
const path = require('node:path');
const { createRequire } = require('node:module');

async function main() {
  const themeRoot = path.resolve(__dirname, '..');
  const blogRoot = path.resolve(process.argv[2] || path.join(themeRoot, '../tech-blogs'));
  const blogRequire = createRequire(path.join(blogRoot, 'package.json'));
  const Hexo = blogRequire('hexo');
  const yaml = blogRequire('js-yaml');
  const previewRoot = path.join(themeRoot, '.preview');
  await fs.mkdir(previewRoot, { recursive: true });
  const base = await fs.mkdtemp(path.join(previewRoot, 'site-'));
  await fs.cp(path.join(blogRoot, 'source'), path.join(base, 'source'), { recursive: true });
  await fs.copyFile(path.join(blogRoot, 'package.json'), path.join(base, 'package.json'));
  await fs.symlink(path.join(blogRoot, 'node_modules'), path.join(base, 'node_modules'), 'dir');
  const themeCopy = path.join(base, 'themes/febirdy');
  await fs.mkdir(themeCopy, { recursive: true });
  // 不链接整个主题根目录，否则 Hexo 会沿 .preview 再次进入自身。
  for (const entry of ['layout', 'languages', 'source', '_config.yml']) {
    await fs.cp(path.join(themeRoot, entry), path.join(themeCopy, entry), { recursive: true });
  }
  // Hexo 支持 YAML 中的缩进制表符，预览解析时与其行为保持一致。
  const raw = await fs.readFile(path.join(blogRoot, '_config.yml'), 'utf8');
  const config = yaml.load(raw.replace(/\t/g, '  '));
  Object.assign(config, {
    theme: 'febirdy', url: 'http://127.0.0.1:4174', root: '/',
    source_dir: 'source', public_dir: 'public', database: 'db.json', deploy: {},
  });
  await fs.writeFile(path.join(base, '_config.yml'), yaml.dump(config));
  const hexo = new Hexo(base, { silent: true });
  try {
    await hexo.init();
    await hexo.call('generate');
    const routes = hexo.route.list();
    for (const route of ['index.html', 'archives/index.html', 'dist/build.css', 'dist/custom.js', 'sitemap.xml']) {
      if (!routes.includes(route)) throw new Error(`缺少必要输出：${route}`);
    }
    const article = hexo.locals.get('posts').first();
    const articleRoute = article && decodeURI(article.path).replace(/\/$/, '/index.html');
    if (!articleRoute || !routes.includes(articleRoute)) throw new Error('没有生成真实文章页面');
    console.log(JSON.stringify({
      theme: hexo.config.theme, themeDirectory: hexo.theme_dir,
      posts: hexo.locals.get('posts').length, routes: routes.length,
      article: article.path, output: path.join(base, 'public'),
    }, null, 2));
  } finally {
    await hexo.exit();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
