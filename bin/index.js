#!/usr/bin/env node
'use strict';


const fs = require('fs')
const path = require('path')

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
const deletedDirPath = resolveApp('./unused-files')
const fileMapJsonPath = `${deletedDirPath}/000-unused-files.json`
// 只针对移动文件的恢复
function restoreFiles (cb) {
  if(fs.existsSync(fileMapJsonPath)){
    const mapArr = JSON.parse(fs.readFileSync(fileMapJsonPath))
    mapArr.forEach(item => {
      const currentPath = `${deletedDirPath}/${item.key}-${path.basename(item.path)}`
      if (fs.existsSync(currentPath)) {
        fs.renameSync(`${deletedDirPath}/${item.key}-${path.basename(item.path)}`, item.path)
      }
    })
    cb && cb()
  }
}
restoreFiles(()=>{
  console.log('文件恢复成功。')
})