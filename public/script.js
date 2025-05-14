// DOM Elements
const tabs = document.querySelectorAll('.tab');
const forms = document.querySelectorAll('.form');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');
const successMessage = document.getElementById('successMessage');
const successText = document.getElementById('successText');
const successBtn = document.getElementById('successBtn');

// Constants
const MIN_GRID_SIZE = 2;
const MAX_GRID_SIZE = 5;
const COLORS = {
    background: '#f8f8f0',
    circle: '#ddd',
    circleBorder: '#999',
    circleHover: '#bef',
    circleActive: '#4CAF50',
    circleLine: '#3498db',
    arrowFill: 'rgba(52, 152, 219, 0.6)',
    arrowStroke: 'rgba(52, 152, 219, 0.9)',
    userPath: '#2ecc71',
    userPathShadow: 'rgba(46, 204, 113, 0.5)'
};

// State
let userPatterns = {};
let expectedPatterns = {};
let gridSizes = {};
let circles = {};
let numberAliases = {};
let isDrawing = {};
let selectedCircles = {};
let noiseElements = {};
let animationFrameIds = {};

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all CAPTCHA canvases
    generateCaptcha('login-captcha');
    generateCaptcha('register-captcha');
    generateCaptcha('admin-captcha');
    
    // Add event listeners to reset buttons
    document.getElementById('login-reset-captcha').addEventListener('click', () => {
        generateCaptcha('login-captcha');
    });
    
    document.getElementById('register-reset-captcha').addEventListener('click', () => {
        generateCaptcha('register-captcha');
    });
    
    document.getElementById('admin-reset-captcha').addEventListener('click', () => {
        generateCaptcha('admin-captcha');
    });
    
    // Initialize tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and forms
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding form
            tab.classList.add('active');
            const formType = tab.dataset.tab;
            document.getElementById(`${formType}Form`).classList.add('active');
            
            // Clear error messages
            loginError.textContent = '';
            registerError.textContent = '';
        });
    });
    
    // Form submission
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    
    // Success button
    successBtn.addEventListener('click', () => {
        const btnText = successBtn.textContent;
        if (btnText.includes('Dashboard')) {
            showDashboard();
        } else {
            successMessage.style.display = 'none';
            document.querySelector('.form-container').style.display = 'block';
        }
    });

    // Add event listeners for request buttons
    const requestButtons = document.querySelectorAll('.request-button');
    
    requestButtons.forEach(button => {
        button.addEventListener('click', function() {
            const resourceCard = this.closest('.resource-card');
            const resourceTitle = resourceCard.querySelector('.card-title').textContent;
            const resourceTag = resourceCard.querySelector('.resource-tag').textContent;
            
            // Get the resource ID
            let resourceId = '';
            if (resourceTitle === 'Jubilee Auditorium 1') {
                resourceId = 'jubilee_auditorium_1';
            } else if (resourceTitle === 'Jubilee Auditorium 2') {
                resourceId = 'jubilee_auditorium_2';
            } else {
                // Convert the title to an ID format (lowercase with underscores)
                resourceId = resourceTitle.toLowerCase().replace(/\s+/g, '_');
            }
            
            // Create the booking request form
            openBookingRequestModal(resourceId, resourceTitle, resourceTag);
        });
    });
});

// Helper Functions
function Circle(center, radius, index) {
    this.x = center.x;
    this.y = center.y;
    this.radius = radius;
    this.index = index;
    this.hovering = false;
    this.selected = false;
    this.visited = false;
    
    this.draw = function(ctx, number) {
        // Draw circle background
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.selected ? COLORS.circleActive : COLORS.circle;
        ctx.fill();
        
        // Draw circle border
        ctx.lineWidth = 1;
        ctx.strokeStyle = COLORS.circleBorder;
        ctx.stroke();
        
        // Draw number inside circle
        ctx.fillStyle = '#000000';  // Black text
        ctx.font = "bold 15px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(number, this.x, this.y);
    };
    
    this.isPointInPath = function(x, y) {
        return Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2)) <= this.radius;
    };
}

