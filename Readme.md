<!--
 * @LastEditTime: 2022-06-24 21:52:33
 * @LastEditors: laoshengchuan
-->
# 说明
清除项目当中无用的文件，支持移动/删除/恢复操作

## 安装

```
npm install -S sweep-webpack-plugin
```

## 使用

```js
const SweepWebpackPlugin = require('sweep-webpack-plugin')

// webpack.conf.js
plugins:[
  new SweepWebpackPlugin({
      // 扫描的根目录
      root: './src',
      // 不扫描目录
      exclude: [/node_modules/],
      // 不扫描后缀,为空时扫描所有后缀
      excludeSuffix: [],
      // 扫描后缀,为空时扫描所有后缀
      includeSuffix: [],
      // 对无用文件执行的操作，move移动、delete删除
      operate: 'move'
    })
]
```

## 恢复
恢复操作仅针对移动无用文件的操作，而且只针对*本次移动操作后的恢复*。其他情况可能无法恢复。
```
npm run sweep-restore
```