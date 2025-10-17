// Global variables
let radarActive = false;
let radarAngle = 15;
let radarDirection = 1;
let animationId;
let particleAnimationId;
let detectedObjects = [];
let maxRange = 150;
let particles = [];
let sweepTrail = [];

// DOM elements
const radarCanvas = document.getElementById('radarCanvas');
const ctx = radarCanvas.getContext('2d');
const radarToggle = document.getElementById('radarToggle');
const clearDetections = document.getElementById('clearDetections');
const sensitivitySlider = document.getElementById('sensitivity');
const sensitivityValue = document.getElementById('sensitivity-value');
const distanceReading = document.getElementById('distance-reading');
const angleReading = document.getElementById('angle-reading');
const objectCount = document.getElementById('object-count');
const detectionLog = document.getElementById('detection-log');
const loadingScreen = document.getElementById('loading-screen');
const radarStartup = document.getElementById('radar-startup');
const particlesBackground = document.getElementById('particles-background');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeLoadingScreen();
    setTimeout(() => {
        hideLoadingScreen();
        initializeParticles();
        initializeRadar();
        initializeTabs();
        initializeControls();
        initializeScrollButtons();
        initializeScrollAnimations();
        initializeTypingAnimation();
        resizeCanvas();
        startParticleAnimation();
    }, 2000);
});

// Window resize handler
window.addEventListener('resize', resizeCanvas);

// Loading Screen
function initializeLoadingScreen() {
    loadingScreen.classList.remove('hidden');
}

function hideLoadingScreen() {
    loadingScreen.classList.add('hidden');
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 500);
}

// Particle System
function initializeParticles() {
    const particleCount = 100;
    particles = [];
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.2,
            color: ['#00FF9F', '#00D1FF', '#FF6B6B', '#8B5CF6'][Math.floor(Math.random() * 4)]
        });
    }
}

function startParticleAnimation() {
    function animateParticles() {
        updateParticles();
        drawParticles();
        particleAnimationId = requestAnimationFrame(animateParticles);
    }
    animateParticles();
}

function updateParticles() {
    particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap around screen
        if (particle.x > window.innerWidth) particle.x = 0;
        if (particle.x < 0) particle.x = window.innerWidth;
        if (particle.y > window.innerHeight) particle.y = 0;
        if (particle.y < 0) particle.y = window.innerHeight;
        
        // Subtle opacity animation
        particle.opacity += (Math.random() - 0.5) * 0.02;
        particle.opacity = Math.max(0.1, Math.min(0.7, particle.opacity));
    });
}

function drawParticles() {
    // Create canvas for particles if it doesn't exist
    let particleCanvas = document.getElementById('particleCanvas');
    if (!particleCanvas) {
        particleCanvas = document.createElement('canvas');
        particleCanvas.id = 'particleCanvas';
        particleCanvas.style.position = 'fixed';
        particleCanvas.style.top = '0';
        particleCanvas.style.left = '0';
        particleCanvas.style.width = '100%';
        particleCanvas.style.height = '100%';
        particleCanvas.style.pointerEvents = 'none';
        particleCanvas.style.zIndex = '-1';
        particleCanvas.width = window.innerWidth;
        particleCanvas.height = window.innerHeight;
        document.body.appendChild(particleCanvas);
    }
    
    const pCtx = particleCanvas.getContext('2d');
    pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    
    particles.forEach(particle => {
        pCtx.save();
        pCtx.globalAlpha = particle.opacity;
        pCtx.fillStyle = particle.color;
        pCtx.shadowBlur = 10;
        pCtx.shadowColor = particle.color;
        pCtx.beginPath();
        pCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        pCtx.fill();
        pCtx.restore();
    });
    
    // Draw connections between nearby particles
    particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(otherParticle => {
            const distance = Math.sqrt(
                Math.pow(particle.x - otherParticle.x, 2) + 
                Math.pow(particle.y - otherParticle.y, 2)
            );
            
            if (distance < 100) {
                pCtx.save();
                pCtx.globalAlpha = (1 - distance / 100) * 0.2;
                pCtx.strokeStyle = '#00FF9F';
                pCtx.lineWidth = 1;
                pCtx.beginPath();
                pCtx.moveTo(particle.x, particle.y);
                pCtx.lineTo(otherParticle.x, otherParticle.y);
                pCtx.stroke();
                pCtx.restore();
            }
        });
    });
}