function generateRandomPattern(rows, cols) {
    // Create graph
    const graph = createGraph(rows, cols);
    
    // Generate DFS pattern
    const startNode = Math.floor(Math.random() * (rows * cols));
    const pattern = dfsTraversal(graph, startNode, [], Math.floor(Math.random() * 3) + 4); // Random length between 4-6
    
    return pattern;
}

function createGraph(rows, cols) {
    const totalNodes = rows * cols;
    const graph = {};
    
    // Initialize empty adjacency list for each node
    for (let i = 0; i < totalNodes; i++) {
        graph[i] = [];
    }
    
    // Connect adjacent nodes
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const currentNode = i * cols + j;
            
            // Check 8 directions around current node
            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    if (di === 0 && dj === 0) continue; // Skip self
                    
                    const ni = i + di;
                    const nj = j + dj;
                    
                    // Check if neighbor is within bounds
                    if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
                        const neighborNode = ni * cols + nj;
                        graph[currentNode].push(neighborNode);
                    }
                }
            }
        }
    }
    
    return graph;
}

function dfsTraversal(graph, node, visited, maxLength) {
    // Shuffle neighbors for randomness
    const neighbors = [...graph[node]];
    shuffleArray(neighbors);
    
    if (!visited.includes(node)) {
        visited.push(node);
    }
    
    if (visited.length >= maxLength) {
        return visited;
    }
    
    for (const neighbor of neighbors) {
        if (!visited.includes(neighbor)) {
            dfsTraversal(graph, neighbor, visited, maxLength);
            if (visited.length >= maxLength) {
                return visited;
            }
        }
    }
    
    return visited;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateCaptcha(captchaId) {
    console.log('Generating CAPTCHA for:', captchaId);
    
    // Generate random grid size
    const rows = Math.floor(Math.random() * (MAX_GRID_SIZE - MIN_GRID_SIZE + 1)) + MIN_GRID_SIZE;
    const cols = Math.floor(Math.random() * (MAX_GRID_SIZE - MIN_GRID_SIZE + 1)) + MIN_GRID_SIZE;
    gridSizes[captchaId] = { rows, cols };
    
    // Reset pattern tracking
    userPatterns[captchaId] = [];
    selectedCircles[captchaId] = [];
    
    // Generate pattern
    const totalNodes = rows * cols;
    expectedPatterns[captchaId] = generateRandomPattern(rows, cols);
    
    console.log('Generated CAPTCHA:', {
        captchaId,
        gridSize: { rows, cols },
        expectedPattern: expectedPatterns[captchaId],
        userPattern: userPatterns[captchaId]
    });
    
    // Generate random number aliases (30-99)
    numberAliases[captchaId] = Array(totalNodes).fill().map(() => Math.floor(Math.random() * 70) + 30);
    
    // Setup canvas
    setupCanvas(captchaId, rows, cols);
}

function setupCanvas(captchaId, rows, cols) {
    const canvas = document.getElementById(captchaId);
    if (!canvas) {
        console.error(`Canvas with ID ${captchaId} not found`);
        return;
    }
    
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    // Calculate grid dimensions
    const padding = 40;
    const circleRadius = 20;
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, width, height);
    
    // Initialize circles
    circles[captchaId] = [];
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const index = i * cols + j;
            const circle = new Circle({
                x: j * ((width - padding * 2) / (cols - 1)) + padding,
                y: i * ((height - padding * 2) / (rows - 1)) + padding
            }, circleRadius, index);
            
            circles[captchaId].push(circle);
        }
    }
    
    // Draw correct pattern (with arrows)
    const pattern = expectedPatterns[captchaId];
    for (let i = 0; i < pattern.length - 1; i++) {
        const startCircle = circles[captchaId][pattern[i]];
        const endCircle = circles[captchaId][pattern[i + 1]];
        
        // Draw arrow
        drawArrow(ctx, startCircle.x, startCircle.y, endCircle.x, endCircle.y);
    }
    
    // Draw "START" indicator on the first circle in the pattern
    if (pattern.length > 0) {
        const startCircle = circles[captchaId][pattern[0]];
        ctx.fillStyle = '#38b000';
        ctx.font = "bold 10px Arial";
        ctx.textAlign = "center";
        ctx.fillText("START", startCircle.x, startCircle.y - 25);
    }
    
    // Draw "END" indicator on the last circle in the pattern
    if (pattern.length > 1) {
        const endCircle = circles[captchaId][pattern[pattern.length - 1]];
        ctx.fillStyle = '#e63946';
        ctx.font = "bold 10px Arial";
        ctx.textAlign = "center";
        ctx.fillText("END", endCircle.x, endCircle.y + 35);
    }
    
    // Draw circles with numbers
    for (let i = 0; i < circles[captchaId].length; i++) {
        circles[captchaId][i].draw(ctx, numberAliases[captchaId][i]);
    }
    
    // Add floating noise numbers
    addNoiseElements(ctx, width, height, captchaId);
    
    // Setup mouse/touch events
    setupCanvasEvents(canvas, captchaId);
}

