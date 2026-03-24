import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { loggerService } from '@logger'
import { app } from 'electron'

const require_ = createRequire(import.meta.url)
const logger = loggerService.withContext('RustSdkHelper')

export interface RustSdkStitchImageInput {
  imageBase64: string
  width: number
  height: number
  offsetX: number
  offsetY: number
}

export interface RustSdkStitchRequest {
  stitchedWidth: number
  stitchedHeight: number
  images: RustSdkStitchImageInput[]
}

export interface RustSdkStitchResult {
  imageBase64: string
  stitchedWidth: number
  stitchedHeight: number
}

export interface RustSdkCompareRequest {
  image1Base64: string
  image2Base64: string
}

export interface RustSdkCompareResult {
  diffPercent: number
}

interface RustSdkModule {
  stitch_images(input: RustSdkStitchRequest): RustSdkStitchResult
  compare_images(input: RustSdkCompareRequest): RustSdkCompareResult
}

let rustSdkModulePromise: Promise<RustSdkModule> | null = null

function getRustSdkCandidatePaths(): string[] {
  const appPath = app.getAppPath()
  const unpackedAppPath = appPath.replace(/\.asar([\\/]|$)/, '.asar.unpacked$1')

  return [
    path.resolve(appPath, 'rust-sdk/pkg/rust_sdk.js'),
    path.resolve(unpackedAppPath, 'rust-sdk/pkg/rust_sdk.js'),
    path.resolve(process.cwd(), 'rust-sdk/pkg/rust_sdk.js')
  ]
}

function resolveRustSdkModulePath(): string {
  const matched = getRustSdkCandidatePaths().find((candidatePath) => fs.existsSync(candidatePath))

  if (!matched) {
    throw new Error(
      'Rust SDK wasm package not found. Please run `pnpm build:rust-sdk` before using src/main/helpers/rustSdk.'
    )
  }

  return matched
}

export async function loadRustSdk(): Promise<RustSdkModule> {
  if (!rustSdkModulePromise) {
    rustSdkModulePromise = Promise.resolve().then(() => {
      const modulePath = resolveRustSdkModulePath()
      logger.info('Loading rust-sdk wasm module', { modulePath })
      return require_(modulePath) as RustSdkModule
    })
  }

  return rustSdkModulePromise
}

export async function stitchImages(input: RustSdkStitchRequest): Promise<RustSdkStitchResult> {
  const sdk = await loadRustSdk()
  return sdk.stitch_images(input)
}

export async function compareImages(input: RustSdkCompareRequest): Promise<RustSdkCompareResult> {
  const sdk = await loadRustSdk()
  return sdk.compare_images(input)
}