// Typing Animation
function initializeTypingAnimation() {
    const heroTitle = document.getElementById('hero-title');
    const typingText = heroTitle.querySelector('.typing-text');
    const text = 'Arduino Ultrasonic Radar';
    let index = 0;
    
    typingText.textContent = '';
    
    function typeWriter() {
        if (index < text.length) {
            typingText.textContent += text.charAt(index);
            index++;
            setTimeout(typeWriter, 100);
        } else {
            // Remove cursor after typing
            setTimeout(() => {
                typingText.style.borderRight = 'none';
            }, 1000);
        }
    }
    
    setTimeout(typeWriter, 1000);
}

// Scroll Animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 1s ease-out forwards';
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    const elementsToAnimate = document.querySelectorAll('.feature-card, .media-card, .glass-card');
    elementsToAnimate.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        observer.observe(el);
    });
}

// Canvas setup and resize
function resizeCanvas() {
    const container = radarCanvas.parentElement;
    const size = Math.min(container.clientWidth - 48, 450);
    radarCanvas.width = size;
    radarCanvas.height = size;
    radarCanvas.style.width = size + 'px';
    radarCanvas.style.height = size + 'px';
    
    // Resize particle canvas
    const particleCanvas = document.getElementById('particleCanvas');
    if (particleCanvas) {
        particleCanvas.width = window.innerWidth;
        particleCanvas.height = window.innerHeight;
    }
}

// Initialize radar
function initializeRadar() {
    drawRadar();
}

// Initialize scroll buttons
function initializeScrollButtons() {
    const heroButtons = document.querySelectorAll('.hero-buttons .btn');
    heroButtons.forEach(button => {
        button.addEventListener('click', function() {
            const text = this.querySelector('.btn-text').textContent.trim();
            if (text === 'Live Demo') {
                scrollToSection('radar-demo');
            } else if (text === 'View Code') {
                scrollToSection('code-section');
            } else if (text === 'Watch Demo') {
                scrollToSection('media-gallery');
            }
        });
    });
}

// Initialize tab functionality
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            button.classList.add('active');
            const targetContent = document.getElementById(tabId);
            targetContent.classList.add('active');
            
            // Trigger slide animation
            targetContent.style.animation = 'slideIn 0.5s ease-out';
        });
    });
}

// Initialize controls
function initializeControls() {
    radarToggle.addEventListener('click', toggleRadar);
    clearDetections.addEventListener('click', clearAllDetections);
    sensitivitySlider.addEventListener('input', updateSensitivity);
}

// Toggle radar on/off
function toggleRadar() {
    radarActive = !radarActive;
    
    if (radarActive) {
        radarToggle.querySelector('.btn-text').textContent = 'Stop Radar';
        radarToggle.classList.remove('btn--primary');
        radarToggle.classList.add('btn--secondary');
        showRadarStartup();
        setTimeout(() => {
            hideRadarStartup();
            startRadarAnimation();
        }, 2000);
    } else {
        radarToggle.querySelector('.btn-text').textContent = 'Start Radar';
        radarToggle.classList.remove('btn--secondary');
        radarToggle.classList.add('btn--primary');
        stopRadarAnimation();
    }
}

// Radar startup animation
function showRadarStartup() {
    radarStartup.classList.add('active');
}

function hideRadarStartup() {
    radarStartup.classList.remove('active');
}

// Start radar animation
function startRadarAnimation() {
    sweepTrail = [];
    
    function animate() {
        if (!radarActive) return;
        
        updateRadarPosition();
        updateSweepTrail();
        simulateDetection();
        drawRadar();
        updateDisplays();
        
        animationId = requestAnimationFrame(animate);
    }
    animate();
}

