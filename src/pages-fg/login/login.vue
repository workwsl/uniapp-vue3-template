<script lang="ts" setup>
import { useTokenStore } from '@/store/token'
import { getHomePage } from '@/utils'

definePage({
  style: {
    navigationBarTitleText: '登录',
  },
})

const tokenStore = useTokenStore()

async function doLogin() {
  if (tokenStore.hasLogin) {
    redirectToHome()
    return
  }
  try {
    // 调用登录接口
    await tokenStore.login({
      username: '菲鸽',
      password: '123456',
    })
    redirectToHome()
  }
  catch (error) {
    console.log('登录失败', error)
  }
}

function redirectToHome() {
  const home = getHomePage()
  if (home.startsWith('/pages/')) {
    uni.switchTab({ url: home })
  }
  else {
    uni.reLaunch({ url: home })
  }
}
</script>

<template>
  <view class="login">
    <!-- 本页面是非MP的登录页，主要用于 h5 和 APP -->
    <view class="text-center">
      登录页
    </view>
    <button class="mt-4 w-40 text-center" @click="doLogin">
      点击模拟登录
    </button>
  </view>
</template>

<style lang="scss" scoped>
//
</style>
