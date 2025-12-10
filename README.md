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

---

# Prompt
# Role: 首席 3D 创意工程师 (React 19 / R3F / WebGL)

## 🌟 项目目标
构建一个 **"Grand Luxury Interactive Christmas Tree" (豪华互动圣诞树)** 的 3D Web 应用。
**核心体验：** 页面加载完毕后，用户看到一棵由无数粒子和精致装饰组成的**完美闭合的圣诞树**。用户可以通过手势控制树的炸裂与重组，并能批量上传照片挂在树上。

## 🎨 视觉美学规范
- **风格定义：** "Cinematic Luxury" (电影级奢华感)。
- **配色方案：**
  - **主色：** Deep Emerald Green (深祖母绿) —— 针叶颜色。
  - **辅色：** High-Gloss Gold (高光流金) —— 装饰物与光晕。
- **光影特效：** 必须使用 `@react-three/postprocessing` 实现高强度的 **Bloom (辉光)**，让金色装饰和树顶星发出耀眼光芒。

## 🛠️ 技术栈要求
- **核心：** React 19, TypeScript, Vite.
- **状态：** Zustand (全局状态管理).
- **3D 引擎：** React Three Fiber (R3F), Drei, Custom Shaders.
- **视觉识别：** `@mediapipe/tasks-vision` (用于手势控制).
- **样式：** Tailwind CSS.

## 🧠 核心交互逻辑 (严格执行)

### 1. 状态生命周期 (State Machine)
系统基于 `interactionStrength` (1.0 到 0.0) 运行：
- **初始状态 (必须):** `interactionStrength = 1.0`。页面加载时，树是**完美闭合**的。
- **1.0 (Tree Formed):** 秩序状态。所有装饰物螺旋排列成圆锥体。
- **0.0 (Chaos Unleashed):** 混沌状态。所有装饰物在球形空间内炸裂悬浮。

### 2. 混合输入系统 (手势 + 鼠标)
引入 MediaPipe 手势识别，逻辑如下：
- **变身控制 (Z轴逻辑):**
  - **张开手掌 (Open Hand):** 触发 `interactionStrength` 向 **0.0** 平滑过渡 (树炸裂)。
  - **握拳 (Closed Hand):** 触发 `interactionStrength` 向 **1.0** 平滑过渡 (树聚合)。
- **视角导航 (XY轴逻辑) - *关键锁机制*:**
  - **仅当** `interactionStrength < 0.5` (树处于炸裂状态) 时：将手掌中心(或鼠标)的屏幕坐标映射为摄像机旋转角度 (Parallax)，允许用户环视碎片。
  - **当** `interactionStrength >= 0.5` (树闭合状态) 时：强制摄像机复位并锁定在正前方，**忽略**手部移动，保持庄重感。

## 🧩 模块详细实现指南

### 模块 A: 高保真针叶系统 (Foliage Layer)
*目标：树必须看起来茂密、有体积感。*
- **实现:** 使用 `THREE.Points` 渲染 20,000+ 个粒子。
- **分布算法:** 使用 **"Tiered Spiral" (分层螺旋)** 算法，模拟松树的层级结构，避免看起来像个简单的圆锥筒。
- **Shader:** 编写自定义 Shader，根据 Y 轴高度从深绿渐变到金黄树梢，并加入微风吹拂的呼吸动画。

### 模块 B: 装饰与树顶星 (Ornaments Layer)
使用 `InstancedMesh` 渲染，赋予不同物体不同的物理惯性 (Lag)：
1.  **树顶星 (Tree Topper):** 一个独立的、高精度的**金色五角星 Mesh**，始终停留在树顶，作为视觉锚点。
2.  **重型装饰 (Gifts):** 方形礼物盒，移动速度最慢。
3.  **轻型装饰 (Orbs):** 金色/红色金属球，标准速度。
4.  **氛围粒子 (Lights):** 极小的发光点，移动速度最快。

### 模块 C: 批量照片上传系统 (Photo Memories)
1.  **UI:** 右下角悬浮按钮 "Upload Memories"，支持 `<input type="file" multiple />` (批量上传)。
2.  **处理:** 将上传的图片转换为纹理并存入 Zustand Store。
3.  **渲染:**
    - 遍历纹理生成 3D 挂件。
    - **样式:** 拍立得风格 (图片纹理 + 白色边框)。
    - **可见性:** 在 Chaos (炸裂) 状态下，照片应缓慢自转或始终朝向摄像机 (Billboard)，确保用户能看清照片内容。

## 💻 交付代码清单
请生成以下完整的、可运行的 React 组件文件：

1.  `stores/useTreeStore.ts` (状态管理，确保初始值为 1.0).
2.  `hooks/useHandLandmarker.ts` (MediaPipe 完整逻辑，含 Open/Closed 判断).
3.  `components/UI/Uploader.tsx` (批量上传组件).
4.  `components/3D/Foliage.tsx` (针叶系统).
5.  `components/3D/Ornaments.tsx` (装饰物与树顶星).
6.  `components/3D/PhotoOrnaments.tsx` (照片挂件渲染).
7.  `components/3D/CameraRig.tsx` (视角控制，含锁定逻辑).
8.  `Scene.tsx` (主场景与 PostProcessing 配置).

**Execute. Build the ultimate holiday experience.**

3. 在浏览器打开（推荐使用 Chrome 以获得最佳 WebGL 与摄像头支持）。

---
*Created with ❤️ by @歪斯Wise*