// Stop radar animation
function stopRadarAnimation() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    sweepTrail = [];
    drawRadar();
}

// Update radar sweep position
function updateRadarPosition() {
    radarAngle += radarDirection * 1.5;
    
    if (radarAngle >= 165) {
        radarDirection = -1;
        radarAngle = 165;
    } else if (radarAngle <= 15) {
        radarDirection = 1;
        radarAngle = 15;
    }
}

// Update sweep trail
function updateSweepTrail() {
    sweepTrail.push({
        angle: radarAngle,
        opacity: 1,
        timestamp: Date.now()
    });
    
    // Remove old trail points
    const currentTime = Date.now();
    sweepTrail = sweepTrail.filter(point => {
        const age = currentTime - point.timestamp;
        return age < 1000; // Keep trail for 1 second
    });
    
    // Update opacity based on age
    sweepTrail.forEach(point => {
        const age = currentTime - point.timestamp;
        point.opacity = Math.max(0, 1 - (age / 1000));
    });
}

// Simulate object detection
function simulateDetection() {
    // Random chance of detecting an object
    if (Math.random() < 0.08) {
        const distance = Math.random() * maxRange + 20;
        const angleVariation = Math.random() * 8 - 4;
        const detectedAngle = Math.max(15, Math.min(165, radarAngle + angleVariation));
        
        const detection = {
            angle: detectedAngle,
            distance: distance,
            timestamp: new Date(),
            id: Date.now() + Math.random(),
            intensity: Math.random() * 0.5 + 0.5,
            ripples: []
        };
        
        detectedObjects.push(detection);
        
        // Limit number of objects
        if (detectedObjects.length > 25) {
            detectedObjects.shift();
        }
        
        // Add to log
        addToDetectionLog(detection);
        
        // Create ripple effect
        createRippleEffect(detection);
    }
    
    // Remove old detections
    const currentTime = Date.now();
    detectedObjects = detectedObjects.filter(obj => {
        return (currentTime - obj.timestamp.getTime()) < 15000; // Keep for 15 seconds
    });
    
    // Update ripple effects
    detectedObjects.forEach(obj => {
        obj.ripples = obj.ripples.filter(ripple => {
            ripple.radius += ripple.speed;
            ripple.opacity -= ripple.decay;
            return ripple.opacity > 0;
        });
    });
}

// Create ripple effect for detected objects
function createRippleEffect(detection) {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            detection.ripples.push({
                radius: 0,
                speed: 2,
                opacity: 0.8,
                decay: 0.02
            });
        }, i * 200);
    }
}

// Enhanced radar drawing
function drawRadar() {
    const centerX = radarCanvas.width / 2;
    const centerY = radarCanvas.height - 20;
    const maxRadius = Math.min(centerX, centerY - 20);
    
    // Clear canvas with fade effect
    ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
    ctx.fillRect(0, 0, radarCanvas.width, radarCanvas.height);
    
    // Set radar background
    ctx.fillStyle = '#0A0A0F';
    ctx.fillRect(0, 0, radarCanvas.width, radarCanvas.height);
    
    // Draw radar grid with glow
    drawEnhancedRadarGrid(centerX, centerY, maxRadius);
    
    // Draw sweep trail
    if (radarActive && sweepTrail.length > 0) {
        drawSweepTrail(centerX, centerY, maxRadius);
    }
    
    // Draw detected objects with effects
    drawEnhancedDetectedObjects(centerX, centerY, maxRadius);
    
    // Draw current sweep line
    if (radarActive) {
        drawEnhancedSweepLine(centerX, centerY, maxRadius);
    }
    
    // Draw range labels with glow
    drawEnhancedRangeLabels(centerX, centerY, maxRadius);
}

