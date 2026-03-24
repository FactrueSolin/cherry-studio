# rust-sdk

用于在 Node 环境中以 WASM 方式复用图像纯算法的 Rust SDK。

当前提供两类能力：

- 多图按布局拼接为单张 PNG
- 两张图片的差异百分比计算

## 设计边界

这个 SDK **不负责系统截图**。像 [`screencapture`](uicontrol/src/screenshot.rs:138) 这样的宿主能力必须由 Node 或原生层提供。

这个 SDK 只负责纯图像处理：

- 对应原项目 [`take_stitched_screenshot()`](uicontrol/src/screenshot.rs:62) 中的拼接内核
- 对应原项目 [`compare_dynamic_images()`](uicontrol/src/image_diff.rs:25) 的差异计算

## 编译为 WASM

建议使用 [`wasm-pack`](https://github.com/rustwasm/wasm-pack)：

```bash
pnpm build:rust-sdk
```

这个命令定义在 [`package.json`](package.json:15) 的 [`build:rust-sdk`](package.json:15) 中；如果本机没有 `wasm-pack`，会先通过 `cargo install wasm-pack --locked --root ./.cargo-tools` 安装到仓库本地工具目录，然后再在 [`rust-sdk/`](rust-sdk/) 下执行 `wasm-pack build --target nodejs`。

## Cherry Studio 内部 helper

Cherry Studio 主进程侧已新增 helper：[`src/main/helpers/rustSdk/index.ts`](src/main/helpers/rustSdk/index.ts:1)

可直接使用：

```ts
import { compareImages, stitchImages } from '@main/helpers/rustSdk'
```

其中：

- [`loadRustSdk()`](src/main/helpers/rustSdk/index.ts:62) 负责加载 WASM 构建产物
- [`stitchImages()`](src/main/helpers/rustSdk/index.ts:73) 封装拼接调用
- [`compareImages()`](src/main/helpers/rustSdk/index.ts:78) 封装差异比较调用

## Node 调用示例

```js
const sdk = require('./pkg/rust_sdk');

const stitched = sdk.stitch_images({
  stitchedWidth: 3840,
  stitchedHeight: 1080,
  images: [
    {
      imageBase64: leftBase64,
      width: 1920,
      height: 1080,
      offsetX: 0,
      offsetY: 0,
    },
    {
      imageBase64: rightBase64,
      width: 1920,
      height: 1080,
      offsetX: 1920,
      offsetY: 0,
    },
  ],
});

const diff = sdk.compare_images({
  image1Base64: beforeBase64,
  image2Base64: afterBase64,
});
```

## 输入说明

### [`stitch_images()`](rust-sdk/src/lib.rs:34)

- `stitchedWidth`: 最终画布宽度
- `stitchedHeight`: 最终画布高度
- `images[]`: 每张待拼接图片
  - `imageBase64`: 图片 base64 数据
  - `width`: 目标宽度
  - `height`: 目标高度
  - `offsetX`: 在目标画布中的横向偏移
  - `offsetY`: 在目标画布中的纵向偏移

返回：

- `imageBase64`: 拼接后 PNG 的 base64
- `stitchedWidth`
- `stitchedHeight`

### [`compare_images()`](rust-sdk/src/lib.rs:42)

- `image1Base64`
- `image2Base64`

返回：

- `diffPercent`: 两图差异百分比