function drawArrow(ctx, fromx, fromy, tox, toy) {
    // Draw line connecting nodes
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.strokeStyle = COLORS.arrowStroke;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Calculate angle for rotation
    const angle = Math.atan2(toy - fromy, tox - fromx);
    
    // Calculate position for marker - exactly in the middle between the circles
    const midX = fromx + (tox - fromx) * 0.5;
    const midY = fromy + (toy - fromy) * 0.5;
    
    // Draw directional marker
    ctx.fillStyle = COLORS.arrowFill;
    ctx.font = "bold 20px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Create a rotated marker
    ctx.save();
    ctx.translate(midX, midY);
    ctx.rotate(angle);
    ctx.fillText(">", 0, 0);
    ctx.restore();
}

function addNoiseElements(ctx, width, height, captchaId) {
    // Clear any existing noise animation
    if (animationFrameIds[captchaId]) {
        cancelAnimationFrame(animationFrameIds[captchaId]);
    }
    
    // Generate 10-15 noise numbers
    const noiseCount = 10 + Math.floor(Math.random() * 6);
    
    // Create noise elements with position, speed, and value
    noiseElements[captchaId] = [];
    for (let i = 0; i < noiseCount; i++) {
        // Random position
        const x = Math.random() * width;
        const y = Math.random() * height;
        
        // Random number (1-99)
        const number = Math.floor(Math.random() * 99) + 1;
        
        // Random color
        const hue = Math.floor(Math.random() * 360);
        const color = `hsla(${hue}, 70%, 50%, 0.4)`;
        
        // Random speed
        const speedX = (Math.random() - 0.5) * 0.8;
        const speedY = (Math.random() - 0.5) * 0.8;
        
        noiseElements[captchaId].push({
            x, y, number, color, speedX, speedY
        });
    }
    
    // Start animation
    animateNoiseElements(ctx, width, height, captchaId);
}

function animateNoiseElements(ctx, width, height, captchaId) {
    const canvas = document.getElementById(captchaId);
    if (!canvas) return; // Exit if canvas doesn't exist
    
    // Update positions of noise elements
    for (const noise of noiseElements[captchaId]) {
        // Move in x and y directions
        noise.x += noise.speedX;
        noise.y += noise.speedY;
        
        // Bounce off edges
        if (noise.x < 0 || noise.x > width) noise.speedX *= -1;
        if (noise.y < 0 || noise.y > height) noise.speedY *= -1;
    }
    
    // Redraw the entire canvas
    drawSelection(captchaId);
    
    // Continue animation
    animationFrameIds[captchaId] = requestAnimationFrame(() => {
        animateNoiseElements(ctx, width, height, captchaId);
    });
}