// Enhanced radar grid with glowing effects
function drawEnhancedRadarGrid(centerX, centerY, maxRadius) {
    // Glowing concentric circles
    for (let i = 1; i <= 4; i++) {
        const radius = (maxRadius / 4) * i;
        
        ctx.strokeStyle = `rgba(0, 255, 159, ${0.3 + (i * 0.1)})`;
        ctx.lineWidth = 1;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00FF9F';
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI, true);
        ctx.stroke();
        
        // Add pulsing effect to outer ring
        if (i === 4) {
            ctx.strokeStyle = `rgba(0, 255, 159, ${0.5 + Math.sin(Date.now() * 0.005) * 0.2})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
    
    // Angle lines with gradient
    ctx.shadowBlur = 5;
    for (let angle = 15; angle <= 165; angle += 30) {
        const rad = (angle * Math.PI) / 180;
        const gradient = ctx.createLinearGradient(
            centerX, centerY,
            centerX + Math.cos(Math.PI - rad) * maxRadius,
            centerY - Math.sin(Math.PI - rad) * maxRadius
        );
        gradient.addColorStop(0, 'rgba(0, 255, 159, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 255, 159, 0.1)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(Math.PI - rad) * maxRadius,
            centerY - Math.sin(Math.PI - rad) * maxRadius
        );
        ctx.stroke();
    }
    
    // Outer arc with enhanced glow
    ctx.strokeStyle = '#00FF9F';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00FF9F';
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius, 0, Math.PI, true);
    ctx.stroke();
    
    ctx.shadowBlur = 0;
}

// Draw sweep trail
function drawSweepTrail(centerX, centerY, maxRadius) {
    sweepTrail.forEach(point => {
        const rad = (point.angle * Math.PI) / 180;
        const gradient = ctx.createLinearGradient(
            centerX, centerY,
            centerX + Math.cos(Math.PI - rad) * maxRadius,
            centerY - Math.sin(Math.PI - rad) * maxRadius
        );
        gradient.addColorStop(0, `rgba(0, 255, 159, ${point.opacity * 0.3})`);
        gradient.addColorStop(1, `rgba(0, 255, 159, ${point.opacity * 0.05})`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(Math.PI - rad) * maxRadius,
            centerY - Math.sin(Math.PI - rad) * maxRadius
        );
        ctx.stroke();
    });
}

// Enhanced detected objects with ripples
function drawEnhancedDetectedObjects(centerX, centerY, maxRadius) {
    const currentTime = Date.now();
    
    detectedObjects.forEach(obj => {
        const age = currentTime - obj.timestamp.getTime();
        const alpha = Math.max(0, 1 - (age / 15000));
        const intensity = obj.intensity;
        
        const rad = (obj.angle * Math.PI) / 180;
        const distance = (obj.distance / maxRange) * maxRadius;
        const x = centerX + Math.cos(Math.PI - rad) * distance;
        const y = centerY - Math.sin(Math.PI - rad) * distance;
        
        // Draw ripple effects
        obj.ripples.forEach(ripple => {
            ctx.strokeStyle = `rgba(0, 209, 255, ${ripple.opacity * 0.5})`;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#00D1FF';
            ctx.beginPath();
            ctx.arc(x, y, ripple.radius, 0, 2 * Math.PI);
            ctx.stroke();
        });
        
        // Main object dot with pulsing effect
        const pulseScale = 1 + Math.sin(Date.now() * 0.01 + obj.id) * 0.3;
        const size = (4 + intensity * 3) * pulseScale;
        
        // Outer glow
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
        glowGradient.addColorStop(0, `rgba(0, 255, 159, ${alpha * 0.8})`);
        glowGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Main dot
        ctx.fillStyle = `rgba(0, 255, 159, ${alpha})`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00FF9F';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fill();
        
        // Inner bright core
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.4, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    ctx.shadowBlur = 0;
}

// Enhanced sweep line with gradient trail
function drawEnhancedSweepLine(centerX, centerY, maxRadius) {
    const rad = (radarAngle * Math.PI) / 180;
    
    // Main sweep line with enhanced gradient
    const gradient = ctx.createLinearGradient(
        centerX, centerY,
        centerX + Math.cos(Math.PI - rad) * maxRadius,
        centerY - Math.sin(Math.PI - rad) * maxRadius
    );
    gradient.addColorStop(0, 'rgba(0, 255, 159, 1)');
    gradient.addColorStop(0.3, 'rgba(0, 255, 159, 0.8)');
    gradient.addColorStop(0.7, 'rgba(0, 255, 159, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 255, 159, 0.1)');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00FF9F';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
        centerX + Math.cos(Math.PI - rad) * maxRadius,
        centerY - Math.sin(Math.PI - rad) * maxRadius
    );
    ctx.stroke();
    
    // Sweep area with fade
    const sweepGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
    sweepGradient.addColorStop(0, 'rgba(0, 255, 159, 0.15)');
    sweepGradient.addColorStop(0.5, 'rgba(0, 255, 159, 0.08)');
    sweepGradient.addColorStop(1, 'rgba(0, 255, 159, 0.02)');
    
    ctx.fillStyle = sweepGradient;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    
    const sweepWidth = 15 * (Math.PI / 180); // 15 degrees in radians
    const startAngle = Math.PI - (radarAngle * Math.PI / 180) - sweepWidth;
    const endAngle = Math.PI - (radarAngle * Math.PI / 180);
    
    ctx.arc(centerX, centerY, maxRadius, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();
    
    ctx.shadowBlur = 0;
}

// Enhanced range labels with glow
function drawEnhancedRangeLabels(centerX, centerY, maxRadius) {
    ctx.fillStyle = '#00D1FF';
    ctx.font = 'bold 11px Orbitron, monospace';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#00D1FF';
    
    // Distance labels
    for (let i = 1; i <= 4; i++) {
        const radius = (maxRadius / 4) * i;
        const range = Math.round((maxRange / 4) * i);
        ctx.fillText(`${range}cm`, centerX, centerY - radius - 8);
    }
    
    // Angle labels with enhanced styling
    ctx.textAlign = 'center';
    ctx.font = 'bold 10px Orbitron, monospace';
    const angles = [30, 60, 90, 120, 150];
    angles.forEach(angle => {
        const rad = (angle * Math.PI) / 180;
        const x = centerX + Math.cos(Math.PI - rad) * (maxRadius + 20);
        const y = centerY - Math.sin(Math.PI - rad) * (maxRadius + 20);
        
        ctx.fillStyle = `rgba(0, 209, 255, 0.8)`;
        ctx.fillText(`${angle}°`, x, y + 3);
    });
    
    ctx.shadowBlur = 0;
}

// Update display readings with smooth animations
function updateDisplays() {
    if (radarActive) {
        // Simulate current reading with some variation
        const baseDistance = 50 + Math.sin(Date.now() * 0.003) * 30 + Math.random() * 40;
        const currentDistance = Math.max(20, Math.min(maxRange, baseDistance));
        
        // Animate the values
        animateValue(distanceReading, Math.round(currentDistance), ' cm');
        animateValue(angleReading, Math.round(radarAngle), '°');
    }
    
    objectCount.textContent = detectedObjects.length;
}

// Animate numeric values
function animateValue(element, targetValue, suffix = '') {
    const currentValue = parseInt(element.textContent) || 0;
    const difference = targetValue - currentValue;
    const steps = 10;
    const stepSize = difference / steps;
    
    let step = 0;
    const timer = setInterval(() => {
        step++;
        const newValue = Math.round(currentValue + (stepSize * step));
        element.textContent = newValue + suffix;
        
        if (step >= steps) {
            clearInterval(timer);
            element.textContent = targetValue + suffix;
        }
    }, 50);
}

// Update sensitivity with smooth transition
function updateSensitivity() {
    const newRange = parseInt(sensitivitySlider.value);
    animateValue(sensitivityValue, newRange, 'cm');
    maxRange = newRange;
}

// Clear all detections with fade effect
function clearAllDetections() {
    // Animate objects fading out
    detectedObjects.forEach(obj => {
        obj.fadeOut = true;
    });
    
    setTimeout(() => {
        detectedObjects = [];
        sweepTrail = [];
        drawRadar();
        
        // Clear log with animation
        const logRows = detectionLog.querySelectorAll('tr');
        logRows.forEach((row, index) => {
            setTimeout(() => {
                row.style.animation = 'fadeOut 0.3s ease-out forwards';
                setTimeout(() => row.remove(), 300);
            }, index * 50);
        });
        
        setTimeout(() => {
            detectionLog.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: rgba(255,255,255,0.5);">
                        No detections recorded
                    </td>
                </tr>
            `;
        }, logRows.length * 50 + 300);
    }, 500);
}

