# zk-view-tool

> an electron project for viewing node's info of zookeeper

#### 项目背景
近来研究zookeeper发现没有一款很好用的zookeeper图形化客户端工具，idea中虽然有一款类似的插件，但总感觉会占用太多内存导致电脑变卡，而且不支持多客户端接入。又由于自己之前了解到到electron.js可以基于前端（html+css+js）做桌面软件，于是决定自己做一个桌面软件来使用。

#### 项目技术栈
- electron.js
- electron-vue
- vue.js
- node-zookeeper-client
- node.js
- element-ui

#### 产品功能
- 接入zk客户端，查看zk上的节点信息，目前仅限于查看功能

#### 效果图展示
![avatar](https://github.com/yangyuscript/zk-view-tool/tree/master/static/pic.png)

#### 安装包下载
云盘下载：https://pan.baidu.com/s/1mZei2inQrkcpZ5R4STOL5Q    提取码：j03o

#### Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build


```

---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue)@[45a3e22](https://github.com/SimulatedGREG/electron-vue/tree/45a3e224e7bb8fc71909021ccfdcfec0f461f634) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).