function drawNoiseElements(ctx, captchaId) {
    if (!noiseElements[captchaId]) return;
    
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    
    // Draw each noise element
    for (const noise of noiseElements[captchaId]) {
        ctx.fillStyle = noise.color;
        ctx.fillText(noise.number.toString(), noise.x, noise.y);
    }
}

function setupCanvasEvents(canvas, captchaId) {
    // Clear any existing event listeners
    const newCanvas = canvas.cloneNode(true);
    canvas.parentNode.replaceChild(newCanvas, canvas);
    
    newCanvas.addEventListener('mousedown', function(e) {
        handleMouseDown(e, captchaId);
    });
    
    newCanvas.addEventListener('mousemove', function(e) {
        handleMouseMove(e, captchaId);
    });
    
    newCanvas.addEventListener('mouseup', function(e) {
        handleMouseUp(e, captchaId);
    });
    
    newCanvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = newCanvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        handleMouseDown({clientX: touch.clientX, clientY: touch.clientY, target: newCanvas}, captchaId);
    });
    
    newCanvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        handleMouseMove({clientX: touch.clientX, clientY: touch.clientY, target: newCanvas}, captchaId);
    });
    
    newCanvas.addEventListener('touchend', function(e) {
        e.preventDefault();
        handleMouseUp({target: newCanvas}, captchaId);
    });
}

function handleMouseDown(e, captchaId) {
    console.log('Mouse down on CAPTCHA:', captchaId);
    isDrawing[captchaId] = true;
    userPatterns[captchaId] = [];
    selectedCircles[captchaId] = [];
    
    // Reset all circles
    if (circles[captchaId]) {
        circles[captchaId].forEach(circle => {
            circle.selected = false;
            circle.visited = false;
        });
    }
    
    // Check if starting on a circle
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (circles[captchaId]) {
        for (const circle of circles[captchaId]) {
            if (circle.isPointInPath(x, y)) {
                circle.visited = true;
                circle.selected = true;
                selectedCircles[captchaId].push(circle);
                userPatterns[captchaId].push(circle.index);
                console.log('Added first point to pattern:', {
                    captchaId,
                    circleIndex: circle.index,
                    currentPattern: userPatterns[captchaId]
                });
                break;
            }
        }
    }
    
    // Redraw
    drawSelection(captchaId);
}

function handleMouseMove(e, captchaId) {
    if (!isDrawing[captchaId] || !circles[captchaId]) return;
    
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if hovering over a circle
    for (const circle of circles[captchaId]) {
        // If hovering over a new circle, add it to the path
        if (circle.isPointInPath(x, y) && !circle.visited) {
            circle.visited = true;
            circle.selected = true;
            selectedCircles[captchaId].push(circle);
            userPatterns[captchaId].push(circle.index);
            console.log('Added point to pattern:', {
                captchaId,
                circleIndex: circle.index,
                currentPattern: userPatterns[captchaId]
            });
            
            // Redraw everything
            drawSelection(captchaId);
            break;
        }
    }
}

function handleMouseUp(e, captchaId) {
    if (!isDrawing[captchaId]) return;
    isDrawing[captchaId] = false;
    
    // Check if the pattern is valid (has at least one point)
    if (userPatterns[captchaId] && userPatterns[captchaId].length > 0) {
        // This check is just a placeholder - we'll accept any pattern for now
        const errorElement = document.getElementById(`${captchaId}-error`);
        if (errorElement) {
            errorElement.textContent = '';
        }
    }
}

