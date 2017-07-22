'use strict';

// ビルドに必要なモジュールを読み込む。
const del = require('del');
const filter = require('gulp-filter');
const gulp = require('gulp');
const jasmine = require('gulp-jasmine');
const process = require('process');
const rename = require('gulp-rename');
const runSequence = require('run-sequence');
const sourcemaps = require('gulp-sourcemaps');
const typescript = require('gulp-typescript');
const uglify = require('gulp-uglify');

gulp.task('build', ['compile-main'], () => {
  return gulp.src('main/generated/**/*.*', {base: 'main/generated'})
  .pipe(gulp.dest('dist'));
});

// タスク定義：生成されたコードをクリーンアップする。
gulp.task('clean', () => {
  del(['main/generated', 'test/generated', 'dist']);
});

// タスク定義：すべてのコードをコンパイルする。
gulp.task('compile', ['compile-main', 'compile-test']);

// タスク定義：メインコードをコンパイルする。
gulp.task('compile-main', () => {
  return compile('main', true);
});

// タスク定義：テストコードをコンパイルする。
gulp.task('compile-test', () => {
  return compile('test');
});

// タスク定義：Jasmineテストドライバによりテストを実行する。
gulp.task('test', ['compile-test'], () => {
  return gulp.src('test/generated/**/*.spec.js').pipe(jasmine());
});

// 機能：引数で指定されたディレクトリ配下のtsファイルをコンパイルする。
// 引数：  baseDir: string   - ベースディレクトリ名
//        doUglify: boolean - 圧縮・難読化を行うかどうか
// 戻り値： コンパイル手続きを行いつつあるストリーム
function compile(baseDir, doUglify) {
  const forTest = 'test' === baseDir;
  // ベースディレクトリの配下のtsconfig.jsonを読み込む
  const tsconfig = require('./' + baseDir + '/tsconfig.json');
  // 処理途中でストリーム内容を一時的にjsファイルのみに絞り込むためのフィルタを作成する
  const jsOnly = filter('**/*.js', {restore: true});

  // 処理フェーズ1：globによる対象ファイル特定
  // 注意1：test以外をビルドするときはmain/src/配下のコードだけが対象になるが、
  // testをビルドするときは{test,main}/src配下のコードが対象になる。
  // 注意2：加えてtest側のコードからmain側のコードを相対パスで参照しており、
  // トランスパイル後のrequireによるモジュール参照にもこれは引き継がれるから、
  // testをビルドするときのbaseオプションはこのプロジェクトのルートを指すようにし、
  // ビルド成果物にもとのディレクトリ構成を反映させるよう仕向ける必要がある。
  const phase1 = gulp.src([baseDir + '/src/**/*.ts']
  .concat(forTest ? ['main/src/**/*.ts'] : []),
  {base: forTest ? '.' : 'main/src' });

  // 処理フェーズ2：tscによるトランスパイル
  // 注意：テスト時はソースマップの出力のための下準備を行わない。
  const phase2 = (forTest ? phase1 : phase1.pipe(sourcemaps.init()))
  .pipe(typescript(tsconfig.compilerOptions));

  // 処理フェーズ3：jsファイルの圧縮・難読化とリネーム
  // 注意1：圧縮・難読化オプションがonの時だけこのコードブロックは実質的な意味を持つ。
  // 注意2：前phaseのストリームにはd.tsなども含まれておりこれを加工するのは誤りだから、
  // フィルタにより一時的にjsファイルだけを処理対象にするようにしている。
  const phase3 = doUglify
  ? phase2.pipe(jsOnly)
  .pipe(uglify())
  .pipe(rename({extname: '.min.js'}))
  .pipe(jsOnly.restore) : phase2;

  // 処理フェーズ4：mapファイルと最終成果物の出力
  // 注意1：テスト時はソースマップの出力を行わない。
  // 注意2：destで指定したパスに出力される内容はテスト時とそうでないときに大きく変わる。
  // テスト時はプロジェクト・ルート配下のmain,test双方のディレクトリ構造が再現されるが、
  // それ以外のときはmain/src配下のディレクトリ構造が再現されるだけである。
  return (forTest ? phase3 : phase3.pipe(sourcemaps.write('./')))
  .pipe(gulp.dest(baseDir + '/generated'));
}
