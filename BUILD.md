Package build process

# 1. clean:tmp:lib
Cleans temporary and lib directories.

# 2. gulp
Copies all nebular packages from src/framework/* to build dir (.ng_build). Then compiles scss to css.

# 3. build:ts
Compiles all packages with `ngc`. Creates es5 and es2015 directories in lib dir (src/.lib).

# 4. build:schematics:package


# 5. build:inline-resources
Copies resource files (.html, .css, .scss etc.) from build directory (.ng_build) to lib dirs (src/.lib/\[es5, es2015\]).
Then inlines this resources to .js files.

# 6. build:move-to-package-dirs
Moves bundles from es5 and es2015 dirs to \[package-name\]/es5 and \[package-name\]/es2015.

# 7. build:bundle
Builds umd bundle from files in lib dir (/src/.lib) with rollup. Outputs in src/.lib/\[package-name\]/bundles.

# 8. clean:tmp
Cleans temporary directories.
