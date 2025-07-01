

    // Verifica permissão
    if (localStorage.getItem('logado') !== 'true' || localStorage.getItem('isAdmin') !== 'true') {
      alert('Acesso negado! Apenas administradores podem acessar esta página.');
      window.location.href = 'login.html';
    }

    const tabelaUsuarios = document.getElementById('tabelaUsuarios');
    const filtroUsuario = document.getElementById('filtroUsuario');
    const novoUsuario = document.getElementById('novoUsuario');
    const novaSenha = document.getElementById('novaSenha');
    const novoTipo = document.getElementById('novoTipo');
    const btnAdicionar = document.getElementById('btnAdicionar');
    const mensagem = document.getElementById('mensagem');

    const totalUsuarios = document.getElementById('totalUsuarios');
    const totalAdmins = document.getElementById('totalAdmins');
    const totalUsers = document.getElementById('totalUsers');

    let usuarios = {};
    let usuarioEditando = null;

    // Função para carregar todos usuários do localStorage (exceto logado e isAdmin)
    function carregarUsuariosStorage() {
      usuarios = {};
      for (let i = 0; i < localStorage.length; i++) {
        const chave = localStorage.key(i);
        if (chave !== 'logado' && chave !== 'isAdmin') {
          try {
            const valor = localStorage.getItem(chave);
            const obj = JSON.parse(valor);
            if (obj && obj.senha && obj.tipo) {
              usuarios[chave] = obj;
            }
          } catch {
            // ignorar erros parse
          }
        }
      }
    }

    // Função para renderizar tabela, aplicando filtro
    function renderizarTabela(filtro = '') {
      tabelaUsuarios.innerHTML = '';

      const filtroMinusculo = filtro.toLowerCase();

      let total = 0, admins = 0, usersCount = 0;

      for (const user in usuarios) {
        if (user.toLowerCase().includes(filtroMinusculo)) {
          total++;
          if (usuarios[user].tipo === 'admin') admins++;
          else usersCount++;

          const tr = document.createElement('tr');

          tr.innerHTML = `
            <td>${user}</td>
            <td>${usuarios[user].tipo}</td>
            <td>
              <button class="btn-editar" aria-label="Editar usuário ${user}" data-usuario="${user}">
                <i class="ph ph-pencil"></i> Editar
              </button>
              <button class="btn-excluir" aria-label="Excluir usuário ${user}" data-usuario="${user}">
                <i class="ph ph-trash"></i> Excluir
              </button>
            </td>
          `;
          tabelaUsuarios.appendChild(tr);
        }
      }

      totalUsuarios.textContent = total;
      totalAdmins.textContent = admins;
      totalUsers.textContent = usersCount;

      if(total === 0){
        tabelaUsuarios.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#666;">Nenhum usuário encontrado.</td></tr>';
      }
    }

    // Função para exibir mensagem (sucesso ou erro)
    function mostrarMensagem(texto, sucesso = true) {
      mensagem.textContent = texto;
      mensagem.style.color = sucesso ? '#004aad' : '#e74c3c';
      setTimeout(() => mensagem.textContent = '', 4000);
    }

    // Adicionar novo usuário
    btnAdicionar.addEventListener('click', () => {
      const usuario = novoUsuario.value.trim();
      const senha = novaSenha.value.trim();
      const tipo = novoTipo.value;

      if (!usuario || !senha) {
        mostrarMensagem('Preencha usuário e senha para cadastro.', false);
        return;
      }

      if (usuarios[usuario]) {
        mostrarMensagem('Usuário já existe.', false);
        return;
      }

      usuarios[usuario] = { senha, tipo };
      localStorage.setItem(usuario, JSON.stringify({ senha, tipo }));

      mostrarMensagem(`Usuário "${usuario}" adicionado com sucesso.`);

      novoUsuario.value = '';
      novaSenha.value = '';
      novoTipo.value = 'user';

      renderizarTabela(filtroUsuario.value);
    });

    // Delegação de eventos para editar e excluir
    tabelaUsuarios.addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (!btn) return;

      const usuario = btn.dataset.usuario;
      if (!usuario) return;

      if (btn.classList.contains('btn-excluir')) {
        if (confirm(`Deseja excluir o usuário "${usuario}"?`)) {
          delete usuarios[usuario];
          localStorage.removeItem(usuario);
          mostrarMensagem(`Usuário "${usuario}" excluído.`);
          renderizarTabela(filtroUsuario.value);
        }
      } else if (btn.classList.contains('btn-editar')) {
        usuarioEditando = usuario;
        abrirModalEditar(usuario, usuarios[usuario]);
      }
    });

    // Filtro busca
    filtroUsuario.addEventListener('input', e => {
      renderizarTabela(e.target.value);
    });

    // Modal editar
    const modalEditar = document.getElementById('modalEditar');
    const editTipo = document.getElementById('editTipo');
    const editSenha = document.getElementById('editSenha');
    const btnCancelar = document.getElementById('btnCancelar');
    const btnSalvar = document.getElementById('btnSalvar');

    function abrirModalEditar(usuario, dados) {
      editTipo.value = dados.tipo;
      editSenha.value = '';
      modalEditar.classList.add('active');
      modalEditar.focus();
    }

    function fecharModal() {
      modalEditar.classList.remove('active');
      usuarioEditando = null;
    }

    btnCancelar.addEventListener('click', fecharModal);
    modalEditar.addEventListener('click', e => {
      if (e.target === modalEditar) fecharModal();
    });

    btnSalvar.addEventListener('click', () => {
      const tipo = editTipo.value;
      const senhaNova = editSenha.value.trim();

      if (!tipo) {
        alert('Selecione um tipo válido.');
        return;
      }

      if (senhaNova.length > 0) {
        usuarios[usuarioEditando].senha = senhaNova;
      }

      usuarios[usuarioEditando].tipo = tipo;
      localStorage.setItem(usuarioEditando, JSON.stringify(usuarios[usuarioEditando]));

      mostrarMensagem(`Usuário "${usuarioEditando}" atualizado com sucesso.`);
      fecharModal();
      renderizarTabela(filtroUsuario.value);
    });

    // Logout
    document.getElementById('btnLogout').addEventListener('click', () => {
      localStorage.removeItem('logado');
      localStorage.removeItem('isAdmin');
      window.location.href = 'login.html';
    });

    // Inicializa
    carregarUsuariosStorage();
    renderizarTabela();
