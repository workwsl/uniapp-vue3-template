<script lang="ts" setup>
import { useTokenStore } from '@/store/token'

definePage({
  style: {
    navigationBarTitleText: '我的',
  },
})

const tokenStore = useTokenStore()

async function handleLogin() {
  await tokenStore.wxLogin()
}

function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        useTokenStore().logout()
        uni.showToast({
          title: '退出登录成功',
          icon: 'success',
        })
      }
    },
  })
}
</script>

<template>
  <view class="bg-white px-4 py-8">
    <view class="text-center">
      <view class="mt-10 text-2xl font-bold">
        我的
      </view>
      <view class="mt-8">
        <view v-if="tokenStore.hasLogin" class="text-lg text-gray-600">
          已登录
        </view>
        <view v-else class="text-lg text-gray-600">
          未登录
        </view>
      </view>
      <view class="mt-8">
        <button v-if="tokenStore.hasLogin" type="warn" class="w-40" @click="handleLogout">
          退出登录
        </button>
        <button v-else type="primary" class="w-40" @click="handleLogin">
          登录
        </button>
      </view>
    </view>
  </view>
</template>
