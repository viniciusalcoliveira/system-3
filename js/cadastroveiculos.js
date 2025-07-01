// Variáveis globais
let vehicles = [];
let editingVehicleId = null; // Armazena o ID do veículo sendo editado
let currentVehicleIdForMaintenance = null;

// --- Funções de Utilitários ---

function generateUniqueId() {
    return vehicles.length > 0 ? Math.max(...vehicles.map(v => v.id)) + 1 : 1;
}

function saveVehicles() {
    localStorage.setItem('vehicles', JSON.stringify(vehicles));
}

function loadVehicles() {
    const storedVehicles = localStorage.getItem('vehicles');
    if (storedVehicles) {
        vehicles = JSON.parse(storedVehicles);
        renderVehiclesTable();
    }
}

function showUserFeedback(message, isSuccess = true) {
    const feedbackDiv = document.getElementById('userFeedback');
    feedbackDiv.textContent = message;
    feedbackDiv.className = `fixed top-20 right-4 px-4 py-2 rounded-lg shadow-lg z-[1001] animate-fade-in ${isSuccess ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`;
    feedbackDiv.classList.remove('hidden');

    setTimeout(() => {
        feedbackDiv.classList.add('hidden');
        feedbackDiv.classList.remove('animate-fade-in');
    }, 3000);
}

// --- Funções da Tabela e Formulário Principal ---

function renderVehiclesTable() {
    const tableBody = document.getElementById('vehiclesTableBody');
    tableBody.innerHTML = '';

    vehicles.forEach(vehicle => {
        const row = tableBody.insertRow();
        row.className = 'hover:bg-gray-50 transition-colors duration-150 text-sm text-gray-700';

        row.insertCell().textContent = vehicle.id;
        row.insertCell().textContent = vehicle.nome;
        row.insertCell().textContent = vehicle.marca;
        row.insertCell().textContent = vehicle.modelo;
        row.insertCell().textContent = vehicle.tipoVeiculo;
        row.insertCell().textContent = vehicle.combustivel;
        row.insertCell().textContent = vehicle.placa;
        row.insertCell().textContent = vehicle.ano;

        const kmHorimetroCell = row.insertCell();
        let leituraText = [];
        if (vehicle.km) leituraText.push(`${vehicle.km} KM`);
        if (vehicle.horimetro) leituraText.push(`${vehicle.horimetro} HR`);
        kmHorimetroCell.textContent = leituraText.length > 0 ? leituraText.join(' / ') : '-';

        // NOTE: O botão de manutenção agora abrirá o modal de ação, não alterará o status diretamente
        const maintenanceCell = row.insertCell();
        const maintenanceButton = document.createElement('button');
        maintenanceButton.innerHTML = `<i class="ph ph-wrench text-xl"></i>`; // Ícone de chave inglesa
        maintenanceButton.className = `font-bold py-1 px-3 rounded-full text-xs shadow-sm transition-all duration-200 
                                      ${vehicle.necessitaManutencao ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`;
        maintenanceButton.title = 'Ações de Manutenção';
        maintenanceButton.onclick = () => showMaintenanceModal(vehicle.id);
        maintenanceCell.appendChild(maintenanceButton);

        const statusCell = row.insertCell();
        const statusSpan = document.createElement('span');
        statusSpan.textContent = vehicle.status;
        statusSpan.className = `font-bold py-1 px-3 rounded-full text-xs ${
            vehicle.status === 'Ativo' ? 'bg-green-100 text-green-800' :
            vehicle.status === 'Em Manutencao' ? 'bg-orange-100 text-orange-800' :
            'bg-red-100 text-red-800'
        }`;
        statusCell.appendChild(statusSpan);

        // NOVOS CAMPOS NA TABELA
        row.insertCell().textContent = vehicle.necessitaPMP === 'Sim' ? 'Sim' : 'Não';
        row.insertCell().textContent = vehicle.necessitaPL === 'Sim' ? 'Sim' : 'Não';
        // FIM DOS NOVOS CAMPOS NA TABELA

        row.insertCell().textContent = vehicle.observacoes || '-';

        const actionsCell = row.insertCell();
        actionsCell.className = 'flex gap-2 items-center px-6 py-4';

        const editButton = document.createElement('button');
        editButton.innerHTML = '<i class="ph ph-pencil-simple text-xl"></i>';
        editButton.className = 'text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50';
        editButton.title = 'Editar Veículo';
        editButton.onclick = () => openEditModal(vehicle.id);
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="ph ph-trash text-xl"></i>';
        deleteButton.className = 'text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50';
        deleteButton.title = 'Excluir Veículo';
        deleteButton.onclick = () => confirmDeleteVehicle(vehicle.id);
        actionsCell.appendChild(deleteButton);
    });
}

