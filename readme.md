## 简介

一个简单的网页端音乐播放器，基于Flask框架编写。

## 启动方法

安装Python环境，并安装`Flask`库：

```bash
pip install Flask
```

编写一个用于启动的脚本文件，用于在Python环境下执行脚本来启动，下面是一个bash脚本例子：

```bash
# start.sh
export FLASK_APP="app.py"
export FLASK_DEBUG="0"
export FLASK_ENV="production"
export FLASK_FILE_ROOT_PATH="/storage/emulated/0/"
flask run -p 5000
```

环境变量`FLASK_FILE_ROOT_PATH`的值是可访问的文件的根目录，如果是安卓系统，通常写`/storage/emulated/0/`，其他系统可以不写。

最后一行可以使用`-p`参数设置开放的端口号，启动后访问`127.0.0.1:端口号`即可。

若需要让局域网内所有主机都可以访问此网站，可以设置`-h`参数为`0.0.0.0`，例如：

```bash
flask run -h 0.0.0.0 -p 5000
```

下面提供一个PowerShell和一个cmd的脚本例子

```PowerShell
# start.ps1
$env:FLASK_APP="app"
$env:FLASK_DEBUG="0"
$env:FLASK_ENV="production"
$env:FLASK_FILE_ROOT_PATH="/storage/emulated/0/"
flask.exe run -p 5000
```

```bash
:: start.bat
set FLASK_APP=app.py
set FLASK_DEBUG=0
set FLASK_ENV=production
set FLASK_FILE_ROOT_PATH=/storage/emulated/0/
flask run -p 5000
```