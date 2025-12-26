<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { nextTick, ref } from 'vue'
import FgTabbar from '@/tabbar/index.vue'
import { initTabbarList, isPageTabbar, updateTabbarList } from './tabbar/store'
import { currRoute } from './utils'

// 当前页面是否是 tabbar 页面
const isCurrentPageTabbar = ref(true)

onShow(() => {
  // 初始化 tabbar 列表（如果未初始化）
  initTabbarList()
  // 更新 tabbar 列表
  updateTabbarList()

  // 使用 nextTick 确保在 DOM 更新后再判断路径
  nextTick(() => {
    const route = currRoute()
    const { path } = route

    // 判断当前页面是否是 tabbar 页面
    // 特殊处理：路径为 '/' 或空时也视为首页，显示 tabbar
    if (!path || path === '/') {
      isCurrentPageTabbar.value = true
    }
    else {
      const isTabbar = isPageTabbar(path)
      isCurrentPageTabbar.value = isTabbar
    }
  })
})
</script>

<template>
  <view>
    <!-- 页面内容 -->
    <KuRootView />
    <!-- TabBar -->
    <FgTabbar v-if="isCurrentPageTabbar" />
  </view>
</template>

<style scoped>
/* 样式已移除，不再需要 */
</style>
