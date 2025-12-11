# 第一阶段：构建阶段
FROM node:lts-slim AS builder

WORKDIR /app

# 先复制依赖文件，利用Docker缓存
COPY package*.json ./

# 安装生产环境依赖
RUN npm install --only=production

# 第二阶段：运行阶段
FROM node:lts-slim

# 设置时区（可选，根据需要调整）
RUN apt-get update && apt-get install -y --no-install-recommends tzdata procps ca-certificates && rm -rf /var/lib/apt/lists/*
ENV TZ=Asia/Shanghai

WORKDIR /app

# 从构建阶段复制依赖，并设置所有者为内置 node 用户
COPY --from=builder --chown=node:node /app/node_modules ./node_modules

# 复制应用文件，并设置所有者
COPY --chown=node:node index.js package.json ./

# 创建 tmp 目录并设置权限
RUN mkdir -p tmp && chown node:node tmp

# 切换到内置非root用户
USER node

# 暴露端口
EXPOSE 3005

# 设置健康检查
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "http.get('http://localhost:' + (process.env.SERVER_PORT || process.env.PORT || 3005), (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# 设置启动命令
CMD ["node", "index.js"]
