document.addEventListener('DOMContentLoaded', () => {
    const emergencyBtns = document.querySelectorAll('.emergency-btn');
    if (emergencyBtns.length > 0) {
        emergencyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const symptom = btn.getAttribute('data-symptom');
                window.location.href = `/chatbot?message=Symptoms of ${symptom} sugar level`;
            });
        });
    }
});
