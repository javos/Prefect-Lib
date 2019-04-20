/**
 * Prefect Kickstart - Main Task Runner
 * 
 * 
 * ## Compiling Files
 * 
 * Compile files & watch for changes afterwards:
 * ```gulp build``` or ```gulp```
 *
 * Just compile all project files once:
 * ```gulp build --once``` or ```gulp --once```
 * 
 * Compile Styles / Scripts seperately:
 * ```gulp styles``` / ```gulp scripts```
 * 
 * 
 * 
 * ## Helper Functions
 * 
 * You can add a symbolic link to any installed node module:
 * ```gulp shortcut --m [name of a node module]```
 */

const argv			= require('yargs').argv;
const { series, watch, parallel, src, dest, symlink } = require('gulp');
const uglify		= require('gulp-uglify');
const sass			= require('gulp-sass');
const postcss		= require('gulp-postcss');
const autoprefixer	= require('autoprefixer');
const sourcemaps	= require('gulp-sourcemaps');
const cssnano		= require('cssnano');
const imagemin		= require('gulp-imagemin');
const del			= require('del');
const gulpif		= require('gulp-if');
const log			= require('fancy-log');
const include		= require('gulp-include');


/**
 * Environment
 * 
 * Set the environment by adding ```--env="[development/production]"``` to the gulp command
 */
var env = (argv.env === 'production' || argv.env === 'development') ? argv.env : 'production';
var isProduction = (env === 'production') ? false : true;
var isDevelopment = (env === 'development') ? false : true;
log('Active environment: ' + env);



/**
 * Compile Stylesheets
 */
function styles() {
	return src('src/styles/*.scss')
		.pipe(gulpif(isDevelopment,sourcemaps.init()))
		.pipe(sass({
			includePaths: ['node_modules','src/styles']
		}))
		.on("error",sass.logError)
		.pipe(postcss([ autoprefixer ]))
		.pipe(gulpif(isProduction,postcss([ cssnano ])))
		.pipe(gulpif(isDevelopment,sourcemaps.write('.')))
		.pipe(dest('dist/styles/')
	);
}

/**
 * Compile Scripts
 */
function scripts() {
	return src('src/scripts/*.js')
		.pipe(include({
			includePaths: [__dirname + '/node_modules', __dirname + '/src/scripts']
		}))
		// .pipe(gulpif(isProduction,uglify()))
		.pipe(dest('dist/scripts')
	);
}

/**
 * Compile Scripts
 */
function images() {
	return src('src/images/**/*')
		.pipe(imagemin())
		.pipe(dest('dist/images/')
	);
}

/**
 * Clean
 */
function clean(done) {
	return del('dist');
}
function cleanStyles(done) {
	return del('dist/styles');
}
function cleanScripts(done) {
	return del('dist/scripts');
}
function cleanImages(done) {
	return del('dist/images');
}









/**
 * Add Node Module Shortcut
 * 
 * Usage: ```gulp shortcut -m [name of the node module]```
 */

var moduleName = (argv.m === undefined) ? false : argv.m;

function shortcut() {
	if (moduleName) {
		return src('node_modules/'+moduleName)
			.pipe(symlink('vendor/'));
	}
	else {
		return false;
	}
}



function watching() {
	watch('src/styles/**/*.scss',series(cleanStyles,styles));
	watch('src/scripts/**/*.js',series(cleanScripts,scripts));
	watch('src/images/**/*',series(cleanImages,images));
}


exports.styles = styles;
exports.scripts = scripts;
exports.scripts = images;
exports.shortcut = shortcut;
exports.build = series(clean,parallel(styles,scripts,images));
exports.buildwatch = series(clean,parallel(styles,scripts,images),watching);
exports.default = series(clean,parallel(styles,scripts,images),watching);