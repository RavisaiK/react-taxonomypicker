///////////////////////////////////////////////////////////////////////////////////////////////////
//  WebPack 2 PROD Config
///////////////////////////////////////////////////////////////////////////////////////////////////

const resolve = require("path").resolve;
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
    // Don't attempt to continue if there are any errors.
    bail: true,
    devtool: "source-map",
    entry: {
        "React.TaxonomyPicker": "./app/src/index.ts"
    },
    context: resolve(__dirname, "../"),
    output: {
        path: resolve(__dirname, "./../dist"),
        filename: "[name].js",
        // Possible value - amd, commonjs, commonjs2, commonjs-module, this, var
        libraryTarget: "umd",
        // library bundle to be available as a global variable when imported
        library: "TaxonomyPicker"
    },
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js"]
    },
    // Exclude React from the bundle, must be react and react-dom here otherwise will not be excluded
    externals: {
        react: {
            root: "React",
            commonjs2: "react",
            commonjs: "react",
            amd: "react",
            umd: "react"
        },
        "react-dom": {
            root: "ReactDOM",
            commonjs2: "react-dom",
            commonjs: "react-dom",
            amd: "react-dom",
            umd: "react-dom"
        }
    },
    optimization: {
        minimize: true,
        minimizer: [
            // Plugins for optimizing size and performance.
            // Here you have all the available by now:
            //    Webpack 1. https://github.com/webpack/webpack/blob/v1.13.3/lib/optimize
            //    Webpack 2. https://github.com/webpack/webpack/tree/master/lib/optimize
            //    Webpack 3. uglify-js is not external (peer) dependency.
            //              We should install version <= 2.8 by now (19/06/2017) because version 3 is not supported by plugin
            //    Webpack 4. now uglify comes under optimization
            new UglifyJSPlugin({
                sourceMap: true,
                uglifyOptions: {
                    // https://github.com/mishoo/UglifyJS2/tree/harmony#compress-options
                    compress: {
                        global_defs: {
                            __REACT_HOT_LOADER__: undefined // eslint-disable-line no-undefined
                        }
                    },
                    beautify: false,
                    ecma: 6,
                    comments: false,
                    mangle: false
                }
            })
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("production") // Reduces 78 kb on React library
            },
            DEBUG: false, // Doesn´t have effect on my example
            __DEVTOOLS__: false // Doesn´t have effect on my example
        }),
        new MiniCssExtractPlugin({
            filename: "../dist/[name].css",
            allChunks: true
        }),
        new webpack.NormalModuleReplacementPlugin(
            /..\/..\/utils\/MockAPI\/SP.Taxonomy$/,
            "../../utils/API/SP.Taxonomy"
        )
    ],
    module: {
        // loaders -> rules in webpack 2
        rules: [
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader",
                exclude: ["/node_modules/"]
            },
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            configFile: "tsconfig.pkg.json"
                            // transpileOnly: true,
                            // logInfoToStdOut: true
                        }
                    }
                ]
            },
            {
                test: /\.css$/i,
                include: resolve(__dirname, "./../app/stylesheets"), // Use include instead exclude to improve the build performance
                use: [
                    MiniCssExtractPlugin.loader,
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
                            sourceMap: true,
                            plugins: () => [
                                require("postcss-import")(),
                                // Following CSS Nesting Module Level 3: http://tabatkins.github.io/specs/css-nesting/
                                require("postcss-nesting")(),
                                require("postcss-custom-properties")(),
                                //https://github.com/ai/browserslist
                                require("autoprefixer")()
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.css$/i,
                include: resolve(__dirname, "./../app/src"),
                use: [
                    MiniCssExtractPlugin.loader,
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
