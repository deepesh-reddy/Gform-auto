document.addEventListener('DOMContentLoaded', () => {
    const formLinkForm = document.getElementById('formLinkForm');
    const formLinkInput = document.getElementById('input');
    const resultDiv = document.getElementById('result');
    const copyText = document.getElementById('copyText');
    const copyButton = document.getElementById('copyButton');

    formLinkForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formLink = formLinkInput.value;
        
        resultDiv.textContent = 'Processing...';
        
        try {
            const response = await fetch('/process-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ formLink }),
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            resultDiv.textContent = data.results.join('\n\n');
        } catch (error) {
            console.error('Error:', error);
            resultDiv.textContent = 'An error occurred while processing the form.(May be because of too many requests from a single api)';
        }
    });

    copyButton.addEventListener('click', () => {
        copyText.select();
        document.execCommand('copy');
        alert('Text copied to clipboard!');
    });
});