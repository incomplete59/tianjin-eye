# 天津之眼 · uni-app x 微信小程序
这个项目使用 **HBuilderV + uni-app x（Vapor 模式）**。界面为 .uvue + TypeScript，Three.js r162 通过微信原生 WebGL canvas 组件绘制，所有模型和库随项目打包，不需要模型下载服务器。

## 在 HBuilderV 里运行
1. 解压工程，用 HBuilderV「打开文件夹」打开本目录（包含 manifest.json、pages.json 的这一层）。
2. 使用支持 uni-app x Vapor 和 main.ts 的 HBuilderV 版本；按当前官方文档建议使用 5.31 或更新版本。
3. 打开 manifest.json，设置 DCloud 应用标识 appid（由你的 DCloud 项目创建/关联得到），以及 mp-weixin.appid（你的微信小程序 AppID）。源码没有预填任何他人的 AppID。
4. 安装并登录微信开发者工具，在它的「设置 → 安全设置」开启服务端口；在 HBuilderV 的运行配置中设置微信开发者工具安装路径。
5. 选择「运行 → 运行到小程序模拟器 → 微信开发者工具」。也可以在运行与调试中选择「天津之眼 · 微信小程序」。
6. 用开发者工具的预览/真机调试，在 Android 和 iPhone 微信里分别检查旋转、双指缩放、日夜切换、后台切回和横竖屏。
7. 需要别人从微信小程序卡片打开时，配置测试成员/体验成员并上传体验版；向普通用户发布需要完成小程序平台的发布流程。

无需 npm install，也不需要构建 npm。首次使用 HBuilderV 时，IDE 可能提示安装 uni-app x 编译插件。
没有正式 AppID 时，可根据微信开发者工具当前提供的测试/游客模式尝试模拟器；真机预览和体验版请使用自己的小程序 AppID。

## 正式上传与代码质量
manifest.json 已配置 `mp-weixin.setting.minified: true`（上传时压缩 JS）及 `mp-weixin.lazyCodeLoading: "requiredComponents"`（组件按需注入）。通过 HBuilderV 的「发行」选择微信小程序，使用新生成的发行产物上传，并在微信开发者工具里重新扫描代码质量。运行模式下的 JS 源码仍可能未压缩，便于调试。
如果开发者工具仍显示 JS 压缩未通过，请检查项目详情的本地设置中「上传时压缩代码」是否开启，以及本地 project.private.config.json 是否覆盖了压缩设置；不要直接修改 unpackage 内的生成文件作为长期修复。

## 已实现
- Q 版天津之眼、24 个彩色座舱、永乐桥、海河、游船、汽车、房屋和树木。
- 单指旋转、双指缩放、按钮缩放、视角复位。
- 日夜平滑切换、摩天轮暂停/继续、0.5～3 倍转速（每档 0.5 倍，拖动实时生效）；转动时座舱保持竖直。
- 一屏自适应布局：控件靠下、滑条完整显示，模型区域填满剩余空间并预留手机底部安全区。
- 游船沿河循环航行，在两端转弯，从两个方向穿过永乐桥。
- 页面隐藏后停止绘制，返回后继续；组件销毁时释放 GPU 资源。
- 本地模型与库、失败提示和重新加载、小程序分享入口。
- 按设备 DPR 渲染并遵守 GPU 尺寸上限、约 30fps 目标、1024 阴影贴图；同材质零件合并以减少绘制调用。

## 文件
- pages/index/index.uvue：页面、按钮和生命周期。
- wxcomponents/tianjin-scene/index.*：微信原生画布组件和属性桥接。
- wxcomponents/tianjin-scene/lib/scene.js：模型、镜头、手势、动画与释放。
- wxcomponents/tianjin-scene/lib/merge-meshes.js：保留运动分组的网格合并。
- wxcomponents/tianjin-scene/lib/three.js：本地 Three.js r162 CommonJS 版。
- .vscode/launch.json：HBuilderV 微信运行配置。
- 验证说明.md：本次检查结果和仍需真机确认的范围。

此工程的当前目标是微信小程序。原生组件目录 wxcomponents 不适用于直接运行到 Web、Android App 或 iOS App；两个手机系统均通过微信运行同一个小程序。

## 官方参考
- [uni-app x 项目结构与 Vapor 模式](https://doc.dcloud.net.cn/uni-app-x/project.html)
- [uni-app x 接入微信原生组件](https://doc.dcloud.net.cn/uni-app-x/mp/native-component-and-wxs.html)

Three.js 与 RoundedBoxGeometry 使用 MIT 许可，许可证随库附带。模型是程序生成的卡通示意，非测绘还原。
