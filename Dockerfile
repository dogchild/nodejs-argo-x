FROM node:lts-alpine

# 安装必要依赖
# gcompat: 相比 libc6-compat，gcompat 对 glibc 二进制文件（如下载的 front/backend）有更好的兼容性
# procps: index.js 中使用了 pkill -f，busybox 的 pkill 可能不支持完整正则或行为不同，procps 更稳妥
# ca-certificates: 确保 HTTPS 请求正常
# tzdata: 设置时区
# 其它如 openssl, curl, bash, iproute2, coreutils 均不需要，Node.js 和 busybox 已覆盖功能
RUN apk add --no-cache gcompat procps ca-certificates tzdata

ENV TZ=Asia/Shanghai

WORKDIR /app

# 复制依赖定义
COPY package*.json ./

# 安装生产环境依赖
RUN npm install --only=production

# 复制应用代码
COPY index.js package.json ./

# 暴露端口
EXPOSE 3005

CMD ["node", "index.js"]
