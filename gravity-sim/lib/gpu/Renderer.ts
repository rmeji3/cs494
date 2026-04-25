/// <reference types="@webgpu/types" />
import type { BodyConfig, SimStats } from '../types';
import computeShader from './compute.wgsl';
import renderShader from './render.wgsl';

const MAX_BODIES = 8192;
const BODY_FLOATS = 8;       // f32 fields per body
const BODY_BYTES  = BODY_FLOATS * 4;  // 32 bytes per body

export class Renderer {
  private device!: GPUDevice;
  private context!: GPUCanvasContext;
  private format!: GPUTextureFormat;

  // Ping-pong body storage buffers
  private bufA!: GPUBuffer;
  private bufB!: GPUBuffer;
  private simParamsBuf!: GPUBuffer;
  private renderParamsBuf!: GPUBuffer;

  private computePipeline!: GPUComputePipeline;
  private renderPipeline!: GPURenderPipeline;

  // Compute bind groups: A→B and B→A
  private cgAtoB!: GPUBindGroup;
  private cgBtoA!: GPUBindGroup;
  // Render bind groups: read from A or B
  private rgA!: GPUBindGroup;
  private rgB!: GPUBindGroup;

  private numBodies = 0;
  // step=0: next compute reads A writes B; step=1: reads B writes A
  private step = 0;

  private G = 100;
  private softeningSq = 400;

  private paused = false;
  private speed = 1.0;
  private lastTime = 0;
  private simTime = 0;

  private animHandle: number | null = null;
  private onStats: ((s: SimStats) => void) | null = null;

  private fpsFrames = 0;
  private fpsClock  = 0;
  private fps       = 0;

  async init(canvas: HTMLCanvasElement, onStats: (s: SimStats) => void): Promise<void> {
    this.onStats = onStats;

    if (!navigator.gpu) throw new Error('WebGPU is not supported in this browser');
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw new Error('No GPU adapter found');
    this.device = await adapter.requestDevice();

    this.context = canvas.getContext('webgpu') as GPUCanvasContext;
    this.format  = navigator.gpu.getPreferredCanvasFormat();
    this.context.configure({ device: this.device, format: this.format, alphaMode: 'opaque' });

    this.buildBuffers();
    await this.buildPipelines();
    this.buildBindGroups();
    this.writeRenderParams(canvas.width, canvas.height);

    this.animHandle = requestAnimationFrame(t => this.frame(t));
  }

  // Write a new body into both ping-pong buffers at the next free slot
  addBody(cfg: BodyConfig): void {
    if (this.numBodies >= MAX_BODIES) return;
    const data = new Float32Array([
      cfg.x, cfg.y, cfg.vx, cfg.vy,
      cfg.mass, cfg.radius, cfg.type, 0,
    ]);
    const byteOffset = this.numBodies * BODY_BYTES;
    this.device.queue.writeBuffer(this.bufA, byteOffset, data);
    this.device.queue.writeBuffer(this.bufB, byteOffset, data);
    this.numBodies++;
  }

  clearAll(): void {
    this.numBodies = 0;
    this.simTime   = 0;
  }

  setPaused(p: boolean): void { this.paused = p; }
  setSpeed(s: number): void   { this.speed  = s; }

  resize(width: number, height: number): void {
    this.writeRenderParams(width, height);
  }

  destroy(): void {
    if (this.animHandle !== null) cancelAnimationFrame(this.animHandle);
    this.bufA?.destroy();
    this.bufB?.destroy();
    this.simParamsBuf?.destroy();
    this.renderParamsBuf?.destroy();
    this.device?.destroy();
  }



  private buildBuffers(): void {
    const bodyBufSize = MAX_BODIES * BODY_BYTES;
    const storageUsage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST;

    this.bufA = this.device.createBuffer({ size: bodyBufSize, usage: storageUsage });
    this.bufB = this.device.createBuffer({ size: bodyBufSize, usage: storageUsage });

    this.simParamsBuf = this.device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.renderParamsBuf = this.device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
  }

  private async buildPipelines(): Promise<void> {
    const computeMod = this.device.createShaderModule({ code: computeShader });
    const renderMod  = this.device.createShaderModule({ code: renderShader  });

    const computeBGL = this.device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' as GPUBufferBindingType } },
        { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage'            as GPUBufferBindingType } },
        { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform'            as GPUBufferBindingType } },
      ],
    });

    this.computePipeline = await this.device.createComputePipelineAsync({
      layout: this.device.createPipelineLayout({ bindGroupLayouts: [computeBGL] }),
      compute: { module: computeMod, entryPoint: 'main' },
    });

