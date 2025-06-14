// Particle System Class
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.connections = [];
        this.mouse = { x: 0, y: 0 };
        this.currentSection = 'hero';
        
        this.resize();
        this.init();
        this.bindEvents();
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    init() {
        this.particles = [];
        const particleCount = Math.min(200, Math.max(100, Math.floor((this.canvas.width * this.canvas.height) / 8000)));
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.3,
                pulse: Math.random() * Math.PI * 2,
                originalSize: 0
            });
            this.particles[i].originalSize = this.particles[i].size;
        }
    }
    
    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        // Update particle colors based on current section
        this.updateSectionColors();
    }
    
    updateSectionColors() {
        const sections = document.querySelectorAll('section');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                    this.currentSection = entry.target.id;
                }
            });
        }, { threshold: 0.5 });
        
        sections.forEach(section => observer.observe(section));
    }
    
    getColorForSection() {
        const colors = {
            hero: '#00d4ff',
            about: '#00d4ff',
            experience: '#10b981',
            projects: '#8b5cf6',
            skills: '#f59e0b',
            contact: '#00d4ff'
        };
        return colors[this.currentSection] || '#00d4ff';
    }
    
    update() {
        const currentColor = this.getColorForSection();
        
        this.particles.forEach(particle => {
            // Mouse attraction effect
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
                const force = (150 - distance) / 150;
                particle.vx += (dx * force) * 0.001;
                particle.vy += (dy * force) * 0.001;
            }
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Boundary collision
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.vx *= -0.5;
                particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.vy *= -0.5;
                particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
            }
            
            // Velocity damping
            particle.vx *= 0.99;
            particle.vy *= 0.99;
            
            // Pulse effect
            particle.pulse += 0.02;
            particle.size = particle.originalSize + Math.sin(particle.pulse) * 0.5;
            particle.opacity = 0.3 + Math.sin(particle.pulse * 0.5) * 0.2;
        });
    }
    
    drawConnections() {
        const currentColor = this.getColorForSection();
        this.connections = [];
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 120) {
                    const opacity = (120 - distance) / 120 * 0.3;
                    
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = currentColor.replace(')', `, ${opacity})`).replace('#', 'rgba(').replace(/^rgba\(([^,]+),\s*([^,]+),\s*([^,]+)/, (match, r, g, b) => {
                        return `rgba(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}`;
                    });
                    
                    // Convert hex to rgba
                    const hex = currentColor.replace('#', '');
                    const r = parseInt(hex.substr(0, 2), 16);
                    const g = parseInt(hex.substr(2, 2), 16);
                    const b = parseInt(hex.substr(4, 2), 16);
                    
                    this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw connections first
        this.drawConnections();
        
        // Draw particles
        const currentColor = this.getColorForSection();
        
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            
            // Convert hex to rgba
            const hex = currentColor.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            
            this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${particle.opacity})`;
            this.ctx.fill();
            
            // Add glow effect
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = currentColor;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
    }
    
    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Typed Text Effect
class TypedText {
    constructor(element, texts, speed = 100) {
        this.element = element;
        this.texts = texts;
        this.speed = speed;
        this.textIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.currentText = '';
        
        this.type();
    }
    
    type() {
        const fullText = this.texts[this.textIndex];
        
        if (this.isDeleting) {
            this.currentText = fullText.substring(0, this.charIndex - 1);
            this.charIndex--;
        } else {
            this.currentText = fullText.substring(0, this.charIndex + 1);
            this.charIndex++;
        }
        
        this.element.textContent = this.currentText;
        
        let typeSpeed = this.speed;
        if (this.isDeleting) typeSpeed /= 2;
        
        if (!this.isDeleting && this.charIndex === fullText.length) {
            typeSpeed = 2000; // Pause at end
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.textIndex = (this.textIndex + 1) % this.texts.length;
            typeSpeed = 500; // Pause before next text
        }
        
        setTimeout(() => this.type(), typeSpeed);
    }
}

// Scroll Animation Observer
class ScrollAnimations {
    constructor() {
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );
        
        this.init();
    }
    
    init() {
        // Observe all animatable elements
        const elements = document.querySelectorAll(
            '.section__title, .timeline__item, .project-card, .skill-category, .fade-in'
        );
        
        elements.forEach(el => {
            this.observer.observe(el);
        });
    }
    
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Add stagger effect for project cards
                if (entry.target.classList.contains('project-card')) {
                    const cards = document.querySelectorAll('.project-card');
                    const index = Array.from(cards).indexOf(entry.target);
                    entry.target.style.transitionDelay = `${index * 0.1}s`;
                }
                
                // Add stagger effect for skill categories
                if (entry.target.classList.contains('skill-category')) {
                    const categories = document.querySelectorAll('.skill-category');
                    const index = Array.from(categories).indexOf(entry.target);
                    entry.target.style.transitionDelay = `${index * 0.2}s`;
                }
            }
        });
    }
}

// Counter Animation
class CounterAnimation {
    constructor() {
        this.counters = document.querySelectorAll('.stat__number');
        this.init();
    }
    
    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        this.counters.forEach(counter => observer.observe(counter));
    }
    
    animateCounter(element) {
        const target = parseInt(element.dataset.target);
        const increment = target / 50;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                element.textContent = Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };
        
        updateCounter();
    }
}

// Project Card Interactions with Full Modal
class ProjectInteractions {
    constructor() {
        this.cards = document.querySelectorAll('.project-card');
        this.blurOverlay = document.getElementById('blur-overlay');
        this.currentExpandedCard = null;
        this.init();
        this.createModal();
    }
    
    createModal() {
        // Create modal structure
        this.modal = document.createElement('div');
        this.modal.className = 'project-modal';
        this.modal.innerHTML = `
            <div class="project-modal__content">
                <button class="project-modal__close">&times;</button>
                <div class="project-modal__body">
                    <div class="project-modal__header">
                        <h2 class="project-modal__title"></h2>
                        <span class="project-modal__subtitle"></span>
                        <span class="project-modal__duration"></span>
                    </div>
                    <div class="project-modal__description"></div>
                    <div class="project-modal__achievements">
                        <h4>Key Achievements</h4>
                        <ul class="project-modal__achievements-list"></ul>
                    </div>
                    <div class="project-modal__tech">
                        <h4>Technologies Used</h4>
                        <div class="project-modal__tech-tags"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal styles
        this.modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(20px);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: all 0.4s ease;
            padding: 2rem;
        `;
        
        const modalContent = this.modal.querySelector('.project-modal__content');
        modalContent.style.cssText = `
            background: linear-gradient(135deg, rgba(10, 14, 39, 0.95), rgba(26, 26, 58, 0.95));
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 3rem;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
            color: white;
            position: relative;
            transform: translateY(30px);
            transition: transform 0.4s ease;
        `;
        
        const closeBtn = this.modal.querySelector('.project-modal__close');
        closeBtn.style.cssText = `
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: none;
            border: none;
            color: white;
            font-size: 2rem;
            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(this.modal);
    }
    
    init() {
        this.cards.forEach(card => {
            card.addEventListener('mouseenter', () => this.handleMouseEnter(card));
            card.addEventListener('mouseleave', () => this.handleMouseLeave(card));
            card.addEventListener('click', () => this.handleClick(card));
        });
        
        // Close modal events
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
        
        this.modal.querySelector('.project-modal__close').addEventListener('click', () => this.closeModal());
        
        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    }
    
    handleMouseEnter(card) {
        // Add hover class for enhanced effects
        card.classList.add('hovered');
        
        // Apply blur to other cards
        this.cards.forEach(otherCard => {
            if (otherCard !== card) {
                otherCard.style.filter = 'blur(2px)';
                otherCard.style.opacity = '0.7';
                otherCard.style.transform = 'scale(0.95)';
            }
        });
    }
    
    handleMouseLeave(card) {
        card.classList.remove('hovered');
        
        // Remove blur from all cards
        this.cards.forEach(otherCard => {
            otherCard.style.filter = '';
            otherCard.style.opacity = '';
            otherCard.style.transform = '';
        });
    }
    
    handleClick(card) {
        this.currentExpandedCard = card;
        this.populateModal(card);
        this.showModal();
    }
    
    populateModal(card) {
        const title = card.querySelector('.project-card__title').textContent;
        const subtitle = card.querySelector('.project-card__subtitle').textContent;
        const duration = card.querySelector('.project-card__duration').textContent;
        const description = card.querySelector('.project-card__description').textContent;
        const techTags = card.querySelectorAll('.tech-tag');
        const achievements = card.querySelector('.overlay__achievements');
        
        // Populate modal content
        this.modal.querySelector('.project-modal__title').textContent = title;
        this.modal.querySelector('.project-modal__subtitle').textContent = subtitle;
        this.modal.querySelector('.project-modal__duration').textContent = duration;
        this.modal.querySelector('.project-modal__description').textContent = description;
        
        // Add detailed descriptions for each project
        const detailedDescriptions = {
            'HeRMES: GPU Scheduling System': 'HeRMES addresses critical challenges in heterogeneous GPU clusters by implementing thermal awareness and bandwidth-conscious scheduling algorithms. The system leverages Mixed-Integer Programming formulations with support for multiple solver backends including Gurobi, CVXPY, and ECOS. Key innovations include adaptive memory allocation using reinforcement learning, hierarchical memory compression techniques, and symbolic AI integration for enhanced reasoning capabilities.',
            'TableNet 2.0 Enhancement': 'Developed advanced adversarial robustness techniques for table detection in scanned documents, surpassing existing state-of-the-art models. The system integrates seamlessly with EDA pipelines and features a RAG LLM copilot built on Amazon Bedrock with Pinecone embeddings and FAISS vector search. Optimized inference latency and throughput to automate FSDs generation with 40% reduction in manual intervention through sophisticated A/B testing methodologies.',
            'CalVision: AI Calorie Prediction': 'Developed a comprehensive computer vision system for instant calorie prediction by integrating advanced depth estimation and object detection technologies. The system achieves 95% mAP@50 with 40% faster inference through optimized neural model deployment using TVM, TFLite, and ONNX. Features improved depth accuracy using MonoDepth2 and leverages Neural Radiance Fields (NeRF) for 3D food model reconstruction from video sequences.',
            'DC Generator: UI to Code': 'Pioneered an innovative deep learning pipeline that transforms hand-drawn UI wireframes into fully executable HTML/CSS/JS code. The system leverages YOLOv7 for precise component detection, KNN for intelligent classification, and layout-aware tokenization for structural preservation. Features a sophisticated GAN-based refinement module that enhances layout fidelity.',
            'Signature Verification System': 'Designed and deployed a sophisticated signature verification system using state-of-the-art Convolutional Neural Networks for financial authentication. The system processes over 100,000 transactions with an impressive 2.4% Equal Error Rate while maintaining robust security standards. Implemented comprehensive A/B testing methodologies that reduced manual intervention by 40%.',
            'Floor Plan 3D Visualization': 'Revolutionized architectural analysis through automated floor-plan area detection and sophisticated 3D visualization capabilities. The system fuses cutting-edge Masked R-CNN technology with Vision Transformers and advanced mesh generation techniques including AtlasNet and Pix2Mesh. Successfully containerized the entire pipeline using Docker Compose for seamless multi-container application management.'
        };
        
        const detailedDesc = detailedDescriptions[title] || description;
        this.modal.querySelector('.project-modal__description').textContent = detailedDesc;
        
        // Populate achievements
        const achievementsList = this.modal.querySelector('.project-modal__achievements-list');
        achievementsList.innerHTML = '';
        if (achievements) {
            achievements.querySelectorAll('li').forEach(achievement => {
                const li = document.createElement('li');
                li.textContent = achievement.textContent;
                li.style.cssText = `
                    margin-bottom: 0.5rem;
                    padding-left: 1.5rem;
                    position: relative;
                    color: rgba(255, 255, 255, 0.9);
                `;
                li.innerHTML = `<span style="position: absolute; left: 0; color: #10b981;">✓</span> ${achievement.textContent}`;
                achievementsList.appendChild(li);
            });
        }
        
        // Populate tech tags
        const techContainer = this.modal.querySelector('.project-modal__tech-tags');
        techContainer.innerHTML = '';
        techTags.forEach(tag => {
            const newTag = document.createElement('span');
            newTag.textContent = tag.textContent;
            newTag.style.cssText = `
                background: rgba(255, 255, 255, 0.1);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.875rem;
                margin-right: 0.5rem;
                margin-bottom: 0.5rem;
                display: inline-block;
                border: 1px solid rgba(255, 255, 255, 0.2);
            `;
            techContainer.appendChild(newTag);
        });
    }
    
    showModal() {
        this.modal.style.opacity = '1';
        this.modal.style.visibility = 'visible';
        this.modal.querySelector('.project-modal__content').style.transform = 'translateY(0)';
        document.body.style.overflow = 'hidden';
    }
    
    closeModal() {
        this.modal.style.opacity = '0';
        this.modal.style.visibility = 'hidden';
        this.modal.querySelector('.project-modal__content').style.transform = 'translateY(30px)';
        document.body.style.overflow = '';
        this.currentExpandedCard = null;
    }
}

