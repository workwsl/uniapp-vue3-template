<p align="center">
  <a href="https://github.com/feige996/unibest">
    <img width="160" src="./src/static/logo.svg">
  </a>
</p>

<h1 align="center">
  <a href="https://github.com/feige996/unibest" target="_blank">unibest-vue3-template</a>
</h1>

<div align="center">

![node version](https://img.shields.io/badge/node-%3E%3D20-green)
![pnpm version](https://img.shields.io/badge/pnpm-%3E%3D9-green)
![GitHub License](https://img.shields.io/badge/license-MIT-blue)

</div>

## 📖 项目简介

基于 `unibest` + `Vue3` + `TypeScript` + `Vite5` + `UnoCSS` 的**微信小程序**开发框架。

### ⚠️ 重要说明

**本项目仅支持微信小程序平台**，所有代码直接针对微信小程序编写，无需平台判断和条件编译。

### ✨ 核心特性

- 🎯 **仅支持微信小程序** - 专注微信小程序开发，无需考虑跨平台兼容
- 🚀 **最新技术栈** - Vue3 Composition API + TypeScript + Vite5
- 🎨 **UnoCSS 原子化 CSS** - 现代化样式解决方案，推荐使用原子化类名
- 📦 **约定式路由** - 基于文件系统的路由配置
- 🏗️ **Layout 布局系统** - 灵活的页面布局管理
- 🔐 **完善的登录拦截** - 支持白名单/黑名单策略的路由拦截
- 🌊 **HTTP 请求封装** - 支持简单 http、alova、vue-query 三种请求方式
- 📱 **自定义 TabBar** - 自定义底部导航栏
- 💾 **状态管理** - Pinia + 持久化存储
- 🛠️ **开发体验** - TypeScript 类型提示、ESLint 代码检查、自动格式化

![](https://raw.githubusercontent.com/andreasbm/readme/master/screenshots/lines/rainbow.png)

## ⚙️ 环境要求

- **Node.js** >= 20
- **pnpm** >= 9
- **TypeScript** >= 5.0
- **微信开发者工具** - 用于调试和预览小程序

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发运行

```bash
# 启动微信小程序开发
pnpm dev:mp
```

然后在微信开发者工具中：
1. 导入项目
2. 选择项目根目录下的 `dist/dev/mp-weixin` 文件夹
3. 开始开发调试

### 生产构建

```bash
# 构建微信小程序生产版本
pnpm build:mp
```

构建产物在 `dist/build/mp-weixin` 目录，通过微信开发者工具上传发布。

## 📁 项目结构

```
uniapp-vue3-template/
├── src/
│   ├── pages/          # 页面文件（约定式路由）
│   ├── components/     # 全局组件
│   ├── layouts/        # 布局文件
│   ├── api/            # API 接口定义
│   ├── http/           # HTTP 请求封装
│   │   ├── http.ts     # 简单 http
│   │   ├── alova.ts    # alova 封装
│   │   └── vue-query.ts # vue-query 封装
│   ├── store/          # Pinia 状态管理
│   ├── router/         # 路由配置和拦截
│   ├── tabbar/         # 自定义 TabBar
│   ├── utils/          # 工具函数
│   ├── style/          # 全局样式
│   ├── App.vue         # 应用入口
│   └── App.ku.vue      # 全局根组件
├── .cursor/
│   └── rules/          # 开发规范和规则
├── docs/               # 项目文档
├── vite.config.ts      # Vite 配置
├── pages.config.ts     # 页面路由配置
├── manifest.config.ts  # 应用清单配置
└── uno.config.ts       # UnoCSS 配置
```

## 🛠️ 核心配置

### 页面路由配置

页面配置在 `pages.config.ts` 中，使用约定式路由，文件名即路由路径。

### 应用清单配置

小程序相关配置在 `manifest.config.ts` 中，包括 appId、版本信息等。

### HTTP 请求配置

- 请求拦截器：`src/http/interceptor.ts`
- 支持三种请求方式：简单 http、alova、vue-query
- 自动处理 token 刷新和错误处理

### 路由拦截配置

- 登录策略配置：`src/router/config.ts`
- 支持白名单/黑名单两种策略
- 路由拦截逻辑：`src/router/interceptor.ts`

## 📝 开发规范

### Vue 组件规范

- 使用 `<script setup lang="ts">` 语法
- `<script setup>` 必须是第一个子元素
- `<template>` 必须是第二个子元素
- `<style scoped>` 必须是最后一个子元素（如使用）

### TypeScript 规范

- 严格使用 TypeScript，避免使用 `any`
- 使用 `interface` 定义对象类型
- 使用 `import type` 导入类型

### 样式规范

- **推荐使用 UnoCSS 原子化类名**
- 如需自定义样式，使用 SCSS + scoped
- 使用 `rpx` 单位适配不同屏幕

### 代码规范

- 使用 ESLint 进行代码检查：`pnpm lint`
- 自动修复格式：`pnpm lint:fix`
- 类型检查：`pnpm type-check`

## 📚 相关文档

- [开屏逻辑和登录逻辑](./docs/splash-login-logic.md) - 详细的开屏和登录流程说明
- [开发规范](./.cursor/rules/) - 完整的开发规范和最佳实践

## 🎯 功能说明

### 开屏逻辑

- 应用启动时显示开屏页面
- 已登录用户显示 Logo（1秒后自动关闭）
- 未登录用户显示身份选择（求职者/招聘者/游客）

### 登录拦截

- 支持白名单策略（默认需要登录）和黑名单策略（默认不需要登录）
- 自动处理登录状态检查和跳转
- Token 过期自动刷新

### HTTP 请求

- 统一的请求拦截和响应处理
- 自动添加 token 到请求头
- 自动处理 token 刷新和请求重试
- 支持三种请求方式：简单 http、alova、vue-query

## 📄 License

MIT
