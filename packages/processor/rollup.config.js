import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import pkg from './package.json' assert { type: 'json' };

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
      exports: 'named'
    },
    {
      file: pkg.unpkg,
      format: 'umd',
      name: 'DMHSQMonitorProcessor',
      sourcemap: true,
      globals: {
        '@dmhsq_monitor/core': 'DMHSQMonitorCore',
        '@dmhsq_monitor/utils': 'DMHSQMonitorUtils'
      }
    }
  ],
  external: [
    '@dmhsq_monitor/core',
    '@dmhsq_monitor/utils'
  ],
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      outputToFilesystem: true
    }),
    terser({
      format: {
        comments: false
      }
    })
  ]
}; 