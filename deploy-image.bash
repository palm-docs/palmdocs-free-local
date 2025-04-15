#!/bin/bash

# 获取当前日期作为版本号
VERSION=$(date +"%Y%m%d%H%M")

# 构建镜像
podman build -t palmdocs-free-local .

# 使用podman tag命令打标签
podman tag palmdocs-free-local crpi-cbqyuxrw2bl506jk.cn-hangzhou.personal.cr.aliyuncs.com/mickeyworks/palmdocs-free-local:$VERSION

# 推送到阿里云镜像仓库
podman push crpi-cbqyuxrw2bl506jk.cn-hangzhou.personal.cr.aliyuncs.com/mickeyworks/palmdocs-free-local:$VERSION

echo "镜像已构建并推送，版本号: $VERSION"