    const renderBGL = this.device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' as GPUBufferBindingType } },
        { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform'            as GPUBufferBindingType } },
      ],
    });

    this.renderPipeline = await this.device.createRenderPipelineAsync({
      layout:   this.device.createPipelineLayout({ bindGroupLayouts: [renderBGL] }),
      vertex:   { module: renderMod, entryPoint: 'vs_main' },
      fragment: { module: renderMod, entryPoint: 'fs_main', targets: [{ format: this.format }] },
      primitive: { topology: 'triangle-list' },
    });
  }

  private buildBindGroups(): void {
    const computeBGL = this.computePipeline.getBindGroupLayout(0);
    const renderBGL  = this.renderPipeline.getBindGroupLayout(0);

    this.cgAtoB = this.device.createBindGroup({
      layout: computeBGL,
      entries: [
        { binding: 0, resource: { buffer: this.bufA } },
        { binding: 1, resource: { buffer: this.bufB } },
        { binding: 2, resource: { buffer: this.simParamsBuf } },
      ],
    });
    this.cgBtoA = this.device.createBindGroup({
      layout: computeBGL,
      entries: [
        { binding: 0, resource: { buffer: this.bufB } },
        { binding: 1, resource: { buffer: this.bufA } },
        { binding: 2, resource: { buffer: this.simParamsBuf } },
      ],
    });

    this.rgA = this.device.createBindGroup({
      layout: renderBGL,
      entries: [
        { binding: 0, resource: { buffer: this.bufA } },
        { binding: 1, resource: { buffer: this.renderParamsBuf } },
      ],
    });
    this.rgB = this.device.createBindGroup({
      layout: renderBGL,
      entries: [
        { binding: 0, resource: { buffer: this.bufB } },
        { binding: 1, resource: { buffer: this.renderParamsBuf } },
      ],
    });
  }

  private writeSimParams(dt: number): void {
    const buf  = new ArrayBuffer(16);
    const view = new DataView(buf);
    view.setFloat32(0,  dt,                true);
    view.setFloat32(4,  this.G,            true);
    view.setUint32( 8,  this.numBodies,    true);
    view.setFloat32(12, this.softeningSq,  true);
    this.device.queue.writeBuffer(this.simParamsBuf, 0, buf);
  }

  private writeRenderParams(w: number, h: number): void {
    this.device.queue.writeBuffer(
      this.renderParamsBuf, 0,
      new Float32Array([w, h, 0, 0]),
    );
  }

  private frame(now: number): void {
    const rawDt = this.lastTime === 0
      ? 0
      : Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    // FPS counter (updated every second)
    this.fpsFrames++;
    if (now - this.fpsClock >= 1000) {
      this.fps       = this.fpsFrames;
      this.fpsFrames = 0;
      this.fpsClock  = now;
    }

    const doCompute = !this.paused && this.numBodies > 0 && rawDt > 0;
    const encoder   = this.device.createCommandEncoder();

    if (doCompute) {
      const dt = rawDt * this.speed;
      this.simTime += dt;
      this.writeSimParams(dt);

      const pass = encoder.beginComputePass();
      pass.setPipeline(this.computePipeline);
      pass.setBindGroup(0, this.step === 0 ? this.cgAtoB : this.cgBtoA);
      pass.dispatchWorkgroups(Math.ceil(this.numBodies / 64));
      pass.end();
    }

    // After a step=0 compute, output is in B; after step=1, output is in A.
    // Render from the output buffer. If no compute ran, render from the
    // current-read buffer (step=0 → A is current, step=1 → B is current).
    const renderBG = doCompute
      ? (this.step === 0 ? this.rgB : this.rgA)
      : (this.step === 0 ? this.rgA : this.rgB);

    const swapTex  = this.context.getCurrentTexture().createView();
    const renderPass = encoder.beginRenderPass({
      colorAttachments: [{
        view:       swapTex,
        clearValue: { r: 0.02, g: 0.02, b: 0.06, a: 1.0 },
        loadOp:    'clear'  as GPULoadOp,
        storeOp:   'store'  as GPUStoreOp,
      }],
    });

    if (this.numBodies > 0) {
      renderPass.setPipeline(this.renderPipeline);
      renderPass.setBindGroup(0, renderBG);
      renderPass.draw(6, this.numBodies);  // 6 verts × N instances
    }

    renderPass.end();
    this.device.queue.submit([encoder.finish()]);

    if (doCompute) this.step ^= 1;

    this.onStats?.({ fps: this.fps, bodyCount: this.numBodies, simTime: this.simTime });

    this.animHandle = requestAnimationFrame(t => this.frame(t));
  }
}
