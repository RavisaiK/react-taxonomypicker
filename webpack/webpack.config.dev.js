///////////////////////////////////////////////////////////////////////////////////////////////////
//  WebPack 2 DEV Config
///////////////////////////////////////////////////////////////////////////////////////////////////
//  author: Jose Quinto - https://blogs.josequinto.com
///////////////////////////////////////////////////////////////////////////////////////////////////

const resolve = require("path").resolve;
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    // To enhance the debugging process. More info: https://webpack.js.org/configuration/devtool/
    devtool: "inline-source-map",
    target: "web",
    entry: {
        "React.TaxonomyPicker": [
            // Our app main entry
            "./app/src/index.dev.tsx"
        ]
    },
    output: {
        // Next line is not used in dev but WebpackDevServer crashes without it
        path: resolve(__dirname, "./../build"),
        // Add /* filename */ comments to generated require()s in the output.
        pathinfo: true,
        // This does not produce a real file. It's just the virtual path that is
        // served by WebpackDevServer in development. This is the JS bundle
        // containing code from all our entry points, and the Webpack runtime.
        filename: "static/js/[name].js",
        // There are also additional JS chunk files if you use code splitting.
        chunkFilename: "static/js/[name].chunk.js",
        // This is the URL that app is served from. We use "/" in development.
        publicPath: "/"
    },

    devServer: {
        // All options here: https://webpack.js.org/configuration/dev-server/

        // enable HMR on the server
        hot: true,
        // match the output path
        contentBase: resolve(__dirname, "../dist"),
        // match the output `publicPath`
        publicPath: "/",

        // Enable to integrate with Docker
        //host:"0.0.0.0",

        port: 3000,
        historyApiFallback: true,
        // All the stats options here: https://webpack.js.org/configuration/stats/
        stats: {
            colors: true, // color is life
            chunks: false, // this reduces the amount of stuff I see in my terminal; configure to your needs
            "errors-only": true
        }
    },

    context: resolve(__dirname, "../"),
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js"]
    },
    plugins: [
        // replacement for Mock APIs
        new webpack.NormalModuleReplacementPlugin(/(\.*)\/api\/(\.*)/, function(
            resource
        ) {
            resource.request = resource.request.replace(/api/, `/apiMock/`);
        }),

        // Generates an `index.html` file with the <script> injected.
        new HtmlWebpackPlugin({
            inject: true,
            template: "public/index.html"
        }),

        // enable HMR globally
        new webpack.HotModuleReplacementPlugin(),

        // prints more readable module names in the browser console on HMR updates
        new webpack.NamedModulesPlugin(),

        // do not emit compiled assets that include errors
        new webpack.NoEmitOnErrorsPlugin()
    ],
    watchOptions: {
        poll: true
    },
    module: {
        // loaders -> rules in webpack 2
        rules: [
            // Once TypeScript is configured to output source maps we need to tell webpack
            // to extract these source maps and pass them to the browser,
            // this way we will get the source file exactly as we see it in our code editor.
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader",
                exclude: "/node_modules/"
            },
            {
                enforce: "pre",
                test: /\.tsx?$/,
                use: "source-map-loader",
                exclude: "/node_modules/"
            },
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            {
                test: /\.ts(x?)$/,
                use: [{ loader: "ts-loader" }],
                include: resolve(__dirname, "./../app/src")
            },
            {
                test: /\.css$/i,
                include: resolve(__dirname, "./../app/stylesheets"),
                use: [
                    {
                        loader: "style-loader"
                    },
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: true,
                            importLoaders: 1
                        }
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            plugins: () => [
                                require("postcss-import")({
                                    //If you are using postcss-import v8.2.0 & postcss-loader v1.0.0 or later, this is unnecessary.
                                    //addDependencyTo: webpack // Must be first item in list
                                }),
                                require("postcss-nesting")(), // Following CSS Nesting Module Level 3: http://tabatkins.github.io/specs/css-nesting/
                                require("postcss-custom-properties")({
                                    preserve: false
                                }),
                                require("autoprefixer")()
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.css$/i,
                exclude: [/node_modules/],
                include: resolve(__dirname, "./../app/src"),
                use: [
                    {
                        loader: "style-loader"
                    },
                    "css-modules-typescript-loader",
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: true,
                            importLoaders: 1,
                            modules: {
                                localIdentName: "[name]_[local]_[hash:base64:5]"
                            },
                            localsConvention: "camelCase"
                        }
                    }
                ]
            }
        ]
    }
};
