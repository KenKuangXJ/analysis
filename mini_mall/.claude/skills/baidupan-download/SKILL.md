---
name: baidupan-download
description: Use when downloading files from Baidu Pan (百度网盘) share links to a Linux server without a browser. Covers bypy authentication, share password verification, directory listing via share API, file transfer to own account, and batch download with size/type filtering.
---

# 百度网盘分享文件下载

## 概述

通过命令行从百度网盘分享链接下载文件到 Linux 服务器。核心思路：**bypy（百度网盘 Python CLI）做认证和下载 + curl 调分享 API 列目录 + transfer API 转存文件**。

## 前置条件

```sh
# 安装 bypy（PEP 668 限制需加 --break-system-packages）
pip3 install --break-system-packages bypy

# 授权 bypy（需要浏览器打开链接 → 登录百度账号 → 粘贴授权码）
bypy info
```

授权后 token 存储在 `/root/.bypy/bypy.json`，后续可直接读取。

## 下载流程

### 1. 获取分享页面的 cookie 和元数据

```sh
# 访问分享链接，获取 cookie（含 BAIDUID、csrfToken）
curl -s -c /tmp/bd_cookies.txt "https://pan.baidu.com/s/<surl>" > /dev/null

# 跟随重定向到 init 页面，提取 yunData
curl -s -b /tmp/bd_cookies.txt -c /tmp/bd_cookies.txt \
  "https://pan.baidu.com/share/init?surl=<surl>" > /tmp/bd_init.html

# 从页面提取 shareid 和 share_uk
grep -oP 'window\.yunData\s*=\s*\{[^}]+\}' /tmp/bd_init.html
```

> **关键字段：** yunData 中的 `shareid`、`share_uk`（分享者 ID）。后续所有 API 调用都需要这两个参数。

### 2. 提交提取码

```sh
curl -s -b /tmp/bd_cookies.txt -c /tmp/bd_cookies.txt \
  -X POST "https://pan.baidu.com/share/verify?surl=<surl>&t=$(date +%s)000&channel=chunlei&clienttype=0&web=1" \
  -d "pwd=<提取码>" \
  -H "Referer: https://pan.baidu.com/share/init?surl=<surl>" \
  -H "X-Requested-With: XMLHttpRequest"
```

> 成功返回 `errno: 0` 和 `randsk`。cookie 中会新增 `BDCLND` 字段，这是后续访问分享目录的凭证。

### 3. 递归列出分享目录（核心技巧）

**关键坑：** `/share/list` API 的 `dir` 参数必须是**完整 sharelink 路径**，而非普通文件路径。

从页面 HTML 的 `file_list` 中获取顶层目录的 `path` 字段，其格式为：
```
/sharelink<share_uk>-<fs_id>/<顶层目录名>
```

然后用此路径递归列出所有子目录：

```python
import requests, json, urllib.parse

bdclnd = "<从 cookie 中获取的 BDCLND 值>"
shareid = "<yunData 中的 shareid>"
share_uk = "<yunData 中的 share_uk>"
base_path = "<file_list 中目录条目的 path>"

def list_dir(dir_path):
    encoded = urllib.parse.quote(dir_path, safe='/')
    url = (
        f"https://pan.baidu.com/share/list"
        f"?app_id=250528&channel=chunlei&clienttype=0&web=1"
        f"&uk={share_uk}&shareid={shareid}&is_from_web=1&sekey={bdclnd}"
        f"&order=time&desc=1&showempty=0&view_mode=1"
        f"&dir={encoded}&page=1&num=1000"
    )
    r = requests.get(url, headers={
        "Referer": f"https://pan.baidu.com/s/<surl>?from=init",
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "Accept-Encoding": "identity",  # 避免 gzip 解码问题
    }, cookies=load_cookies())
    return r.json()  # errno==0 时 list 数组为目录内容
```

> **常见错误：** `dir=/` 或 `dir=/目录名` 返回 `errno: 2`（链接出错了）。**必须用从 `file_list` 中提取的完整 sharelink 路径。**

### 4. 筛选目标文件并转存

根据条件（文件类型、大小）筛选文件，通过 `share/transfer` API 转存到自己的网盘：

```sh
ACCESS_TOKEN=$(python3 -c "import json; d=json.load(open('/root/.bypy/bypy.json')); print(d['access_token'])")

curl -s -b /tmp/bd_cookies.txt \
  -X POST "https://pan.baidu.com/share/transfer?shareid=<shareid>&from=<share_uk>&access_token=${ACCESS_TOKEN}" \
  -d "fsidlist=[<fs_id1>,<fs_id2>,...]&path=%2Fapps%2Fbypy%2F<目标目录>%2F" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Referer: https://pan.baidu.com/s/<surl>?from=init"
```

> **注意事项：**
> - 非 VIP 单次最多转存 500 个文件（`non_vip_limit: 500`）
> - 目标路径需先通过 `bypy mkdir <目标目录>` 创建
> - `fsidlist` 是 JSON 数组 `[fs_id, ...]`，需 URL 编码
> - 返回 `errno: 0` 且 `info[].errno: 0` 表示转存成功

### 5. 下载到本地

```sh
# 创建本地目录
mkdir -p /data/temp/<目标目录>

# 通过 bypy 从网盘下载到本地
bypy downdir <网盘子目录> /data/temp/<目标目录>
```

## 完整脚本模板

将上述步骤整合到一个 Python 脚本中。关键函数：

| 函数 | 作用 |
|---|---|
| `init_session()` | 访问分享页、提交提取码、获取 BDCLND cookie |
| `list_dir(path)` | 列出分享目录内容（递归使用） |
| `explore_recursive(path, depth)` | 递归遍历，按扩展名/大小筛选文件 |
| `transfer_files(fs_ids, dest)` | 通过 transfer API 转存到自己的网盘 |
| `bypy_download(remote_dir, local_dir)` | 调用 `bypy downdir` 下载到本地 |

## 常见错误

| 错误 | 原因 | 修复 |
|---|---|---|
| `errno: 2` + "啊哦，链接出错了" | `dir` 参数用了 `/` 或简单路径，而非完整 sharelink 路径 | 从 `file_list[0].path` 提取完整路径 |
| `errno: 2` + "请求失败" | `/api/sharedownload` 需要登录 session | 改用 `/share/list`（GET，只需 BDCLND） |
| `errno: 12` + "转存文件数超限" | 选中文件超过 500 个（非 VIP 限制） | 分批转存或进一步筛选 |
| `errno: 2` + "转存路径不存在" | 目标网盘目录未创建 | 先执行 `bypy mkdir <目录名>` |
| `errno: -6` + "账户已过期" | transfer API 缺少 `access_token` 参数 | URL 参数中加上 `&access_token=...` |
| `errno: 9019` + "need verify" | 带了 access_token 但缺少 bdstoken | 用 BDCLND cookie 方式（不需要 access_token）调用 list API |
| gzip 解码错误（Python requests） | 百度返回的 gzip 响应头与内容不匹配 | 设置 `Accept-Encoding: identity` + `stream=True` + 手动读取 raw |

## 环境要求

- Python 3.8+
- `bypy` 包 + 百度 OAuth 授权
- `curl` + `python3` 标准库（`json`, `urllib.parse`, `subprocess`）
- 服务器能访问 `pan.baidu.com`（关键：公司网络可能屏蔽，需要服务器有外网访问权限）
