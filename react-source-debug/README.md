首先执行 npm install 或 yarn 安装依赖

然后执行 npx patch-package 应用 react-dom 包的 patch

之后 npm run build 执行 webpack 构建

然后 npx http-server . 启动静态服务器

之后 debug 启动

这时候调用栈中就可以看到 react 源码的包

只不过因为用的是我生成的 sourcemap，路径是我本地的，大家可以替换成自己生成的 sourcemap

之后把 react 源码也加到这个 workspace 里来，就可以直接点击调用栈打开对应的源码文件了