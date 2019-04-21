const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const rigger = require('gulp-rigger');
const del = require('del');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const cache = require('gulp-cache');
const server = require('browser-sync').create();
const svgSprite = require('gulp-svg-sprite');
const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');

const path = {
  build: {
    html: 'build/',
    css: 'build/css/',
    js: 'build/js/',
    img: 'build/img/',
    fonts: 'build/fonts/'
  },
  src: {
    html: 'src/*.html',
    css: 'src/styles/main.scss',
    js: 'src/js/main.js',
    img: 'src/img/**/*.*',
    svgIcon: 'src/img/svg/icon-*.svg',
    fonts: 'src/fonts/**/*.*'
  },
  watch: {
    html: ['src/*.html', 'src/templates/*.html'],
    css: ['src/styles/*.scss', 'src/styles/partials/*.scss'],
    js: 'src/js/**/*.js',
    img: 'src/img/**/*.*',
    fonts: 'src/fonts/**/*.*'
  },
  clean: './build'
}
const serverConfig = {
  server: {
    baseDir: './build'
  },
  // tunnel: true,
  port: 3000,
  host: 'localhost',
  logPrefix: "Frontend_Devil"
}
function htmlBuild() {
  return gulp.src(path.src.html)
    .pipe(rigger())
    .pipe(gulp.dest(path.build.html));
}

function styleBuild() {
  return gulp.src(path.src.css)
    .pipe(sass())
    .pipe(autoprefixer({
      browsers: ['> 0.1%'],
      cascade: false
    }))
    .pipe(gulp.dest(path.build.css))
    .pipe(server.stream());
}

function jsBuild() {
  return gulp.src(path.src.js)
    .pipe(rigger())
    .pipe(gulp.dest(path.build.js));
  // .pipe(server.reload());
}

function imgBuild() {
  return gulp.src(path.src.img)
    .pipe(cache(imagemin({
      interlaced: true,
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    })))
    .pipe(gulp.dest(path.build.img));
  // .pipe(server.stream());
}

function svgSpriteIcon() {
  return gulp.src(path.src.svgIcon)
    .pipe(cheerio({
      run: function ($) {
        $('[fill]').removeAttr('fill');
        $('[stroke]').removeAttr('stroke');
        $('[style]').removeAttr('style');
      },
      parserOptions: {xmlMode: true}
    }))
    .pipe(replace('&gt;', '>'))
    .pipe(svgSprite({
      mode: {
        symbol: {
          sprite: 'icon-sprite.svg'
        }
      }
    }))
    .pipe(gulp.dest(path.build.img));
}

function fontsBuild() {
  return gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.build.fonts));
}

function watch() {
  server.init(serverConfig);
  gulp.watch(path.watch.html).on('change', gulp.series(htmlBuild, server.reload));
  gulp.watch(path.watch.css, styleBuild);
  gulp.watch(path.watch.js, gulp.series(jsBuild, server.reload));
  gulp.watch(path.watch.img, gulp.series(imgBuild, server.reload));
  gulp.watch(path.watch.fonts, fontsBuild);
}

function webserver() {
  return server.init(serverConfig);
}

function build(done) {
  gulp.parallel(htmlBuild, styleBuild, jsBuild, imgBuild, fontsBuild);
  done();
}

gulp.task('webserver', webserver);

gulp.task('img:clean', (done) => {
  del.sync(path.clean+'/img');
  done();
});

gulp.task('html:build', htmlBuild);

gulp.task('style:build', styleBuild);

gulp.task('js:build', jsBuild);

gulp.task('img:build', imgBuild);

gulp.task('svg-icon:build', svgSpriteIcon);

gulp.task('fonts:build', fontsBuild);

gulp.task('build', build);

gulp.task('watch', watch);

gulp.task('default', watch);