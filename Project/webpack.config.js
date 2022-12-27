const CommunicationIdentityClient =
  require("@azure/communication-administration").CommunicationIdentityClient;
const HtmlWebPackPlugin = require("html-webpack-plugin");
const config = require("./config.json");

if (!config || !config.connectionString) {
  throw new Error("Update `config.json` with connection string");
}

const PORT = process.env.port || 80;

module.exports = {
  devtool: "inline-source-map",
  mode: "development",
  entry: "./src/index.js",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
          },
        ],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./public/index.html",
      filename: "./index.html",
    }),
  ],
  devServer: {
    open: true,
    port: PORT,
    before: function (app) {
      app.post("/tokens/provisionUser", async (req, res) => {
        try {
          const communicationIdentityClient = new CommunicationIdentityClient(
            config.connectionString
          );
          let communicationUserId =
            await communicationIdentityClient.createUser();
          const tokenResponse = await communicationIdentityClient.issueToken(
            communicationUserId,
            ["voip"]
          );
          res.json(tokenResponse);
        } catch (error) {
          console.error(error);
        }
      });
    },
  },
};
