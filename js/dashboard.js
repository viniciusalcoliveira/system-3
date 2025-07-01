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

// --- FUNCIONALIDADE DE DROPDOWN MENUS ---
function toggleDropdown(id, event) {
    event.preventDefault();
    event.stopPropagation();

    const menu = document.getElementById(id);
    const isVisible = menu.classList.contains('animate-fade-in');

    document.querySelectorAll('.dropdown-content').forEach(m => {
        if (m !== menu) {
            m.classList.remove('flex', 'animate-fade-in');
            m.classList.add('hidden');
            if (m.previousElementSibling) {
                m.previousElementSibling.setAttribute('aria-expanded', 'false');
            }
        }
    });

    if (!isVisible) {
        menu.classList.remove('hidden');
        menu.classList.add('flex', 'animate-fade-in');
        if (menu.previousElementSibling) {
            menu.previousElementSibling.setAttribute('aria-expanded', 'true');
        }
    } else {
        menu.classList.remove('flex', 'animate-fade-in');
        menu.classList.add('hidden');
        if (menu.previousElementSibling) {
            menu.previousElementSibling.setAttribute('aria-expanded', 'false');
        }
    }
}

document.addEventListener('click', (event) => {
    const isClickInsideDropdown = event.target.closest('.dropdown');
    if (!isClickInsideDropdown) {
        document.querySelectorAll('.dropdown-content').forEach(menu => {
            if (menu.classList.contains('flex')) {
                menu.classList.remove('flex', 'animate-fade-in');
                menu.classList.add('hidden');
                if (menu.previousElementSibling) {
                    menu.previousElementSibling.setAttribute('aria-expanded', 'false');
                }
            }
        });
    }
});


