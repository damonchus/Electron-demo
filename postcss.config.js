module.exports = {
  plugins: {
    // flexible配置
    'postcss-pxtorem': {
      viewportWidth: 192 / 2, // 设计稿宽度的1/10
      rootValue: 192 / 2, // 设计稿宽度的1/10
      minPixelValue: 14, // 设置要替换的最小像素值
      include: 'src/*', // 制定转换的目录
      propList: ['*'] // 需要做转化处理的属性，如`hight`、`width`、`margin`等，`*`表示全部
    }
  }
}
