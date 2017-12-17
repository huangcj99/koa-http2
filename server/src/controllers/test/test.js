const test = async (ctx, next) => {
  console.log('-----');
  return ctx.render('test.html');
}

module.exports = {
  test
}
