async function findCrane() {
    const code = document.getElementById('crane-code').value.trim();
    if (!code) return alert('Enter a crane code!');

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = "Loading...";

    try {
        const res = await fetch(`/api/crane/${code}`);
        if(!res.ok) throw new Error('Crane not found');

        const crane = await res.json();
        resultDiv.innerHTML = `
            <h3>${crane.model}</h3>
            <p>${crane.description}</p>
            <p>Severity: ${crane.severity}</p>
            <h4>Steps:</h4>
            <ul>
                ${crane.steps.map(step => `<li><b>${step.title}</b>: ${step.description}</li>`).join('')}
            </ul>
        `;
    } catch(err) {
        resultDiv.innerText = err.message;
    }
}
