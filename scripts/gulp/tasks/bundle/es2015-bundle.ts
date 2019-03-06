import { dest, src, task } from 'gulp';
import { ES_2015_LIB_DIR, ES_5_LIB_DIR, JS_PACKAGES, LIB_DIR } from '../config';

task('move-to-package-dirs', () => {
  return Promise.all([
    ...JS_PACKAGES.map((packageName) => {
      return src([`${ES_5_LIB_DIR}/${packageName}/**`])
        .pipe(dest(`${LIB_DIR}/${packageName}/es5`));
    }),
    ...JS_PACKAGES.map((packageName) => {
      return src([`${ES_2015_LIB_DIR}/${packageName}/**`])
        .pipe(dest(`${LIB_DIR}/${packageName}/es2015`));
    }),
    ...JS_PACKAGES.map((packageName) => {
      return src([`${ES_5_LIB_DIR}/${packageName}/**/*.d.ts`])
        .pipe(dest(`${LIB_DIR}/${packageName}`));
    }),
    ...JS_PACKAGES.map((packageName) => {
      return src([`${ES_5_LIB_DIR}/${packageName}/**/*.metadata.json`])
        .pipe(dest(`${LIB_DIR}/${packageName}`));
    }),
  ]);
});
