<script setup lang="ts">
import { onHide, onLaunch, onShow } from '@dcloudio/uni-app'
import { isMpAlipay, isMpWeixin } from '@uni-helper/uni-env'
import { navigateToInterceptor } from '@/router/interceptor'
import { isPageTabbar } from '@/tabbar/store'
import { getHomePage } from '@/utils'

onLaunch((options) => {
  console.log('App.vue onLaunch', options)
})

onShow((options) => {
  console.log('App.vue onShow', options)

  // 小程序平台：退出或刷新时，默认回到首页
  const isMiniProgram = isMpWeixin || isMpAlipay

  if (isMiniProgram) {
    // 小程序环境下，如果没有指定路径（退出或刷新），跳转到首页
    if (!options?.path) {
      const homePath = getHomePage()

      console.log('App.vue onShow - 无路径，跳转到首页:', homePath)

      // 检查当前页面栈
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const currentPath = currentPage ? `/${currentPage.route}` : ''

      // 如果当前不在首页，跳转到首页
      if (currentPath !== homePath) {
        if (isPageTabbar(homePath)) {
          // switchTab 使用带前导斜杠的路径（与 404/index.vue 保持一致）
          uni.switchTab({ url: homePath })
        }
        else {
          uni.reLaunch({ url: homePath })
        }
        return
      }
    }
    // 如果有指定路径（如分享链接），使用拦截器处理
    else {
      navigateToInterceptor.invoke({ url: `/${options.path}`, query: options.query })
      return
    }
  }

  // H5等其他平台：处理直接进入页面路由的情况
  // https://github.com/unibest-tech/unibest/issues/192
  if (options?.path) {
    navigateToInterceptor.invoke({ url: `/${options.path}`, query: options.query })
  }
  else {
    navigateToInterceptor.invoke({ url: '/' })
  }
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">

</style>