// --- LÓGICA DO SEU ARQUIVO ORIGINAL DE O.S. E NOVAS FUNÇÕES DE VEÍCULO ---
document.addEventListener('DOMContentLoaded', () => {

    // --- DADOS FICTÍCIOS ---
    const costCenters = [
        { code: '101-AGRO', name: 'AgroNorte Grãos e Logística' },
        { code: '205-TEC', name: 'Connecta Soluções em TI' },
        { code: '310-IND', name: 'ConstruVale Engenharia Industrial' }
    ];

    // --- ELEMENTOS DO DOM ---
    const internalNavButtons = document.querySelectorAll('.nav-btn-internal');
    const views = document.querySelectorAll('.view');
    const osForm = document.getElementById('osForm');
    const openOsTableBody = document.getElementById('openOsTableBody');
    const closedOsTableBody = document.getElementById('closedOsTableBody');
    const noOpenOsMessage = document.getElementById('noOpenOsMessage');
    const noClosedOsMessage = document.getElementById('noClosedOsMessage');

    // Modal Elements (Centro de Custo)
    const costCenterModal = document.getElementById('costCenterModal');
    const openCostCenterModalBtn = document.getElementById('openCostCenterModalBtn');
    const costCenterTableBody = document.getElementById('costCenterTableBody');
    const costCenterInput = document.getElementById('centroCusto');

    // Elementos do formulário de O.S. (para preenchimento automático)
    const veiculoInput = document.getElementById('veiculo');
    const placaInput = document.getElementById('placa');
    const modeloInput = document.getElementById('modelo');
    const combustivelSelect = document.getElementById('combustivel');
    const horimetroInput = document.getElementById('horimetro');
    const odometroInput = document.getElementById('odometro');
    const vehicleDetailsDiv = document.getElementById('vehicleDetails');

    // Elementos do Modal de Busca de Veículos
    const searchVehicleBtn = document.getElementById('searchVehicleBtn');
    const vehicleSearchModal = document.getElementById('vehicleSearchModal');
    const closeVehicleSearchModalBtn = document.getElementById('closeVehicleSearchModalBtn');
    const foundVehiclesTableBody = document.getElementById('foundVehiclesTableBody');
    const noVehiclesFoundMessage = document.getElementById('noVehiclesFoundMessage');

    // Elementos do Modal de Confirmação Genérico
    const confirmModal = document.getElementById('confirmModal');
    const confirmModalTitle = document.getElementById('confirmModalTitle');
    const confirmModalMessage = document.getElementById('confirmModalMessage');
    const confirmModalYes = document.getElementById('confirmModalYes');
    const confirmModalNo = document.getElementById('confirmModalNo');


    // --- LÓGICA DE DADOS ---
    let osList = [];
    try {
        osList = JSON.parse(localStorage.getItem('osList')) || [];
        console.log("OS List loaded from localStorage:", osList);
    } catch (e) {
        console.error("Error parsing osList from localStorage:", e);
        osList = [];
    }
    const saveOsList = () => localStorage.setItem('osList', JSON.stringify(osList));

    let vehicles = [];
    try {
        vehicles = JSON.parse(localStorage.getItem('vehicles')) || []; // Carrega veículos do localStorage
        console.log("Vehicles loaded from localStorage:", vehicles);
    } catch (e) {
        console.error("Error parsing vehicles from localStorage:", e);
        vehicles = [];
    }

    // --- FUNÇÕES PRINCIPAIS ---

    /**
     * Alterna a exibição das diferentes seções da página (Agendar, O.S. Abertas, O.S. Fechadas).
     * @param {string} viewId - O ID da view a ser ativada.
     */
    const switchView = (viewId) => {
        views.forEach(view => {
            view.classList.remove('active-view');
        });
        document.getElementById(viewId).classList.add('active-view');

        internalNavButtons.forEach(button => {
            button.classList.remove('active', 'bg-blue-600', 'text-white', 'hover:bg-blue-700', 'shadow-md');
            button.classList.add('text-blue-800', 'bg-gray-100', 'hover:bg-gray-200', 'hover:text-blue-900', 'shadow-sm');
        });
        const activeButton = document.querySelector(`.nav-btn-internal[data-view="${viewId}"]`);
        if (activeButton) {
            activeButton.classList.add('active', 'bg-blue-600', 'text-white', 'hover:bg-blue-700', 'shadow-md');
            activeButton.classList.remove('text-blue-800', 'bg-gray-100', 'hover:bg-gray-200', 'hover:text-blue-900', 'shadow-sm');
        }
        renderTables(); // Renderiza as tabelas sempre que a view muda
    };

    /**
     * Renderiza as tabelas de O.S. abertas e fechadas.
     */
    const renderTables = () => {
        openOsTableBody.innerHTML = '';
        closedOsTableBody.innerHTML = '';

        const abertas = osList.filter(os => os.status === 'Aberta');
        const fechadas = osList.filter(os => os.status === 'Fechada');

        noOpenOsMessage.style.display = abertas.length === 0 ? 'block' : 'none';
        noClosedOsMessage.style.display = fechadas.length === 0 ? 'block' : 'none';

        abertas.sort((a, b) => b.id - a.id).forEach(os => {
            const row = openOsTableBody.insertRow();
            row.innerHTML = `
                <td class="px-4 py-3">${os.id}</td>
                <td class="px-4 py-3 font-semibold">${os.veiculo}<br><span class="text-sm text-gray-500">${os.placa}</span></td>
                <td class="px-4 py-3">${os.motorista || '-'}</td>
                <td class="px-4 py-3">${os.data} ${os.hora}</td>
                <td class="px-4 py-3"><span class="priority-tag priority-${os.prioridade}">${os.prioridade}</span></td>
                <td class="px-4 py-3">${os.tipoManutencao}</td>
                <td class="px-4 py-3 action-buttons">
                    <button class="text-blue-600 hover:text-blue-800" onclick="editOs(${os.id})"><i class="ph ph-pencil"></i></button>
                    <button class="text-green-600 hover:text-green-800 ml-2" onclick="closeOs(${os.id})"><i class="ph ph-check-circle"></i></button>
                    <button class="text-red-600 hover:text-red-800 ml-2" onclick="showConfirmModal('Excluir O.S.', 'Tem certeza que deseja excluir esta Ordem de Serviço?', () => deleteOs(${os.id}))"><i class="ph ph-trash"></i></button>
                </td>
            `;
        });

        fechadas.sort((a, b) => b.id - a.id).forEach(os => {
            const row = closedOsTableBody.insertRow();
            row.innerHTML = `
                <td class="px-4 py-3">${os.id}</td>
                <td class="px-4 py-3 font-semibold">${os.veiculo}<br><span class="text-sm text-gray-500">${os.placa}</span></td>
                <td class="px-4 py-3">${os.dataConclusao || '-'}</td>
                <td class="px-4 py-3">${os.tipoManutencao}</td>
                <td class="px-4 py-3">${os.motivo}</td>
            `;
        });
    };

    /**
     * Abre o modal de Centro de Custo e preenche a tabela.
     */
    const openCostCenterModal = () => {
        costCenterTableBody.innerHTML = ''; // Limpa a tabela
        costCenters.forEach(cc => {
            const row = costCenterTableBody.insertRow();
            row.innerHTML = `
                <td class="px-4 py-3">${cc.code}</td>
                <td class="px-4 py-3">${cc.name}</td>
                <td class="px-4 py-3">
                    <button class="btn-select-cc" data-code="${cc.code}">Selecionar</button>
                </td>
            `;
        });
        costCenterModal.classList.remove('opacity-0', 'pointer-events-none');
        costCenterModal.classList.add('opacity-100');
        costCenterModal.querySelector('.modal-content').classList.remove('-translate-y-5');
    };

    /**
     * Fecha o modal de Centro de Custo.
     */
    const closeCostCenterModal = () => {
        costCenterModal.classList.remove('opacity-100');
        costCenterModal.classList.add('opacity-0', 'pointer-events-none');
        costCenterModal.querySelector('.modal-content').classList.add('-translate-y-5');
    };

    /**
     * Abre o modal de busca de veículos e preenche a tabela com os resultados.
     * @param {Array} foundVehicles - Array de veículos encontrados.
     */
    const openVehicleSearchModal = (foundVehicles) => {
        foundVehiclesTableBody.innerHTML = '';
        if (foundVehicles.length === 0) {
            noVehiclesFoundMessage.classList.remove('hidden');
        } else {
            noVehiclesFoundMessage.classList.add('hidden');
            foundVehicles.forEach(vehicle => {
                const row = foundVehiclesTableBody.insertRow();
                row.innerHTML = `
                    <td class="px-4 py-3">${vehicle.nome || ''}</td>
                    <td class="px-4 py-3">${vehicle.marca || ''}</td>
                    <td class="px-4 py-3">${vehicle.modelo || ''}</td>
                    <td class="px-4 py-3">${vehicle.placa || ''}</td>
                    <td class="px-4 py-3">${vehicle.tipoVeiculo || ''}</td>
                    <td class="px-4 py-3">
                        <button class="btn-select-cc" data-id="${vehicle.id}">Selecionar</button>
                    </td>
                `;
            });
        }
        vehicleSearchModal.classList.remove('opacity-0', 'pointer-events-none');
        vehicleSearchModal.classList.add('opacity-100');
        vehicleSearchModal.querySelector('.modal-content').classList.remove('-translate-y-5');
    };

    /**
     * Fecha o modal de busca de veículos.
     */
    const closeVehicleSearchModal = () => {
        vehicleSearchModal.classList.remove('opacity-100');
        vehicleSearchModal.classList.add('opacity-0', 'pointer-events-none');
        vehicleSearchModal.querySelector('.modal-content').classList.add('-translate-y-5');
    };

    /**
     * Preenche os campos do formulário com os dados do veículo selecionado.
     * @param {object} vehicle - O objeto veículo com os dados.
     */
    const populateVehicleFields = (vehicle) => {
        veiculoInput.value = vehicle.nome || '';
        placaInput.value = vehicle.placa || '';
        modeloInput.value = vehicle.modelo || '';
        combustivelSelect.value = vehicle.combustivel || 'Diesel'; // Define um valor padrão se vazio
        horimetroInput.value = vehicle.km || ''; // Usando KM como horímetro/odômetro inicial
        odometroInput.value = vehicle.km || '';

        vehicleDetailsDiv.innerHTML = `
            <p><strong>Marca:</strong> ${vehicle.marca || '-'}</p>
            <p><strong>Modelo:</strong> ${vehicle.modelo || '-'}</p>
            <p><strong>Tipo:</strong> ${vehicle.tipoVeiculo || '-'}</p>
            <p><strong>Cor:</strong> ${vehicle.cor || '-'}</p>
            <p><strong>Ano:</strong> ${vehicle.ano || '-'}</p>
            <p><strong>Última Revisão:</strong> ${vehicle.revisao || '-'}</p>
        `;
    };

    /**
     * Exibe o modal de confirmação genérico.
     * @param {string} title - Título do modal.
     * @param {string} message - Mensagem do modal.
     * @param {function} onConfirm - Função a ser executada se o usuário confirmar.
     */
    const showConfirmModal = (title, message, onConfirm) => {
        confirmModalTitle.textContent = title;
        confirmModalMessage.textContent = message;
        confirmModal.classList.remove('hidden');
        confirmModal.classList.add('animate-fade-in');

        const handleConfirm = () => {
            onConfirm();
            hideConfirmModal();
            confirmModalYes.removeEventListener('click', handleConfirm);
            confirmModalNo.removeEventListener('click', handleCancel);
        };

        const handleCancel = () => {
            hideConfirmModal();
            confirmModalYes.removeEventListener('click', handleConfirm);
            confirmModalNo.removeEventListener('click', handleCancel);
        };

        confirmModalYes.addEventListener('click', handleConfirm);
        confirmModalNo.addEventListener('click', handleCancel);

        // Fecha o modal se clicar fora
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) {
                handleCancel();
            }
        }, { once: true }); // Garante que o listener seja removido após o primeiro clique
    };

    /**
     * Esconde o modal de confirmação genérico.
     */
    const hideConfirmModal = () => {
        confirmModal.classList.remove('animate-fade-in');
        confirmModal.classList.add('animate-fade-out');
        confirmModal.addEventListener('animationend', () => {
            confirmModal.classList.add('hidden');
            confirmModal.classList.remove('animate-fade-out');
        }, { once: true });
    };


    // --- LISTENERS DE EVENTOS ---

    // Navegação interna (Agendar, Abertas, Fechadas)
    internalNavButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchView(button.dataset.view);
        });
    });

    // Envio do formulário de O.S.
    osForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newOs = {
            id: osList.length > 0 ? Math.max(...osList.map(os => os.id)) + 1 : 1,
            veiculo: veiculoInput.value,
            placa: placaInput.value,
            modelo: modeloInput.value,
            motorista: document.getElementById('motorista').value.trim(),
            centroCusto: costCenterInput.value.trim(),
            combustivel: combustivelSelect.value,
            horimetro: horimetroInput.value,
            odometro: odometroInput.value,
            tipoManutencao: document.getElementById('tipoManutencao').value,
            prioridade: document.getElementById('prioridade').value,
            data: document.getElementById('data').value,
            hora: document.getElementById('hora').value,
            motivo: document.getElementById('motivo').value.trim(),
            status: 'Aberta'
        };

        // Validação simples
        if (!newOs.veiculo || !newOs.placa || !newOs.data || !newOs.hora || !newOs.motivo) {
            console.error("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        osList.push(newOs);
        saveOsList();
        osForm.reset(); // Limpa o formulário
        vehicleDetailsDiv.innerHTML = 'Nenhum veículo selecionado.'; // Limpa os detalhes do veículo
        renderTables(); // Atualiza as tabelas
        switchView('abertasView'); // Muda para a view de O.S. Abertas
    });

    // Abrir modal de Centro de Custo
    openCostCenterModalBtn.addEventListener('click', openCostCenterModal);

    // Fechar modal de Centro de Custo
    costCenterModal.querySelector('.modal-close-btn').addEventListener('click', closeCostCenterModal);
    costCenterModal.addEventListener('click', (e) => {
        if (e.target === costCenterModal) {
            closeCostCenterModal();
        }
    });

    // Selecionar Centro de Custo na tabela do modal
    costCenterTableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-select-cc')) {
            costCenterInput.value = e.target.dataset.code;
            closeCostCenterModal();
        }
    });

    // Botão de busca de veículo
    searchVehicleBtn.addEventListener('click', () => {
        const searchTerm = veiculoInput.value.trim().toLowerCase();
        if (searchTerm) {
            const foundVehicles = vehicles.filter(v => v.nome.toLowerCase().includes(searchTerm));
            openVehicleSearchModal(foundVehicles);
        } else {
            // Se o campo de busca estiver vazio, pode-se optar por mostrar todos os veículos
            // ou uma mensagem para o usuário digitar algo. Por enquanto, mostra todos.
            openVehicleSearchModal(vehicles);
        }
    });

    // Fechar modal de busca de veículos
    closeVehicleSearchModalBtn.addEventListener('click', closeVehicleSearchModal);
    vehicleSearchModal.addEventListener('click', (e) => {
        if (e.target === vehicleSearchModal) {
            closeVehicleSearchModal();
        }
    });

    // Selecionar veículo na tabela do modal de busca
    foundVehiclesTableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-select-cc')) {
            const vehicleId = e.target.dataset.id;
            const selectedVehicle = vehicles.find(v => v.id === vehicleId);
            if (selectedVehicle) {
                populateVehicleFields(selectedVehicle);
                closeVehicleSearchModal();
            }
        }
    });

    // Funções globais para botões de ação na tabela (para serem acessíveis via onclick no HTML)
    window.editOs = (id) => {
        const osToEdit = osList.find(os => os.id === id);
        if (osToEdit) {
            // Preenche o formulário para edição
            veiculoInput.value = osToEdit.veiculo;
            placaInput.value = osToEdit.placa;
            modeloInput.value = osToEdit.modelo;
            document.getElementById('motorista').value = osToEdit.motorista;
            costCenterInput.value = osToEdit.centroCusto;
            combustivelSelect.value = osToEdit.combustivel;
            horimetroInput.value = osToEdit.horimetro;
            odometroInput.value = osToEdit.odometro;
            document.getElementById('tipoManutencao').value = osToEdit.tipoManutencao;
            document.getElementById('prioridade').value = osToEdit.prioridade;
            document.getElementById('data').value = osToEdit.data;
            document.getElementById('hora').value = osToEdit.hora;
            document.getElementById('motivo').value = osToEdit.motivo;

            // Remove a OS da lista para que seja adicionada novamente com as edições
            osList = osList.filter(os => os.id !== id);
            saveOsList();
            renderTables();
            switchView('agendarView'); // Volta para a view de agendamento para editar
        }
    };

    window.closeOs = (id) => {
        const osToClose = osList.find(os => os.id === id);
        if (osToClose) {
            osToClose.status = 'Fechada';
            osToClose.dataConclusao = new Date().toISOString().split('T')[0]; // Data de hoje
            saveOsList();
            renderTables();
        }
    };

    window.deleteOs = (id) => {
        osList = osList.filter(os => os.id !== id);
        saveOsList();
        renderTables();
    };

    // Inicialização
    renderTables();

    // Verifica se há um nome de veículo armazenado do `cadastro_veiculos.js`
    const agendamentoVehicleName = localStorage.getItem('agendamentoVehicleName');
    if (agendamentoVehicleName) {
        veiculoInput.value = agendamentoVehicleName;
        localStorage.removeItem('agendamentoVehicleName'); // Limpa após usar

        // Tenta buscar e preencher os dados do veículo automaticamente
        const foundVehicle = vehicles.find(v => v.nome.toLowerCase() === agendamentoVehicleName.toLowerCase());
        if (foundVehicle) {
            populateVehicleFields(foundVehicle);
        } else {
            vehicleDetailsDiv.innerHTML = 'Veículo não encontrado. Por favor, verifique o nome.';
        }
    }
});
