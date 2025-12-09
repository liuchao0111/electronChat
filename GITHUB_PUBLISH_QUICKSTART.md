# GitHub 发布快速开始

## 快速配置（3 步）

### 1️⃣ 创建 GitHub Token

访问：https://github.com/settings/tokens/new

- 名称：`vchat-release-token`
- 权限：勾选 `repo`
- 复制生成的 token

### 2️⃣ 设置环境变量

```bash
# macOS/Linux
export GITHUB_TOKEN=你的token

# 永久设置：添加到 ~/.zshrc
echo 'export GITHUB_TOKEN=你的token' >> ~/.zshrc
source ~/.zshrc
```

### 3️⃣ 更新配置

编辑 `forge.config.ts` 和 `package.json`，替换：
- `your-github-username` → 你的 GitHub 用户名
- `vchat` → 你的仓库名（如果不同）

## 发布命令

```bash
# 更新版本号（自动创建 git tag）
npm version patch  # 1.0.0 → 1.0.1

# 构建并发布到 GitHub
npm run publish
```

## 自动化发布（可选）

使用 GitHub Actions 自动发布：

```bash
# 创建并推送 tag
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions 会自动构建并发布
```

## 注意事项

- ✅ 首次发布建议设置 `draft: true`（已配置）
- ✅ 发布前先本地测试：`npm run make`
- ✅ 检查 GitHub Releases 页面确认上传成功
- ✅ 编辑 Release 说明后再正式发布

## 详细文档

查看 `GITHUB_PUBLISH_GUIDE.md` 了解完整配置和故障排除。
