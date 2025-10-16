document.addEventListener('DOMContentLoaded', () => {
    // Get references to all the necessary HTML elements
    const valueA_input = document.getElementById('valueA');
    const valueB_input = document.getElementById('valueB');
    const valueC_input = document.getElementById('valueC');
    const maxRange_input = document.getElementById('maxRange');
    const numOutputs_input = document.getElementById('numOutputs');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const outputArea = document.getElementById('outputArea');

    generateBtn.addEventListener('click', generateValues);
    downloadBtn.addEventListener('click', downloadResults);

    function generateValues() {
        // --- 1. Get and Validate Inputs using parseFloat ---
        const A = parseFloat(valueA_input.value);
        const B = parseFloat(valueB_input.value);
        const C = parseFloat(valueC_input.value);
        // Max and N should still be integers for the logic to work properly
        const max = parseInt(maxRange_input.value); 
        const N = parseInt(numOutputs_input.value);

        if (isNaN(A) || isNaN(B) || isNaN(C) || isNaN(max) || isNaN(N) || max <= 0 || N <= 0) {
            outputArea.value = "Error: Please enter valid numbers in all fields.";
            downloadBtn.disabled = true;
            return;
        }

        if (N > max) {
            outputArea.value = "Error: Number of outputs (N) cannot be greater than the max range.";
            downloadBtn.disabled = true;
            return;
        }
        
        // --- 2. Subdivide the Range Deterministically ---
        const part_size = Math.floor(max / N);
        const remainder = max % N;

        const subdivisionSizes = new Array(N).fill(part_size);

        // The offset calculation now uses floats, which is fine
        const offset = (A + B + C) * 98765;
        const start_index = Math.floor(offset) % N;

        for (let i = 0; i < remainder; i++) {
            const indexToIncrement = (start_index + i) % N;
            subdivisionSizes[indexToIncrement]++;
        }

        // --- 3 & 4. Generate Seeds and Map to Subdivisions ---
        const finalOutputs = [];
        let currentStart = 1;

        for (let i = 0; i < N; i++) {
            // Seed calculation now works with decimals
            const seed = (A * (1005703 + i * 173) + B * (285209 + i * 157) + C * (309647 + i * 1879));
            
            const sizeOfThisPart = subdivisionSizes[i];
            // We use Math.floor on the seed to ensure the result is an integer index
            const value_in_part = Math.floor(seed) % sizeOfThisPart;
            const finalValue = currentStart + value_in_part;

            finalOutputs.push(finalValue);
            currentStart += sizeOfThisPart;
        }

        outputArea.value = finalOutputs.join('\n');
        downloadBtn.disabled = false;
    }
    
    function downloadResults() {
        // This function does not need changes
        const textToSave = outputArea.value;
        if (!textToSave || textToSave.startsWith("Error:")) {
            return;
        }
        const blob = new Blob([textToSave], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'generated_values.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    }
});