function handleAddVehicle(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const marca = document.getElementById('marca').value.trim();
    const modelo = document.getElementById('modelo').value.trim();
    const tipoVeiculo = document.getElementById('tipoVeiculo').value;
    const combustivel = document.getElementById('combustivel').value;
    const placa = document.getElementById('placa').value.trim().toUpperCase();
    const ano = parseInt(document.getElementById('ano').value);
    const km = document.getElementById('km').value !== '' ? parseFloat(document.getElementById('km').value) : null;
    const horimetro = document.getElementById('HR').value !== '' ? parseFloat(document.getElementById('HR').value) : null;
    const status = document.getElementById('status').value;
    const observacoes = document.getElementById('observacoes').value.trim();
    // NOVOS CAMPOS
    const necessitaPMP = document.getElementById('necessitaPMP').value;
    const necessitaPL = document.getElementById('necessitaPL').value;
    // FIM DOS NOVOS CAMPOS

    if (!nome || !marca || !modelo || !tipoVeiculo || !combustivel || !placa || !ano || !status) {
        showUserFeedback('Por favor, preencha todos os campos obrigatórios.', false);
        return;
    }

    if (km === null && horimetro === null) {
        showUserFeedback('Preencha a Quilometragem (KM) ou o Horímetro (HR).', false);
        return;
    }

    const newVehicle = {
        id: generateUniqueId(),
        nome,
        marca,
        modelo,
        tipoVeiculo,
        combustivel,
        placa,
        ano,
        km,
        horimetro,
        status,
        observacoes,
        necessitaManutencao: false, // Mantido para compatibilidade, mas o botão agora abre o modal
        necessitaPMP, // Novo campo
        necessitaPL   // Novo campo
    };
    vehicles.push(newVehicle);
    showUserFeedback('Veículo adicionado com sucesso!');

    saveVehicles();
    renderVehiclesTable();
    document.getElementById('vehicleForm').reset();
}

// --- Funções do MODAL DE EDIÇÃO ---

