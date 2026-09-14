'use strict'

// Tool
const gulp = require('gulp')
const concat = require('gulp-concat') // 合并文件
const plumber = require('gulp-plumber')

// CSS
const autoprefixer = require('gulp-autoprefixer') // CSS自动添加前缀
const sass = require('gulp-sass')(require('sass')); // 编译 SASS
const cleanCSS = require('gulp-clean-css');
// JS
const rollup = require('rollup') // JS打包工具
const { babel } = require('@rollup/plugin-babel'); // JS babel
const commonjs = require('@rollup/plugin-commonjs') // Common JS
const { nodeResolve } = require('@rollup/plugin-node-resolve'); // 使 Rollup 支持 NPM 模块
const terser = require('@rollup/plugin-terser'); // Rollup plugin to minify generated es bundle

const eslint = require('gulp-eslint-new')
const stylelint = require('@ronilaukkarinen/gulp-stylelint')

// Other
const yaml = require('js-yaml');
const fs   = require('fs');

let isWatching = false

/* -------------------------------------------------------- */

// 清理旧文件
// gulp.task('clean-files', function(cb) {
//   return del([
//     'source/dist/*'
//   ], cb);
// });

/* -------------------------------------------------------- */
/* ------------------------  CSS  ------------------------- */

gulp.task('css', async function () {
    const vendorStream = gulp
        .src([
            'source/stylesheets/normalize.css',
            'source/stylesheets/spectre.min.css',
            'source/stylesheets/spectre-exp.min.css',
            'source/stylesheets/spectre-icons.min.css',
            'source/stylesheets/github.css',
            'source/stylesheets/tocbot.css',
            'source/stylesheets/nprogress.css',
            'source/stylesheets/perfect-scrollbar.css',
            'source/stylesheets/swiper-bundle.min.css',
            'source/stylesheets/plyr.css',
            'source/stylesheets/remark42.css',
            'node_modules/viewerjs/dist/viewer.min.css',
            'source/stylesheets/post.css'
        ])
        .pipe(concat('build.css'))
        .pipe(cleanCSS())
        .pipe(gulp.dest('source/dist'))

    let customStream = gulp
        .src([
            'source/stylesheets/base.scss',
            'source/stylesheets/style.scss',
        ])

    // 正式构建必须暴露 Sass 错误；watch 模式则保留错误提示并继续监听。
    if (isWatching) {
        customStream = customStream.pipe(
            plumber({
                errorHandler: errorAlert,
            })
        )
    }

    customStream = customStream.pipe(
            sass({
                outputStyle: 'expanded',
            })
        )
        .pipe(autoprefixer('last 2 version'))
        .pipe(concat('custom.css'))
        .pipe(cleanCSS())
        .pipe(gulp.dest('source/dist'))

    await Promise.all([
        waitForStream(vendorStream),
        waitForStream(customStream),
    ])
})

gulp.task('build-css', gulp.series('css'))

/* -------------------------------------------------------- */
/* ---------------------  JavaScript  --------------------- */

gulp.task('js', async function () {
    const bundle = await rollup.rollup({
        input: './source/javascripts/app.js',
        plugins: [
            nodeResolve({
                mainFields: ['module', 'main', 'jsnext', 'browser'],
            }),
            commonjs({
                include: 'node_modules/**',
            }),
            babel({
                babelHelpers: 'bundled',
                exclude: 'node_modules/**', // 只编译我们的源代码
            }),
            terser(),
        ],
    })
    await bundle.write({
        file: './source/dist/custom.js',
        format: 'umd',
    })
    const vendorStream = gulp.src([
        'source/modules/algoliasearch-lite.umd.js',
        'source/modules/highlight.min.js',
        'source/modules/md5.min.js',
        'source/modules/nprogress.js',
        'source/modules/perfect-scrollbar.min.js',
        'source/modules/swiper-bundle.min.js',
        'source/modules/tocbot.min.js',
        'source/modules/typed.min.js',
        'source/modules/plyr.js',
        'source/modules/lazyload.min.js',
    ])
        .pipe(concat('build.js'))
        .pipe(gulp.dest('source/dist'))

    await waitForStream(vendorStream)

    const doc = yaml.load(fs.readFileSync('_config.yml', 'utf8'));
    doc.version = (new Date()).getTime()
    const docUpdated = yaml.dump(doc);
    fs.writeFileSync('_config.yml', docUpdated, 'utf8');
})

gulp.task('build-js', gulp.series('js'))

/* -------------------------------------------------------- */
/* ---------------------  Lint  --------------------- */

gulp.task('eslint', () => {
    return gulp
        .src(['source/javascripts/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
})

gulp.task('stylelint', () => {
    return gulp.src(['source/stylesheets/**/*.scss']).pipe(
        stylelint({
            failAfterError: true,
            reporters: [
                {
                    formatter: 'string',
                    console: true,
                },
            ],
        })
    )
})

/* -------------------------------------------------------- */

//监测任务
gulp.task('watch', function () {
    isWatching = true

    // Watch .scss
    const cssVendors = ['source/stylesheets/*.css', 'source/stylesheets/*.scss']

    // Watch .js
    const jsVendors = ['source/javascripts/*.js']

    gulp.watch(cssVendors, gulp.series('stylelint', 'build-css', 'build-js'))
    gulp.watch(jsVendors, gulp.series('eslint', 'build-css', 'build-js'))
})

/* -------------------------------------------------------- */

// development workflow task
gulp.task(
    'dev',
    gulp.series('eslint', 'stylelint', 'build-css', 'build-js', 'watch')
)
gulp.task('build', gulp.series('eslint', 'stylelint', 'build-css', 'build-js'))
gulp.task('default', gulp.series('dev'))

/* -------------------------------------------------------- */

// handle errors
function errorAlert(error) {
    // 不依赖桌面通知，确保 CI 和无图形环境仍能看到完整错误。
    console.error(`Error in plugin '${error.plugin}'`)
    console.error(error.toString())
    this.emit('end')
}

// 将 Gulp stream 转为 Promise，确保异步任务在文件真正写完后才结束。
function waitForStream(stream) {
    return new Promise((resolve, reject) => {
        stream.once('finish', resolve)
        stream.once('error', reject)
    })
}
