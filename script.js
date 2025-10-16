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

    /**
     * Creates a highly obfuscated, non-reversible seed from the inputs and an index.
     * This uses 5 layers of information loss to prevent reverse-engineering.
     * @param {BigInt} valA - The first input seed.
     * @param {BigInt} valB - The second input seed.
     * @param {BigInt} valC - The third input seed.
     * @param {BigInt} index - The current loop iteration index.
     * @returns {BigInt} A secure, positive BigInt seed.
     */
    function createObfuscatedSeed(valA, valB, valC, index) {
        // Initial Combination with prime multipliers
        let combined = (valA * 31n + valB * 37n + valC * 41n) + 104729n; // 104729 is a large prime

        // Layer 1: Bitwise Scrambling (XOR and Shift)
        // This scrambles the bits of the number based on its own structure.
        combined = combined ^ (combined >> 7n);

        // Layer 2: Modulo with a Dynamic Value
        // Use a modulo derived from the inputs. Add 1n to prevent a modulo-by-zero error.
        const dynamicMod = (valA + valB + 1n);
        combined = combined % dynamicMod;

        // Layer 3: Iteration-Dependent Mixing
        // Mix the loop index 'i' into the calculation in a non-linear way.
        combined = (combined + index) * (index + 211n); // 211 is a prime

        // Layer 4: Cross-Variable Influence
        // Shift one input value by an amount determined by the lower bits of another.
        // (valC & 15n) gives a value from 0 to 15 based on C's last 4 bits.
        // Clamp the shift amount to prevent excessive shifts on large BigInt values
        const shiftAmount = Number(valC & 15n); // Convert to number for safe shifting
        const crossInfluence = valB >> BigInt(shiftAmount);
        combined = combined + crossInfluence;

        // Layer 5: Final Hashing with Large Primes
        // Multiply by large primes and XOR-shift again to finalize the obfuscation.
        combined = combined * 982451653n ^ (combined >> 13n);
        
        // Ensure the final result is always a positive number.
        return combined < 0n ? -combined : combined;
    }

    function generateValues() {
        try {
            const A = BigInt(valueA_input.value);
            const B = BigInt(valueB_input.value);
            const C = BigInt(valueC_input.value);
            const max = BigInt(maxRange_input.value);
            const N = BigInt(numOutputs_input.value);

            if (max <= 0n || N <= 0n) {
                outputArea.value = "Error: Max Range and Number of Outputs must be positive whole numbers.";
                downloadBtn.disabled = true;
                return;
            }

            if (N > max) {
                outputArea.value = "Error: Number of outputs (N) cannot be greater than the max range.";
                downloadBtn.disabled = true;
                return;
            }
            
            const part_size = max / N;
            const remainder = max % N;
            const subdivisionSizes = new Array(Number(N)).fill(part_size);
            const offset = (A + B + C) * 98765n; 
            const start_index = offset % N;

            for (let i = 0n; i < remainder; i += 1n) {
                const indexToIncrement = (start_index + i) % N;
                subdivisionSizes[Number(indexToIncrement)] += 1n;
            }

            const finalOutputs = [];
            let currentStart = 1n;

            // Fixed: Use consistent BigInt loop variable with i += 1n
            for (let i = 0n; i < N; i += 1n) {
                // --- MODIFIED PART ---
                // Call the new secure seed generation function
                const seed = createObfuscatedSeed(A, B, C, i);
                
                const sizeOfThisPart = subdivisionSizes[Number(i)];
                
                if (sizeOfThisPart === 0n) continue;

                const value_in_part = seed % sizeOfThisPart;
                const finalValue = currentStart + value_in_part;

                finalOutputs.push(finalValue);
                currentStart += sizeOfThisPart;
            }

            // Handle edge case: N = 1 (single winner)
            if (finalOutputs.length === 0) {
                outputArea.value = "Error: No valid outputs generated. Please check your inputs.";
                downloadBtn.disabled = true;
                return;
            }

            outputArea.value = finalOutputs.join('\n');
            downloadBtn.disabled = false;

        } catch (error) {
            outputArea.value = "Error: Please enter valid whole numbers in all fields.";
            console.error("An error occurred:", error);
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
