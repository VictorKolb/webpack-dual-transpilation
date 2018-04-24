function createEntryPoint(params) {
  const {entryName, extension = 'js'} = params;
  const entryPoint = {entry: {}};
  entryPoint.entry[`${entryName}`] = ['babel-polyfill', `./src/${entryName}.${extension}`];
  return entryPoint;
}

module.exports = {
  index: createEntryPoint({entryName: 'index', extension: 'js'}),
};
