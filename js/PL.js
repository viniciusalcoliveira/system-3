// Função para alternar a visibilidade dos dropdowns do cabeçalho
        function toggleDropdown(menuId, event) {
            const menu = document.getElementById(menuId);
            document.querySelectorAll('.dropdown-content').forEach(openMenu => {
                if (openMenu.id !== menuId && !openMenu.classList.contains('hidden')) {
                    openMenu.classList.add('hidden');
                    openMenu.classList.remove('flex');
                }
            });
            menu.classList.toggle('hidden');
            menu.classList.toggle('flex');
            event.stopPropagation();
        }

        // Close dropdowns when clicking outside
        document.addEventListener('click', function(event) {
            document.querySelectorAll('.dropdown-content').forEach(menu => {
                if (!menu.closest('.dropdown').contains(event.target)) {
                    menu.classList.add('hidden');
                    menu.classList.remove('flex');
                }
            });
        });

        function logout() {
            alert('Saindo...');
            window.location.href = 'login.html';
        }

        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('cadastroPlanoForm');
            const servicoTrocarSelect = document.getElementById('servico-trocar');
            const detalhesTrocarDiv = document.getElementById('detalhes-trocar');
            const trocarTipoSelect = document.getElementById('trocar-tipo');
            const trocarOleoDiv = document.getElementById('trocar-oleo');
            const trocarPecaDiv = document.getElementById('trocar-peca');
            const selectAllCompartmentsButton = document.getElementById('selectAllCompartments');
            const compartmentCheckboxes = document.querySelectorAll('input[name="compartimento"]');
            const toggleSubfieldSelects = document.querySelectorAll('.toggle-subfield');

            // Elements for service plan type selection
            const optionCriarPlano = document.getElementById('option-criar-plano');
            const optionPlanoPremium = document.getElementById('option-plano-premium');
            const criarPlanoDetalhes = document.getElementById('criarPlanoDetalhes');
            const planoPremiumDetalhes = document.getElementById('planoPremiumDetalhes');

            let currentServicePlanType = null; // Initial state: no plan type selected

            // Function to reset all custom service inputs
            function resetCustomServiceInputs() {
                toggleSubfieldSelects.forEach(select => {
                    select.value = ''; // Reset select to default option "Selecione"
                    const targetDiv = document.getElementById(select.dataset.target);
                    if (targetDiv) {
                        targetDiv.classList.add('hidden'); // Ensure subfields are hidden
                        targetDiv.classList.remove('fade-in');
                        targetDiv.querySelectorAll('input, select').forEach(el => {
                            if (el.tagName === 'SELECT') {
                                el.value = '';
                            } else {
                                el.value = '';
                            }
                        });
                    }
                });
                // Ensure specific "Trocar" sub-sub-fields are hidden and cleared
                trocarOleoDiv.classList.add('hidden');
                trocarPecaDiv.classList.add('hidden');
                trocarOleoDiv.classList.remove('fade-in');
                trocarPecaDiv.classList.remove('fade-in');
                if (trocarTipoSelect) trocarTipoSelect.value = ''; // Reset "O que deseja trocar?"
            }

            // Function to handle selection logic for service plan types
            function selectServicePlanType(type) {
                // Remove selected class from both
                optionCriarPlano.classList.remove('selected');
                optionPlanoPremium.classList.remove('selected');

                // Hide both detail sections
                criarPlanoDetalhes.classList.add('hidden');
                criarPlanoDetalhes.classList.remove('fade-in');
                planoPremiumDetalhes.classList.add('hidden');
                planoPremiumDetalhes.classList.remove('fade-in');

                // Apply selected class and show relevant details
                if (type === 'criar-plano') {
                    optionCriarPlano.classList.add('selected');
                    criarPlanoDetalhes.classList.remove('hidden');
                    criarPlanoDetalhes.classList.add('fade-in');
                    // Ensure all subfields inside criarPlanoDetalhes are initially hidden
                    resetCustomServiceInputs();
                } else if (type === 'plano-premium') {
                    optionPlanoPremium.classList.add('selected');
                    planoPremiumDetalhes.classList.remove('hidden');
                    planoPremiumDetalhes.classList.add('fade-in');
                    resetCustomServiceInputs(); // Clear custom inputs when premium is chosen
                }
                currentServicePlanType = type; // Update the global state
            }

            // Event listeners for service plan type selection
            optionCriarPlano.addEventListener('click', () => selectServicePlanType('criar-plano'));
            optionPlanoPremium.addEventListener('click', () => selectServicePlanType('plano-premium'));

            // --- Dynamic Field Visibility for Services (only if 'criar plano' is active) ---
            toggleSubfieldSelects.forEach(select => {
                // Ensure initial state of each subfield is hidden (redundant, but safe)
                const targetDiv = document.getElementById(select.dataset.target);
                if (targetDiv) {
                    targetDiv.classList.add('hidden');
                    targetDiv.classList.remove('fade-in');
                }

                select.addEventListener('change', function() {
                    // Only run if "Criar Plano" is selected and this specific service is chosen
                    if (currentServicePlanType !== 'criar-plano') return;

                    const targetId = this.dataset.target;
                    const targetDiv = document.getElementById(targetId);

                    if (targetDiv) {
                        if (this.value === 'sim') {
                            targetDiv.classList.remove('hidden');
                            targetDiv.classList.add('fade-in');
                        } else {
                            targetDiv.classList.add('hidden');
                            targetDiv.classList.remove('fade-in');
                            // Clear inputs within the hidden subfield
                            targetDiv.querySelectorAll('input, select').forEach(el => {
                                if (el.tagName === 'SELECT') {
                                    el.value = '';
                                } else {
                                    el.value = '';
                                }
                            });
                            // Special handling for 'servico-trocar' to hide its nested fields
                            if (this.id === 'servico-trocar') {
                                trocarOleoDiv.classList.add('hidden');
                                trocarPecaDiv.classList.add('hidden');
                                trocarOleoDiv.classList.remove('fade-in');
                                trocarPecaDiv.classList.remove('fade-in');
                                if (trocarTipoSelect) trocarTipoSelect.value = '';
                            }
                        }
                    }
                });
            });

            // --- Specific Control for "O que deseja trocar?" ---
            if (trocarTipoSelect) {
                // Ensure initial state of 'trocar-oleo' and 'trocar-peca' is hidden
                trocarOleoDiv.classList.add('hidden');
                trocarPecaDiv.classList.add('hidden');

                trocarTipoSelect.addEventListener('change', function() {
                    if (currentServicePlanType !== 'criar-plano') return; // Only run if "Criar Plano" is selected

                    trocarOleoDiv.classList.add('hidden');
                    trocarPecaDiv.classList.add('hidden');
                    trocarOleoDiv.classList.remove('fade-in');
                    trocarPecaDiv.classList.remove('fade-in');

                    trocarOleoDiv.querySelectorAll('input').forEach(i => i.value = '');
                    trocarPecaDiv.querySelectorAll('input').forEach(i => i.value = '');

                    if (this.value === 'oleo') {
                        trocarOleoDiv.classList.remove('hidden');
                        trocarOleoDiv.classList.add('fade-in');
                    } else if (this.value === 'peca') {
                        trocarPecaDiv.classList.remove('hidden');
                        trocarPecaDiv.classList.add('fade-in');
                    }
                });
            }

            // --- "Select all Compartments" Button ---
            if (selectAllCompartmentsButton) {
                let allChecked = false;

                selectAllCompartmentsButton.addEventListener('click', function() {
                    allChecked = !allChecked;
                    compartmentCheckboxes.forEach(checkbox => {
                        checkbox.checked = allChecked;
                    });
                    const icon = this.querySelector('i');
                    const textNode = this.childNodes[1];

                    if (allChecked) {
                        icon.className = 'ph ph-x-square';
                        textNode.nodeValue = ' Deselecionar todos os Compartimentos';
                    } else {
                        icon.className = 'ph ph-check-square';
                        textNode.nodeValue = ' Selecione todos os Compartimentos';
                    }
                });
            }

            // --- Form Submission Handling ---
            if (form) {
                form.addEventListener('submit', function(event) {
                    event.preventDefault();

                    const formData = {
                        veiculo: document.getElementById('veiculo').value,
                        periodicidade: document.getElementById('periodicidade').value,
                        compartimentos: Array.from(compartmentCheckboxes)
                            .filter(checkbox => checkbox.checked)
                            .map(checkbox => checkbox.value),
                        tipoPlanoServico: currentServicePlanType
                    };

                    if (currentServicePlanType === 'criar-plano') {
                        formData.servicosCustomizados = {
                            trocar: servicoTrocarSelect.value,
                            trocarDetalhes: {},
                            limpar: document.getElementById('servico-limpar').value,
                            obsLimpar: document.getElementById('obs-limpar').value,
                            lubrificar: document.getElementById('servico-lubrificar').value,
                            obsLubrificar: document.getElementById('obs-lubrificar').value,
                            lavar: document.getElementById('servico-lavar').value,
                            obsLavar: document.getElementById('obs-lavar').value,
                            substituir: document.getElementById('servico-substituir').value,
                            obsSubstituir: document.getElementById('obs-substituir').value
                        };

                        if (formData.servicosCustomizados.trocar === 'sim') {
                            formData.servicosCustomizados.trocarDetalhes.tipo = trocarTipoSelect.value;
                            if (trocarTipoSelect.value === 'oleo') {
                                formData.servicosCustomizados.trocarDetalhes.litrosOleo = document.getElementById('litros-oleo').value;
                            } else if (trocarTipoSelect.value === 'peca') {
                                formData.servicosCustomizados.trocarDetalhes.refPeca = document.getElementById('ref-peca').value;
                                formData.servicosCustomizados.trocarDetalhes.quantPeca = document.getElementById('quant-peca').value;
                            }
                        }
                    } else { // Plano Premium
                        formData.servicosCustomizados = null; // No custom services for premium
                    }

                    console.log('Dados do Plano de Lubrificação:', formData);

                    alert('Plano de Lubrificação cadastrado com sucesso.');

                    form.reset();
                    // Reset service plan type selection to default (neither selected, both hidden)
                    optionCriarPlano.classList.remove('selected');
                    optionPlanoPremium.classList.remove('selected');
                    criarPlanoDetalhes.classList.add('hidden');
                    planoPremiumDetalhes.classList.add('hidden');
                    currentServicePlanType = null; // Reset to no selection
                    resetCustomServiceInputs(); // Ensure all custom fields are hidden and cleared

                    // Reset "Select all" button state
                    allChecked = false;
                    selectAllCompartmentsButton.querySelector('i').className = 'ph ph-check-square';
                    selectAllCompartmentsButton.childNodes[1].nodeValue = ' Selecione todos os Compartimentos';
                });
            }
        });