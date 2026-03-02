async function checkWebGPUSupport() {
  const outputDiv = document.getElementById('output');
  if (!outputDiv) { console.error('Output div not found'); return; }

  if (!navigator.gpu) {
    outputDiv.innerHTML = '<p>WebGPU is NOT supported in this browser.</p><p>Please use Chrome/Edge 113+.</p>';
    console.error('WebGPU is not supported');
    return;
  }

  outputDiv.innerHTML = '<p>WebGPU is supported!</p>';
  console.log('WebGPU is supported!');

  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      outputDiv.innerHTML += '<p>Failed to get GPU adapter.</p>';
      console.error('Failed to get GPU adapter');
      return;
    }
    outputDiv.innerHTML += '<p>GPU Adapter obtained!</p>';
    outputDiv.innerHTML += '<p>WebGPU is functional!</p>';
    const naive = await matrixMultiplicationCubicNaive();
    const trans = await matrixMultiplicationTranspose();
    outputDiv.innerHTML += `<p>naive result: ${naive.value}</p>`;
    outputDiv.innerHTML += `<p>naive time: ${naive.ms.toFixed(2)} ms</p>`;
    outputDiv.innerHTML += `<p>transpose result: ${trans.value}</p>`;
    outputDiv.innerHTML += `<p>transpose time: ${trans.ms.toFixed(2)} ms</p>`;
  } catch (error) {
    outputDiv.innerHTML += '<p>Error: ' + error + '</p>';
    console.error('WebGPU Error:', error);
  }
}
async function matrixMultiplicationCubicNaive() : Promise<{ value: number; ms: number }> {
  const size = 512; // Size of the square matrices
  // initialize matrices as proper 2D arrays filled with 1s
  let matrixA: number[][] = Array.from({ length: size }, () => Array(size).fill(1));
  let matrixB: number[][] = Array.from({ length: size }, () => Array(size).fill(1));

  // do cubic matrix multiplication
  let result: number[][] = Array.from({ length: size }, () => Array(size).fill(0));
  const start = performance.now();
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      for (let k = 0; k < size; k++) {
        result[i][j] += matrixA[i][k] * matrixB[k][j];
      }
    }
  }
  const end = performance.now();
  const ms = end - start;

  console.log('Matrix Mult Cubic Naive Result:', result[0][0], 'time(ms):', ms.toFixed(2)); // Should be 512
  return { value: result[0][0], ms };
}

async function transposeMatrix(matrix: number[][]): Promise<number[][]> {
    const rows = matrix.length;
    // Handle empty matrix case
    if (rows === 0) {
        return [];
    }
    const cols = matrix[0].length;

    // Create a new matrix with swapped dimensions
  // Initialize transposed with proper inner arrays
  const transposed: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0));

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            transposed[j][i] = matrix[i][j];
        }
    }

    return transposed;
}

async function matrixMultiplicationTranspose() : Promise<{ value: number; ms: number }> {
  const size = 512; // Size of the square matrices
  // initialize matrices as proper 2D arrays filled with 1s
  let matrixA: number[][] = Array.from({ length: size }, () => Array(size).fill(1));
  let matrixB: number[][] = Array.from({ length: size }, () => Array(size).fill(1));

  matrixB = await transposeMatrix(matrixB);

  // do cubic matrix multiplication (using transposed B for cache friendliness)
  let result: number[][] = Array.from({ length: size }, () => Array(size).fill(0));
  const start = performance.now();
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      for (let k = 0; k < size; k++) {
        result[i][j] += matrixA[i][k] * matrixB[j][k];
      }
    }
  }
  const end = performance.now();
  const ms = end - start;

  console.log('Matrix Mult Transpose Result:', result[0][0], 'time(ms):', ms.toFixed(2)); // Should be 512
  return { value: result[0][0], ms };
}

document.addEventListener('DOMContentLoaded', checkWebGPUSupport);

