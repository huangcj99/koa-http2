const test = async (ctx, next) => {
  console.log('-----');

  return ctx.render('index.html');
}

module.exports = {
  test
}
