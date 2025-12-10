# 奢华互动 3D 圣诞树 (Grand Luxury Interactive Tree)

🎄 **创作者：@歪斯Wise**

这是一个基于 React 19、React Three Fiber 和 MediaPipe 构建的高保真 3D 互动圣诞树体验。它结合了粒子系统、计算机视觉手势控制和沉浸式光影效果，旨在为你带来独特且充满科技感的节日祝福。

## ✨ 核心亮点

### 1. AI 手势交互 (MediaPipe)
通过摄像头实时捕捉手部动作，带来魔法般的控制体验：
- **张开手掌 (Open Hand)**：圣诞树瞬间炸裂，装饰物与照片悬浮进入“混沌模式”。
- **握紧拳头 (Closed Fist)**：所有元素受物理引力牵引，重新凝聚成完美的螺旋圣诞树形态。
- **手势跟随**：在炸裂状态下，移动手势可实时控制树体的旋转与视角，带来沉浸式观感。

### 2. 回忆照片墙 (Memory Gallery)
- **批量上传**：支持从设备批量上传照片。
- **3D 拍立得**：照片会自动生成带有边框的 3D 模型，并依据黄金螺旋算法挂在树上。
- **全屏浏览**：点击树上的照片可进入全屏画廊模式。
- **移动端适配**：支持触屏左右滑动切换照片，并针对 iOS/Android 进行了底层的内存压缩优化（Blob Streaming），防止因大图导致的崩溃。

### 3. 自定义背景音乐
- 支持上传你喜欢的音乐文件（支持 MP3, FLAC 等）。
- 上传后按钮呈现金色光圈与旋转动效。
- 针对移动端浏览器限制，提供了交互式播放按钮以确保音乐顺利播放。

### 4. 影院级视觉效果
- **粒子系统**：基于 Shader 编写的 25,000 个独立针叶粒子，带有呼吸与风动效果。
- **黄金螺旋分布**：820+ 个装饰物（彩球、礼物盒、宝石）基于斐波那契数列（Phyllotaxis）完美均匀分布，无死角。
- **后期处理**：集成了 Bloom（辉光）、Vignette（暗角）与 Noise（噪点），模拟电影胶片质感。

## 🛠️ 技术栈

- **Core**: React 19, TypeScript, Vite
- **3D Engine**: Three.js, React Three Fiber (R3F), @react-three/drei
- **AI Vision**: @mediapipe/tasks-vision
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Post-processing**: @react-three/postprocessing

## 🚀 运行项目

确保你的环境已安装 Node.js。

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

3. 在浏览器打开（推荐使用 Chrome 以获得最佳 WebGL 与摄像头支持）。

---
*Created with ❤️ by @歪斯Wise*