// Smooth Navigation
class SmoothNavigation {
    constructor() {
        this.navLinks = document.querySelectorAll('.nav__link');
        this.sections = document.querySelectorAll('section');
        this.nav = document.querySelector('.nav');
        
        this.init();
    }
    
    init() {
        // Smooth scroll for navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 80; // Account for fixed nav
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        // Update active nav link on scroll
        this.updateActiveLink();
        window.addEventListener('scroll', () => this.updateActiveLink());
        
        // Add background to nav on scroll
        window.addEventListener('scroll', () => this.updateNavBackground());
    }
    
    updateActiveLink() {
        const scrollPos = window.scrollY + 100;
        
        this.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                this.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    updateNavBackground() {
        const scrolled = window.scrollY > 50;
        this.nav.classList.toggle('scrolled', scrolled);
    }
}

// Contact Form Handler
class ContactForm {
    constructor() {
        this.form = document.querySelector('.contact__form');
        this.init();
    }
    
    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const name = formData.get('name') || document.getElementById('name').value;
        const email = formData.get('email') || document.getElementById('email').value;
        const message = formData.get('message') || document.getElementById('message').value;
        
        // Simple validation
        if (!name || !email || !message) {
            this.showMessage('Please fill in all fields.', 'error');
            return;
        }
        
