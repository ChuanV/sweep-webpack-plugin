/*
 * @LastEditTime: 2022-06-25 10:49:30
 * @LastEditors: laoshengchuan
 */
const fs = require('fs')
const path = require('path')

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
const deletedDirPath = resolveApp('./unused-files')
const fileMapJsonPath = `${deletedDirPath}/000-unused-files.json`


// 支持移动/删除文件（move/delete）
function deletedFiles (type = 'move', cb) {
  !fs.existsSync(deletedDirPath) && fs.mkdirSync(deletedDirPath)
  const jsonArr = JSON.parse(fs.readFileSync(fileMapJsonPath))
  jsonArr.forEach(item => {
    if (fs.existsSync(item.path)) {
      type === 'move' ? fs.renameSync(item.path, `${deletedDirPath}/${item.key}-${path.basename(item.path)}`) : fs.unlinkSync(item.path)
    }
  })
  cb && cb()
}
// 数组去重
function unique (arr) {
  return [...new Set(arr)]
}
// 获取目录下所有文件
function getAllFiles (dirPath) {
  const allFiles = []
  function fn (dirPath) {
    const files = fs.readdirSync(dirPath)
    files.forEach(item => {
      const fp = path.resolve(dirPath, `./${item}`)
      const tmp = fs.lstatSync(fp)
      if (tmp.isDirectory()) {
        fn(fp)
      } else {
        allFiles.push(fp)
      }
    })
  }
  fn(dirPath)
  return allFiles
}
// 生成命令
function npmScript () {
  // 重写package.json
  const jsonPath = resolveApp('./package.json')
  if (fs.existsSync(jsonPath)) {
    const json = JSON.parse(fs.readFileSync(jsonPath,{encoding:'utf-8'}))
    json.scripts['sweep-restore'] = "sweep-webpack-plugin-restore"
    fs.writeFileSync(jsonPath, JSON.stringify(json,null,'  '))
  }
}

// 清除插件
module.exports = class CleanPlugin {
  constructor(options = {}) {
    const defaultOptions = {
      // 扫描的根目录
      root: './src',
      // 不扫描目录
      exclude: [/node_modules/],
      // 不扫描后缀,为空时扫描所有后缀
      excludeSuffix: [],
      // 扫描后缀,为空时扫描所有后缀
      includeSuffix: [],
      // 保存无用文件的目录
      unUsedFilesDir: './unused-files',
      // 对无用文件执行的操作，move移动、delete删除
      operate: 'move'
    }
    this.options = {
      root: options?.root || defaultOptions.root,
      unUsedFilesDir: defaultOptions.unUsedFilesDir,
      exclude: Array.isArray(options?.exclude) ? options.exclude : defaultOptions.exclude,
      excludeSuffix: Array.isArray(options?.excludeSuffix) ? options.excludeSuffix : defaultOptions.excludeSuffix,
      includeSuffix: Array.isArray(options?.includeSuffix) ? options.includeSuffix : defaultOptions.includeSuffix

    }
    if (options?.root) {
      if (options.root === 'move' || options.root === 'delete') {
        this.options.root = options.root
      } else {
        this.options.root = defaultOptions.root
      }
    } else {
      this.options.root = defaultOptions.root
    }
  }
  apply (compiler) {
    const { root, exclude, excludeSuffix, unUsedFilesDir, operate, includeSuffix } = this.options
    compiler.hooks.afterEmit.tap('clean-plugin', compilation => {
      const usedFileDeps = unique(Array.from(compilation.fileDependencies).filter(Boolean))
      const filterDeps = usedFileDeps.filter(item => !exclude.some(regExp => regExp.test(item)))

      const allFiles = getAllFiles(resolveApp(root)).filter(Boolean)
      const filterFiles = allFiles.filter(item => !~excludeSuffix.indexOf(path.extname(item)))
      const filterFiles2 = includeSuffix.length ? filterFiles.filter(item => ~includeSuffix.indexOf(path.extname(item))) : filterFiles

      const unUsedFiles = filterFiles2.filter(item => !filterDeps.includes(item))

      const unUsedRoot = resolveApp(unUsedFilesDir)
      !fs.existsSync(unUsedRoot) && fs.mkdirSync(unUsedRoot)
      const addKeyJson = unUsedFiles.map((item, index) => ({ path: item, key: index + 1 }))
      fs.writeFileSync(`${unUsedRoot}/000-unused-files.json`, JSON.stringify(addKeyJson))
      deletedFiles(operate)
      npmScript()
    })
  }
}

