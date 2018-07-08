# vue-element-admin-chrome

## Environment
- node v10.5.0
- npm v6.1.0
- yarn v1.7.0

## Goals
1. **use vue-admin-element as a sidepanel to unify/integrate some useful features for github/gitlab/bitbucket browsing:**
  - examples:
    - add a dynamic/searchable list with package dependency insights
        - ref: https://github.com/BrainMaestro/packagehub
    - add a tree of all files in the repository
        - ref: https://github.com/buunguyen/octotree 
    - add tabs for golang projects with godoc related informations
        - ref: https://gotools.org/github.com/joeshaw/envdecode
    - add tooltip/hovercards effects on github links
        - ref: https://github.com/Justineo/github-hovercard
    - more references available
        - ref: https://github.com/stefanbuck/awesome-browser-extensions-for-github
2. **Create different routes per domain**
  - Ability to have a set of routes for github. gitlab and bitbucket. (maybe others websites too...)
3. **Real-time update of tables if some events occured on the backend side**
  - Implement a websocket client
  - Develop a backend in golang with some bots for indexing or harvesting additional insights

## Install

### Pre-built extension (faster)
```bash
# download pre-build 'DEVELOPMENT' extension
$ wget -nc https://github.com/sniperkit/vue-element-admin-chrome/raw/master/eadmin-extension.dev.zip # dev (recommended)
$ unzip eadmin-extension.dev.zip
# jump to section "Add Chrome Extension"
```

or

```bash
# download pre-build 'PRODUCTION' extension
$ wget -nc https://github.com/sniperkit/vue-element-admin-chrome/raw/master/eadmin-extension.prod.zip
$ unzip eadmin-extension.prod.zip
# jump to section "Add Chrome Extension"
```

### Build
```bash
# clone project locally
$ git clone https://github.com/sniperkit/vue-element-admin-chrome
# install dependencies and go!
$ cd vue-element-admin-chrome
$ npm install # or yarn

# build dev version
$ npm run dev # or yarn dev

# or build dist version
$ npm run build # or yarn build
```

### Add Chrome Extension
1. Next, open the "Extensions" page ([chrome://extensions/](chrome://extensions/)) in the browser and check the "Developer mode" checkbox.
![load_extension](https://developer.chrome.com/static/images/get_started/load_extension.png)

2. Click on the "Load unpacked extension" button and select the `vue-element-admin-chrome/dist` directory located at the place you have cloned the source or unzipped the pre-build extension.

3. Disable the chrome extension as the css styles ar conflicting for now

![Imgur](https://i.imgur.com/dOoTuzi.png)

voila

## Run
1. Open github.com repository page
- examples: 
  - https://github.com/syntacticsolutions/Golang-Vue-Webpack
  - https://github.com/syntacticsolutions/Golang-Vue-Webpack#/form/index
  - https://github.com/syntacticsolutions/Golang-Vue-Webpack#/example/tree
2. Open Extension
![Imgur](https://i.imgur.com/IynzqjF.png)

3. Explore Extension
![Imgur](https://i.imgur.com/JR98wXP.png)

### Credits
- https://github.com/PanJiaChen/vueAdmin-template
- https://github.com/PanJiaChen/vue-element-admin
- https://github.com/YuraDev/vue-chrome-extension-template
- https://github.com/ALiangLiang/vue-webpack-chrome-extension-template
- https://github.com/cucygh/vue-chrome-extension-example