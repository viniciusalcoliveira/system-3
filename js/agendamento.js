// js/agendamento.js

// --- SEGURANÇA DE LOGIN E FUNÇÕES GLOBAIS DE DROPDOWN ---
// Essas funções são mantidas globalmente para serem acessíveis diretamente do HTML
// (especialmente para o cabeçalho, que pode ser reutilizado em várias páginas).

/**
 * Função para alternar a visibilidade dos menus dropdown no cabeçalho.
 * @param {string} id - O ID do elemento dropdown-content.
 * @param {Event} event - O evento de clique.
 */
// A função toggleDropdown e o listener de document.addEventListener('click')
// estão agora no HTML, para que possam ser usados em todas as páginas.
// Removendo a duplicação aqui.

/**
 * Função para realizar logout.
 */
function logout() {
    // Usa o modal de confirmação genérico antes de deslogar
    showConfirmModal('Sair', 'Tem certeza que deseja sair?', () => {
        localStorage.removeItem('logado'); // Remove o status de login
        // Verifica se está em um ambiente Canvas (se __app_id é definido)
        if (typeof __app_id === 'undefined') {
            window.location.href = 'index.html'; // Redireciona para a página de login
        } else {
            console.log("Running in Canvas environment, logout simulated.");
        }
    });
}
window.logout = logout; // Torna a função globalmente acessível para o HTML

// --- VARIÁVEIS GLOBAIS E ELEMENTOS DOM (ESPECÍFICOS DE AGENDAMENTO) ---
let osList = []; // Lista de Ordens de Serviço
let vehicles = []; // Lista de veículos carregados do localStorage
let currentVehicleId = null; // ID do veículo atualmente selecionado no formulário de O.S.

// Elementos do DOM - Navegação e Views
const internalNavButtons = document.querySelectorAll('.nav-btn-internal');
const views = document.querySelectorAll('.view');

// Elementos do DOM - Formulário de O.S.
const osForm = document.getElementById('osForm');
const veiculoInput = document.getElementById('veiculo');
const placaInput = document.getElementById('placa');
const modeloInput = document.getElementById('modelo');
const centroCustoInput = document.getElementById('centroCusto');
const combustivelSelect = document.getElementById('combustivel');
const horimetroInput = document.getElementById('horimetro');
const odometroInput = document.getElementById('odometro');
const tipoManutencaoSelect = document.getElementById('tipoManutencao');
const prioridadeSelect = document.getElementById('prioridade');
const dataInput = document.getElementById('data');
const horaInput = document.getElementById('hora');
const motivoTextarea = document.getElementById('motivo');
const vehicleDetailsDiv = document.getElementById('vehicleDetails');

// Elementos do DOM - Tabelas de O.S.
const openOsTableBody = document.getElementById('openOsTableBody');
const closedOsTableBody = document.getElementById('closedOsTableBody');
const noOpenOsMessage = document.getElementById('noOpenOsMessage');
const noClosedOsMessage = document.getElementById('noClosedOsMessage');

// Elementos do DOM - Modal Centro de Custo
const costCenterModal = document.getElementById('costCenterModal');
const openCostCenterModalBtn = document.getElementById('openCostCenterModalBtn');
const costCenterTableBody = document.getElementById('costCenterTableBody');
const closeCostCenterModalBtn = costCenterModal.querySelector('.modal-close-btn');

// Elementos do DOM - Modal Busca de Veículos
const searchVehicleBtn = document.getElementById('searchVehicleBtn');
const vehicleSearchModal = document.getElementById('vehicleSearchModal');
const closeVehicleSearchModalBtn = document.getElementById('closeVehicleSearchModalBtn');
const foundVehiclesTableBody = document.getElementById('foundVehiclesTableBody');
const noVehiclesFoundMessage = document.getElementById('noVehiclesFoundMessage');

// Elementos do DOM - Modal Confirmação Genérica
const confirmModal = document.getElementById('confirmModal');
const confirmModalTitle = document.getElementById('confirmModalTitle');
const confirmModalMessage = document.getElementById('confirmModalMessage');
const confirmModalYes = document.getElementById('confirmModalYes');
const confirmModalNo = document.getElementById('confirmModalNo');
let confirmCallback = null; // Para armazenar a callback do modal de confirmação

