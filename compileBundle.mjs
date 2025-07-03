import * as esbuild from 'esbuild'
import esbuildPluginTsc from 'esbuild-plugin-tsc'

await esbuild.build({
  entryPoints: ['src/lambdas/application.ts'],
  bundle: true,
  sourcemap: true,
  minify: true,
  platform: 'node',
  target: 'node18',
  outdir: 'out/application',
  plugins: [esbuildPluginTsc()],
  external: ['@aws-sdk/*', '@nestjs/websockets/socket-module', '@nestjs/microservices', 'class-transformer/storage', 'swagger-ui-dist'],
})

await esbuild.build({
  entryPoints: ['src/lambdas/handleEvmTransactionEvent.ts'],
  bundle: true,
  sourcemap: true,
  minify: true,
  platform: 'node',
  target: 'node18',
  outdir: 'out/handleEvmTransactionEvent',
  plugins: [esbuildPluginTsc()],
  external: ['@aws-sdk/*', '@nestjs/websockets/socket-module', '@nestjs/microservices', 'class-transformer/storage', 'swagger-ui-dist'],
})

await esbuild.build({
  entryPoints: ['src/lambdas/generate1099TaxForms.ts'],
  bundle: true,
  sourcemap: true,
  minify: true,
  platform: 'node',
  target: 'node18',
  outdir: 'out/generate1099TaxForms',
  plugins: [esbuildPluginTsc()],
  external: ['@aws-sdk/*', '@nestjs/websockets/socket-module', '@nestjs/microservices', 'class-transformer/storage', 'swagger-ui-dist'],
})

await esbuild.build({
  entryPoints: ['src/lambdas/monitorVaults.ts'],
  bundle: true,
  sourcemap: true,
  minify: true,
  platform: 'node',
  target: 'node18',
  outdir: 'out/monitorVaults',
  plugins: [esbuildPluginTsc()],
  external: ['@aws-sdk/*', '@nestjs/websockets/socket-module', '@nestjs/microservices', 'class-transformer/storage', 'swagger-ui-dist'],
})

await esbuild.build({
  entryPoints: ['src/lambdas/removeSecurityCode.ts'],
  bundle: true,
  sourcemap: true,
  minify: true,
  platform: 'node',
  target: 'node18',
  outdir: 'out/removeSecurityCode',
  plugins: [esbuildPluginTsc()],
  external: ['@aws-sdk/*', '@nestjs/websockets/socket-module', '@nestjs/microservices', 'class-transformer/storage', 'swagger-ui-dist'],
})

await esbuild.build({
  entryPoints: ['src/lambdas/iterator.ts'],
  bundle: true,
  sourcemap: true,
  minify: true,
  platform: 'node',
  target: 'node18',
  outdir: 'out/iterator',
  plugins: [esbuildPluginTsc()],
  external: ['@aws-sdk/*', '@nestjs/websockets/socket-module', '@nestjs/microservices', 'class-transformer/storage', 'swagger-ui-dist'],
})

await esbuild.build({
  entryPoints: ['src/lambdas/createSeparatedVault.ts'],
  bundle: true,
  sourcemap: true,
  minify: true,
  platform: 'node',
  target: 'node18',
  outdir: 'out/createSeparatedVault',
  plugins: [esbuildPluginTsc()],
  external: ['@aws-sdk/*', '@nestjs/websockets/socket-module', '@nestjs/microservices', 'class-transformer/storage', 'swagger-ui-dist'],
})
