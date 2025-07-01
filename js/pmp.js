
        // --- SEGURANÇA DE LOGIN ---
        // Redireciona para a página de login se o usuário não estiver 'logado'.
        if (localStorage.getItem('logado') !== 'true') {
            if (typeof __app_id === 'undefined') {
                window.location.href = 'index.html'; // Redireciona para a página de login
            } else {
                console.log("Running in Canvas environment, bypassing login redirect.");
                localStorage.setItem('logado', 'true');
            }
        }

        // Função para realizar logout.
        function logout() {
            localStorage.removeItem('logado');
            if (typeof __app_id === 'undefined') {
                window.location.href = 'index.html'; // Redireciona para a página de login
            } else {
                console.log("Running in Canvas environment, logout simulated.");
            }
        }

        // --- FUNCIONALIDADE DE DROPDOWN MENUS (HEADER) ---
        function toggleDropdown(id, event) {
            event.preventDefault();
            event.stopPropagation();

            const menu = document.getElementById(id);
            const isVisible = menu.style.display === 'flex';

            document.querySelectorAll('.dropdown-content').forEach(m => {
                if (m !== menu) {
                    m.style.display = 'none';
                    if (m.previousElementSibling) {
                        m.previousElementSibling.setAttribute('aria-expanded', 'false');
                        m.classList.remove('animate-fade-in');
                    }
                }
            });

            if (!isVisible) {
                menu.style.display = 'flex';
                menu.style.flexDirection = 'column';
                menu.classList.add('animate-fade-in');
                if (menu.previousElementSibling) {
                    menu.previousElementSibling.setAttribute('aria-expanded', 'true');
                }
            } else {
                menu.style.display = 'none';
                menu.classList.remove('animate-fade-in');
                if (menu.previousElementSibling) {
                    menu.previousElementSibling.setAttribute('aria-expanded', 'false');
                }
            }
        }

        document.addEventListener('click', (event) => {
            const isClickInsideDropdown = event.target.closest('.dropdown');
            if (!isClickInsideDropdown) {
                document.querySelectorAll('.dropdown-content').forEach(menu => {
                    if (menu.style.display === 'flex') {
                        menu.style.display = 'none';
                        menu.classList.remove('animate-fade-in');
                        if (menu.previousElementSibling) {
                            menu.previousElementSibling.setAttribute('aria-expanded', 'false');
                        }
                    }
                });
            }
        });

        // --- FUNCIONALIDADE DE COLLAPSIBLE SECTIONS ---
        function toggleCollapsible(header) {
            header.classList.toggle('active');
            const content = header.nextElementSibling;
            if (content.classList.contains('active')) {
                content.classList.remove('active');
                content.style.maxHeight = 0;
            } else {
                content.classList.add('active');
                // Set max-height to scrollHeight to allow smooth transition
                // A small buffer is added to ensure content is fully visible
                content.style.maxHeight = (content.scrollHeight + 50) + "px"; 
            }
        }

        // --- FUNCIONALIDADE DE SELEÇÃO DE PLANO PMP ---
        document.addEventListener('DOMContentLoaded', () => {
            const selectPMPPlan = document.getElementById('selectPMPPlan');
            const pmpPlanContents = document.querySelectorAll('#pmpPlanContent > div');

            function showSelectedPMPPlan() {
                const selectedValue = selectPMPPlan.value;
                pmpPlanContents.forEach(contentDiv => {
                    if (contentDiv.id === selectedValue + '_content') {
                        contentDiv.classList.remove('hidden');
                        // Optionally, open the first collapsible section by default when a plan is selected
                        const firstHeader = contentDiv.querySelector('.collapsible-header');
                        if (firstHeader && !firstHeader.classList.contains('active')) {
                            // Delay to allow content to render before calculating scrollHeight
                            setTimeout(() => toggleCollapsible(firstHeader), 100); 
                        }
                    } else {
                        contentDiv.classList.add('hidden');
                        // Ensure all collapsibles within hidden sections are closed
                        contentDiv.querySelectorAll('.collapsible-content.active').forEach(c => {
                            c.classList.remove('active');
                            c.style.maxHeight = 0;
                        });
                        contentDiv.querySelectorAll('.collapsible-header.active').forEach(h => {
                            h.classList.remove('active');
                        });
                    }
                });
            }

            selectPMPPlan.addEventListener('change', showSelectedPMPPlan);

            // Hide all plan contents initially
            pmpPlanContents.forEach(contentDiv => contentDiv.classList.add('hidden'));

            // If a plan is pre-selected (e.g., from URL parameter), show it
            // For now, it will just default to nothing shown until a selection is made
        });

        // Ensure functions are globally accessible
        window.toggleDropdown = toggleDropdown;
        window.logout = logout;
        window.toggleCollapsible = toggleCollapsible;
    