// Elemento para feedback ao usuário
const userFeedbackDiv = document.getElementById('userFeedback');

// --- DADOS FICTÍCIOS ---
// Você pode carregar isso de um DB ou API real se tiver um backend
const costCenters = [
    { code: '101-AGRO', name: 'AgroNorte Grãos e Logística' },
    { code: '205-TEC', name: 'Connecta Soluções em TI' },
    { code: '310-IND', name: 'ConstruVale Engenharia Industrial' },
    { code: '400-ADM', name: 'Sede Administrativa' },
    { code: '500-LOG', name: 'Logística de Distribuição' },
    { code: '600-PROD', name: 'Produção Industrial' }
];

// --- FUNÇÕES DE UTILITÁRIOS ---

/**
 * Exibe uma mensagem de feedback ao usuário.
 * @param {string} message - A mensagem a ser exibida.
 * @param {boolean} isSuccess - True para sucesso (verde), false para erro (vermelho).
 */
function showUserFeedback(message, isSuccess = true) {
    userFeedbackDiv.textContent = message;
    userFeedbackDiv.className = `fixed top-20 right-4 px-4 py-2 rounded-lg shadow-lg z-[1001] animate-fade-in ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`;
    userFeedbackDiv.classList.remove('hidden');
    setTimeout(() => {
        userFeedbackDiv.classList.add('hidden');
        userFeedbackDiv.classList.remove('animate-fade-in');
    }, 3000);
}

/**
 * Salva a lista de O.S. no localStorage.
 */
function saveOsList() {
    localStorage.setItem('osList', JSON.stringify(osList));
}

/**
 * Carrega a lista de O.S. do localStorage.
 */
function loadOsList() {
    try {
        osList = JSON.parse(localStorage.getItem('osList')) || [];
    } catch (e) {
        console.error("Erro ao carregar lista de O.S. do localStorage:", e);
        osList = [];
    }
}

/**
 * Carrega a lista de veículos do localStorage (do cadastroveiculos.js).
 */
function loadVehiclesFromLocalStorage() {
    try {
        vehicles = JSON.parse(localStorage.getItem('vehicles')) || [];
    } catch (e) {
        console.error("Erro ao carregar veículos do localStorage:", e);
        vehicles = [];
    }
}

/**
 * Abre um modal com animação.
 * @param {HTMLElement} modalElement - O elemento do modal a ser aberto.
 */
function openModal(modalElement) {
    modalElement.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
    modalElement.classList.add('opacity-100');
    modalElement.querySelector('.modal-content').classList.remove('-translate-y-5');
}

/**
 * Fecha um modal com animação.
 * @param {HTMLElement} modalElement - O elemento do modal a ser fechado.
 */
function closeModal(modalElement) {
    modalElement.classList.remove('opacity-100');
    modalElement.classList.add('opacity-0', 'pointer-events-none');
    modalElement.querySelector('.modal-content').classList.add('-translate-y-5');
    setTimeout(() => {
        modalElement.classList.add('hidden');
    }, 300); // Tempo da transição
}

/**
 * Exibe o modal de confirmação genérico.
 * @param {string} title - Título do modal.
 * @param {string} message - Mensagem do modal.
 * @param {Function} onConfirm - Função a ser executada se o usuário confirmar.
 */
function showConfirmModal(title, message, onConfirm) {
    confirmModalTitle.textContent = title;
    confirmModalMessage.textContent = message;
    confirmCallback = onConfirm; // Armazena a função de callback

    // Remove listeners antigos para evitar múltiplas execuções
    confirmModalYes.removeEventListener('click', handleConfirmClick);
    confirmModalNo.removeEventListener('click', handleCancelClick);

    // Adiciona novos listeners
    confirmModalYes.addEventListener('click', handleConfirmClick);
    confirmModalNo.addEventListener('click', handleCancelClick);

    openModal(confirmModal);
}

/**
 * Esconde o modal de confirmação genérico.
 */
function hideConfirmModal() {
    closeModal(confirmModal);
    confirmCallback = null; // Limpa a callback
}

// Handlers para os botões do modal de confirmação
function handleConfirmClick() {
    if (confirmCallback) {
        confirmCallback();
    }
    hideConfirmModal();
}

function handleCancelClick() {
    hideConfirmModal();
}

// --- FUNÇÕES DE LÓGICA DE NEGÓCIO ---