// Add detection to log with enhanced styling
function addToDetectionLog(detection) {
    const time = detection.timestamp.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
    
    const distance = Math.round(detection.distance);
    const angle = Math.round(detection.angle);
    
    let status = 'Normal';
    let statusClass = 'status--success';
    
    if (distance < 50) {
        status = 'Close';
        statusClass = 'status--warning';
    } else if (distance < 30) {
        status = 'Alert';
        statusClass = 'status--error';
    }
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${time}</td>
        <td>${angle}°</td>
        <td>${distance} cm</td>
        <td><span class="status ${statusClass} pulse">${status}</span></td>
    `;
    
    // Add slide-in animation
    row.style.animation = 'slideInRight 0.5s ease-out';
    
    // Add to top of table
    if (detectionLog.children.length > 0 && detectionLog.children[0].children[0].colSpan) {
        detectionLog.innerHTML = '';
    }
    
    detectionLog.insertBefore(row, detectionLog.firstChild);
    
    // Limit log entries with fade out animation
    while (detectionLog.children.length > 10) {
        const lastRow = detectionLog.lastChild;
        lastRow.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => {
            if (lastRow.parentNode) lastRow.remove();
        }, 300);
    }
}

// Enhanced smooth scroll function
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const headerOffset = 0;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        // Add visual feedback
        element.style.boxShadow = '0 0 30px rgba(0, 255, 159, 0.3)';
        setTimeout(() => {
            element.style.boxShadow = '';
        }, 2000);

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Initialize mock data with enhanced animations
function initializeMockData() {
    const mockDetections = [
        { angle: 45, distance: 67, timestamp: new Date(Date.now() - 4000), intensity: 0.8 },
        { angle: 78, distance: 123, timestamp: new Date(Date.now() - 3000), intensity: 0.6 },
        { angle: 112, distance: 89, timestamp: new Date(Date.now() - 2000), intensity: 0.9 },
        { angle: 156, distance: 45, timestamp: new Date(Date.now() - 1000), intensity: 0.7 }
    ];
    
    mockDetections.forEach((detection, index) => {
        setTimeout(() => {
            detectedObjects.push({
                ...detection,
                id: Date.now() + Math.random(),
                ripples: []
            });
            addToDetectionLog(detection);
            createRippleEffect(detectedObjects[detectedObjects.length - 1]);
        }, index * 500);
    });
}

// Add CSS keyframes dynamically
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            to { opacity: 0; transform: translateX(20px); }
        }
        @keyframes slideInRight {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
        }
    `;
    document.head.appendChild(style);
}

// Initialize with enhanced mock data
setTimeout(() => {
    initializeMockData();
    addAnimationStyles();
}, 3000);

// Mouse trail effect
let mouseTrail = [];
document.addEventListener('mousemove', (e) => {
    mouseTrail.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now()
    });
    
    // Limit trail length
    if (mouseTrail.length > 10) {
        mouseTrail.shift();
    }
});

// Export functions for global use
window.scrollToSection = scrollToSection;

// Handle page visibility changes to optimize performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (particleAnimationId) {
            cancelAnimationFrame(particleAnimationId);
        }
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    } else {
        if (particles.length > 0) {
            startParticleAnimation();
        }
        if (radarActive) {
            startRadarAnimation();
        }
    }
});

// Enhanced button interactions
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btn--neon');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-3px) scale(1.05)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = '';
        });
        
        button.addEventListener('click', (e) => {
            // Create ripple effect
            const rect = button.getBoundingClientRect();
            const ripple = document.createElement('div');
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                left: ${x}px;
                top: ${y}px;
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            button.style.position = 'relative';
            button.style.overflow = 'hidden';
            button.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // Add ripple animation
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyle);
});