import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import { babel } from '@rollup/plugin-babel';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8')
);

const { name, dependencies = {}, peerDependencies = {} } = packageJson;

// 提取包名称为UMD格式的全局变量名
const umdName = 'DMHSQMonitorWeb';

// 获取需要排除的依赖
const externalDeps = [...Object.keys(dependencies), ...Object.keys(peerDependencies)];

export default {
  input: 'src/index.ts',
  external: id => externalDeps.some(dep => id === dep || id.startsWith(`${dep}/`)),
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: true,
      declaration: true,
      declarationDir: 'dist',
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
  ],
  output: [
    // CommonJS
    {
      file: packageJson.main,
      format: 'cjs',
      sourcemap: true,
    },
    // ESModule
    {
      file: packageJson.module,
      format: 'esm',
      sourcemap: true,
    },
    // UMD
    {
      file: packageJson.unpkg,
      format: 'umd',
      name: umdName,
      sourcemap: true,
      plugins: [terser()],
      globals: {
        '@dmhsq_monitor/core': 'DMHSQMonitorCore',
        '@dmhsq_monitor/utils': 'DMHSQMonitorUtils',
        '@dmhsq_monitor/processor': 'DMHSQMonitorProcessor'
      },
    },
  ],
}; 