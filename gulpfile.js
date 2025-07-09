const { rimraf } = require('rimraf');
const imagemin = require('gulp-imagemin');
const prettier = require('gulp-prettier');
const {
  src: gulpSrc, dest: gulpDest, parallel, series,
} = require('gulp');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');
const terser = require('gulp-terser');
const babel = require('gulp-babel');
const htmlmin = require('gulp-htmlmin');
const concat = require('gulp-concat');
const htmlReplace = require('gulp-html-replace');
const eslint = require('gulp-eslint');
const print = require('gulp-print').default;
const logger = require('fancy-log');

/**
 * Helper function to log into terminal
 * @param {string} message
 */
const log = (message) => logger(message);

/**
 * Helper function to get the build destination path
 * @return {string}
 */
function getDestinationPath() {
  const fullPathFragments = __dirname.split('/');
  const plugin = fullPathFragments.pop();
  fullPathFragments.push(`${plugin}_release`);
  return fullPathFragments.join('/');
}

const destinationPath = getDestinationPath();

/**
 * Common task to process plugin's CSS files
 * @param {Object} options
 * @param {string} options.src - CSS files source
 * @param {string} options.dest - CSS files destination
 * @returns { Promise }
 */
const cssTask = ({ src, dest }) => gulpSrc(src, { base: '.' })
  .pipe(print())
  .pipe(
    postcss([
      autoprefixer({
        overrideBrowserslist: ['last 2 versions'],
        cascade: false,
      }),
      cssnano(),
    ]),
  )
  .pipe(concat('styles.min.css'))
  .pipe(gulpDest(`${destinationPath}${dest}`));

/**
 * Common task to process plugin's JS files
 * @param {Object} options
 * @param {string} options.src - JS files source
 * @param {string} options.dest - JS files destination
 * @returns { Promise }
 */
const jsTask = ({ src, dest }) => gulpSrc(src, { base: '.' })
  .pipe(print())
  .pipe(babel({ presets: ['@babel/preset-env'] }))
  .pipe(terser())
  .pipe(concat('scripts.min.js'))
  .pipe(gulpDest(`${destinationPath}${dest}`));

/**
 * CSS Tasks
 * @description A named function for each CSS task, used with watch and build
 */
const widgetCSS = () => cssTask({ src: 'widget/**/*.css', dest: '/widget' });
const controlContentCSS = () => cssTask({ src: 'control/content/**/*.css', dest: '/control/content' });
const controlDesignCSS = () => cssTask({ src: 'control/design/**/*.css', dest: '/control/design' });
const controlSettingsCSS = () => cssTask({ src: 'control/settings/**/*.css', dest: '/control/settings' });
/**
 * JS Tasks
 * @description A named function for each JS task, used with watch and build
 */
const widgetJS = () => jsTask({ src: 'widget/**/*.js', dest: '/widget' });
const controlContentJS = () => jsTask({ src: 'control/content/**/*.js', dest: '/control/content' });
const controlDesignJS = () => jsTask({ src: 'control/design/**/*.js', dest: '/control/design' });
const controlSettingsJS = () => jsTask({ src: 'control/settings/**/*.js', dest: '/control/settings' });

/**
 * Lint Task
 * @description Verify code quality with ESLint
 */
const lint = () => gulpSrc([
  'widget/**/*.js',
  'control/**/*.js',
])
  .pipe(print())
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError());

/**
 * Prettier Task
 * @description Verify code format with Prettier
 */
const prettierTask = () => gulpSrc([
  'widget/**/*.js',
  'control/**/*.js',
])
  .pipe(print())
  .pipe(prettier.check());

/**
 * Clean Task
 * @description Clears the previous build if exists
 */
const clean = () => rimraf(destinationPath);

/**
 * HTML Task
 * @description Recursively loops through the widget and control folders, processes each html file
 */
const htmlTask = () => gulpSrc([
  'widget/**/*.html',
  'widget/**/*.htm',
  'control/**/*.html',
  'control/**/*.htm',
], { base: '.' })
  .pipe(print())
  .pipe(htmlReplace({
    bundleJSFiles: `scripts.min.js?v=${new Date().getTime()}`,
    bundleCSSFiles: `styles.min.css?v=${new Date().getTime()}`,
  }))
  .pipe(htmlmin({
    removeComments: true,
    collapseWhitespace: true,
  }))
  .pipe(gulpDest(destinationPath));

/**
 * Resources Task
 * @description Copy resources directiry and plugin.json
 */
const resourcesTask = () => gulpSrc([
  'resources/*',
  'plugin.json',
], { base: '.' })
  .pipe(print())
  .pipe(gulpDest(destinationPath));

/**
 * Images Task
 * @description Process plugin images directory
 */
const imagesTask = () => gulpSrc(['**/.images/**'], { base: '.' })
  .pipe(print())
  .pipe(imagemin())
  .pipe(gulpDest(destinationPath));

exports.default = series(
  // lint,
  clean,
  // prettierTask,
  parallel(
    widgetCSS,
    controlContentCSS,
    controlDesignCSS,
    controlSettingsCSS,
    widgetJS,
    controlContentJS,
    controlDesignJS,
    controlSettingsJS,
    htmlTask,
    resourcesTask,
    imagesTask,
  ),
);
