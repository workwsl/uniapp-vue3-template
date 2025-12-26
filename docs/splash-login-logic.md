# 开屏逻辑和登录逻辑梳理

## 一、开屏逻辑流程

### 1.1 应用启动阶段（App.vue）

**文件位置**: `src/App.vue`

**onLaunch 生命周期**:
```typescript
onLaunch(() => {
  // 标记应用已启动（用于区分应用启动和页面切换）
  uni.setStorageSync('app-launched', true)
  // 重置本会话的开屏已展示标记
  uni.removeStorageSync('splash-shown-session')
})
```

**关键点**:
- 设置 `app-launched` 标记，用于区分应用启动和页面切换
- 清除 `splash-shown-session` 标记，确保每次应用启动都会重新判断是否显示开屏

### 1.2 开屏显示控制（App.ku.vue）

**文件位置**: `src/App.ku.vue`

**onMounted 生命周期**:
1. 检查是否是小程序平台
2. 检查本会话是否已显示过开屏（`splash-shown-session`）
3. 检查是否是应用启动（`app-launched`）
4. 根据登录状态决定是否显示开屏：
   - **未登录**：显示开屏页面让用户选择身份
   - **已登录**：显示开屏页面（只显示Logo，1秒后自动关闭）

**onShow 生命周期**:
- 如果未登录且开屏已关闭，检查是否需要重新显示开屏
- 如果未登录且开屏关闭时，进入非 tabbar 页时兜底到首页

### 1.3 开屏页面组件（SplashScreen.vue）

**文件位置**: `src/components/SplashScreen.vue`

**核心逻辑**:

1. **登录状态检查**:
   ```typescript
   onMounted(() => {
     tokenStore.updateNowTime()
     hasLogin.value = tokenStore.hasLogin
   })
   ```

2. **显示逻辑**:
   - **已登录**：只显示 Logo 和品牌信息，1秒后自动关闭
   - **未登录**：显示身份选择卡片（求职者/招聘者/游客）+ Logo

3. **身份选择处理**:
   ```typescript
   function handleRoleSelect(role: UserRole) {
     userStore.setUserRole(role)  // 保存角色
     emit('close')  // 关闭开屏
     
     switch (role) {
       case 'jobseeker':
         // 跳转到求职者登录页
         uni.navigateTo({ url: '/pages-fg/login/login?role=jobseeker' })
         break
       case 'recruiter':
         // 跳转到招聘者登录页
         uni.navigateTo({ url: '/pages-fg/login/login?role=recruiter' })
         break
       case 'visitor':
         // 游客 = 未登录的求职者，直接进入首页
         const homePath = getHomePageByRole('visitor')
         if (isPageTabbar(homePath)) {
           uni.switchTab({ url: homePath })
         } else {
           uni.reLaunch({ url: homePath })
         }
         break
     }
   }
   ```

**关键点**:
- 游客身份 = 未登录的求职者，可以直接进入首页浏览
- 求职者和招聘者需要登录后才能使用完整功能

---

## 二、登录逻辑流程

### 2.1 路由拦截（登录拦截）

**文件位置**: `src/router/interceptor.ts`

**核心逻辑**:

1. **登录状态检查**:
   ```typescript
   const tokenStore = useTokenStore()
   if (tokenStore.hasLogin) {
     // 已登录：如果访问登录页，重定向到首页
     if (path !== LOGIN_PAGE) {
       return true  // 允许访问
     } else {
       // 已登录但还在登录页，重定向到首页或 redirect 参数指定的页面
       const url = myQuery.redirect || HOME_PAGE
       uni.switchTab({ url })  // 或 uni.navigateTo({ url })
       return false  // 阻止原路由
     }
   }
   ```

2. **未登录处理**:
   - 根据登录策略（白名单/黑名单）判断是否需要登录
   - 需要登录时，构建重定向URL：`/pages-fg/login/login?redirect=${encodeURIComponent(fullPath)}`
   - 跳转到登录页并携带 redirect 参数

3. **登录策略**:
   - **白名单策略**（`isNeedLoginMode = true`）：默认需要登录，`EXCLUDE_LOGIN_PATH_LIST` 为白名单
   - **黑名单策略**（`isNeedLoginMode = false`）：默认不需要登录，`EXCLUDE_LOGIN_PATH_LIST` 为黑名单

**配置位置**: `src/router/config.ts`
```typescript
export const LOGIN_STRATEGY = LOGIN_STRATEGY_MAP.DEFAULT_NO_NEED_LOGIN  // 黑名单策略
export const isNeedLoginMode = LOGIN_STRATEGY === LOGIN_STRATEGY_MAP.DEFAULT_NEED_LOGIN
export const EXCLUDE_LOGIN_PATH_LIST = [...]  // 白名单或黑名单
```

