# koa-http2

### 改造koa

```code
// 重写Koa的listen方法
class KoaOnhttp2 extends Koa {
  constructor() {
    super()
  }

  listen(...args) {
    debug('listen');

    const server = http2.createServer(
      keysOptions,
      this.callback()
    );
    return server.listen(...args);
  }
}

const app = new KoaOnhttp2();
```

###http1.1
下图中，同一个页面下的三个资源，Connection ID不同，分别建立了三条TCP链接

![image](http://github.com/smallcatcat-joe/koa-http2/raw/master/images/http1.1.png)

###http2
而下图，http2则使用了一条TCP链接就将资源全数返回

![image](http://github.com/smallcatcat-joe/koa-http2/raw/master/images/http2.png)
