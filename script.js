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

    // Attach event listener to the "Generate" button
    generateBtn.addEventListener('click', generateValues);

    // Attach event listener to the "Download" button
    downloadBtn.addEventListener('click', downloadResults);

    function generateValues() {
        // --- 1. Get and Validate Inputs ---
        const A = parseInt(valueA_input.value);
        const B = parseInt(valueB_input.value);
        const C = parseInt(valueC_input.value);
        const max = parseInt(maxRange_input.value);
        const N = parseInt(numOutputs_input.value);

        if (isNaN(A) || isNaN(B) || isNaN(C) || isNaN(max) || isNaN(N) || max <= 0 || N <= 0) {
            outputArea.value = "Error: Please enter valid, positive numbers in all fields.";
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

        // Create an array to hold the size of each subdivision
        const subdivisionSizes = new Array(N).fill(part_size);

        // Deterministically calculate an offset to distribute the remainder
        const offset = (A + B + C) * 98765;
        const start_index = offset % N;

        // Distribute the remainder values across the subdivisions
        for (let i = 0; i < remainder; i++) {
            const indexToIncrement = (start_index + i) % N;
            subdivisionSizes[indexToIncrement]++;
        }

        // --- 3 & 4. Generate Seeds and Map to Subdivisions ---
        const finalOutputs = [];
        let currentStart = 1; // The range starts from 1

        for (let i = 0; i < N; i++) {
            // 3. Generate a unique, deterministic seed for this output
            // Using different large, prime-like multipliers and the index 'i' ensures variety
            const seed = (A * (1005703 + i * 173) + B * (285209 + i * 157) + C * (309647 + i * 1879));
            
            // 4. Map the seed to the current subdivided part
            const sizeOfThisPart = subdivisionSizes[i];
            const value_in_part = seed % sizeOfThisPart; // Find a position within the sub-range
            const finalValue = currentStart + value_in_part; // Add to the start of the sub-range

            finalOutputs.push(finalValue);

            // Update the starting point for the next subdivision
            currentStart += sizeOfThisPart;
        }

        // --- 6. Output to display ---
        outputArea.value = finalOutputs.join('\n');
        downloadBtn.disabled = false; // Enable the download button
    }

    function downloadResults() {
        const textToSave = outputArea.value;

        // If there's nothing to save, exit
        if (!textToSave || textToSave.startsWith("Error:")) {
            return;
        }

        // Create a blob (a file-like object) from the text
        const blob = new Blob([textToSave], { type: 'text/plain' });

        // Create a temporary link element
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'generated_values.txt'; // The default filename for the download

        // Programmatically click the link to trigger the download
        document.body.appendChild(a);
        a.click();

        // Clean up by removing the temporary link
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    }
});
