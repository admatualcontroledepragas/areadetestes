/* =======================================================
   ARQUIVO: script.js (Portal Principal)
   (Lógica de Login Seguro, Abas, Tema Personalizado e Iframe)
   ======================================================= */

// A URL DO SEU NOVO BACKEND (O COFRE SEGURO DO APPS SCRIPT)
const URL_API_LOGIN = "https://script.google.com/macros/s/SUA_NOVA_URL_AQUI/exec";

// ==========================================
// INICIALIZAÇÃO
// ==========================================
window.onload = function() {
    carregarTema(); 
    
    // Verifica se há uma sessão ativa e um token válido salvo
    if (sessionStorage.getItem("sessaoAtiva") === "true" && sessionStorage.getItem("vertec_token")) {
        liberarPortal(sessionStorage.getItem("nomeUsuario"));
    }
};

// ==========================================
// LÓGICA DE LOGIN E SEGURANÇA
// ==========================================
function toggleSenha() {
    const inputSenha = document.getElementById('loginPass');
    const iconeOlho = document.getElementById('icone-olho');
    
    if (inputSenha.type === 'password') {
        inputSenha.type = 'text';
        iconeOlho.innerText = 'visibility_off'; 
    } else {
        inputSenha.type = 'password';
        iconeOlho.innerText = 'visibility'; 
    }
}

async function fazerLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('btnLogin');
    const err = document.getElementById('login-error');
    
    btn.innerHTML = "Verificando..."; 
    btn.disabled = true;
    err.style.display = "none";

    // NOVO: Usando URLSearchParams para compatibilidade com a segurança do backend
    const payload = new URLSearchParams();
    payload.append('acao', 'login');
    payload.append('email', document.getElementById('loginUser').value.trim().toLowerCase());
    payload.append('senha', document.getElementById('loginPass').value.trim());

    try {
        const req = await fetch(URL_API_LOGIN, { 
            method: 'POST', 
            body: payload 
        });
        const res = await req.json();

        if (res.sucesso) {
            // NOVO: Salvando o Crachá Digital (Token) na sessão do navegador
            sessionStorage.setItem("sessaoAtiva", "true");
            sessionStorage.setItem("nomeUsuario", res.nome);
            sessionStorage.setItem("vertec_token", res.token); // BARREIRA DE SEGURANÇA
            
            liberarPortal(res.nome);
        } else {
            err.innerText = "⚠️ " + (res.erro || res.mensagem || "Acesso negado.");
            err.style.display = "block";
        }
    } catch (erro) {
        err.innerText = "⚠️ Erro de conexão com o servidor de acessos.";
        err.style.display = "block";
    }
    
    btn.innerHTML = "Entrar"; 
    btn.disabled = false;
}

function liberarPortal(nome) {
    document.getElementById('login-wrapper').style.display = 'none';
    document.getElementById('portal-wrapper').style.display = 'flex';
    document.getElementById('nomeUsuarioDisplay').innerText = nome;
    
    mudarAba('dashboard');
}

function sair() {
    // Destrói o token e encerra a sessão imediatamente
    sessionStorage.clear();
    
    document.getElementById('portal-wrapper').style.display = 'none';
    document.getElementById('login-wrapper').style.display = 'flex';
    
    document.getElementById('loginPass').value = "";
    document.getElementById('loginPass').type = "password";
    document.getElementById('icone-olho').innerText = 'visibility';
}

// ==========================================
// LÓGICA DE NAVEGAÇÃO DE ABAS E IFRAME
// ==========================================

function limparAtivos() {
    document.querySelectorAll('.view-section').forEach(el => {
        el.classList.remove('active');
        el.style.display = 'none';
    });
    document.querySelectorAll('.menu-item').forEach(el => {
        el.classList.remove('active');
    });
}

function mudarAba(abaId) {
    limparAtivos();

    if (abaId === 'dashboard') {
        const view = document.getElementById('view-dashboard');
        view.style.display = 'block';
        setTimeout(() => view.classList.add('active'), 10);
        
        document.getElementById('topbar-title').innerText = "Dashboard";
        document.querySelector('.menu-item:nth-child(1)').classList.add('active');
        
        document.getElementById('frame-sistema').src = "";
        
    } else if (abaId === 'configuracoes') {
        const view = document.getElementById('view-configuracoes');
        view.style.display = 'block';
        setTimeout(() => view.classList.add('active'), 10);
        
        document.getElementById('topbar-title').innerText = "Configurações";
        document.querySelector('.menu-item:last-child').classList.add('active');
        
        document.getElementById('frame-sistema').src = "";
    }
}

function abrirModulo(urlDestino, titulo, elementoClicado) {
    const ehMobile = window.innerWidth <= 1024;

    if (ehMobile) {
        window.location.href = urlDestino;
    } else {
        limparAtivos();
        
        elementoClicado.classList.add('active');
        document.getElementById('topbar-title').innerText = titulo;
        
        const viewIframe = document.getElementById('view-iframe');
        viewIframe.style.display = 'block';
        setTimeout(() => viewIframe.classList.add('active'), 10);
        
        const baseUrl = window.location.href.split('index.html')[0];
        document.getElementById('frame-sistema').src = baseUrl + urlDestino;
    }
}

// ==========================================
// SISTEMA DE TEMAS E PERSONALIZAÇÃO
// ==========================================
function alterarTema(tema) {
    document.body.setAttribute('data-tema', tema);
    localStorage.setItem('temaPortalAtual', tema);
}

function carregarTema() {
    const temaSalvo = localStorage.getItem('temaPortalAtual');
    if (temaSalvo) {
        document.body.setAttribute('data-tema', temaSalvo);
    } else {
        document.body.setAttribute('data-tema', 'azul');
    }
}

// ==========================================
// SERVICE WORKER
// ==========================================
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
