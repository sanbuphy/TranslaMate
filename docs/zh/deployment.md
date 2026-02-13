# 部署指南

本指南介绍如何在服务器和云平台上部署 TranslaMate CLI。

## 目录

- [概述](#概述)
- [系统要求](#系统要求)
- [安装](#安装)
- [Docker 部署](#docker-部署)
- [云平台](#云平台)
- [服务器配置](#服务器配置)
- [监控](#监控)
- [安全性](#安全性)

---

## 概述

TranslaMate CLI 可以部署在服务器上用于：
- 自动化翻译工作流
- API 服务后端
- 批量处理任务
- CI/CD 集成

---

## 系统要求

### 最低要求

- **操作系统**：Linux (Ubuntu 20.04+)、macOS 12+、Windows Server 2019+
- **Node.js**：18.x 或更高版本
- **内存**：最低 512 MB，推荐 1 GB
- **磁盘**：应用程序 100 MB，额外空间用于文件存储
- **网络**：出站 HTTPS 访问 API 提供商

### 推荐配置

- **CPU**：2+ 核心用于并发处理
- **内存**：2 GB 用于批量处理大文件
- **磁盘**：SSD 以获得更好的 I/O 性能

---

## 安装

### Ubuntu/Debian

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version  # v18.x.x
npm --version   # 9.x.x

# 创建应用目录
sudo mkdir -p /opt/translamate
sudo chown $USER:$USER /opt/translamate
cd /opt/translamate

# 克隆仓库
git clone https://github.com/username/translamate.git .

# 安装依赖
npm ci --only=production

# 构建 CLI
npm run build:cli

# 创建配置目录
mkdir -p /etc/translamate

# 设置环境变量
sudo tee /etc/translamate/env << EOF
TRANSLAMATE_API_KEY=your-api-key-here
TRANSLAMATE_BASE_URL=https://api.deepseek.com
TRANSLAMATE_MODEL=deepseek-chat
EOF

sudo chmod 600 /etc/translamate/env
```

### CentOS/RHEL

```bash
# 安装 Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 其余步骤与 Ubuntu 相同
```

### macOS

```bash
# 如果未安装 Homebrew 则安装
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Node.js
brew install node@18

# 其余步骤与 Ubuntu 相同
```

---

## Docker 部署

### Dockerfile

```dockerfile
# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:cli

# 生产阶段
FROM node:18-alpine

WORKDIR /app

# 仅复制必要文件
COPY --from=builder /app/dist/cli ./dist/cli
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# 创建非 root 用户
RUN addgroup -g 1001 -S translamate && \
    adduser -S translamate -u 1001

# 设置环境
ENV NODE_ENV=production
ENV TRANSLAMATE_CONFIG_PATH=/app/config.json

# 创建配置目录
RUN mkdir -p /app/data && chown -R translamate:translamate /app

USER translamate

ENTRYPOINT ["node", "dist/cli/index.js"]
CMD ["--help"]
```

### 构建和运行

```bash
# 构建镜像
docker build -t translamate:latest .

# 使用环境变量运行
docker run -e TRANSLAMATE_API_KEY=sk-xxx translamate translate "Hello" --to zh-CN

# 使用配置文件运行
docker run -v $(pwd)/config.json:/app/config.json translamate batch /data --to zh-CN

# 交互式运行
docker run -it --rm translamate /bin/sh
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  translamate:
    build: .
    image: translamate:latest
    environment:
      - TRANSLAMATE_API_KEY=${TRANSLAMATE_API_KEY}
      - TRANSLAMATE_BASE_URL=${TRANSLAMATE_BASE_URL:-https://api.deepseek.com}
      - TRANSLAMATE_MODEL=${TRANSLAMATE_MODEL:-deepseek-chat}
    volumes:
      - ./data:/app/data
      - ./output:/app/output
    command: batch /app/data --to zh-CN --output /app/output
```

```bash
# 使用 docker-compose 运行
docker-compose up
```

---

## 云平台

### AWS EC2

```bash
# EC2 实例的用户数据脚本
#!/bin/bash
apt-get update
apt-get install -y nodejs npm git

mkdir -p /opt/translamate
cd /opt/translamate
git clone https://github.com/username/translamate.git .
npm ci --only=production
npm run build:cli

# 创建 systemd 服务
cat > /etc/systemd/system/translamate.service << 'EOF'
[Unit]
Description=TranslaMate Translation Service
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/translamate
Environment=TRANSLAMATE_API_KEY=your-key
ExecStart=/usr/bin/node dist/cli/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

systemctl enable translamate
```

### Google Cloud Run

```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/translamate:$SHORT_SHA', '.']
  
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/translamate:$SHORT_SHA']
  
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'translamate'
      - '--image'
      - 'gcr.io/$PROJECT_ID/translamate:$SHORT_SHA'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
```

### Azure Container Instances

```bash
# 创建资源组
az group create --name translamate-rg --location eastus

# 创建容器
az container create \
  --resource-group translamate-rg \
  --name translamate \
  --image translamate:latest \
  --environment-variables TRANSLAMATE_API_KEY=your-key \
  --cpu 1 \
  --memory 1
```

### 阿里云 ECS

```bash
# 类似于 AWS EC2
# 使用阿里云 Linux 或 CentOS

yum install -y nodejs git
# 遵循与 CentOS 相同的安装步骤
```

---

## 服务器配置

### Systemd 服务

```ini
# /etc/systemd/system/translamate.service
[Unit]
Description=TranslaMate Translation Service
Documentation=https://github.com/username/translamate
After=network.target

[Service]
Type=oneshot
User=translamate
Group=translamate
WorkingDirectory=/opt/translamate
EnvironmentFile=/etc/translamate/env
ExecStart=/usr/bin/node dist/cli/index.js batch /data/input --to zh-CN --output /data/output
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

```bash
# 启用并启动服务
sudo systemctl daemon-reload
sudo systemctl enable translamate
sudo systemctl start translamate

# 检查状态
sudo systemctl status translamate
sudo journalctl -u translamate -f
```

### 定时任务

```bash
# 编辑 crontab
crontab -e

# 每小时运行翻译
0 * * * * cd /opt/translamate && /usr/bin/node dist/cli/index.js batch /data/inbox --to zh-CN --output /data/outbox >> /var/log/translamate.log 2>&1

# 每天凌晨 2 点运行
0 2 * * * cd /opt/translamate && /usr/bin/node dist/cli/index.js batch /data/daily --to ja --output /data/daily-ja
```

### 日志轮转

```bash
# /etc/logrotate.d/translamate
/var/log/translamate/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 translamate translamate
}
```

---

## 监控

### 健康检查脚本

```bash
#!/bin/bash
# /opt/translamate/health-check.sh

API_KEY=$(grep TRANSLAMATE_API_KEY /etc/translamate/env | cut -d= -f2)

if /usr/bin/node /opt/translamate/dist/cli/index.js translate "test" --to zh-CN > /dev/null 2>&1; then
    echo "OK: TranslaMate is working"
    exit 0
else
    echo "ERROR: TranslaMate health check failed"
    exit 1
fi
```

### Prometheus 指标（示例）

```javascript
// metrics.js - 简单指标端点
const http = require('http');
const { execSync } = require('child_process');

const server = http.createServer((req, res) => {
  if (req.url === '/metrics') {
    // 从日志获取翻译计数
    const count = execSync('grep -c "Translation completed" /var/log/translamate.log 2>/dev/null || echo 0').toString().trim();
    
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`# HELP translamate_translations_total Total translations\n# TYPE translamate_translations_total counter\ntranslamate_translations_total ${count}\n`);
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(9090);
```

### 监控检查清单

- [ ] 磁盘空间使用情况
- [ ] API 配额/使用量
- [ ] 错误率
- [ ] 处理时间
- [ ] 队列深度（如果使用消息队列）

---

## 安全性

### API 密钥管理

```bash
# 使用环境变量（推荐）
export TRANSLAMATE_API_KEY=$(cat /etc/secrets/api-key)

# 或使用密钥管理器
# AWS Secrets Manager
export TRANSLAMATE_API_KEY=$(aws secretsmanager get-secret-value --secret-id translamate/api-key --query SecretString --output text)

# Azure Key Vault
export TRANSLAMATE_API_KEY=$(az keyvault secret show --name api-key --vault-name translamate-vault --query value -o tsv)
```

### 文件权限

```bash
# 设置正确的权限
sudo chown -R translamate:translamate /opt/translamate
sudo chmod 750 /opt/translamate
sudo chmod 600 /etc/translamate/env

# 保护数据目录
sudo mkdir -p /data/translamate
sudo chown translamate:translamate /data/translamate
sudo chmod 700 /data/translamate
```

### 网络安全

```bash
# 防火墙规则（ufw）
sudo ufw default deny incoming
sudo ufw allow ssh
sudo ufw allow from 10.0.0.0/8 to any port 443  # 仅内部网络
sudo ufw enable

# 或使用 iptables
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -s 10.0.0.0/8 -j ACCEPT
sudo iptables -A INPUT -j DROP
```

### 安全检查清单

- [ ] API 密钥安全存储（不在代码中）
- [ ] 文件权限设置正确
- [ ] 定期安全更新
- [ ] 网络访问受限
- [ ] 监控日志异常
- [ ] 备份策略到位

---

## 故障排除

### 常见问题

#### 权限被拒绝

```bash
# 修复权限
sudo chown -R $(whoami):$(whoami) /opt/translamate
chmod +x /opt/translamate/dist/cli/index.js
```

#### 内存不足

```bash
# 增加 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=4096"
node dist/cli/index.js batch large-directory --to zh-CN
```

#### API 超时

```bash
# 检查网络连接
curl -I https://api.deepseek.com

# 检查 DNS 解析
nslookup api.deepseek.com

# 查看防火墙规则
sudo iptables -L -n | grep 443
```

### 调试模式

```bash
# 启用调试日志
export DEBUG=translamate:*
node dist/cli/index.js translate "test" --to zh-CN
```

---

## 性能调优

### 并发处理

```bash
# 并发处理多个文件
find /data/input -name "*.md" -print0 | xargs -0 -P 4 -I {} \
  node dist/cli/index.js translate {} --to zh-CN --output /data/output/{}
```

### 缓存

```bash
# 使用 Redis 缓存翻译结果
# 安装：npm install redis

# 缓存脚本示例
#!/bin/bash
CACHE_KEY=$(echo "$1$2" | md5sum | cut -d' ' -f1)
CACHED=$(redis-cli GET "$CACHE_KEY")

if [ -n "$CACHED" ]; then
    echo "$CACHED"
else
    RESULT=$(node dist/cli/index.js translate "$1" --to "$2")
    redis-cli SETEX "$CACHE_KEY" 3600 "$RESULT"
    echo "$RESULT"
fi
```

---

## 备份和恢复

### 备份脚本

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backup/translamate/$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

# 备份配置
cp /etc/translamate/env "$BACKUP_DIR/"
cp -r /opt/translamate/config "$BACKUP_DIR/"

# 备份数据
tar czf "$BACKUP_DIR/data.tar.gz" /data/translamate

# 上传到 S3（可选）
aws s3 sync "$BACKUP_DIR" s3://your-bucket/translamate-backups/

# 清理旧备份
find /backup/translamate -type d -mtime +30 -exec rm -rf {} +
```

### 恢复

```bash
# 从备份恢复
sudo systemctl stop translamate
sudo cp /backup/translamate/20240101/env /etc/translamate/
sudo tar xzf /backup/translamate/20240101/data.tar.gz -C /
sudo systemctl start translamate
```