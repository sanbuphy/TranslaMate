# Deployment Guide

Guide for deploying TranslaMate CLI on servers and cloud platforms.

## Table of Contents

- [Overview](#overview)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Docker Deployment](#docker-deployment)
- [Cloud Platforms](#cloud-platforms)
- [Server Configuration](#server-configuration)
- [Monitoring](#monitoring)
- [Security](#security)

---

## Overview

TranslaMate CLI can be deployed on servers for:
- Automated translation workflows
- API service backend
- Batch processing jobs
- CI/CD integration

---

## System Requirements

### Minimum Requirements

- **OS**: Linux (Ubuntu 20.04+), macOS 12+, Windows Server 2019+
- **Node.js**: 18.x or higher
- **RAM**: 512 MB minimum, 1 GB recommended
- **Disk**: 100 MB for application, additional space for files
- **Network**: Outbound HTTPS access to API provider

### Recommended Specifications

- **CPU**: 2+ cores for concurrent processing
- **RAM**: 2 GB for batch processing large files
- **Disk**: SSD for better I/O performance

---

## Installation

### Ubuntu/Debian

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # v18.x.x
npm --version   # 9.x.x

# Create app directory
sudo mkdir -p /opt/translamate
sudo chown $USER:$USER /opt/translamate
cd /opt/translamate

# Clone repository
git clone https://github.com/username/translamate.git .

# Install dependencies
npm ci --only=production

# Build CLI
npm run build:cli

# Create config directory
mkdir -p /etc/translamate

# Set up environment variables
sudo tee /etc/translamate/env << EOF
TRANSLAMATE_API_KEY=your-api-key-here
TRANSLAMATE_BASE_URL=https://api.deepseek.com
TRANSLAMATE_MODEL=deepseek-chat
EOF

sudo chmod 600 /etc/translamate/env
```

### CentOS/RHEL

```bash
# Install Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Remaining steps same as Ubuntu
```

### macOS

```bash
# Install Homebrew if not present
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node@18

# Remaining steps same as Ubuntu
```

---

## Docker Deployment

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:cli

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy only necessary files
COPY --from=builder /app/dist/cli ./dist/cli
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Create non-root user
RUN addgroup -g 1001 -S translamate && \
    adduser -S translamate -u 1001

# Set environment
ENV NODE_ENV=production
ENV TRANSLAMATE_CONFIG_PATH=/app/config.json

# Create config directory
RUN mkdir -p /app/data && chown -R translamate:translamate /app

USER translamate

ENTRYPOINT ["node", "dist/cli/index.js"]
CMD ["--help"]
```

### Build and Run

```bash
# Build image
docker build -t translamate:latest .

# Run with environment variables
docker run -e TRANSLAMATE_API_KEY=sk-xxx translamate translate "Hello" --to zh-CN

# Run with config file
docker run -v $(pwd)/config.json:/app/config.json translamate batch /data --to zh-CN

# Run interactively
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
# Run with docker-compose
docker-compose up
```

---

## Cloud Platforms

### AWS EC2

```bash
# User data script for EC2 instance
#!/bin/bash
apt-get update
apt-get install -y nodejs npm git

mkdir -p /opt/translamate
cd /opt/translamate
git clone https://github.com/username/translamate.git .
npm ci --only=production
npm run build:cli

# Create systemd service
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
# Create resource group
az group create --name translamate-rg --location eastus

# Create container
az container create \
  --resource-group translamate-rg \
  --name translamate \
  --image translamate:latest \
  --environment-variables TRANSLAMATE_API_KEY=your-key \
  --cpu 1 \
  --memory 1
```

### Alibaba Cloud ECS

```bash
# Similar to AWS EC2
# Use Alibaba Cloud Linux or CentOS

yum install -y nodejs git
# Follow same installation steps as CentOS
```

---

## Server Configuration

### Systemd Service

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
# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable translamate
sudo systemctl start translamate

# Check status
sudo systemctl status translamate
sudo journalctl -u translamate -f
```

### Cron Job

```bash
# Edit crontab
crontab -e

# Run translation every hour
0 * * * * cd /opt/translamate && /usr/bin/node dist/cli/index.js batch /data/inbox --to zh-CN --output /data/outbox >> /var/log/translamate.log 2>&1

# Run daily at 2 AM
0 2 * * * cd /opt/translamate && /usr/bin/node dist/cli/index.js batch /data/daily --to ja --output /data/daily-ja
```

### Log Rotation

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

## Monitoring

### Health Check Script

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

### Prometheus Metrics (Example)

```javascript
// metrics.js - Simple metrics endpoint
const http = require('http');
const { execSync } = require('child_process');

const server = http.createServer((req, res) => {
  if (req.url === '/metrics') {
    // Get translation count from logs
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

### Monitoring Checklist

- [ ] Disk space usage
- [ ] API quota/usage
- [ ] Error rates
- [ ] Processing time
- [ ] Queue depth (if using message queue)

---

## Security

### API Key Management

```bash
# Use environment variables (recommended)
export TRANSLAMATE_API_KEY=$(cat /etc/secrets/api-key)

# Or use a secrets manager
# AWS Secrets Manager
export TRANSLAMATE_API_KEY=$(aws secretsmanager get-secret-value --secret-id translamate/api-key --query SecretString --output text)

# Azure Key Vault
export TRANSLAMATE_API_KEY=$(az keyvault secret show --name api-key --vault-name translamate-vault --query value -o tsv)
```

### File Permissions

```bash
# Set correct permissions
sudo chown -R translamate:translamate /opt/translamate
sudo chmod 750 /opt/translamate
sudo chmod 600 /etc/translamate/env

# Secure data directories
sudo mkdir -p /data/translamate
sudo chown translamate:translamate /data/translamate
sudo chmod 700 /data/translamate
```

### Network Security

```bash
# Firewall rules (ufw)
sudo ufw default deny incoming
sudo ufw allow ssh
sudo ufw allow from 10.0.0.0/8 to any port 443  # Internal network only
sudo ufw enable

# Or iptables
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -s 10.0.0.0/8 -j ACCEPT
sudo iptables -A INPUT -j DROP
```

### Security Checklist

- [ ] API keys stored securely (not in code)
- [ ] File permissions set correctly
- [ ] Regular security updates
- [ ] Network access restricted
- [ ] Logs monitored for anomalies
- [ ] Backup strategy in place

---

## Troubleshooting

### Common Issues

#### Permission Denied

```bash
# Fix permissions
sudo chown -R $(whoami):$(whoami) /opt/translamate
chmod +x /opt/translamate/dist/cli/index.js
```

#### Out of Memory

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
node dist/cli/index.js batch large-directory --to zh-CN
```

#### API Timeouts

```bash
# Check network connectivity
curl -I https://api.deepseek.com

# Check DNS resolution
nslookup api.deepseek.com

# Review firewall rules
sudo iptables -L -n | grep 443
```

### Debug Mode

```bash
# Enable debug logging
export DEBUG=translamate:*
node dist/cli/index.js translate "test" --to zh-CN
```

---

## Performance Tuning

### Concurrent Processing

```bash
# Process multiple files concurrently
find /data/input -name "*.md" -print0 | xargs -0 -P 4 -I {} \
  node dist/cli/index.js translate {} --to zh-CN --output /data/output/{}
```

### Caching

```bash
# Use Redis for caching translations
# Install: npm install redis

# Cache script example
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

## Backup and Recovery

### Backup Script

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backup/translamate/$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

# Backup configuration
cp /etc/translamate/env "$BACKUP_DIR/"
cp -r /opt/translamate/config "$BACKUP_DIR/"

# Backup data
tar czf "$BACKUP_DIR/data.tar.gz" /data/translamate

# Upload to S3 (optional)
aws s3 sync "$BACKUP_DIR" s3://your-bucket/translamate-backups/

# Clean old backups
find /backup/translamate -type d -mtime +30 -exec rm -rf {} +
```

### Recovery

```bash
# Restore from backup
sudo systemctl stop translamate
sudo cp /backup/translamate/20240101/env /etc/translamate/
sudo tar xzf /backup/translamate/20240101/data.tar.gz -C /
sudo systemctl start translamate
```
