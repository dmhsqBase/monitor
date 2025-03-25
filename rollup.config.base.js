import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import { babel } from '@rollup/plugin-babel';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8')
);

const createBaseConfig = (packageJson, input = 'src/index.ts') => {
  const { name, dependencies = {}, peerDependencies = {} } = packageJson;
  
  // 提取包名称为UMD格式的全局变量名
  const umdName = name.replace(/[@/-]/g, '_').replace(/@.*\//, '');
  
  // 获取需要排除的依赖
  const externalDeps = [...Object.keys(dependencies), ...Object.keys(peerDependencies)];
  
  return {
    input,
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
        file: `dist/index.cjs.js`,
        format: 'cjs',
        sourcemap: true,
      },
      // ESModule
      {
        file: `dist/index.esm.js`,
        format: 'esm',
        sourcemap: true,
      },
      // UMD
      {
        file: `dist/index.umd.js`,
        format: 'umd',
        name: umdName,
        sourcemap: true,
        plugins: [terser()],
        globals: {
          // 在这里可以定义外部库的UMD全局变量名
          // 例如：'react': 'React'
        },
      },
    ],
  };
};

export default createBaseConfig(packageJson); 