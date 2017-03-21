module.exports = {
  context: __dirname + '/src',
  entry: ["./app.js"],
  output: {
    path: __dirname + '/public',
    filename: "[name].bundle.js",
    chunkFilename: "[id].bundle.js"
  },
  watch: true,

  module: {
    loaders: [
      {
        test:/\.js$/,
        exclude: /node_moduels/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        loader: "style-loader!css-loader"
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loader: [
          'file?hash=sha512&digest=hex&name=[hash].[ext]',
          'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
        ]
      }
    ]
  }

};
