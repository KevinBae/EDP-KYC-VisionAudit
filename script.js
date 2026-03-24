document.addEventListener('DOMContentLoaded', () => {

    /* --- Feature Card Mouse Tracking Glow effect --- */
    const cards = document.querySelectorAll('.feature-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    /* --- Hero Section Mock Scan Animation --- */
    const heroScanResults = document.getElementById('hero-scan-results');
    
    const startHeroScanSimulation = () => {
        setTimeout(() => {
            if(heroScanResults.children[0]) {
                heroScanResults.children[0].className = 'bg-black/40 p-4 rounded-lg flex items-center gap-3 font-mono text-sm border border-emerald-500/30 text-emerald-500';
                heroScanResults.children[0].innerHTML = '<i class="fa-solid fa-check"></i> SSL / HTTPS Verified';
            }
        }, 1500);

        setTimeout(() => {
             if(heroScanResults.children[1]) {
                heroScanResults.children[1].className = 'bg-black/40 p-4 rounded-lg flex items-center gap-3 font-mono text-sm border border-emerald-500/30 text-emerald-500';
                heroScanResults.children[1].innerHTML = '<i class="fa-solid fa-check"></i> Footer Disclosures Valid';
            }
        }, 3000);

        setTimeout(() => {
             if(heroScanResults.children[2]) {
                heroScanResults.children[2].className = 'bg-black/40 p-4 rounded-lg flex items-center gap-3 font-mono text-sm border border-amber-500/30 text-amber-500';
                heroScanResults.children[2].innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> 2 Absolute Claims Found';
            }
        }, 4500);
    };

    // Trigger simulation immediately for visual flair
    startHeroScanSimulation();

    // Jump to demo section and focus input
    document.getElementById('hero-run-audit').addEventListener('click', () => {
        document.getElementById('demo').scrollIntoView({ behavior: 'smooth' });
        
        // Optional: auto-focus the input after scrolling down
        setTimeout(() => {
            document.getElementById('audit-url').focus();
        }, 800);
    });

    /* --- Demo Section Interactive Scanner --- */
    const btnRunAudit = document.getElementById('btn-run-audit');
    const inputUrl = document.getElementById('audit-url');
    const reportContent = document.getElementById('report-content');
    const reportStatus = document.getElementById('report-status');

    // Tailwind class mappings for result statuses
    const statusClasses = {
        success: 'bg-black/40 p-4 rounded-lg flex items-center gap-3 font-mono text-sm border border-emerald-500/30 text-emerald-500',
        warning: 'bg-black/40 p-4 rounded-lg flex items-center gap-3 font-mono text-sm border border-amber-500/30 text-amber-500',
        danger:  'bg-black/40 p-4 rounded-lg flex items-center gap-3 font-mono text-sm border border-red-500/30 text-red-500',
        loading: 'bg-black/40 p-4 rounded-lg flex items-center gap-3 font-mono text-sm border border-sky-500/30 text-sky-500',
    };

    // Tailwind class mappings for score results in scorecard
    const scoreClasses = {
        success: 'text-sm leading-relaxed text-emerald-500',
        warning: 'text-sm leading-relaxed text-amber-500',
        danger:  'text-sm leading-relaxed text-red-500',
    };

    btnRunAudit.addEventListener('click', async () => {
        const url = inputUrl.value.trim();
        if(!url) {
            alert("Please enter a URL first.");
            return;
        }

        // Set loading states
        reportStatus.textContent = "Scanning...";
        reportStatus.className = "bg-sky-500/20 text-sky-500 px-3 py-1 rounded-full text-xs font-semibold";

        // Hide scorecard when a new audit runs
        const scorecard = document.getElementById('compliance-scorecard');
        scorecard.classList.add('hidden-card');

        reportContent.innerHTML = `
            <div class="flex flex-col gap-4">
                <div class="${statusClasses.loading}" id="loading-status-text">
                    <i class="fa-solid fa-circle-notch fa-spin"></i> Preparing Audit...
                </div>
            </div>
        `;

        const loadingText = document.getElementById('loading-status-text');
        
        // 5-second loading animation with status updates
        setTimeout(() => { if(document.body.contains(loadingText)) loadingText.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Scanning Footer...'; }, 1000);
        setTimeout(() => { if(document.body.contains(loadingText)) loadingText.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Analyzing Marketing Claims...'; }, 2500);
        setTimeout(() => { if(document.body.contains(loadingText)) loadingText.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Checking SSL...'; }, 4000);

        // Wait a full 5 seconds before showing results
        await new Promise(resolve => setTimeout(resolve, 5000));

        try {
            // Ping the Express backend API
            const response = await fetch('https://edp-kyc-visionaudit.onrender.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            if (!response.ok) {
                throw new Error("Failed to reach audit server");
            }

            const data = await response.json();
            
            // Build the primary UI from the server response
            let htmlPayload = '<div class="flex flex-col gap-4">';
            data.results.forEach(res => {
                const cls = statusClasses[res.status] || statusClasses.loading;
                htmlPayload += `
                    <div class="${cls}">
                        <i class="${res.icon}"></i> ${res.message}
                    </div>
                `;
            });
            htmlPayload += '</div>';

            reportContent.innerHTML = htmlPayload;

            // Populate the new Compliance Scorecard
            scorecard.classList.remove('hidden-card');

            const scoreTech = document.getElementById('score-tech');
            const scoreMarketing = document.getElementById('score-marketing');
            const scoreFooter = document.getElementById('score-footer');
            const overallScoreValue = document.querySelector('#overall-score .score-value');

            let riskLevel = 'Low';
            let riskColor = 'text-emerald-500';
            let riskGlow = 'drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]';

            data.results.forEach(res => {
                const targetEl = res.id === 'tech' ? scoreTech 
                               : res.id === 'marketing' ? scoreMarketing 
                               : scoreFooter;
                               
                if (targetEl) {
                    targetEl.textContent = res.message;
                    targetEl.className = scoreClasses[res.status] || 'text-sm leading-relaxed text-slate-400';
                }

                if (res.status === 'danger') {
                    riskLevel = 'High';
                    riskColor = 'text-red-500';
                    riskGlow = 'drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]';
                } else if (res.status === 'warning' && riskLevel !== 'High') {
                    riskLevel = 'Medium';
                    riskColor = 'text-amber-500';
                    riskGlow = 'drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]';
                }
            });

            overallScoreValue.textContent = riskLevel;
            overallScoreValue.className = `score-value font-heading text-4xl font-extrabold ${riskColor} ${riskGlow}`;

            reportStatus.textContent = "Audit Complete";
            reportStatus.className = "bg-amber-500/20 text-amber-500 px-3 py-1 rounded-full text-xs font-semibold";

        } catch (error) {
            console.error(error);
            reportContent.innerHTML = `
                 <div class="${statusClasses.danger}">
                    <i class="fa-solid fa-xmark"></i> Connection Error. Ensure the backend server is running on port 3000.
                </div>
            `;
            reportStatus.textContent = "Failed";
            reportStatus.className = "bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-xs font-semibold";
        }
    });

    /* --- Smooth Scroll for Anchor Links --- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    /* --- Navbar Scroll Effect --- */
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            nav.style.background = "rgba(15, 17, 26, 0.8)";
            nav.style.boxShadow = "0 8px 32px 0 rgba(0, 0, 0, 0.3)";
        } else {
            nav.style.background = "rgba(255, 255, 255, 0.03)";
            nav.style.boxShadow = "none";
        }
    });

    /* --- Scroll Reveal Animations --- */
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.5, 0, 0, 1)';
        revealObserver.observe(el);
    });

});
