"use strict";

var autoprefixer = require("gulp-autoprefixer");
var browserSync = require("browser-sync").create();
var cache = require("gulp-cached");
var cp = require("child_process");
var cssnano = require("gulp-cssnano");
var cache = require("gulp-cache");
var changed = require("gulp-changed");
var del = require("del");
var es = require("event-stream");
var foreach = require("gulp-foreach");
var fs = require("fs");
var gulp = require("gulp");
var imagemin = require("gulp-imagemin");
var imageResize = require("gulp-image-resize");
var jscs = require("gulp-jscs");
var jshint = require("gulp-jshint");
var os = require("os");
var parallel = require("concurrent-transform");
var path = require("path");
var plumber = require("gulp-plumber");
var print = require("gulp-print");
var reload = browserSync.reload;
var rename = require("gulp-rename");
var replace = require("gulp-replace");
var runSequence = require("run-sequence");
var sass = require("gulp-sass")(require("sass"));
var scsslint = require("gulp-scss-lint");
var shell = require("gulp-shell");
var sizeOf = require("image-size");
var sourcemaps = require("gulp-sourcemaps");
var uglify = require("gulp-uglify");

var jekyll = process.platform === "win32" ? "jekyll.bat" : "jekyll";
var messages = {
  jekyllBuild: '<span style="color: grey">Running: </span> $ jekyll build',
};
var responsiveSizes = [20, 400, 800, 1600];

/************
 **  SCSS  **
 ************/

gulp.task("scss:lint", function (done) {
  gulp
    .src(["./_scss/**/*.scss", "!./_scss/lib/**/*.scss"])
    .pipe(plumber())
    .pipe(scsslint());
  done();
});

gulp.task("scss:build", function (done) {
  gulp
    .src("./_scss/style.scss")
    .pipe(plumber())
    .pipe(rename({ suffix: ".min" }))
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        includePaths: ["scss"],
        onError: browserSync.notify,
        outputStyle: "compressed",
      })
    )
    .pipe(
      autoprefixer(["last 15 versions", "> 1%", "ie 8", "ie 7"], {
        cascade: true,
      })
    )
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("./_site/css/"))
    .pipe(reload({ stream: true }))
    .pipe(gulp.dest("./css/"));
  done();
});

gulp.task("scss", gulp.parallel("scss:lint", "scss:build"));

gulp.task("scss:optimized", function () {
  return gulp
    .src("./_scss/style.scss")
    .pipe(plumber())
    .pipe(rename({ suffix: ".min" }))
    .pipe(
      sass({
        includePaths: ["scss"],
        outputStyle: "compressed",
      })
    )
    .pipe(
      autoprefixer(["last 15 versions", "> 1%", "ie 8", "ie 7"], {
        cascade: true,
      })
    )
    .pipe(cssnano({ compatibility: "ie8" }))
    .pipe(gulp.dest("./_site/css/"))
    .pipe(reload({ stream: true }))
    .pipe(gulp.dest("./css/"));
});

/******************
 **  JavaScript  **
 ******************/
gulp.task("js:build", function () {
  return gulp
    .src("./_js/**/*.js")
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("./_site/js/"))
    .pipe(reload({ stream: true }))
    .pipe(gulp.dest("./js/"));
});

gulp.task("js:lint", function () {
  return gulp
    .src(["./_js/**/*.js", "!./_js/lib/**/*.js", "Gulpfile.js"])
    .pipe(plumber())
    .pipe(jscs())
    .pipe(jshint())
    .pipe(jshint.reporter("default"));
});

gulp.task("js", gulp.parallel("js:lint", "js:build"));

/**********************
 ** Optimized Images **
 **********************/

gulp.task(
  "images",
  /*['responsive'],*/ function () {
    var dest = "./img/";
    return gulp
      .src("./_img/**/*")
      .pipe(plumber())
      .pipe(changed(dest))
      .pipe(gulp.dest("./_site/img/"))
      .pipe(reload({ stream: true }))
      .pipe(gulp.dest(dest));
  }
);

gulp.task(
  "images:optimized",
  /*['responsive'],*/ function () {
    return gulp
      .src("./_img/**/*")
      .pipe(plumber())
      .pipe(
        cache(
          imagemin({
            interlaced: true,
            pngquant: true,
            progressive: true,
            multipass: true,
          })
        )
      )
      .pipe(gulp.dest("./_site/img/"))
      .pipe(reload({ stream: true }))
      .pipe(gulp.dest("./img/"));
  }
);

/***********************
 ** Responsive Images **
 ***********************/