function openEditModal(id) {
    const vehicle = vehicles.find(v => v.id === id);
    if (!vehicle) return;

    editingVehicleId = id;

    document.getElementById('edit-nome').value = vehicle.nome;
    document.getElementById('edit-marca').value = vehicle.marca;
    document.getElementById('edit-modelo').value = vehicle.modelo;
    document.getElementById('edit-tipoVeiculo').value = vehicle.tipoVeiculo;
    document.getElementById('edit-combustivel').value = vehicle.combustivel;
    document.getElementById('edit-placa').value = vehicle.placa;
    document.getElementById('edit-ano').value = vehicle.ano;
    document.getElementById('edit-km').value = vehicle.km || '';
    document.getElementById('edit-horimetro').value = vehicle.horimetro || '';
    document.getElementById('edit-status').value = vehicle.status;
    document.getElementById('edit-observacoes').value = vehicle.observacoes || '';
    // NOVOS CAMPOS NO MODAL DE EDIÇÃO
    document.getElementById('edit-necessitaPMP').value = vehicle.necessitaPMP || 'Não'; // Define 'Não' como padrão se for undefined
    document.getElementById('edit-necessitaPL').value = vehicle.necessitaPL || 'Não';   // Define 'Não' como padrão se for undefined
    // FIM DOS NOVOS CAMPOS

    const modal = document.getElementById('editVehicleModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeEditModal() {
    const modal = document.getElementById('editVehicleModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    editingVehicleId = null;
}

function handleEditFormSubmit(event) {
    event.preventDefault();
    if (editingVehicleId === null) return;

    const updatedVehicle = {
        nome: document.getElementById('edit-nome').value.trim(),
        marca: document.getElementById('edit-marca').value.trim(),
        modelo: document.getElementById('edit-modelo').value.trim(),
        tipoVeiculo: document.getElementById('edit-tipoVeiculo').value,
        combustivel: document.getElementById('edit-combustivel').value,
        placa: document.getElementById('edit-placa').value.trim().toUpperCase(),
        ano: parseInt(document.getElementById('edit-ano').value),
        km: document.getElementById('edit-km').value !== '' ? parseFloat(document.getElementById('edit-km').value) : null,
        horimetro: document.getElementById('edit-horimetro').value !== '' ? parseFloat(document.getElementById('edit-horimetro').value) : null,
        status: document.getElementById('edit-status').value,
        observacoes: document.getElementById('edit-observacoes').value.trim(),
        // NOVOS CAMPOS PARA ATUALIZAÇÃO
        necessitaPMP: document.getElementById('edit-necessitaPMP').value,
        necessitaPL: document.getElementById('edit-necessitaPL').value
        // FIM DOS NOVOS CAMPOS
    };

    const vehicleIndex = vehicles.findIndex(v => v.id === editingVehicleId);
    if (vehicleIndex !== -1) {
        vehicles[vehicleIndex] = {
            ...vehicles[vehicleIndex], // Mantém quaisquer outras propriedades existentes
            ...updatedVehicle
        };
        showUserFeedback('Veículo atualizado com sucesso!');
        saveVehicles();
        renderVehiclesTable();
        closeEditModal();
    }
}

// --- Funções de Exclusão e Confirmação ---

function openConfirmModal(title, message, onConfirm) {
    document.getElementById('confirmModalTitle').textContent = title;
    document.getElementById('confirmModalMessage').textContent = message;
    document.getElementById('confirmModal').classList.remove('hidden');
    document.getElementById('confirmModal').classList.add('flex');

    const confirmYesBtn = document.getElementById('confirmModalYes');
    // Remove o event listener anterior para evitar múltiplos disparos
    confirmYesBtn.replaceWith(confirmYesBtn.cloneNode(true));
    document.getElementById('confirmModalYes').addEventListener('click', () => {
        onConfirm();
        closeConfirmModal();
    });

    document.getElementById('confirmModalNo').onclick = closeConfirmModal; // Garante que o botão 'Não' apenas feche
}

function closeConfirmModal() {
    document.getElementById('confirmModal').classList.add('hidden');
    document.getElementById('confirmModal').classList.remove('flex');
}

function confirmDeleteVehicle(id) {
    openConfirmModal(
        'Confirmar Exclusão',
        'Tem certeza que deseja excluir este veículo?',
        () => deleteVehicle(id)
    );
}

function deleteVehicle(id) {
    vehicles = vehicles.filter(v => v.id !== id);
    saveVehicles();
    renderVehiclesTable();
    showUserFeedback('Veículo excluído com sucesso!');
}

// --- Funções do Modal de Manutenção ---

function showMaintenanceModal(vehicleId) {
    currentVehicleIdForMaintenance = vehicleId;
    const modal = document.getElementById('modalManutencao');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeModal() {
    const modal = document.getElementById('modalManutencao');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    currentVehicleIdForMaintenance = null;
}

function agendarManutencao() {
    if (currentVehicleIdForMaintenance) {
        const vehicleIndex = vehicles.findIndex(v => v.id === currentVehicleIdForMaintenance);
        if (vehicleIndex !== -1) {
            vehicles[vehicleIndex].status = 'Em Manutencao';
            // Você pode adicionar lógica aqui para verificar se necessitaPMP ou necessitaPL é 'Sim'
            // e talvez acionar uma notificação ou algo mais específico.
            saveVehicles();
            renderVehiclesTable();
        }
        // Redireciona para a página de agendamento passando o ID do veículo
        window.location.href = `agendamento.html?vehicleId=${currentVehicleIdForMaintenance}`;
    }
}

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
    loadVehicles();
    document.getElementById('vehicleForm').addEventListener('submit', handleAddVehicle);
    document.getElementById('editVehicleForm').addEventListener('submit', handleEditFormSubmit);
    // O evento para confirmModalNo agora é tratado dentro de openConfirmModal para flexibilidade
});