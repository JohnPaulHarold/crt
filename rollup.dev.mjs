import serve from 'rollup-plugin-serve'
import config from './rollup.config.mjs';

export default {
  ...config,
  plugins: [
    ...config.plugins,
    serve({
      open: true,
      contentBase: 'dist'
    })
  ]
}