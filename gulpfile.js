const gulp = require("gulp");
const sourcemaps = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const debug = require("gulp-debug");
const replace = require("gulp-replace");
const livereload = require("gulp-livereload");
const buildNumber = Math.random();

gulp.task("default", ["sass"]);

gulp.task("sass", () => {
	gulp.src("static/scss/main.scss")
		.pipe(debug())
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(gulp.dest("static/css"))
		.pipe(sourcemaps.write())
		.pipe(livereload());
});

gulp.task("scripts", () => {
	gulp.src("static/js/**/*.js")
		.pipe(debug())
		.pipe(gulp.dest("static/js"))
		.pipe(livereload());
});

gulp.task("images", () => {
	gulp.src("static/img/**/*.{png,jpg,gif}")
		.pipe(debug())
		.pipe(gulp.dest("static/img"))
		.pipe(livereload());
});

gulp.task("service-worker", () => {
	gulp.src([
		"static/service-worker.js"
	])
	.pipe(debug())
	.pipe(replace("#{MyBuildNumber}#", `local-${buildNumber}`))
	.pipe(gulp.dest("static/"))
	.pipe(livereload());
});

gulp.task("manifest", () => {
	gulp.src([
		"static/manifest.json"
	])
	.pipe(debug())
	.pipe(gulp.dest("static/"))
	.pipe(livereload());
})

gulp.task("html", () => {
	gulp.src([
		"static/index.html"
	])
	.pipe(debug())
	.pipe(replace("#{MyBuildNumber}#", `local-${buildNumber}`))
	.pipe(gulp.dest("static/"))
	.pipe(livereload());
});

gulp.task("watch", ["default"], () => {
	livereload.listen();
	gulp.watch("static/scss/**/*.scss", ["sass"]);
});