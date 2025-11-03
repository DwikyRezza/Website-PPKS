// ============================================
// LAPOR FORM JAVASCRIPT
// Clean, Modular, Accessible
// ============================================

(function() {
    'use strict';

    // ============================================
    // STATE MANAGEMENT
    // ============================================
    let currentStep = 1;
    const totalSteps = 5;
    const formData = {};
    
    // Track step 2 selections (needs both)
    const step2Status = {
        korban: false,
        kehawatiran: false
    };

    // ============================================
    // DOM ELEMENTS
    // ============================================
    const progressBar = document.getElementById('progressBar');
    const currentStepNumber = document.getElementById('currentStepNumber');
    const formSteps = document.querySelectorAll('.form-step');

    // ============================================
    // INITIALIZE
    // ============================================
    function init() {
        initChoiceCards();
        initStep1();
        initStep2();
        initStep3();
        initStep4();
        initStep5();
        console.log('✅ Lapor Form Initialized');
    }

    // ============================================
    // CHOICE CARDS HANDLER (Step 1 & 2)
    // ============================================
    function initChoiceCards() {
        const choiceCards = document.querySelectorAll('.lapor-choice');
        
        choiceCards.forEach(card => {
            card.addEventListener('click', function() {
                const radioInput = this.querySelector('input[type="radio"]');
                const radioName = radioInput.name;
                const groupName = this.getAttribute('data-group');
                
                // Remove selected from same group
                document.querySelectorAll(`input[name="${radioName}"]`).forEach(radio => {
                    radio.closest('.lapor-choice').classList.remove('selected');
                });
                
                // Add selected to clicked card
                this.classList.add('selected');
                radioInput.checked = true;
                
                // Store in formData
                formData[radioName] = this.getAttribute('data-value');
                
                // Handle different steps
                if (radioName === 'statusDarurat') {
                    handleStep1Selection();
                } else if (groupName) {
                    handleStep2Selection(groupName);
                }
            });
        });
    }

    // ============================================
    // STEP 1: KEADAAN DARURAT
    // ============================================
    function initStep1() {
        const btnLanjutkan1 = document.getElementById('btnLanjutkan1');
        
        if (btnLanjutkan1) {
            btnLanjutkan1.addEventListener('click', function() {
                if (formData.statusDarurat === 'darurat') {
                    redirectToWhatsApp();
                } else if (formData.statusDarurat === 'tidak') {
                    goToStep(2);
                }
            });
        }
    }

    function handleStep1Selection() {
        const btnLanjutkan1 = document.getElementById('btnLanjutkan1');
        
        if (btnLanjutkan1) {
            btnLanjutkan1.disabled = false;
        }
        
        // Auto-proceed after 500ms
        setTimeout(() => {
            if (formData.statusDarurat === 'darurat') {
                redirectToWhatsApp();
            } else if (formData.statusDarurat === 'tidak') {
                goToStep(2);
            }
        }, 500);
    }

    function redirectToWhatsApp() {
        const phoneNumber = '6282188467793';
        const message = encodeURIComponent('🚨 DARURAT! Saya membutuhkan bantuan segera dari Satgas PPKS.');
        window.location.href = `https://wa.me/${phoneNumber}?text=${message}`;
    }

    // ============================================
    // STEP 2: KORBAN & KEHAWATIRAN
    // ============================================
    function initStep2() {
        const btnKembali2 = document.getElementById('btnKembali2');
        const btnLanjutkan2 = document.getElementById('btnLanjutkan2');
        
        if (btnKembali2) {
            btnKembali2.addEventListener('click', function() {
                resetStep2();
                goToStep(1);
            });
        }
        
        if (btnLanjutkan2) {
            btnLanjutkan2.addEventListener('click', function() {
                if (step2Status.korban && step2Status.kehawatiran) {
                    console.log('Step 2 Complete:', formData);
                    goToStep(3);
                }
            });
        }
    }

    function handleStep2Selection(groupName) {
        if (groupName === 'korban') {
            step2Status.korban = true;
        } else if (groupName === 'kehawatiran') {
            step2Status.kehawatiran = true;
        }
        
        // Enable button if both selected
        const btnLanjutkan2 = document.getElementById('btnLanjutkan2');
        if (step2Status.korban && step2Status.kehawatiran) {
            if (btnLanjutkan2) {
                btnLanjutkan2.disabled = false;
            }
        }
    }

    function resetStep2() {
        step2Status.korban = false;
        step2Status.kehawatiran = false;
        
        const btnLanjutkan2 = document.getElementById('btnLanjutkan2');
        if (btnLanjutkan2) {
            btnLanjutkan2.disabled = true;
        }
    }

    // ============================================
    // STEP 3: GENDER KORBAN
    // ============================================
    function initStep3() {
        const genderRadios = document.querySelectorAll('input[name="genderKorban"]');
        const btnKembali3 = document.getElementById('btnKembali3');
        const btnLanjutkan3 = document.getElementById('btnLanjutkan3');
        
        genderRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.checked) {
                    formData.genderKorban = this.value;
                    if (btnLanjutkan3) {
                        btnLanjutkan3.disabled = false;
                    }
                }
            });
        });
        
        if (btnKembali3) {
            btnKembali3.addEventListener('click', function() {
                goToStep(2);
            });
        }
        
        if (btnLanjutkan3) {
            btnLanjutkan3.addEventListener('click', function() {
                if (formData.genderKorban) {
                    console.log('Step 3 Complete:', formData);
                    goToStep(4);
                }
            });
        }
    }

    // ============================================
    // STEP 4: DATA KEJADIAN KEKERASAN
    // ============================================
    function initStep4() {
        const pelakuKekerasan = document.getElementById('pelakuKekerasan');
        const waktuKejadian = document.getElementById('waktuKejadian');
        const lokasiKejadian = document.getElementById('lokasiKejadian');
        const detailKejadian = document.getElementById('detailKejadian');
        const btnKembali4 = document.getElementById('btnKembali4');
        const btnLanjutkan4 = document.getElementById('btnLanjutkan4');
        
        // Add event listeners
        if (pelakuKekerasan) {
            pelakuKekerasan.addEventListener('change', function() {
                formData.pelakuKekerasan = this.value;
                validateStep4();
            });
            
            pelakuKekerasan.addEventListener('blur', function() {
                if (!this.value) {
                    showError('errorPelaku', this);
                } else {
                    hideError('errorPelaku', this);
                }
            });
        }
        
        if (waktuKejadian) {
            waktuKejadian.addEventListener('change', function() {
                formData.waktuKejadian = this.value;
                validateStep4();
            });
            
            waktuKejadian.addEventListener('blur', function() {
                if (!this.value) {
                    showError('errorWaktu', this);
                } else {
                    hideError('errorWaktu', this);
                }
            });
        }
        
        if (lokasiKejadian) {
            lokasiKejadian.addEventListener('change', function() {
                formData.lokasiKejadian = this.value;
                validateStep4();
            });
            
            lokasiKejadian.addEventListener('blur', function() {
                if (!this.value) {
                    showError('errorLokasi', this);
                } else {
                    hideError('errorLokasi', this);
                }
            });
        }
        
        if (detailKejadian) {
            detailKejadian.addEventListener('input', function() {
                formData.detailKejadian = this.value;
                validateStep4();
            });
            
            detailKejadian.addEventListener('blur', function() {
                if (this.value.trim().length < 10) {
                    showError('errorDetail', this);
                } else {
                    hideError('errorDetail', this);
                }
            });
        }
        
        if (btnKembali4) {
            btnKembali4.addEventListener('click', function() {
                goToStep(3);
            });
        }
        
        if (btnLanjutkan4) {
            btnLanjutkan4.addEventListener('click', function() {
                if (validateStep4()) {
                    console.log('Step 4 Complete:', formData);
                    goToStep(5);
                }
            });
        }
    }

    function validateStep4() {
        const pelakuKekerasan = document.getElementById('pelakuKekerasan');
        const waktuKejadian = document.getElementById('waktuKejadian');
        const lokasiKejadian = document.getElementById('lokasiKejadian');
        const detailKejadian = document.getElementById('detailKejadian');
        const btnLanjutkan4 = document.getElementById('btnLanjutkan4');
        
        let isValid = true;
        
        // Validate Pelaku
        if (!pelakuKekerasan.value) {
            isValid = false;
        } else {
            hideError('errorPelaku', pelakuKekerasan);
        }
        
        // Validate Waktu
        if (!waktuKejadian.value) {
            isValid = false;
        } else {
            hideError('errorWaktu', waktuKejadian);
        }
        
        // Validate Lokasi
        if (!lokasiKejadian.value) {
            isValid = false;
        } else {
            hideError('errorLokasi', lokasiKejadian);
        }
        
        // Validate Detail (min 10 chars)
        const detailValue = detailKejadian.value.trim();
        if (detailValue.length < 10) {
            isValid = false;
        } else {
            hideError('errorDetail', detailKejadian);
        }
        
        // Enable/disable button
        if (btnLanjutkan4) {
            btnLanjutkan4.disabled = !isValid;
        }
        
        return isValid;
    }

    // ============================================
    // STEP 5: INPUT DATA KORBAN
    // ============================================
    function initStep5() {
        const emailKorban = document.getElementById('emailKorban');
        const usiaKorban = document.getElementById('usiaKorban');
        const disabilitasYa = document.getElementById('disabilitasYa');
        const disabilitasTidak = document.getElementById('disabilitasTidak');
        const jenisDisabilitasContainer = document.getElementById('jenisDisabilitasContainer');
        const jenisDisabilitas = document.getElementById('jenisDisabilitas');
        const whatsappKorban = document.getElementById('whatsappKorban');
        const btnKembali5 = document.getElementById('btnKembali5');
        const btnKirimPengaduan = document.getElementById('btnKirimPengaduan');
        
        // Email validation
        if (emailKorban) {
            emailKorban.addEventListener('input', function() {
                formData.emailKorban = this.value;
                validateStep5();
            });
            
            emailKorban.addEventListener('blur', function() {
                const emailValue = this.value.trim();
                if (emailValue !== '' && !isValidEmail(emailValue)) {
                    showError('errorEmail', this);
                } else {
                    hideError('errorEmail', this);
                }
            });
        }
        
        // Usia validation
        if (usiaKorban) {
            usiaKorban.addEventListener('change', function() {
                formData.usiaKorban = this.value;
                validateStep5();
            });
            
            usiaKorban.addEventListener('blur', function() {
                if (!this.value) {
                    showError('errorUsia', this);
                } else {
                    hideError('errorUsia', this);
                }
            });
        }
        
        // Disabilitas radio
        if (disabilitasYa) {
            disabilitasYa.addEventListener('change', function() {
                if (this.checked) {
                    formData.disabilitasStatus = 'ya';
                    jenisDisabilitasContainer.classList.remove('hidden');
                    validateStep5();
                }
            });
        }
        
        if (disabilitasTidak) {
            disabilitasTidak.addEventListener('change', function() {
                if (this.checked) {
                    formData.disabilitasStatus = 'tidak';
                    jenisDisabilitasContainer.classList.add('hidden');
                    jenisDisabilitas.value = '';
                    formData.jenisDisabilitas = '';
                    hideError('errorDisabilitas', jenisDisabilitas);
                    validateStep5();
                }
            });
        }
        
        // Jenis Disabilitas
        if (jenisDisabilitas) {
            jenisDisabilitas.addEventListener('change', function() {
                formData.jenisDisabilitas = this.value;
                validateStep5();
            });
        }
        
        // WhatsApp validation
        if (whatsappKorban) {
            whatsappKorban.addEventListener('input', function() {
                formData.whatsappKorban = this.value;
                validateStep5();
            });
            
            whatsappKorban.addEventListener('blur', function() {
                const whatsappValue = this.value.trim();
                if (whatsappValue !== '' && !isValidPhone(whatsappValue)) {
                    showError('errorWhatsapp', this);
                } else {
                    hideError('errorWhatsapp', this);
                }
            });
        }
        
        // Back button
        if (btnKembali5) {
            btnKembali5.addEventListener('click', function() {
                goToStep(4);
            });
        }
        
        // Submit button
        if (btnKirimPengaduan) {
            btnKirimPengaduan.addEventListener('click', function() {
                if (validateStep5()) {
                    submitForm();
                }
            });
        }
    }

    function validateStep5() {
        const emailKorban = document.getElementById('emailKorban');
        const usiaKorban = document.getElementById('usiaKorban');
        const disabilitasYa = document.getElementById('disabilitasYa');
        const jenisDisabilitas = document.getElementById('jenisDisabilitas');
        const whatsappKorban = document.getElementById('whatsappKorban');
        const btnKirimPengaduan = document.getElementById('btnKirimPengaduan');
        
        let isValid = true;
        
        // Validate Email (optional but must be valid)
        const emailValue = emailKorban.value.trim();
        if (emailValue !== '' && !isValidEmail(emailValue)) {
            isValid = false;
        } else {
            hideError('errorEmail', emailKorban);
        }
        
        // Validate Usia (required)
        if (!usiaKorban.value) {
            isValid = false;
        } else {
            hideError('errorUsia', usiaKorban);
        }
        
        // Validate Jenis Disabilitas (required if disabilitasYa checked)
        if (disabilitasYa.checked && !jenisDisabilitas.value) {
            isValid = false;
        } else {
            hideError('errorDisabilitas', jenisDisabilitas);
        }
        
        // Validate WhatsApp (optional but must be valid)
        const    whatsappValue = whatsappKorban.value.trim();
        if (whatsappValue !== '' && !isValidPhone(whatsappValue)) {
            isValid = false;
        } else {
            hideError('errorWhatsapp', whatsappKorban);
        }
        
        // Enable/disable submit button
        if (btnKirimPengaduan) {
            btnKirimPengaduan.disabled = !isValid;
        }
        
        return isValid;
    }

    // ============================================
    // VALIDATION HELPERS
    // ============================================
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPhone(phone) {
        const phoneRegex = /^[0-9]{10,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\+]/g, ''));
    }

    function showError(errorId, inputElement) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.classList.add('show');
        }
        if (inputElement) {
            inputElement.classList.add('error');
        }
    }

    function hideError(errorId, inputElement) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.classList.remove('show');
        }
        if (inputElement) {
            inputElement.classList.remove('error');
        }
    }

    // ============================================
    // NAVIGATION
    // ============================================
    function goToStep(stepNumber) {
        // Hide all steps
        formSteps.forEach(step => {
            step.classList.remove('active');
        });
        
        // Show target step
        const targetStep = document.getElementById('step' + stepNumber);
        if (targetStep) {
            targetStep.classList.add('active');
            currentStep = stepNumber;
            updateProgressBar(stepNumber);
            
            // Smooth scroll to top
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }

    function updateProgressBar(step) {
        const percentage = (step / totalSteps) * 100;
        
        if (progressBar) {
            progressBar.style.width = percentage + '%';
            progressBar.setAttribute('aria-valuenow', percentage);
        }
        
        if (currentStepNumber) {
            currentStepNumber.textContent = step;
        }
    }

    // ============================================
    // FORM SUBMISSION
    // ============================================
    function submitForm() {
        console.log('=== FORM SUBMISSION ===');
        console.log('Final Form Data:', formData);
        
        // Generate report code
        const reportCode = generateReportCode();
        formData.reportCode = reportCode;
        formData.timestamp = new Date().toISOString();
        
        // Save to localStorage
        saveToLocalStorage();
        
        // Show success message
        alert(`✅ Pengaduan Berhasil Dikirim!\n\nKode Laporan: ${reportCode}\n\nSimpan kode ini untuk melihat progress laporan Anda.`);
        
        // Redirect to home
        setTimeout(() => {
            window.location.href = '../Landing Page/Landing_Page.html';
        }, 2000);
    }

    function generateReportCode() {
        const prefix = 'PPKS';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return prefix + timestamp + random;
    }

    function saveToLocalStorage() {
        try {
            const existingReports = JSON.parse(localStorage.getItem('laporFormData')) || [];
            existingReports.push(formData);
            localStorage.setItem('laporFormData', JSON.stringify(existingReports));
            console.log('✅ Form data saved to localStorage');
        } catch (error) {
            console.error('❌ Error saving to localStorage:', error);
        }
    }

    // ============================================
    // INITIALIZE ON DOM READY
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();