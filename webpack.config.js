import pkg from 'pkg';
import path from 'node:path';
import webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';

class WebpackPkgPlugin {
	apply(compiler) {
		compiler.hooks.done.tapAsync('WebpackNexePlugin', async () => {
			if (compiler.options.mode !== 'development') {
				await pkg.exec([
					path.resolve(compiler.options.output.path, compiler.options.output.filename),
					'--target',
					'node16-win-x64',
					'--output',
					path.resolve(compiler.options.output.path, 'iPCTC.exe'),
				]);
			}
		});
	}
}

export default (env, argv) => {
	const isDevelopmentMode = argv.mode === 'development';

	/** @type {import('webpack').Configuration} */
	const config = {
		target: 'node',
		entry: path.resolve('./src/main.js'),
		output: {
			path: path.resolve('build'),
			libraryTarget: 'commonjs',
			filename: 'index.cjs',
		},
		cache: {
			type: 'filesystem',
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					use: ['babel-loader'],
				},
			],
		},
		optimization: {
			minimize: !isDevelopmentMode,
			minimizer: [new TerserPlugin()],
		},
		plugins: [new webpack.ProgressPlugin(), new WebpackPkgPlugin()],
		watch: isDevelopmentMode,
		watchOptions: {
			aggregateTimeout: 300,
			poll: 1000,
			ignored: /node_modules|build/,
		},
		devtool: isDevelopmentMode ? 'source-map' : false,
	};

	return config;
};