### 2.2 登录页面

**文件位置**: `src/pages-fg/login/login.vue`

**核心逻辑**:

1. **获取角色参数**:
   ```typescript
   onLoad((query) => {
     const role = (query?.role as any) || 'jobseeker'
     roleFromQuery = role
     userStore.setUserRole(role)  // 保存角色
   })
   ```

2. **执行登录**:
   ```typescript
   async function doLogin() {
     if (tokenStore.hasLogin) {
       redirectToHome()  // 已登录，直接跳转
       return
     }
     try {
       await tokenStore.login({
         username: '菲鸽',
         password: '123456',
       })
       redirectToHome()  // 登录成功，跳转首页
     } catch (error) {
       console.log('登录失败', error)
     }
   }
   ```

3. **登录后跳转**:
   ```typescript
   function redirectToHome() {
     const role = roleFromQuery || userStore.getUserRole.value || 'jobseeker'
     const home = getHomePageByRole(role as any)
     if (home.startsWith('/pages/')) {
       uni.switchTab({ url: home })
     } else {
       uni.reLaunch({ url: home })
     }
   }
   ```

### 2.3 Token 管理（登录状态管理）

**文件位置**: `src/store/token.ts`

**核心功能**:

1. **登录方法**:
   ```typescript
   const login = async (loginForm: ILoginForm) => {
     const res = await _login(loginForm)  // 调用登录接口
     await _postLogin(res)  // 处理登录结果
     // _postLogin 会：
     // 1. 保存 token 信息（setTokenInfo）
     // 2. 获取用户信息（userStore.fetchUserInfo）
   }
   ```

2. **Token 过期检查**:
   ```typescript
   const isTokenExpired = computed(() => {
     const now = nowTime.value
     const expireTime = uni.getStorageSync('accessTokenExpireTime')
     return now >= expireTime
   })
   
   const hasLogin = computed(() => {
     return hasLoginInfo.value && !isTokenExpired.value
   })
   ```

3. **Token 刷新**:
   ```typescript
   const refreshToken = async () => {
     // 使用 refreshToken 刷新 accessToken
     const res = await _refreshToken(tokenInfo.value.refreshToken)
     setTokenInfo(res)  // 更新 token 信息
   }
   ```

4. **退出登录**:
   ```typescript
   const logout = async () => {
     await _logout()  // 调用退出接口
     // 清除本地 token 信息
     tokenInfo.value = { ...tokenInfoState }
     userStore.clearUserInfo()  // 清除用户信息
   }
   ```

**关键点**:
- 支持单 token 和双 token 两种模式
- Token 信息持久化存储（persist: true）
- 通过 `updateNowTime()` 确保过期检查的准确性

### 2.4 HTTP 请求拦截（Token 自动刷新）

**文件位置**: `src/http/http.ts`

**核心逻辑**:

1. **Token 过期检测**:
   ```typescript
   if (code === ResultEnum.Unauthorized) {
     // Token 过期，尝试刷新
     if (!refreshing) {
       refreshing = true
       try {
         await tokenStore.refreshToken()  // 刷新 token
         // 重新请求失败的任务
         taskQueue.forEach(task => task())
       } catch (refreshErr) {
         // 刷新失败，清除用户信息并跳转登录页
         await tokenStore.logout()
         toLoginPage()
       }
     }
   }
   ```

2. **请求队列机制**:
   - Token 过期时，将失败的请求加入队列
   - Token 刷新成功后，重新执行队列中的请求
   - 避免并发请求导致的多次刷新

### 2.5 用户信息管理

**文件位置**: `src/store/user.ts`

**核心功能**:

1. **用户角色管理**:
   ```typescript
   const getUserRole = computed((): UserRole => {
     // 如果用户未登录（userId <= 0），返回游客身份
     if (userInfo.value.userId <= 0) {
       return 'visitor'
     }
     // 如果用户已登录，返回用户角色
     return userInfo.value.role || (uni.getStorageSync('user-role') as UserRole) || 'jobseeker'
   })
   ```

2. **角色类型**:
   - `jobseeker`: 求职者
   - `recruiter`: 招聘者
   - `visitor`: 游客（未登录的求职者）

---

## 三、完整流程图

### 3.1 应用启动流程

