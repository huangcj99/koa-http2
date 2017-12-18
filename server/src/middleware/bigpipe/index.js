const Readable = require('stream').Readable;
const util = require('util');
const fs = require('fs');
const { resolve, join } = require('path');
const Handlebars = require('handlebars');

module.exports = createBigPipeReadable

util.inherits(BigPipe, Readable);

function BigPipe(render) {
  Readable.call(this, {});

  render.call(this);
}

BigPipe.prototype._read = function () {};

function createBigPipeReadable (
  templateRootPath = resolve(__dirname, '../../template'),
  publicPath = resolve(__dirname, '../../../../public')
) {

  return async function initBigPipe(ctx, next) {
    if (ctx.setBigPipe) return next()

    ctx.setBigPipe = function (layoutHtmlPath, modules) {
      ctx.type = 'html';
      ctx.body = new BigPipe(render);

      async function render() {
        let _ctx = this,
            layoutHtml = '',
            taskArr = [],
            taskNum = modules.length;

        let getHtml = (rootPath, realPath) => {
          return fs.readFileSync(join(rootPath, realPath)).toString();
        }

        let getHtmlTemplate = (rootPath, realPath) => {
          let tplSource = fs.readFileSync(join(rootPath, realPath)).toString();

          return Handlebars.compile(tplSource);
        }

        let clearEnter = (html) => {
          return html.replace(/[\r\n]/g,"")
        }

        let done = () => {
          _ctx.push('</body></html>');
          _ctx.push(null)
        }

        function setModules(module) {
          return new Promise((resolve, reject) => {
            // ctx.proxy为异步
            (async function () {
              let data = null,
                  tpl = function() {},
                  tplHtml = '';

              data = await ctx.proxy(module.proxy.url);

              tpl = getHtmlTemplate(templateRootPath, module.tpl);
              tplHtml = clearEnter(tpl(data));

              _ctx.push(`<script>renderFlush("#${module.id}","${tplHtml}")</script>`)
              taskNum--;
              resolve()
            })()

          })
        }

        //首先输出layout
        layoutHtml = getHtml(publicPath, layoutHtmlPath);
        _ctx.push(layoutHtml);

        taskArr = modules.map((module) => setModules(module))

        await Promise.all(taskArr);

        if (taskNum === 0) {
          done();
        }

      }

    }

    return next()
  }
}