/**
 * Alterna a exibição das diferentes seções da página.
 * @param {string} viewId - O ID da view a ser ativada.
 */
const switchView = (viewId) => {
    views.forEach(view => {
        view.classList.add('hidden'); // Esconde todas as views
    });
    document.getElementById(viewId).classList.remove('hidden'); // Mostra a view selecionada

    internalNavButtons.forEach(button => {
        button.classList.remove('active', 'bg-blue-600', 'text-white', 'hover:bg-blue-700', 'shadow-md');
        button.classList.add('text-blue-800', 'bg-gray-100', 'hover:bg-gray-200', 'hover:text-blue-900', 'shadow-sm');
    });
    const activeButton = document.querySelector(`.nav-btn-internal[data-view="${viewId}"]`);
    if (activeButton) {
        activeButton.classList.add('active', 'bg-blue-600', 'text-white', 'hover:bg-blue-700', 'shadow-md');
        activeButton.classList.remove('text-blue-800', 'bg-gray-100', 'hover:bg-gray-200', 'hover:text-blue-900', 'shadow-sm');
    }
    renderOsTables(); // Renderiza as tabelas sempre que a view muda
};

/**
 * Renderiza as tabelas de O.S. abertas e fechadas.
 */
const renderOsTables = () => {
    openOsTableBody.innerHTML = '';
    closedOsTableBody.innerHTML = '';

    const abertas = osList.filter(os => os.status === 'Aberta');
    const fechadas = osList.filter(os => os.status === 'Fechada');

    // Mostra/esconde a mensagem de "nenhuma OS"
    noOpenOsMessage.classList.toggle('hidden', abertas.length > 0);
    noClosedOsMessage.classList.toggle('hidden', fechadas.length > 0);

    // --- Renderiza O.S. Abertas ---
    abertas.sort((a, b) => b.id - a.id).forEach(os => {
        const row = openOsTableBody.insertRow();
        row.className = 'hover:bg-gray-50 transition-colors duration-150';
        row.innerHTML = `
            <td class="px-4 py-3">${os.id}</td>
            <td class="px-4 py-3 font-semibold">${os.veiculo}<br><span class="text-sm text-gray-500">${os.placa}</span></td>
            <td class="px-4 py-3">${os.data} ${os.hora}</td>
            <td class="px-4 py-3">${os.tipoManutencao}</td>
            <td class="px-4 py-3"><span class="inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPriorityClass(os.prioridade)}">${os.prioridade}</span></td>
            <td class="px-4 py-3 action-buttons">
                <button class="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50" onclick="editOs(${os.id})" title="Editar"><i class="ph ph-pencil text-xl"></i></button>
                <button class="text-green-600 hover:text-green-800 ml-2 p-1 rounded-full hover:bg-green-50" onclick="closeOs(${os.id})" title="Fechar O.S."><i class="ph ph-check-circle text-xl"></i></button>
                <button class="text-red-600 hover:text-red-800 ml-2 p-1 rounded-full hover:bg-red-50" onclick="confirmDeleteOs(${os.id})" title="Excluir"><i class="ph ph-trash text-xl"></i></button>
            </td>
        `;
    });

    // --- Renderiza O.S. Fechadas ---
    fechadas.sort((a, b) => b.id - a.id).forEach(os => {
        const row = closedOsTableBody.insertRow();
        row.className = 'hover:bg-gray-50 transition-colors duration-150';
        row.innerHTML = `
            <td class="px-4 py-3">${os.id}</td>
            <td class="px-4 py-3 font-semibold">${os.veiculo}<br><span class="text-sm text-gray-500">${os.placa}</span></td>
            <td class="px-4 py-3">${os.dataConclusao || '-'}</td>
            <td class="px-4 py-3">${os.tipoManutencao}</td>
            <td class="px-4 py-3">${os.motivo || '-'}</td>
        `;
    });
};

/**
 * Retorna a classe CSS para o estilo da prioridade.
 * @param {string} priority - A string de prioridade (Baixa, Média, Alta, Urgente).
 * @returns {string} Classes Tailwind CSS.
 */
