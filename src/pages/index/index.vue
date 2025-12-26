<script lang="ts" setup>
defineOptions({
  name: 'Home',
})
definePage({
  type: 'home',
  style: {
    navigationBarTitleText: '首页',
  },
})
</script>

<template>
  <view class="bg-white px-4 py-8">
    <view class="text-center">
      <view class="mt-10 text-3xl font-bold">
        欢迎使用
      </view>
      <view class="mt-4 text-xl text-gray-600">
        这是一个基于 unibest 的微信小程序项目
      </view>
    </view>
  </view>
</template>