```
App.vue onLaunch
  ↓
设置 app-launched = true
清除 splash-shown-session
  ↓
App.ku.vue onMounted
  ↓
检查登录状态
  ↓
┌─────────────────┬─────────────────┐
│   未登录        │   已登录         │
└─────────────────┴─────────────────┘
  ↓                    ↓
显示开屏页面        显示开屏页面
（身份选择）        （仅Logo）
  ↓                    ↓
用户选择身份        1秒后自动关闭
  ↓                    ↓
┌──────┬──────┬──────┐
│求职者│招聘者│游客  │
└──────┴──────┴──────┘
  ↓      ↓      ↓
登录页  登录页  首页
```

### 3.2 登录流程

```
用户访问需要登录的页面
  ↓
路由拦截器检查登录状态
  ↓
┌─────────────────┬─────────────────┐
│   已登录        │   未登录         │
└─────────────────┴─────────────────┘
  ↓                    ↓
允许访问            检查登录策略
  ↓                    ↓
                  ┌──────┬──────┐
                  │需要登录│不需要│
                  └──────┴──────┘
                    ↓      ↓
                  跳转登录页  允许访问
                    ↓
                  用户输入账号密码
                    ↓
                  tokenStore.login()
                    ↓
                  ┌──────┬──────┐
                  │成功  │失败  │
                  └──────┴──────┘
                    ↓      ↓
                  保存token  显示错误
                  获取用户信息
                    ↓
                  跳转到首页
```

### 3.3 Token 刷新流程

```
HTTP 请求
  ↓
响应 401 Unauthorized
  ↓
检查是否正在刷新
  ↓
┌─────────────────┬─────────────────┐
│   正在刷新      │   未在刷新       │
└─────────────────┴─────────────────┘
  ↓                    ↓
加入请求队列        开始刷新
  ↓                    ↓
                  refreshToken()
                    ↓
                  ┌──────┬──────┐
                  │成功  │失败  │
                  └──────┴──────┘
                    ↓      ↓
                  更新token  清除登录状态
                  执行队列请求  跳转登录页
```

---

## 四、关键配置和常量

### 4.1 登录策略配置

**文件**: `src/router/config.ts`

```typescript
// 登录策略：0=黑名单策略（默认不需要登录），1=白名单策略（默认需要登录）
export const LOGIN_STRATEGY = LOGIN_STRATEGY_MAP.DEFAULT_NO_NEED_LOGIN

// 登录页路径
export const LOGIN_PAGE = '/pages-fg/login/login'

// 排除登录检查的路径列表（根据策略不同，含义不同）
export const EXCLUDE_LOGIN_PATH_LIST = [...]
```

### 4.2 开屏相关存储键

- `app-launched`: 标记应用是否已启动
- `splash-shown-session`: 标记本会话是否已显示过开屏
- `user-role`: 用户角色（jobseeker/recruiter/visitor）
- `accessTokenExpireTime`: AccessToken 过期时间
- `refreshTokenExpireTime`: RefreshToken 过期时间

---

## 五、注意事项

1. **开屏显示时机**:
   - 只在应用启动时显示（通过 `app-launched` 标记判断）
   - 本会话只显示一次（通过 `splash-shown-session` 标记控制）

2. **登录状态判断**:
   - 使用 `tokenStore.updateNowTime().hasLogin` 确保状态准确
   - `hasLogin` 会检查 token 是否存在且未过期

3. **角色管理**:
   - 游客 = 未登录的求职者
   - 角色信息存储在 `userStore` 和本地存储中
   - 登录时会从服务器获取用户信息（包含角色）

4. **Token 刷新**:
   - 仅在双 token 模式下支持自动刷新
   - 刷新失败会自动清除登录状态并跳转登录页

5. **路由拦截**:
   - 小程序平台如果 `LOGIN_PAGE_ENABLE_IN_MP = false`，则不走路由拦截逻辑
   - 系统内部页面（如 `__uniappchooselocation`）直接放行

---

## 六、相关文件清单

### 开屏相关
- `src/App.vue` - 应用启动逻辑
- `src/App.ku.vue` - 开屏显示控制
- `src/components/SplashScreen.vue` - 开屏页面组件

### 登录相关
- `src/pages-fg/login/login.vue` - 登录页面
- `src/store/token.ts` - Token 管理
- `src/store/user.ts` - 用户信息管理
- `src/router/interceptor.ts` - 路由拦截（登录拦截）
- `src/router/config.ts` - 路由配置（登录策略）
- `src/http/http.ts` - HTTP 请求拦截（Token 刷新）
- `src/utils/toLoginPage.ts` - 跳转登录页工具函数