function drawSelection(captchaId) {
    const canvas = document.getElementById(captchaId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, width, height);
    
    // Draw expected pattern with arrows
    if (expectedPatterns[captchaId]) {
        const pattern = expectedPatterns[captchaId];
        for (let i = 0; i < pattern.length - 1; i++) {
            if (circles[captchaId] && circles[captchaId][pattern[i]] && circles[captchaId][pattern[i+1]]) {
                const startCircle = circles[captchaId][pattern[i]];
                const endCircle = circles[captchaId][pattern[i + 1]];
                drawArrow(ctx, startCircle.x, startCircle.y, endCircle.x, endCircle.y);
            }
        }
    }
    
    // Draw circles
    if (circles[captchaId]) {
        for (let i = 0; i < circles[captchaId].length; i++) {
            if (numberAliases[captchaId] && numberAliases[captchaId][i] !== undefined) {
                circles[captchaId][i].draw(ctx, numberAliases[captchaId][i]);
            }
        }
    }
    
    // Draw user's path
    if (selectedCircles[captchaId] && selectedCircles[captchaId].length > 1) {
        ctx.beginPath();
        const startCircle = selectedCircles[captchaId][0];
        ctx.moveTo(startCircle.x, startCircle.y);
        
        for (let i = 1; i < selectedCircles[captchaId].length; i++) {
            const circle = selectedCircles[captchaId][i];
            ctx.lineTo(circle.x, circle.y);
        }
        
        ctx.strokeStyle = COLORS.userPath;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
    }
    
    // Draw noise elements
    drawNoiseElements(ctx, captchaId);
}

// Add toast message function
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add toast to body
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Update verifyPattern function
function verifyPattern(captchaId) {
    const userPattern = userPatterns[captchaId] || [];
    const expectedPattern = expectedPatterns[captchaId] || [];
    
    console.log('CAPTCHA Verification:', {
        captchaId,
        userPattern,
        expectedPattern,
        userPatternLength: userPattern.length,
        expectedPatternLength: expectedPattern.length
    });
    
    // Check if patterns have the same length
    if (userPattern.length !== expectedPattern.length) {
        console.log('Pattern length mismatch');
        showToast('CAPTCHA verification failed', 'error');
        return false;
    }
    
    // Compare each node in the pattern
    for (let i = 0; i < userPattern.length; i++) {
        if (userPattern[i] !== expectedPattern[i]) {
            console.log(`Pattern mismatch at index ${i}: user=${userPattern[i]}, expected=${expectedPattern[i]}`);
            showToast('CAPTCHA verification failed', 'error');
            return false;
        }
    }
    
    console.log('Pattern verification successful');
    return true;
}

// Create dashboard after login
function showDashboard() {
    // Redirect to dashboard page
    window.location.href = '/dashboard.html';
}

// Form Handlers
async function handleLogin(e) {
    e.preventDefault();
    
    console.log("Login form submitted");
    
    // Get form values
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Debug log all patterns
    console.log('All patterns:', {
        userPatterns,
        expectedPatterns,
        loginCaptcha: userPatterns['login-captcha'],
        expectedLoginCaptcha: expectedPatterns['login-captcha']
    });
    
    // Validate form
    if (!email || !password) {
        loginError.textContent = 'Please fill in all fields';
        return;
    }
    
    // Verify CAPTCHA pattern
    const captchaValid = verifyPattern('login-captcha');
    if (!captchaValid) {
        loginError.textContent = 'CAPTCHA pattern is incorrect. Please trace the arrow pattern again.';
        generateCaptcha('login-captcha');
        return;
    }
    
    try {
        console.log("Sending login request");
        loginError.textContent = ''; // Clear previous error messages
        
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                email, 
                password,
                captchaPattern: userPatterns['login-captcha'],
                expectedPattern: expectedPatterns['login-captcha']
            })
        });

        const data = await response.json();
        console.log("Login response:", data);

        if (response.ok) {
            console.log("Login successful, redirecting to dashboard");
            window.location.href = '/dashboard.html';
        } else {
            // Show error and generate new CAPTCHA
            loginError.textContent = data.error || 'Login failed. Please try again.';
            generateCaptcha('login-captcha');
        }
    } catch (error) {
        console.error('Login error:', error);
        loginError.textContent = 'An error occurred. Please try again later.';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    console.log("Register form submitted");
    
    // Get form values
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    // Validate form
    if (!email || !password || !confirmPassword) {
        registerError.textContent = 'Please fill in all fields';
        return;
    }

    if (password !== confirmPassword) {
        registerError.textContent = 'Passwords do not match';
        return;
    }
    
    // Verify CAPTCHA pattern
    const captchaValid = verifyPattern('register-captcha');
    if (!captchaValid) {
        registerError.textContent = 'CAPTCHA pattern is incorrect. Please trace the arrow pattern again.';
        generateCaptcha('register-captcha');
        return;
    }
    
    try {
        console.log("Sending register request");
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                email, 
                password,
                captchaPattern: userPatterns['register-captcha'],
                expectedPattern: expectedPatterns['register-captcha']
            })
        });

        const data = await response.json();
        console.log("Register response:", data);

        if (response.ok) {
            // Show success and switch to login tab
            alert('Registration successful! You can now log in.');
            document.querySelector('[data-tab="login"]').click();
        } else {
            // Show error and generate new CAPTCHA
            registerError.textContent = data.error || 'Registration failed. Please try again.';
            generateCaptcha('register-captcha');
        }
    } catch (error) {
        console.error('Registration error:', error);
        registerError.textContent = 'An error occurred. Please try again later.';
    }
}

