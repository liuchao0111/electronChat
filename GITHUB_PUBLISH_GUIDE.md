# GitHub 发布配置指南

## 概述

本项目已配置 Electron Forge 的 GitHub Publisher，可以自动将构建的应用发布到 GitHub Releases。

## 配置步骤

### 1. 创建 GitHub Personal Access Token

1. 访问 GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 点击 "Generate new token (classic)"
3. 设置 Token 名称（如：`vchat-release-token`）
4. 选择权限：
   - ✅ `repo` (完整的仓库访问权限)
5. 点击 "Generate token"
6. **重要**：复制生成的 token（只会显示一次）

### 2. 配置环境变量

在你的系统中设置环境变量 `GITHUB_TOKEN`：

**macOS/Linux (临时):**
```bash
export GITHUB_TOKEN=your_github_token_here
```

**macOS/Linux (永久):**
在 `~/.zshrc` 或 `~/.bash_profile` 中添加：
```bash
export GITHUB_TOKEN=your_github_token_here
```
然后运行 `source ~/.zshrc`

**Windows (临时):**
```cmd
set GITHUB_TOKEN=your_github_token_here
```

**Windows (永久):**
在系统环境变量中添加 `GITHUB_TOKEN`

### 3. 更新 forge.config.ts

在 `forge.config.ts` 中的 `publishers` 配置中，更新以下信息：

```typescript
publishers: [
  new PublisherGithub({
    repository: {
      owner: 'your-github-username', // 替换为你的 GitHub 用户名
      name: 'vchat', // 替换为你的仓库名
    },
    prerelease: false, // 是否为预发布版本
    draft: true, // 是否创建为草稿
  }),
],
```

### 4. 确保 package.json 配置正确

确保 `package.json` 中有正确的版本号和仓库信息：

```json
{
  "name": "vchat",
  "version": "1.0.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/vchat.git"
  }
}
```

## 发布流程

### 手动发布

1. **更新版本号**
   ```bash
   npm version patch  # 1.0.0 -> 1.0.1
   npm version minor  # 1.0.0 -> 1.1.0
   npm version major  # 1.0.0 -> 2.0.0
   ```

2. **构建并发布**
   ```bash
   npm run publish
   ```

3. **检查 GitHub Releases**
   - 访问你的 GitHub 仓库的 Releases 页面
   - 如果 `draft: true`，你会看到一个草稿版本
   - 检查上传的文件（.zip, .dmg 等）
   - 编辑 Release 说明
   - 点击 "Publish release" 正式发布

### 发布内容

根据当前配置，发布时会包含：

- **macOS**: 
  - `VChat-darwin-x64-1.0.0.zip` (ZIP 压缩包)
  - `VChat-1.0.0.dmg` (DMG 磁盘映像)
  
- **Linux**: 
  - `VChat-linux-x64-1.0.0.zip` (ZIP 压缩包)

## 配置选项说明

### PublisherGithub 选项

```typescript
{
  repository: {
    owner: string,  // GitHub 用户名或组织名
    name: string,   // 仓库名
  },
  prerelease: boolean,  // 是否标记为预发布版本
  draft: boolean,       // 是否创建为草稿（推荐设为 true）
  octokitOptions: {     // 可选：GitHub API 配置
    auth: string,       // 可以直接传入 token（不推荐）
  }
}
```

### 推荐配置

**开发阶段：**
```typescript
draft: true,        // 创建草稿，可以检查后再发布
prerelease: false,  // 正式版本
```

**测试版本：**
```typescript
draft: false,       // 直接发布
prerelease: true,   // 标记为预发布
```

**正式发布：**
```typescript
draft: false,       // 直接发布
prerelease: false,  // 正式版本
```

## 自动化发布（GitHub Actions）

可以创建 GitHub Actions 工作流来自动化发布流程：

创建 `.github/workflows/release.yml`：

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ${{ matrix.os }}
    
    strategy:
      matrix:
        os: [macos-latest, ubuntu-latest]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Publish to GitHub
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npm run publish
```

使用方法：
```bash
git tag v1.0.0
git push origin v1.0.0
```

## 常见问题

### 1. 发布失败：Authentication failed

**原因**：未设置 `GITHUB_TOKEN` 或 token 权限不足

**解决**：
- 确保已设置环境变量 `GITHUB_TOKEN`
- 确保 token 有 `repo` 权限
- 检查 token 是否过期

### 2. 发布失败：Repository not found

**原因**：仓库配置错误或 token 无权限访问

**解决**：
- 检查 `forge.config.ts` 中的 `owner` 和 `name` 是否正确
- 确保 token 有权限访问该仓库

### 3. 文件上传失败

**原因**：网络问题或文件过大

**解决**：
- 检查网络连接
- 如果文件过大，考虑使用 GitHub 的 Large File Storage (LFS)

### 4. 版本已存在

**原因**：GitHub Release 中已存在相同版本

**解决**：
- 更新 `package.json` 中的版本号
- 或删除 GitHub 上的旧 Release

## 最佳实践

1. **使用草稿模式**：首次发布时设置 `draft: true`，检查无误后再正式发布

2. **版本管理**：使用语义化版本（Semantic Versioning）
   - MAJOR：不兼容的 API 修改
   - MINOR：向下兼容的功能性新增
   - PATCH：向下兼容的问题修正

3. **Release Notes**：在 GitHub Release 中添加详细的更新说明
   - 新功能
   - Bug 修复
   - 破坏性变更
   - 已知问题

4. **测试**：发布前在本地充分测试
   ```bash
   npm run make  # 先本地构建测试
   ```

5. **备份**：重要版本发布前做好代码备份

## 相关命令

```bash
# 本地构建（不发布）
npm run make

# 本地打包（不发布）
npm run package

# 构建并发布到 GitHub
npm run publish

# 更新版本号
npm version patch/minor/major
```

## 参考资料

- [Electron Forge 文档](https://www.electronforge.io/)
- [GitHub Publisher 文档](https://www.electronforge.io/config/publishers/github)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
