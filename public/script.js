async function findCrane() {
    const code = document.getElementById('crane-code').value;
    if (!code) return alert('Enter a crane code!');
    try {
        const res = await fetch(`/api/crane/${code}`);
        if (!res.ok) throw new Error('Crane not found');
        const crane = await res.json();
        document.getElementById('result').innerHTML = `
            <h3>${crane.model}</h3>
            <p>${crane.description}</p>
            <p>Severity: ${crane.severity}</p>
        `;
    } catch (error) {
        document.getElementById('result').innerText = error.message;
    }
}