function getPriorityClass(priority) {
    switch (priority) {
        case 'Baixa': return 'bg-blue-100 text-blue-800';
        case 'Média': return 'bg-yellow-100 text-yellow-800';
        case 'Alta': return 'bg-orange-100 text-orange-800';
        case 'Urgente': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

/**
 * Abre o modal de Centro de Custo e preenche a tabela.
 */
const openCostCenterModal = () => {
    costCenterTableBody.innerHTML = ''; // Limpa a tabela

    // Adiciona os centros de custo dinamicamente
    costCenters.forEach(cc => {
        const row = costCenterTableBody.insertRow();
        row.className = 'hover:bg-gray-50 transition-colors duration-150';
        row.innerHTML = `
            <td class="px-4 py-3">${cc.code}</td>
            <td class="px-4 py-3">${cc.name}</td>
            <td class="px-4 py-3">
                <button class="btn-select-cc bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm" data-code="${cc.code}" data-name="${cc.name}">Selecionar</button>
            </td>
        `;
    });
    openModal(costCenterModal);
};

/**
 * Fecha o modal de Centro de Custo.
 */
const closeCostCenterModal = () => {
    closeModal(costCenterModal);
};

/**
 * Abre o modal de busca de veículos e preenche a tabela com os resultados.
 * @param {Array} vehiclesToDisplay - Array de veículos a serem exibidos.
 */
const openVehicleSearchModal = (vehiclesToDisplay) => {
    foundVehiclesTableBody.innerHTML = '';
    if (vehiclesToDisplay.length === 0) {
        noVehiclesFoundMessage.classList.remove('hidden');
    } else {
        noVehiclesFoundMessage.classList.add('hidden');
        vehiclesToDisplay.forEach(vehicle => {
            const row = foundVehiclesTableBody.insertRow();
            row.className = 'hover:bg-gray-50 transition-colors duration-150';
            row.innerHTML = `
                <td class="px-4 py-3">${vehicle.nome || ''}</td>
                <td class="px-4 py-3">${vehicle.marca || ''}</td>
                <td class="px-4 py-3">${vehicle.modelo || ''}</td>
                <td class="px-4 py-3">${vehicle.placa || ''}</td>
                <td class="px-4 py-3">${vehicle.tipoVeiculo || ''}</td>
                <td class="px-4 py-3">
                    <button class="btn-select-vehicle bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm" data-id="${vehicle.id}">Selecionar</button>
                </td>
            `;
        });
    }
    openModal(vehicleSearchModal);
};

/**
 * Fecha o modal de busca de veículos.
 */
const closeVehicleSearchModal = () => {
    closeModal(vehicleSearchModal);
};

/**
 * Preenche os campos do formulário de O.S. com os dados do veículo selecionado.
 * Habilita/desabilita campos de odômetro/horímetro/combustível.
 * @param {object} vehicle - O objeto veículo com os dados.
 */
const populateVehicleFields = (vehicle) => {
    currentVehicleId = vehicle.id; // Salva o ID do veículo selecionado
    veiculoInput.value = vehicle.nome || '';
    placaInput.value = vehicle.placa || '';
    modeloInput.value = vehicle.modelo || '';

    // Habilita e define o combustível
    combustivelSelect.disabled = false;
    combustivelSelect.value = vehicle.combustivel || 'Diesel';
    combustivelSelect.disabled = true; // Desabilita novamente para evitar edição manual

    // Lógica para KM (odômetro) vs. HR (horímetro)
    horimetroInput.value = ''; // Limpa ambos antes de preencher
    odometroInput.value = '';

    if (vehicle.tipoVeiculo === 'Trator' || vehicle.tipoVeiculo === 'Máquina') {
        horimetroInput.value = vehicle.horimetro || '';
        horimetroInput.disabled = false;
        odometroInput.disabled = true;
    } else { // Presume-se que outros tipos usam odômetro (Carro, Caminhão, Ônibus, Van, etc.)
        odometroInput.value = vehicle.km || '';
        odometroInput.disabled = false;
        horimetroInput.disabled = true;
    }

    // AQUI ESTÁ A MUDANÇA: Atualiza a div de detalhes do veículo com as informações simplificadas
    // e agora incluindo Horímetro e Odômetro.
    vehicleDetailsDiv.innerHTML = `
        <p><strong>Nome:</strong> ${vehicle.nome || '-'}</p>
        <p><strong>Placa:</strong> ${vehicle.placa || '-'}</p>
        <p><strong>Marca:</strong> ${vehicle.marca || '-'}</p>
        <p><strong>Modelo:</strong> ${vehicle.modelo || '-'}</p>
        <p><strong>Tipo:</strong> ${vehicle.tipoVeiculo || '-'}</p>
        <p><strong>Ano:</strong> ${vehicle.ano || '-'}</p>
        <p><strong>Horímetro (h):</strong> ${vehicle.horimetro || '-'}</p>
        <p><strong>Odômetro (Km):</strong> ${vehicle.km || '-'}</p>
        <p><strong>Status do Veículo:</strong> <span class="font-bold ${vehicle.status === 'Ativo' ? 'text-green-700' : 'text-red-700'}">${vehicle.status || '-'}</span></p>
    `;
};

/**
 * Reseta o formulário de O.S. para seu estado inicial.
 */
const resetOsForm = () => {
    osForm.reset();
    vehicleDetailsDiv.innerHTML = 'Nenhum veículo selecionado.';
    currentVehicleId = null;
    horimetroInput.disabled = true;
    odometroInput.disabled = true;
    combustivelSelect.disabled = true;
    combustivelSelect.value = ""; // Garante que a opção padrão "Selecione um veículo" seja mostrada
    osForm.dataset.editingOsId = ''; // Remove o ID de edição
    document.querySelector('#osForm button[type="submit"]').textContent = 'Criar Ordem de Serviço'; // Volta o texto do botão
    // Se você tiver uma maneira de limpar as classes de validação, adicione aqui
};


// --- LISTENERS DE EVENTOS ---

document.addEventListener('DOMContentLoaded', () => {
    // Carrega dados iniciais
    loadVehiclesFromLocalStorage();
    loadOsList();
    renderOsTables();
    switchView('agendarView'); // Define a view inicial como 'Agendar Manutenção'

    // Lógica para preencher formulário se vier de `cadastro_veiculos.html` via URL param
    const urlParams = new URLSearchParams(window.location.search);
    const vehicleIdFromUrl = urlParams.get('vehicleId');

    if (vehicleIdFromUrl) {
        const foundVehicle = vehicles.find(v => v.id === parseInt(vehicleIdFromUrl));
        if (foundVehicle) {
            populateVehicleFields(foundVehicle);
            showUserFeedback(`Veículo "${foundVehicle.nome}" carregado para nova O.S.`);
        } else {
            showUserFeedback('Veículo não encontrado. Por favor, busque manualmente.', false);
            // Se o veículo da URL não for encontrado, garantir que os campos estejam desabilitados
            horimetroInput.disabled = true;
            odometroInput.disabled = true;
            combustivelSelect.disabled = true;
        }
        // Limpa o parâmetro da URL para não recarregar sempre
        history.replaceState({}, document.title, window.location.pathname);
    } else {
        // Se não houver vehicleId na URL, desabilita os campos de KM/HR/Combustível inicialmente
        horimetroInput.disabled = true;
        odometroInput.disabled = true;
        combustivelSelect.disabled = true;
    }


    // Navegação interna (Agendar, Abertas, Fechadas)
    internalNavButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchView(button.dataset.view);
        });
    });

    // Envio do formulário de O.S.
    osForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validação de campos obrigatórios
        if (!veiculoInput.value.trim() || !placaInput.value.trim() || !dataInput.value || !horaInput.value || !motivoTextarea.value.trim()) {
            showUserFeedback("Por favor, preencha todos os campos obrigatórios (Veículo, Placa, Data Programada, Hora Programada, Motivo/Solicitação).", false);
            return;
        }

        // Validação KM/HR/Combustível baseada no tipo de veículo SE um veículo foi selecionado
        const selectedVehicle = vehicles.find(v => v.id === currentVehicleId);
        if (selectedVehicle) {
            if (selectedVehicle.tipoVeiculo === 'Trator' || selectedVehicle.tipoVeiculo === 'Máquina') {
                if (!horimetroInput.value.trim()) {
                    showUserFeedback("Para este tipo de veículo, o campo 'Horímetro (h)' é obrigatório.", false);
                    return;
                }
            } else { // Carro, Caminhão, Ônibus, Van, Passeio
                if (!odometroInput.value.trim()) {
                    showUserFeedback("Para este tipo de veículo, o campo 'Odômetro (Km)' é obrigatório.", false);
                    return;
                }
            }
        } else {
            // Se nenhum veículo foi selecionado (por exemplo, preenchimento manual sem lookup),
            // exigimos que ou Odômetro ou Horímetro seja preenchido.
            if (!odometroInput.value.trim() && !horimetroInput.value.trim()) {
                showUserFeedback("Para continuar, selecione um veículo usando a lupa ou preencha o Odômetro (Km) ou o Horímetro (h).", false);
                return;
            }
        }

        const newOs = {
            id: osList.length > 0 ? Math.max(...osList.map(os => os.id)) + 1 : 1, // Gera ID ÚNICO
            veiculoId: currentVehicleId, // Associa a OS ao ID do veículo (pode ser null se não for selecionado via lookup)
            veiculo: veiculoInput.value,
            placa: placaInput.value,
            modelo: modeloInput.value,
            centroCusto: centroCustoInput.value.trim(),
            combustivel: combustivelSelect.value,
            horimetro: horimetroInput.value ? parseFloat(horimetroInput.value) : null,
            odometro: odometroInput.value ? parseFloat(odometroInput.value) : null,
            tipoManutencao: tipoManutencaoSelect.value,
            prioridade: prioridadeSelect.value,
            data: dataInput.value,
            hora: horaInput.value,
            motivo: motivoTextarea.value.trim(),
            status: 'Aberta' // Status inicial
        };

        // Lógica para edição vs. nova O.S.
        const editingOsId = osForm.dataset.editingOsId;
        if (editingOsId) {
            // Caso de edição: Encontra a OS original e a substitui
            const index = osList.findIndex(os => os.id === parseInt(editingOsId));
            if (index !== -1) {
                // Mantém o ID original e atualiza o resto dos dados
                osList[index] = { ...newOs, id: parseInt(editingOsId), status: osList[index].status }; // Mantém o status original da OS
                showUserFeedback('Ordem de Serviço atualizada com sucesso!');
            }
        } else {
            // Caso de nova O.S.
            osList.push(newOs);
            showUserFeedback('Ordem de Serviço criada com sucesso!');
        }

        saveOsList();
        resetOsForm(); // Reseta o formulário após a submissão/edição
        renderOsTables(); // Atualiza as tabelas
        switchView('abertasView'); // Muda para a view de O.S. Abertas
    });

    // Abrir modal de Centro de Custo
    openCostCenterModalBtn.addEventListener('click', openCostCenterModal);

    // Fechar modal de Centro de Custo
    closeCostCenterModalBtn.addEventListener('click', closeCostCenterModal);
    costCenterModal.addEventListener('click', (e) => {
        if (e.target === costCenterModal) {
            closeCostCenterModal();
        }
    });

    // Selecionar Centro de Custo na tabela do modal
    costCenterTableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-select-cc')) {
            const selectedCode = e.target.dataset.code;
            const selectedName = e.target.dataset.name;
            centroCustoInput.value = `${selectedCode} - ${selectedName}`;
            closeCostCenterModal();
        }
    });

    // Botão de busca de veículo
    searchVehicleBtn.addEventListener('click', () => {
        const searchTerm = veiculoInput.value.trim().toLowerCase();
        let vehiclesToDisplay = [];

        if (searchTerm) {
            vehiclesToDisplay = vehicles.filter(v =>
                v.nome.toLowerCase().includes(searchTerm) ||
                (v.placa && v.placa.toLowerCase().includes(searchTerm)) ||
                (v.modelo && v.modelo.toLowerCase().includes(searchTerm))
            );
        } else {
            // Se o campo de busca estiver vazio, mostra todos os veículos
            vehiclesToDisplay = vehicles;
        }
        openVehicleSearchModal(vehiclesToDisplay);
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
        if (e.target.classList.contains('btn-select-vehicle')) {
            const vehicleId = parseInt(e.target.dataset.id);
            const selectedVehicle = vehicles.find(v => v.id === vehicleId);
            if (selectedVehicle) {
                populateVehicleFields(selectedVehicle);
                closeVehicleSearchModal();
            }
        }
    });

    // Adiciona listener para fechar o confirmModal clicando no overlay
    confirmModal.addEventListener('click', (event) => {
        if (event.target === confirmModal) {
            hideConfirmModal();
        }
    });

    // --- FUNÇÕES GLOBAIS PARA ACESSO VIA HTML (ONCLICK) ---

    /**
     * Edita uma Ordem de Serviço existente, preenchendo o formulário.
     * @param {number} id - ID da O.S. a ser editada.
     */
    window.editOs = (id) => {
        const osToEdit = osList.find(os => os.id === id);
        if (osToEdit) {
            resetOsForm(); // Limpa o formulário antes de preencher para evitar dados residuais
            const associatedVehicle = vehicles.find(v => v.id === osToEdit.veiculoId);

            if (associatedVehicle) {
                populateVehicleFields(associatedVehicle); // Preenche os dados do veículo
            } else {
                // Se o veículo não for encontrado no cadastro, preenche o que tem na OS
                // e garante que os campos estejam habilitados para possível correção manual.
                veiculoInput.value = osToEdit.veiculo || '';
                placaInput.value = osToEdit.placa || '';
                modeloInput.value = osToEdit.modelo || '';
                vehicleDetailsDiv.innerHTML = `<p class="text-red-600">Veículo original (ID: ${osToEdit.veiculoId || '-'}) não encontrado no cadastro. Campos do veículo habilitados para edição manual, se necessário.</p>`;
                
                // Habilitar campos para edição manual já que o veículo não foi encontrado via lookup
                placaInput.readOnly = false; // Permite edição da placa
                modeloInput.readOnly = false; // Permite edição do modelo
                combustivelSelect.disabled = false; // Permite edição do combustível
                horimetroInput.disabled = false; // Permite edição do horímetro
                odometroInput.disabled = false; // Permite edição do odômetro
            }

            centroCustoInput.value = osToEdit.centroCusto || '';
            horimetroInput.value = osToEdit.horimetro || '';
            odometroInput.value = osToEdit.odometro || '';
            tipoManutencaoSelect.value = osToEdit.tipoManutencao || '';
            prioridadeSelect.value = osToEdit.prioridade || '';
            dataInput.value = osToEdit.data || '';
            horaInput.value = osToEdit.hora || '';
            motivoTextarea.value = osToEdit.motivo || '';

            osForm.dataset.editingOsId = id; // Marca que estamos em modo de edição
            document.querySelector('#osForm button[type="submit"]').textContent = 'Atualizar Ordem de Serviço'; // Muda o texto do botão

            switchView('agendarView'); // Volta para a view de agendamento para editar
            showUserFeedback('Ordem de Serviço carregada para edição.');
        } else {
            showUserFeedback('Ordem de Serviço não encontrada para edição.', false);
        }
    };

    /**
     * Fecha uma Ordem de Serviço, atualizando seu status.
     * @param {number} id - ID da O.S. a ser fechada.
     */
    window.closeOs = (id) => {
        showConfirmModal('Fechar Ordem de Serviço', 'Tem certeza que deseja fechar esta Ordem de Serviço? Ela será movida para o histórico.', () => {
            const osToClose = osList.find(os => os.id === id);
            if (osToClose) {
                osToClose.status = 'Fechada';
                osToClose.dataConclusao = new Date().toISOString().split('T')[0]; // Data de hoje
                saveOsList();
                renderOsTables();
                showUserFeedback('Ordem de Serviço fechada com sucesso!');
                switchView('fechadasView'); // Mude para a view de O.S. Fechadas após fechar
            } else {
                showUserFeedback('Ordem de Serviço não encontrada.', false);
            }
        });
    };

    /**
     * Confirma a exclusão de uma Ordem de Serviço.
     * @param {number} id - ID da O.S. a ser excluída.
     */
    window.confirmDeleteOs = (id) => {
        showConfirmModal('Excluir Ordem de Serviço', 'Tem certeza que deseja excluir esta Ordem de Serviço? Esta ação é irreversível.', () => {
            deleteOs(id);
        });
    };

    /**
     * Exclui uma Ordem de Serviço da lista.
     * @param {number} id - ID da O.S. a ser excluída.
     */
    const deleteOs = (id) => {
        osList = osList.filter(os => os.id !== id);
        saveOsList();
        renderOsTables();
        showUserFeedback('Ordem de Serviço excluída com sucesso!', false);
    };
    window.deleteOs = deleteOs; // Torna a função global para o HTML
});