const API_BASE = "http://localhost:4000";

// ---------- CONTACT FORM ----------
const form = document.getElementById("contactForm");
const formMsg = document.getElementById("formMsg");

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name")?.value.trim() || "";
        const email = document.getElementById("email")?.value.trim() || "";
        const service = document.getElementById("service")?.value.trim() || "";
        const message = document.getElementById("message")?.value.trim() || "";

        if (!name || !email || !service || !message) {
            if (formMsg) {
                formMsg.textContent = "Por favor completa todos los campos.";
                formMsg.style.color = "crimson";
            }
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.textContent : null;
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Enviando..."; }
        if (formMsg) { formMsg.textContent = ""; }

        try {
            const res = await fetch(`${API_BASE}/api/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, service, message })
            });

            const data = await res.json().catch(()=>null);

            if (!res.ok) {
                const errMsg = data?.error || `Error al enviar (status ${res.status})`;
                if (formMsg) { formMsg.textContent = errMsg; formMsg.style.color = "crimson"; }
            } else {
                const okMsg = data?.message || "Gracias, tu solicitud ha sido enviada.";
                if (formMsg) { formMsg.textContent = okMsg; formMsg.style.color = "green"; }
                form.reset();
            }
        } catch (err) {
            console.error("Error de red al enviar formulario:", err);
            if (formMsg) { formMsg.textContent = "Error de red al enviar el formulario."; formMsg.style.color = "crimson"; }
        } finally {
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalBtnText; }
        }
    });
} else {
    console.warn("No se encontró el formulario #contactForm en el DOM.");
}

