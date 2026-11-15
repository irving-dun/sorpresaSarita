document.addEventListener("DOMContentLoaded", () => {
    // === REPRODUCTOR DE FLORES ASCII ===
    const video = document.getElementById("video-fondo");
    const pantalla = document.getElementById("pantalla-ascii");
    
    fetch("animacion.json")
        .then(res => res.json())
        .then(frames => {
            if (frames.length === 0) return;
            
            function actualizarFrame() {
                const duracion = video.duration || 1.9;
                let frameIndex = Math.floor((video.currentTime / duracion) * frames.length);
                if (frameIndex >= frames.length) frameIndex = frames.length - 1;
                pantalla.textContent = frames[frameIndex];
                requestAnimationFrame(actualizarFrame);
            }
            video.addEventListener('play', () => requestAnimationFrame(actualizarFrame));
            if (!video.paused) requestAnimationFrame(actualizarFrame);
        })
        .catch(err => console.error("Error cargando flores ASCII:", err));


    // === SISTEMA MÁGICO DE PARTÍCULAS (Con siluetas reales) ===
    const canvas = document.getElementById("canvas-brillos");
    const ctx = canvas.getContext("2d");

    let particles = [];
    
    function resizeCanvas() {
        const rect = canvas.parentNode.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    class Particula {
        constructor() {
            this.reset();
            this.y = Math.random() * canvas.height; 
        }

        reset() {
            this.x = Math.random() * canvas.width;
            
            const tipos = ["petalo", "petalo", "petalo", "petalo", "hoja", "hoja", "estrella", "estrella", "polvo", "polvo"];
            this.tipo = tipos[Math.floor(Math.random() * tipos.length)];
            
            this.angle = Math.random() * Math.PI * 2;
            this.spin = (Math.random() - 0.5) * 0.04;
            this.sway = Math.random() * Math.PI * 2;
            this.swaySpeed = Math.random() * 0.02 + 0.01; 

            if (this.tipo === "petalo") {
                const coloresPetalo = ["#ffb7c5", "#ffc2d1", "#fff0f3", "#ffccd5"];
                this.color = coloresPetalo[Math.floor(Math.random() * coloresPetalo.length)];
                // Aumentamos el tamaño para que se aprecie la forma (6 a 12 píxeles)
                this.size = Math.random() * 6 + 6; 
                this.speedY = Math.random() * 0.8 + 0.5; 
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.6 + 0.4;
                this.fadeSpeed = 0; 
                this.y = -20; 
                
            } else if (this.tipo === "hoja") {
                const coloresHoja = ["#9dbb9c", "#a8c3a6", "#8fa98e"];
                this.color = coloresHoja[Math.floor(Math.random() * coloresHoja.length)];
                // Tamaño visible para las hojas (5 a 10 píxeles)
                this.size = Math.random() * 5 + 5;
                this.speedY = Math.random() * 1 + 0.6; 
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.5 + 0.3;
                this.fadeSpeed = 0;
                this.y = -20;
                
            } else {
                const coloresBrillo = ["#ffc2d1", "#ffffff", "#ffe5b4"];
                this.color = coloresBrillo[Math.floor(Math.random() * coloresBrillo.length)];
                this.size = Math.random() * 2 + 0.5;
                this.speedY = -Math.random() * 0.6 - 0.2; 
                this.speedX = (Math.random() - 0.5) * 0.4;
                this.opacity = Math.random() * 0.6 + 0.1;
                this.fadeSpeed = Math.random() * 0.005 + 0.002;
                this.y = canvas.height + 10; 
            }
        }

        update() {
            if (this.tipo === "petalo" || this.tipo === "hoja") {
                this.x += Math.sin(this.sway) * 0.8 + this.speedX;
                this.sway += this.swaySpeed;
                this.angle += this.spin;
            } else {
                this.x += this.speedX;
            }
            
            this.y += this.speedY;
            if (this.fadeSpeed > 0) this.opacity -= this.fadeSpeed;

            if (this.opacity <= 0 || this.y > canvas.height + 30 || this.y < -30 || this.x < -30 || this.x > canvas.width + 30) {
                this.reset();
            }
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);

            if (this.tipo === "estrella" || this.tipo === "polvo") {
                ctx.shadowBlur = this.tipo === "estrella" ? 10 : 3;
                ctx.shadowColor = this.color;
                
                if (this.tipo === "estrella") {
                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(-5, 0); ctx.lineTo(5, 0);
                    ctx.moveTo(0, -5); ctx.lineTo(0, 5);
                    ctx.stroke();
                } else {
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else if (this.tipo === "petalo") {
                // Silueta de flor de cerezo con la hendidura en la punta ancha
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.moveTo(0, -this.size); 
                ctx.bezierCurveTo(this.size * 1.5, -this.size * 0.5, this.size, this.size, this.size * 0.2, this.size); 
                ctx.lineTo(0, this.size * 0.7); // La hendidura
                ctx.lineTo(-this.size * 0.2, this.size);
                ctx.bezierCurveTo(-this.size, this.size, -this.size * 1.5, -this.size * 0.5, 0, -this.size);
                ctx.fill();
            } else if (this.tipo === "hoja") {
                // Silueta asimétrica de hoja con punta
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.moveTo(0, -this.size);
                ctx.quadraticCurveTo(this.size * 1.2, 0, 0, this.size);
                ctx.quadraticCurveTo(-this.size * 0.5, 0, 0, -this.size);
                ctx.fill();
                
                // Agregamos una nervadura sutil (la línea del centro)
                ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(0, -this.size);
                ctx.lineTo(0, this.size);
                ctx.stroke();
            }
            ctx.restore();
        }
    }

    const numeroParticulas = 65; // Bajamos ligeramente la cantidad para no saturar con los nuevos tamaños
    for (let i = 0; i < numeroParticulas; i++) {
        particles.push(new Particula());
    }

    function animar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animar);
    }
    
    animar();
});