gulp.task("responsive:resize", function () {
  var srcSuffix, destSuffix;

  // Note: process.argv = ['node', 'path/to/gulpfile.js', 'responsive', '--dir', 'subPathIfProvided']
  var idx = process.argv.indexOf("--dir");
  if (idx > -1) {
    // Only process subdirectory
    var rawSrc = process.argv[idx + 1];
    var srcPath = path.join("./_img/res/raw/", rawSrc);
    if (fs.lstatSync(path.resolve(srcPath)).isDirectory()) {
      srcSuffix = path.join(rawSrc, "/**/*");
      destSuffix = rawSrc;
    } else {
      srcSuffix = rawSrc;
      destSuffix = rawSrc.substring(0, rawSrc.lastIndexOf("/"));
    }
  } else {
    srcSuffix = "**/*";
    destSuffix = "";
  }

  return es.merge(
    responsiveSizes.map(function (size) {
      var dest = "./_img/res/" + size + "/" + destSuffix;
      return gulp
        .src("./_img/res/raw/" + srcSuffix)
        .pipe(plumber())
        .pipe(changed(dest))
        .pipe(
          parallel(
            imageResize({
              height: size,
              width: 0,
              crop: false,
              upscale: false,
              imageMagick: true,
            }),
            os.cpus().length
          )
        )
        .pipe(
          print(function (filepath) {
            return "Created: " + filepath.replace("/raw/", "/" + size + "/");
          })
        )
        .pipe(gulp.dest(dest));
    })
  );
});

gulp.task("responsive:metadata", function (done) {
  // We always process all images.
  var metadata = {
    _NOTE:
      "This file is generated in gulpfile.js, in the responsive:metadata task.",
    aspectRatios: {},
    sizes: responsiveSizes,
  };
  return gulp
    .src("./_img/res/raw/**/*.{jpg,JPG,png,PNG,jpeg,JPEG,gif,GIF}")
    .pipe(
      foreach(function (stream, file) {
        var key = file.path.replace(/.*\/_img\/res\/raw\//, "");
        var dimensions = sizeOf(file.path);
        metadata.aspectRatios[key] = Number(
          (dimensions.width / dimensions.height).toFixed(3)
        );
        return stream;
      })
    )
    .on("finish", function () {
      fs.writeFileSync(
        "./_data/responsiveMetadata.json",
        JSON.stringify(metadata, null, 2)
      );
      done();
    });
});

gulp.task("responsive:clean", function (cb) {
  // Note: process.argv = ['node', 'path/to/gulpfile.js', 'responsive', '--dir', 'subPathIfProvided']
  var idx = process.argv.indexOf("--dir");
  var folders =
    idx > -1
      ? responsiveSizes.map(function (size) {
          return "_img/res/" + size + "/" + process.argv[idx + 1];
        })
      : ["_img/res/*", "!_img/res/raw/", "!_img/res/raw/**"];

  return del(folders, cb);
});

gulp.task(
  "responsive",
  gulp.series(
    "responsive:clean",
    gulp.parallel("responsive:resize", "responsive:metadata"),
    "images"
  )
);

/************
 ** Jekyll **
 ************/

gulp.task("jekyll:build", function (cb) {
  browserSync.notify(messages.jekyllBuild);
  return cp.spawn(jekyll, ["build"], { stdio: "inherit" }).on("close", cb);
});

gulp.task(
  "jekyll:rebuild",
  gulp.series("jekyll:build", function () {
    reload();
  })
);

gulp.task("jekyll", gulp.parallel("jekyll:build"));

/******************
 ** Global Tasks **
 ******************/

gulp.task("clean", function (cb) {
  return del(["./_site/", "./css/", "./js/", "./img/"], cb);
});

gulp.task(
  "build",
  gulp.series("clean", gulp.parallel("scss", "images", "js"), "jekyll")
);

gulp.task(
  "build:optimized",
  gulp.series(
    "clean",
    gulp.parallel("scss:optimized", "images", "js"),
    "jekyll"
  )
);

gulp.task(
  "deploy",
  gulp.series("build:optimized", function (done) {
    cp.exec(
      "rsync -avuzh _site/* dan:/srv/isaaclevien.com/public_html/",
      function () {
        process.stdout.write("Deployed to isaaclevien.com\n");
        done();
      }
    ).stdout.on("data", function (data) {
      process.stdout.write(data);
    });
  })
);

gulp.task("watch", function (done) {
  gulp.watch(
    [
      "./**/*.html",
      "!./_site/**/*.html",
      "./_layouts/*.html",
      "./_includes/*.html",
      "./_drafts/*.html",
      "./_posts/*",
      "./_data/*",
      "./_config.yml",
    ],
    gulp.series("jekyll:rebuild")
  );
  gulp.watch("./_scss/**/*.scss", gulp.series("scss"));
  gulp.watch("./img/res/**/*", gulp.series("images"));
  gulp.watch(["./_js/**/*.js", "Gulpfile.js"], gulp.series("js"));
  done();
});

// use default task to launch Browsersync and watch JS files
gulp.task(
  "serve",
  gulp.series(
    "build",
    function (done) {
      // Serve files from the root of this project
      browserSync.init(["./dist/**/*"], {
        ghostMode: {
          clicks: false,
          forms: false,
          scroll: false,
        },
        server: {
          baseDir: "_site",
          routes: {
            "/img": "_img",
          },
        },
      });
      done();
    },
    "watch"
  )
);

gulp.task("default", gulp.series("serve"));