// Open booking request modal
function openBookingRequestModal(resourceId, resourceName, resourceType) {
    // Create modal HTML
    const isAuditorium = resourceType.includes('Auditorium');
    
    const modalHtml = `
        <div class="booking-request-modal">
            <h2>Request Booking for ${resourceName}</h2>
            <form id="booking-request-form">
                <input type="hidden" id="resource-id" value="${resourceId}">
                
                <div class="form-group">
                    <label for="booking-date">Date:</label>
                    <input type="date" id="booking-date" required>
                </div>
                
                <div class="form-group">
                    <label for="booking-time">Time:</label>
                    <input type="time" id="booking-time" required>
                </div>
                
                <div class="form-group">
                    <label for="booking-duration">Duration (hours):</label>
                    <input type="number" id="booking-duration" min="1" max="8" value="1" required>
                </div>
                
                <div class="form-group">
                    <label for="booking-purpose">Purpose:</label>
                    <textarea id="booking-purpose" rows="3" required></textarea>
                </div>
                
                <div class="form-group">
                    <label for="booking-attendees">Number of Attendees:</label>
                    <input type="number" id="booking-attendees" min="1" required>
                </div>
                
                <div class="form-group">
                    <label for="booking-department">Department:</label>
                    <input type="text" id="booking-department" required>
                </div>
                
                ${isAuditorium ? `
                <div class="form-group">
                    <label for="booking-event">Event Name:</label>
                    <input type="text" id="booking-event" required>
                </div>
                
                <div class="form-group">
                    <label for="booking-event-type">Event Type:</label>
                    <select id="booking-event-type" required>
                        <option value="Conference">Conference</option>
                        <option value="Cultural Program">Cultural Program</option>
                        <option value="Seminar">Seminar</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="technical-requirements">Technical Requirements:</label>
                    <textarea id="technical-requirements" rows="3" placeholder="Projector, microphones, lighting, etc."></textarea>
                </div>
                ` : ''}
                
                <div class="form-group">
                    <button type="submit" class="submit-request-btn">Submit Request</button>
                    <button type="button" class="cancel-request-btn">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    // Show modal
    showModal(modalHtml);
    
    // Add event listeners
    document.querySelector('.cancel-request-btn').addEventListener('click', hideModal);
    document.getElementById('booking-request-form').addEventListener('submit', submitBookingRequest);
}

// Submit booking request
async function submitBookingRequest(e) {
    e.preventDefault();
    
    try {
        // Get form data
        const formData = {
            resourceId: document.getElementById('resource-id').value,
            date: document.getElementById('booking-date').value,
            time: document.getElementById('booking-time').value,
            duration: document.getElementById('booking-duration').value,
            purpose: document.getElementById('booking-purpose').value,
            attendees: document.getElementById('booking-attendees').value,
            department: document.getElementById('booking-department').value,
            captchaPattern: window.userDrawnPattern || [], // Get pattern from CAPTCHA
        };
        
        // Add auditorium-specific fields if they exist
        const eventInput = document.getElementById('booking-event');
        if (eventInput) {
            formData.event = eventInput.value;
        }
        
        const eventTypeSelect = document.getElementById('booking-event-type');
        if (eventTypeSelect) {
            formData.eventType = eventTypeSelect.value;
        }
        
        const technicalReqsTextarea = document.getElementById('technical-requirements');
        if (technicalReqsTextarea) {
            formData.technicalRequirements = technicalReqsTextarea.value;
        }
        
        // Get user email from session
        const userResponse = await fetch('/api/profile');
        if (!userResponse.ok) {
            throw new Error('You must be logged in to submit a booking request');
        }
        
        const userData = await userResponse.json();
        formData.userEmail = userData.email;
        
        // Submit request
        const response = await fetch('/api/booking-requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Failed to submit booking request');
        }
        
        // Hide modal
        hideModal();
        
        // Show success message
        showSuccessMessage('Booking request submitted successfully! You will be notified once it has been reviewed.');
        
        // Reload the page after a delay to refresh the booking list
        setTimeout(() => {
            window.location.reload();
        }, 3000);
        
    } catch (error) {
        showErrorMessage(error.message);
    }
}

// Helper function to show modal
function showModal(content) {
    let modalContainer = document.querySelector('.modal-container');
    
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.className = 'modal-container';
        document.body.appendChild(modalContainer);
    }
    
    modalContainer.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-box">
            <button class="modal-close">&times;</button>
            <div class="modal-content">
                ${content}
            </div>
        </div>
    `;
    
    // Show modal
    setTimeout(() => {
        modalContainer.classList.add('show');
    }, 10);
    
    // Add event listener for close button
    const closeBtn = modalContainer.querySelector('.modal-close');
    closeBtn.addEventListener('click', hideModal);
    
    // Add event listener for overlay click
    const overlay = modalContainer.querySelector('.modal-overlay');
    overlay.addEventListener('click', hideModal);
}

