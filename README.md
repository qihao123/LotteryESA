# 3D炫酷抽奖程序

本项目由阿里云ESA提供加速、计算和保护

![aliyunESA](aliyunESA.png)

## 项目介绍

这是一个基于React和Three.js开发的3D炫酷抽奖程序，专为国内公司年会、活动抽奖设计，功能全面且视觉效果震撼。

### 实用性
- 支持多种奖品类型配置，可灵活设置奖品数量、中奖概率
- 提供Excel导入/导出功能，方便批量管理参与人员信息
- 实时显示中奖记录，支持打印或导出中奖名单
- 适配各种屏幕尺寸，支持移动端和桌面端使用
- 支持自定义背景、音乐和动画效果，增强现场氛围

### 创意性
- 采用3D旋转球体抽奖动画，视觉效果震撼
- 支持粒子特效和光影效果，提升科技感
- 提供丰富的交互反馈，增强用户参与感
- 可自定义抽奖速度和动画效果，满足不同场景需求

### 技术深度
- 基于React 18 + Vite 5构建，开发效率高，性能优秀
- 使用Three.js和@react-three/fiber实现3D抽奖球体效果
- 集成xlsx库实现Excel文件的导入/导出功能
- 使用react-toastify提供友好的消息提示
- 采用CSS3动画和渐变效果，提升视觉体验
- 部署在阿里云ESA Pages，享受边缘加速和安全防护

## 技术栈

- 前端框架：React 18
- 构建工具：Vite 5
- 3D引擎：Three.js
- UI组件：React Icons
- 文件处理：xlsx
- 消息提示：react-toastify
- 部署平台：阿里云ESA Pages

## 功能特性

1. **3D抽奖球体**：旋转动画流畅，视觉效果震撼
2. **奖品管理**：支持添加、删除、修改奖品信息
3. **人员管理**：Excel导入/导出，单个添加，灵活管理参与人员
4. **抽奖控制**：可调节抽奖速度，开始/停止/重置抽奖
5. **中奖记录**：实时显示中奖名单，支持导出
6. **自定义配置**：支持修改背景、音乐、动画效果
7. **响应式设计**：适配各种设备尺寸

## 开发说明

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 部署指南

### 1. 准备工作
- 注册阿里云账号
- 创建ESA Pages项目
- 准备GitHub仓库

### 2. 配置部署
- 在阿里云ESA控制台配置构建命令：`npm run build`
- 配置输出目录：`dist`
- 绑定GitHub仓库，开启自动部署

### 3. 访问应用
- 获取阿里云ESA分配的域名
- 通过域名访问部署好的应用

## 项目结构

```
├── public/              # 静态资源
├── src/
│   ├── components/     # React组件
│   │   ├── LotterySphere.jsx     # 3D抽奖球体组件
│   │   ├── PrizeConfig.jsx        # 奖品配置组件
│   │   └── ParticipantsManager.jsx # 人员管理组件
│   ├── App.jsx         # 应用主组件
│   ├── main.jsx        # 应用入口
│   ├── index.css       # 全局样式
│   └── App.css         # 组件样式
├── .gitignore          # Git忽略文件
├── package.json        # 项目配置
├── vite.config.js      # Vite配置
├── index.html          # HTML入口
└── README.md           # 项目说明
```

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎提交Issue或Pull Request。