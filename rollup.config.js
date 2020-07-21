import typescript from 'rollup-plugin-typescript2';
import babel from '@rollup/plugin-babel';
import pkg from './package.json';

export default {
  input: 'src/index.tsx',
  output: [
    { file: pkg.main, format: 'cjs', exports: 'named', sourcemap: true },
    { file: pkg.module, format: 'es', sourcemap: true },
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
  ],
  external: [
    /@babel\/runtime/,
    ...Object.keys(pkg.dependencies),
    ...Object.keys(pkg.peerDependencies),
    ...Object.keys(pkg.devDependencies),
  ],
};