// Helper function to hide modal
function hideModal() {
    const modalContainer = document.querySelector('.modal-container');
    
    if (modalContainer) {
        modalContainer.classList.remove('show');
        
        setTimeout(() => {
            modalContainer.innerHTML = '';
        }, 300);
    }
}

// Helper function to show success message
function showSuccessMessage(message) {
    const successElement = document.createElement('div');
    successElement.className = 'notification success';
    successElement.textContent = message;
    
    document.body.appendChild(successElement);
    
    setTimeout(() => {
        successElement.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        successElement.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(successElement);
        }, 300);
    }, 5000);
}

// Helper function to show error message
function showErrorMessage(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'notification error';
    errorElement.textContent = message;
    
    document.body.appendChild(errorElement);
    
    setTimeout(() => {
        errorElement.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        errorElement.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(errorElement);
        }, 300);
    }, 5000);
}

// Update login form handler
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const userEmail = document.getElementById('loginEmail').value;
    const userPassword = document.getElementById('loginPassword').value;
    const userCaptchaPattern = userPatterns['login-captcha'] || [];
    const expectedPattern = expectedPatterns['login-captcha'] || [];
    
    if (userCaptchaPattern.length === 0) {
        document.getElementById('login-messages').innerHTML = 
            '<div class="error-message">Please trace the pattern</div>';
        return;
    }
    
    // Verify CAPTCHA pattern
    if (!verifyPattern('login-captcha')) {
        return;
    }
    
    // Show loading message
    showToast('Logging in...', 'info');
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: userEmail,
                password: userPassword,
                captchaPattern: userCaptchaPattern,
                expectedPattern: expectedPattern
            }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('User login successful, response:', data);
            
            // Show success message
            showToast('Login successful', 'success');
            
            // Reset form
            document.getElementById('loginForm').reset();
            generateCaptcha('login-captcha');
            
            // Store user info in sessionStorage
            sessionStorage.clear();
            sessionStorage.setItem('userEmail', userEmail);
            sessionStorage.setItem('userType', 'user');
            sessionStorage.setItem('loggedIn', 'true');
            
            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = data.redirectTo || '/dashboard.html';
            }, 1000);
        } else {
            console.error('Login failed:', data.error);
            showToast(data.error || 'Login failed', 'error');
            generateCaptcha('login-captcha');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('An error occurred. Please try again.', 'error');
        generateCaptcha('login-captcha');
    }
});

