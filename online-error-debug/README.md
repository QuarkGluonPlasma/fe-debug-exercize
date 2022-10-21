安装依赖，然后执行 npx webpack -c webpack.config.js 来编译

执行 npx http-server . 跑个静态服务器

配置 hosts 为 127.0.0.1 配个域名，然后 charles 断点调试该域名的 index.js，修改内容加上 //# sourceMappingURL=http://域名:端口/dist/index.js.map

用 vscode debugger 跑网页，勾选 uncaught exception
