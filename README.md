# palmdocs-free-local

An ai-powered rich-text editor with simple documents management, for FREE and SAFE (Completely stored locally).

- Open source
- Totally free
- Totally local
- No need to register
- Support docker image deployment

```bash
# use docker or podman
# docker or podman is required

# pull it
podman pull crpi-cbqyuxrw2bl506jk.cn-hangzhou.personal.cr.aliyuncs.com/mickeyworks/palmdocs-free-local:latest
# run it
podman run -d -p 8080:80 --name palmdocs-free-local-container crpi-cbqyuxrw2bl506jk.cn-hangzhou.personal.cr.aliyuncs.com/mickeyworks/palmdocs-free-local:latest

# or

# build it
podman build -t palmdocs-free-local .
# run it from local image
podman run -d -p 8080:80 --name palmdocs-free-local-container localhost/palmdocs-free-local:latest
```

---

[live demo](https://palmdocs-free-local.gocheers.fun)

we also have an additional version with more features, and more powerful capabilities for enterprise users. Contact us for more details.