// Update registration form handler
document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const userEmail = document.getElementById('registerEmail').value;
    const userPassword = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirm').value;
    const userCaptchaPattern = userPatterns['register-captcha'] || [];
    const expectedPattern = expectedPatterns['register-captcha'] || [];
    
    if (userPassword !== confirmPassword) {
        document.getElementById('register-messages').innerHTML = 
            '<div class="error-message">Passwords do not match</div>';
        return;
    }
    
    if (userCaptchaPattern.length === 0) {
        document.getElementById('register-messages').innerHTML = 
            '<div class="error-message">Please trace the pattern</div>';
        return;
    }
    
    // Verify CAPTCHA pattern
    if (!verifyPattern('register-captcha')) {
        return;
    }
    
    // Show loading message
    showToast('Registering...', 'info');
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: userEmail,
                password: userPassword,
                captchaPattern: userCaptchaPattern,
                expectedPattern: expectedPattern
            }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('Registration successful, response:', data);
            
            // Show success message
            showToast('Registered successfully', 'success');
            
            // Reset form
            document.getElementById('registerForm').reset();
            generateCaptcha('register-captcha');
            
            // Switch to login tab
            document.getElementById('login-tab').click();
        } else {
            console.error('Registration failed:', data.error);
            showToast(data.error || 'Registration failed', 'error');
            generateCaptcha('register-captcha');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showToast('An error occurred. Please try again.', 'error');
        generateCaptcha('register-captcha');
    }
});

// Handle admin login
document.getElementById('adminForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const adminEmail = document.getElementById('adminEmail').value;
    const adminPassword = document.getElementById('adminPassword').value;
    const adminCaptchaPattern = userPatterns['admin-captcha'] || [];
    const expectedPattern = expectedPatterns['admin-captcha'] || [];
    
    if (adminCaptchaPattern.length === 0) {
        document.getElementById('admin-messages').innerHTML = 
            '<div class="error-message">Please trace the pattern</div>';
        return;
    }
    
    // Show loading message
    document.getElementById('admin-messages').innerHTML = 
        '<div class="loading-message">Logging in...</div>';
    
    try {
        const response = await fetch('/api/admin-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: adminEmail,
                password: adminPassword,
                captchaPattern: adminCaptchaPattern,
                expectedPattern: expectedPattern
            }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('Admin login successful, response:', data);
            
            // Show success message
            document.getElementById('admin-messages').innerHTML = 
                `<div class="success-message">Login successful. Redirecting...</div>`;
            
            // Reset form
            document.getElementById('adminForm').reset();
            generateCaptcha('admin-captcha');
            
            // Store admin info in sessionStorage
            sessionStorage.clear();
            sessionStorage.setItem('adminEmail', adminEmail);
            sessionStorage.setItem('userType', 'admin');
            sessionStorage.setItem('loggedIn', 'true');
            
            // Redirect after a short delay
            setTimeout(() => {
                console.log('Redirecting to admin dashboard...');
                window.location.href = data.redirectTo || '/admin-dashboard.html';
            }, 1000);
        } else {
            console.error('Admin login failed:', data.error);
            document.getElementById('admin-messages').innerHTML = 
                `<div class="error-message">${data.error || 'Login failed'}</div>`;
            generateCaptcha('admin-captcha');
        }
    } catch (error) {
        console.error('Admin login error:', error);
        document.getElementById('admin-messages').innerHTML = 
            '<div class="error-message">An error occurred. Please try again.</div>';
        generateCaptcha('admin-captcha');
    }
}); 