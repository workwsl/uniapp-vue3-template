import type { CustomTabBarItem, CustomTabBarItemBadge } from './types'
import { reactive } from 'vue'

import { customTabbarEnable, customTabbarList, selectedTabbarStrategy, TABBAR_STRATEGY_MAP } from './config'

// TODO 1/2: 中间的鼓包tabbarItem的开关
const BULGE_ENABLE = false

/** tabbarList 里面的 path 从 pages.config.ts 得到 */
const tabbarList = reactive<CustomTabBarItem[]>([])

/**
 * 获取 tabbar 配置
 */
function getTabbarListByRole(): CustomTabBarItem[] {
  return customTabbarList
}

/**
 * 更新 tabbar 列表
 */
function updateTabbarList() {
  const baseList = getTabbarListByRole()
  const formattedList = baseList.map(item => ({
    ...item,
    pagePath: (item.pagePath.startsWith('/') ? item.pagePath : `/${item.pagePath}`) as any,
  }))

  // 清空并重新填充
  tabbarList.length = 0
  tabbarList.push(...formattedList)

  // 处理鼓包逻辑
  if (customTabbarEnable && BULGE_ENABLE) {
    if (tabbarList.length % 2) {
      console.error('有鼓包时 tabbar 数量必须是偶数，否则样式很奇怪！！')
    }
    else {
      tabbarList.splice(tabbarList.length / 2, 0, {
        isBulge: true,
      } as CustomTabBarItem)
    }
  }
}

// 延迟初始化：只在真正需要时才初始化 tabbar 列表
// 不在模块顶层初始化，避免 Pinia 未初始化时出错
let isInitialized = false
function initTabbarList() {
  if (!isInitialized) {
    updateTabbarList()
    isInitialized = true
  }
}

// 鼓包逻辑已移至 updateTabbarList 函数中

export function isPageTabbar(path: string) {
  if (selectedTabbarStrategy === TABBAR_STRATEGY_MAP.NO_TABBAR) {
    return false
  }
  // 确保 tabbar 列表已初始化（可能在路由拦截器中被调用，此时 Pinia 可能已初始化）
  initTabbarList()
  const _path = path.split('?')[0]
  return tabbarList.some(item => item.pagePath === _path)
}

/**
 * 自定义 tabbar 的状态管理，原生 tabbar 无需关注本文件
 * tabbar 状态，增加 storageSync 保证刷新浏览器时在正确的 tabbar 页面
 * 使用reactive简单状态，而不是 pinia 全局状态
 */
const tabbarStore = reactive({
  curIdx: uni.getStorageSync('app-tabbar-index') || 0,
  prevIdx: uni.getStorageSync('app-tabbar-index') || 0,
  setCurIdx(idx: number) {
    this.curIdx = idx
    uni.setStorageSync('app-tabbar-index', idx)
  },
  setTabbarItemBadge(idx: number, badge: CustomTabBarItemBadge) {
    if (tabbarList[idx]) {
      tabbarList[idx].badge = badge
    }
  },
  setAutoCurIdx(path: string) {
    // '/' 当做首页
    if (path === '/') {
      this.setCurIdx(0)
      return
    }
    const index = tabbarList.findIndex(item => item.pagePath === path)
    // console.log('tabbarList:', tabbarList)
    if (index === -1) {
      const pagesPathList = getCurrentPages().map(item => item.route.startsWith('/') ? item.route : `/${item.route}`)
      // console.log(pagesPathList)
      const flag = tabbarList.some(item => pagesPathList.includes(item.pagePath))
      if (!flag) {
        this.setCurIdx(0)
        return
      }
    }
    else {
      this.setCurIdx(index)
    }
  },
  restorePrevIdx() {
    if (this.prevIdx === this.curIdx)
      return
    this.setCurIdx(this.prevIdx)
    this.prevIdx = uni.getStorageSync('app-tabbar-index') || 0
  },
})

export { initTabbarList, tabbarList, tabbarStore, updateTabbarList }
