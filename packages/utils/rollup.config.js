import { readFileSync } from 'fs';
import baseConfig from '../../rollup.config.base.js';

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8')
);

// 复用基础配置，但可以在这里添加包特定的配置
const config = {
  ...baseConfig,
  input: 'src/index.ts',
  // 如果有特殊需求，可以覆盖基础配置中的一些字段
};

// 可以根据工具库特定需求修改配置

export default config; 