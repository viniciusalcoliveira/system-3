    const codigoFixo = "84166977";

    // Gera um token aleatório de 6 dígitos
    function gerarToken() {
      const token = Math.floor(100000 + Math.random() * 900000).toString();
      const tokenEl = document.getElementById("tokenGerado");
      tokenEl.textContent = token;
      return token;
    }

    // Inicializa o token quando a página carrega, se for admin
    window.addEventListener("load", () => {
      if (document.getElementById("tipoUsuario").value === "admin") {
        mostrarCamposAdmin(true);
        gerarToken();
      }
    });

    function mostrarCamposAdmin(mostrar) {
      const codigoAdminContainer = document.getElementById("codigoAdminContainer");
      const codigoDinamicoContainer = document.getElementById("codigoDinamicoContainer");
      if (mostrar) {
        codigoAdminContainer.classList.remove("hidden");
        codigoDinamicoContainer.classList.remove("hidden");
      } else {
        codigoAdminContainer.classList.add("hidden");
        codigoDinamicoContainer.classList.add("hidden");
      }
    }

    // Verifica tipo selecionado no cadastro e mostra/esconde campos extras
    function verificarTipoUsuario() {
      const tipo = document.getElementById("tipoUsuario").value;
      mostrarCamposAdmin(tipo === "admin");
      if (tipo === "admin") {
        gerarToken();
      }
    }

    function mostrarCadastro() {
      document.getElementById("login-form").classList.add("hidden");
      document.getElementById("cadastro-form").classList.remove("hidden");
      limparMensagens();
    }

    function mostrarLogin() {
      document.getElementById("cadastro-form").classList.add("hidden");
      document.getElementById("login-form").classList.remove("hidden");
      limparMensagens();
    }

    function limparMensagens() {
      const ids = ["erroLogin", "erroCadastro", "sucessoCadastro"];
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = "";
      });
    }

    // Cadastro de usuário (user ou admin)
    function fazerCadastro() {
      limparMensagens();

      const usuario = document.getElementById("cadastroUsuario").value.trim();
      const senha = document.getElementById("cadastroSenha").value.trim();
      const tipo = document.getElementById("tipoUsuario").value;
      const codigoAdmin = document.getElementById("codigoAdmin")?.value.trim() || "";
      const codigoDinamicoInput = document.getElementById("codigoDinamico")?.value.trim() || "";
      const tokenGerado = document.getElementById("tokenGerado")?.textContent.trim() || "";

      const erro = document.getElementById("erroCadastro");
      const sucesso = document.getElementById("sucessoCadastro");

      if (!usuario || !senha) {
        erro.textContent = "Preencha todos os campos obrigatórios.";
        return;
      }

      if (localStorage.getItem(usuario)) {
        erro.textContent = "Nome de usuário já existe.";
        return;
      }

      if (tipo === "admin") {
        if (codigoAdmin !== codigoFixo) {
          erro.textContent = "Código fixo do administrador incorreto.";
          return;
        }
        if (codigoDinamicoInput !== tokenGerado) {
          erro.textContent = "Token dinâmico incorreto.";
          return;
        }
      }

      // Salvar no localStorage: chave = usuario, valor = objeto json stringificado
      localStorage.setItem(
        usuario,
        JSON.stringify({ senha: senha, tipo: tipo })
      );

      sucesso.textContent = "Cadastro realizado com sucesso!";
      // Limpar campos após sucesso
      document.getElementById("cadastroUsuario").value = "";
      document.getElementById("cadastroSenha").value = "";
      if (tipo === "admin") {
        document.getElementById("codigoAdmin").value = "";
        document.getElementById("codigoDinamico").value = "";
        gerarToken(); // Gera novo token para próximo uso
      }
    }

    // Login
    function fazerLogin() {
      limparMensagens();

      const usuario = document.getElementById("loginUsuario").value.trim();
      const senha = document.getElementById("loginSenha").value.trim();
      const erro = document.getElementById("erroLogin");

      if (!usuario || !senha) {
        erro.textContent = "Por favor, preencha usuário e senha.";
        return;
      }

      const dadosUsuarioJSON = localStorage.getItem(usuario);

      if (!dadosUsuarioJSON) {
        erro.textContent = "Usuário ou senha inválidos.";
        return;
      }

      const dadosUsuario = JSON.parse(dadosUsuarioJSON);
      if (dadosUsuario.senha === senha) {
        localStorage.setItem("logado", "true");
        localStorage.setItem("isAdmin", dadosUsuario.tipo === "admin" ? "true" : "false");
        if (dadosUsuario.tipo === "admin") {
          window.location.href = "admin.html";
        } else {
          window.location.href = "dashboard.html";
        }
      } else {
        erro.textContent = "Usuário ou senha inválidos.";
      }
    }

    // Atalho Shift + Alt + A para ativar modo admin no cadastro (mostrar campos)
    let atalhoAdminPressionado = false;
    document.addEventListener("keydown", function (e) {
      if (e.shiftKey && e.altKey && e.code === "KeyA") {
        if (!atalhoAdminPressionado) {
          atalhoAdminPressionado = true;
          const tipoUsuario = document.getElementById("tipoUsuario");
          if (tipoUsuario) {
            tipoUsuario.value = "admin";
            mostrarCamposAdmin(true);
            gerarToken();
          }
          alert("Modo administrador ativado no cadastro. Digite os códigos para continuar.");
          setTimeout(() => {
            atalhoAdminPressionado = false;
          }, 10000);
        }
      }
    });