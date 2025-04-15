# 使用nginx镜像作为基础镜像，找个能访问的镜像源
# FROM registry.cn-hangzhou.aliyuncs.com/nginx/nginx:stable-alpine
# FROM https://docker.1panel.live/nginx/nginx:stable-alpine
FROM func.ink/library/nginx:stable-alpine

# 将构建后的文件复制到nginx服务目录
COPY dist/ /usr/share/nginx/html/

# 复制自定义的nginx配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露80端口
EXPOSE 80

# 启动nginx服务
CMD ["nginx", "-g", "daemon off;"]