        // Simulate form submission
        this.showMessage('Thank you for your message! I\'ll get back to you soon.', 'success');
        this.form.reset();
    }
    
    showMessage(text, type) {
        // Create message element
        const message = document.createElement('div');
        message.className = `form-message form-message--${type}`;
        message.textContent = text;
        message.style.cssText = `
            padding: 1rem;
            margin-top: 1rem;
            border-radius: 8px;
            font-weight: 500;
            background: ${type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
            color: ${type === 'success' ? '#10b981' : '#ef4444'};
            border: 1px solid ${type === 'success' ? '#10b981' : '#ef4444'};
        `;
        
        // Remove existing message
        const existingMessage = this.form.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Add new message
        this.form.appendChild(message);
        
        // Remove message after 5 seconds
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 5000);
    }
}

// Performance Optimization
class PerformanceOptimizer {
    constructor() {
        this.init();
    }
    
    init() {
        // Debounce scroll events
        this.debounceScroll();
        
        // Lazy load images (if any)
        this.lazyLoadImages();
        
        // Optimize particle count based on device performance
        this.optimizeParticles();
    }
    
    debounceScroll() {
        let ticking = false;
        
        const originalScroll = window.addEventListener;
        window.addEventListener = function(type, listener, options) {
            if (type === 'scroll') {
                const debouncedListener = function() {
                    if (!ticking) {
                        requestAnimationFrame(() => {
                            listener.apply(this, arguments);
                            ticking = false;
                        });
                        ticking = true;
                    }
                };
                return originalScroll.call(this, type, debouncedListener, options);
            } else {
                return originalScroll.call(this, type, listener, options);
            }
        };
    }
    
    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    optimizeParticles() {
        // Reduce particles on mobile devices
        const isMobile = window.innerWidth < 768;
        const canvas = document.getElementById('particles-canvas');
        
        if (isMobile && canvas) {
            canvas.style.opacity = '0.5';
        }
    }
}

// Main Application
class PortfolioApp {
    constructor() {
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        // Initialize particle system
        const canvas = document.getElementById('particles-canvas');
        if (canvas) {
            this.particleSystem = new ParticleSystem(canvas);
        }
        
        // Initialize typed text
        const typedElement = document.getElementById('typed-text');
        if (typedElement) {
            this.typedText = new TypedText(typedElement, [
                'Machine Learning Engineer',
                'AI Researcher',
                'Deep Learning Specialist',
                'Computer Vision Expert'
            ], 100);
        }
        
        // Initialize all other components
        this.scrollAnimations = new ScrollAnimations();
        this.counterAnimation = new CounterAnimation();
        this.projectInteractions = new ProjectInteractions();
        this.smoothNavigation = new SmoothNavigation();
        this.contactForm = new ContactForm();
        this.performanceOptimizer = new PerformanceOptimizer();
        
        // Add loading complete class
        document.body.classList.add('loaded');
        
        console.log('Portfolio app initialized successfully!');
    }
}

// Initialize the application
const app = new PortfolioApp();