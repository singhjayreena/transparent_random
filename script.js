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

    // Attach event listeners
    generateBtn.addEventListener('click', generateValues);
    downloadBtn.addEventListener('click', downloadResults);

    function generateValues() {
        try {
            // --- 1. Get and Validate Inputs using BigInt ---
            // BigInt() will throw an error if the input is not a whole number (e.g., contains "."),
            // which we catch at the end of this function.
            const A = BigInt(valueA_input.value);
            const B = BigInt(valueB_input.value);
            const C = BigInt(valueC_input.value);
            const max = BigInt(maxRange_input.value);
            const N = BigInt(numOutputs_input.value);

            // Validate that inputs are positive. Note the 'n' suffix for BigInt literals.
            if (max <= 0n || N <= 0n) {
                outputArea.value = "Error: Max Range and Number of Outputs must be positive whole numbers.";
                downloadBtn.disabled = true;
                return;
            }

            // Validate that we can actually generate N unique numbers within the range.
            if (N > max) {
                outputArea.value = "Error: Number of outputs (N) cannot be greater than the max range.";
                downloadBtn.disabled = true;
                return;
            }
            
            // --- 2. Subdivide the Range Deterministically ---
            const part_size = max / N; // BigInt division automatically floors the result.
            const remainder = max % N;

            // Create an array to hold the size of each subdivision.
            // Array indexes MUST be regular Numbers, so we convert N back with Number(N).
            const subdivisionSizes = new Array(Number(N)).fill(part_size);

            // Use BigInts for all calculation parts to maintain precision.
            const offset = (A + B + C) * 98765n; 
            const start_index = offset % N;

            // Distribute the remainder values across the subdivisions one by one.
            // The loop counter 'i' must also be a BigInt.
            for (let i = 0n; i < remainder; i++) {
                const indexToIncrement = (start_index + i) % N;
                // We MUST convert the BigInt index back to a Number to access the array.
                // We also MUST use '+= 1n' because the '++' operator doesn't work on BigInts.
                subdivisionSizes[Number(indexToIncrement)] += 1n;
            }

            // --- 3 & 4. Generate Seeds and Map to Subdivisions ---
            const finalOutputs = [];
            let currentStart = 1n; // The range starts from 1.

            // Loop N times to generate N output values. The counter 'i' is a BigInt.
            for (let i = 0n; i < N; i++) {
                // Generate a unique, deterministic seed for this output.
                // All numeric literals in the calculation must have the 'n' suffix.
                const seed = (A * (1005703n + i * 173n) + B * (285209n + i * 157n) + C * (309647n + i * 1879n));
                
                // Get the size of the current subdivision. Convert 'i' to Number for indexing.
                const sizeOfThisPart = subdivisionSizes[Number(i)];
                
                // This check prevents a "division by zero" error, though it shouldn't happen with the N > max check.
                if (sizeOfThisPart === 0n) continue;

                // Map the seed to a value within the current subdivided part.
                const value_in_part = seed % sizeOfThisPart;
                const finalValue = currentStart + value_in_part;

                finalOutputs.push(finalValue);

                // The start of the next part is the end of the current one.
                currentStart += sizeOfThisPart;
            }

            // --- 5. Display Output ---
            // .join() automatically converts the BigInt values to strings for display.
            outputArea.value = finalOutputs.join('\n');
            downloadBtn.disabled = false; // Enable the download button

        } catch (error) {
            // This block will catch any errors, including when a user enters
            // a decimal or non-numeric text into an input field.
            outputArea.value = "Error: Please enter valid whole numbers in all fields.";
            console.error("An error occurred:", error); // Log the actual error for debugging
            downloadBtn.disabled = true;
        }
    }

    function downloadResults() {
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
