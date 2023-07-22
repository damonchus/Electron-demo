import remote from "electron";

/* 选择文件 */
export const dialogChoose = async () => {
  console.log("asd");
  try {
    const data = {
      title: "请选择你喜欢的照片", //默认路径,默认选择的文件
      defaultPath: __dirname, //过滤文件后缀
      filters: [
        {
          name: "img",
          extensions: ["jpg", "png"],
        },
      ], //打开按钮
      buttonLabel: "打开按钮文字", //回调结果渲染到img标签上
    };
    const result = await remote.dialog.showOpenDialog(data);

    console.log("result", result);
  } catch (err) {
    console.log(err);
  }
};
