import typescript from 'rollup-plugin-typescript2';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

export default {
  input: 'src/index.ts',
  output: [
    { file: pkg.main, format: 'cjs' },
    { file: pkg.module, format: 'es' },
  ],
  plugins: [
    typescript({
      typescript: require('typescript'),
      clean: true,
      tsconfig: './tsconfig.json',
    }),

    babel({
      babelHelpers: 'runtime',
      extensions: ['.ts', '.tsx'],
      exclude: 'node_modules/**',
      presets: ['solid'],
      plugins: [
        '@babel/plugin-transform-runtime',
        '@babel/plugin-proposal-optional-chaining',
        '@babel/plugin-proposal-nullish-coalescing-operator',
      ],
    }),

    terser(),
  ],
  external: [
    /@babel\/runtime/,
    ...Object.keys(pkg.dependencies),
    ...Object.keys(pkg.peerDependencies),
    ...Object.keys(pkg.devDependencies),
  ],
};
