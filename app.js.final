// DOM Elements
const searchInput = document.getElementById('searchInput');
const filtersContainer = document.getElementById('filtersContainer');
const streamsGrid = document.getElementById('streamsGrid');
const noResults = document.getElementById('noResults');
const resultsCount = document.getElementById('resultsCount');
const paginationContainer = document.getElementById('pagination');
const channelSelect = document.getElementById('channelSelect');
const langSortSelect = document.getElementById('langSortSelect');

// Player Elements
const mainPlayer = document.getElementById('mainPlayer');
const playerPlaceholder = document.getElementById('playerPlaceholder');
const activeVideoTitle = document.getElementById('activeVideoTitle');
const activeVideoChannel = document.getElementById('activeVideoChannel');
const activeVideoViewers = document.getElementById('activeVideoViewers');
const playerSection = document.getElementById('playerSection');

// Auth DOM Elements
const userAuthSection = document.getElementById('userAuthSection');
const authModal = document.getElementById('authModal');
const btnCloseAuth = document.getElementById('btnCloseAuth');
const tabLoginBtn = document.getElementById('tabLoginBtn');
const tabRegisterBtn = document.getElementById('tabRegisterBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginEmailInput = document.getElementById('loginEmail');
const loginPasswordInput = document.getElementById('loginPassword');
const registerEmailInput = document.getElementById('registerEmail');
const registerPasswordInput = document.getElementById('registerPassword');
const loginErrorMsg = document.getElementById('loginError');
const registerErrorMsg = document.getElementById('registerError');
const btnTogglePlaylist = document.getElementById('btnTogglePlaylist');
const filterMyListBtn = document.getElementById('filterMyList');

// Cast to TV Elements
const btnCastTV = document.getElementById('btnCastTV');
const castModal = document.getElementById('castModal');
const btnCloseCast = document.getElementById('btnCloseCast');
const castQrCode = document.getElementById('castQrCode');
const btnOpenInYT = document.getElementById('btnOpenInYT');

// API — Cloudflare Worker que fala com o banco Turso
const API_BASE = 'https://lunera-api.luneramv.workers.dev';

// Application State
let movies = []; // filmes da PÁGINA ATUAL (não a base inteira)
let currentCategory = 'all';
let searchQuery = '';
let activeMovieId = null;
let currentPage = 1;
const moviesPerPage = 250;
let currentChannel = 'all'; // guarda o channel_id selecionado
let currentSort = 'original'; // idioma preferido (title_lang) ou 'original'
let currentUser = null;
let currentUserUID = null;
let userPlaylists = {};
let currentLang = localStorage.getItem('lunera_lang') || 'pt';
let currentTotalPages = 1;
let currentTotalResults = 0;
let currentTotalAproximado = false;
let allChannels = []; // cache da lista de canais (carregada uma vez via /api/canais)
let searchDebounceTimer = null;
let renderRequestId = 0; // evita que uma resposta antiga sobrescreva uma mais nova

// =====================================================================
// INTERNATIONALIZATION (i18n) - Translation Dictionaries
// =====================================================================
const translations = {
    pt: {
        subtitle: 'Filmes completos e dublados do YouTube reunidos em um só lugar',
        cc_info: '<strong>Filmes estrangeiros?</strong> Ative as legendas (CC) no player e mude para a tradução automática para Português na engrenagem <i class="fa-solid fa-gear"></i> do vídeo. O cadastro não é obrigatório, ele existe para que você possa criar a sua playlist. Se gostou, divulgue por favor!',
        btn_auth: '<i class="fa-regular fa-user"></i> Entrar / Cadastrar',
        placeholder_title: 'Nenhum filme selecionado',
        placeholder_desc: 'Selecione um filme abaixo para começar a assistir',
        now_playing: 'REPRODUZINDO AGORA',
        loading_movies: 'Carregando filmes...',
        meta_channel: 'Canal',
        meta_duration: 'Duração',
        btn_toggle_playlist_title: 'Salvar para assistir depois',
        btn_add_playlist: 'Adicionar à Playlist',
        btn_in_playlist: 'Na Playlist',
        search_placeholder: 'Pesquisar por título, gênero, canal ou palavra-chave...',
        all_channels: 'Todos os Canais',
        sort_original: 'Ordem Original',
        sort_pt: 'Português (Brasil/Portugal)',
        sort_es: 'Espanhol',
        sort_en: 'Inglês',
        sort_it: 'Italiano',
        sort_fr: 'Francês',
        sort_ja: 'Japonês',
        sort_zh: 'Chinês',
        sort_hi: 'Hindu',
        sort_tr: 'Turco',
        sort_ru: 'Russo',
        sort_de: 'Alemão',
        filter_all: 'Todos',
        filter_action: 'Ação & Aventura',
        filter_comedy: 'Comédia',
        filter_horror: 'Terror & Suspense',
        filter_scifi: 'Ficção & Fantasia',
        filter_documentary: 'Documentários',
        filter_other: 'Outros Filmes',
        filter_mylist: '<i class="fa-solid fa-bookmark" style="margin-right: 5px;"></i> Minha Lista',
        available_movies: 'Filmes Disponíveis',
        channels_label: 'canais',
        no_results_title: 'Nenhum filme encontrado',
        no_results_desc: 'Tente buscar por termos diferentes ou selecione outra categoria.',
        footer_copy: '&copy; 2026 Lunera. Filmes agregados do YouTube em tempo real.',
        footer_email_label: 'E-mail para contato, dúvidas, sugestões e elogios:',
        footer_visitors: 'Visitas:',
        footer_map_placeholder: 'Mapa de visitantes — <strong>configure em flagcounter.com</strong>',
        update_list: '<i class="fa-solid fa-arrows-rotate"></i> Atualizar Lista',
        tab_login: 'Entrar',
        tab_register: 'Cadastrar',
        label_email: 'E-mail',
        label_password: 'Senha',
        placeholder_password: 'Sua senha',
        placeholder_min_char: 'Mínimo 6 caracteres',
        btn_login_submit: 'Entrar',
        btn_register_submit: 'Cadastrar',
        btn_logout: 'Sair',
        card_badge: 'FILME',
        duration_label: 'Duração',
        page_label: 'Página',
        page_of: 'de',
        page_first: 'Primeira',
        page_previous: 'Anterior',
        page_next: 'Próxima',
        page_last: 'Última',
        cat_action: 'Ação & Aventura',
        cat_comedy: 'Comédia',
        cat_horror: 'Terror & Suspense',
        cat_scifi: 'Ficção & Fantasia',
        cat_documentary: 'Documentário',
        cat_other: 'Filme',
        error_load_title: 'Erro ao carregar os filmes',
        error_load_desc: 'Verifique se o arquivo "filmes.js" ou "filmes.json" existe ou execute "atualizar.bat" na pasta do projeto.',
        error_no_data: 'Sem conexão com os dados',
        error_invalid_email: 'Por favor, insira um e-mail válido.',
        error_short_password: 'A senha deve ter pelo menos 6 caracteres.',
        error_email_taken: 'Este e-mail já está cadastrado.',
        error_wrong_credentials: 'E-mail ou senha incorretos.',
        update_alert: 'Para atualizar a lista de filmes em tempo real:\n\n1. Abra a pasta do projeto e dê duplo clique no arquivo "atualizar.bat".\n2. Isso iniciará a pesquisa automatizada no YouTube.\n3. Quando o script terminar, basta recarregar esta página (F5) no navegador.',
        warning_file_protocol: '<i class="fa-solid fa-triangle-exclamation" style="font-size: 1.1rem; color: #ffbe0b;"></i> <span><strong>Atenção:</strong> O YouTube bloqueia a reprodução (Erro 153) quando o arquivo é aberto diretamente (<code>file://</code>). Por favor, execute o arquivo <strong>"iniciar_servidor.bat"</strong> na pasta do projeto para rodar via <code>http://localhost:8000</code>.</span>',
        warning_dismiss: 'Entendido',
        forgot_password: 'Esqueci minha senha',
        forgot_desc: 'Digite seu e-mail e enviaremos um link para redefinir sua senha.',
        btn_send_reset: 'Enviar link de redefinição',
        forgot_success: 'E-mail enviado! Verifique sua caixa de entrada.',
        back_to_login: '← Voltar para o login',
        error_too_many_requests: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
        error_network: 'Erro de conexão. Verifique sua internet.',
        error_generic: 'Ocorreu um erro. Tente novamente.',
        btn_cast_tv: 'Assistir na TV',
        btn_cast_tv_title: 'Transmitir para a TV',
        cast_modal_title: 'Assistir na TV',
        cast_option_mobile_title: 'Pelo Celular',
        cast_option_mobile_desc: 'Escaneie o QR Code abaixo com a câmera do seu celular para abrir o filme no aplicativo do YouTube e transmitir diretamente para a TV:',
        btn_open_in_yt: 'Abrir no App do YouTube',
        cast_option_pc_title: 'Pelo Computador (Chrome / Edge)',
        cast_option_pc_desc: 'Selecione o ícone de transmissão <i class="fa-solid fa-square-rss" style="transform: rotate(90deg); color: var(--accent-cyan);"></i> nos controles inferiores do player (só aparece se a TV estiver ligada no mesmo Wi-Fi). <br><br><strong>Alternativa:</strong> Clique com o botão direito em qualquer área vazia desta página e selecione <strong>"Transmitir mídia para dispositivo"</strong> (no Edge) ou <strong>"Transmitir..."</strong> (no Chrome).',
        seo_title: 'Lunera - Portal de Filmes Completos no YouTube',
        seo_description: 'Assista a centenas de filmes completos, dublados e legendados agregados diretamente do YouTube. Acesso rápido, organizado e sem cadastro obrigatório.',
        seo_keywords: 'filmes completos, filmes dublados, filmes gratis, youtube filmes, assistir filmes online, cinema gratis, filmes completos youtube, lunera'
    },
    es: {
        subtitle: 'Películas completas y dobladas de YouTube reunidas en un solo lugar',
        cc_info: '<strong>¿Películas extranjeras?</strong> Active los subtítulos (CC) en el reproductor y cambie a la traducción automática al Español en el engranaje <i class="fa-solid fa-gear"></i> del vídeo. El registro no es obligatorio, existe para que pueda crear su lista de reproducción. ¡Si le gustó, compártalo!',
        btn_auth: '<i class="fa-regular fa-user"></i> Iniciar sesión / Registrarse',
        placeholder_title: 'Ninguna película seleccionada',
        placeholder_desc: 'Seleccione una película abajo para comenzar a verla',
        now_playing: 'REPRODUCIENDO AHORA',
        loading_movies: 'Cargando películas...',
        meta_channel: 'Canal',
        meta_duration: 'Duración',
        btn_toggle_playlist_title: 'Guardar para ver después',
        btn_add_playlist: 'Agregar a Playlist',
        btn_in_playlist: 'En Playlist',
        search_placeholder: 'Buscar por título, género, canal o palabra clave...',
        all_channels: 'Todos los Canales',
        sort_original: 'Orden Original',
        sort_pt: 'Portugués (Brasil/Portugal)',
        sort_es: 'Español',
        sort_en: 'Inglés',
        sort_it: 'Italiano',
        sort_fr: 'Francés',
        sort_ja: 'Japonés',
        sort_zh: 'Chino',
        sort_hi: 'Hindi',
        sort_tr: 'Turco',
        sort_ru: 'Ruso',
        sort_de: 'Alemán',
        filter_all: 'Todos',
        filter_action: 'Acción y Aventura',
        filter_comedy: 'Comedia',
        filter_horror: 'Terror y Suspenso',
        filter_scifi: 'Ciencia Ficción y Fantasía',
        filter_documentary: 'Documentales',
        filter_other: 'Otras Películas',
        filter_mylist: '<i class="fa-solid fa-bookmark" style="margin-right: 5px;"></i> Mi Lista',
        available_movies: 'Películas Disponibles',
        channels_label: 'canales',
        no_results_title: 'Ninguna película encontrada',
        no_results_desc: 'Intente buscar con términos diferentes o seleccione otra categoría.',
        footer_copy: '&copy; 2026 Lunera. Películas agregadas de YouTube en tiempo real.',
        footer_email_label: 'Correo para contacto, dudas, sugerencias y elogios:',
        footer_visitors: 'Visitas:',
        footer_map_placeholder: 'Mapa de visitantes — <strong>configura en flagcounter.com</strong>',
        update_list: '<i class="fa-solid fa-arrows-rotate"></i> Actualizar Lista',
        tab_login: 'Iniciar sesión',
        tab_register: 'Registrarse',
        label_email: 'Correo electrónico',
        label_password: 'Contraseña',
        placeholder_password: 'Su contraseña',
        placeholder_min_char: 'Mínimo 6 caracteres',
        btn_login_submit: 'Iniciar sesión',
        btn_register_submit: 'Registrarse',
        btn_logout: 'Salir',
        card_badge: 'PELÍCULA',
        duration_label: 'Duración',
        page_label: 'Página',
        page_of: 'de',
        page_first: 'Primera',
        page_previous: 'Anterior',
        page_next: 'Siguiente',
        page_last: 'Última',
        cat_action: 'Acción y Aventura',
        cat_comedy: 'Comedia',
        cat_horror: 'Terror y Suspenso',
        cat_scifi: 'Ciencia Ficción y Fantasía',
        cat_documentary: 'Documental',
        cat_other: 'Película',
        error_load_title: 'Error al cargar las películas',
        error_load_desc: 'Verifique si el archivo "filmes.js" o "filmes.json" existe o ejecute "atualizar.bat" en la carpeta del proyecto.',
        error_no_data: 'Sin conexión con los datos',
        error_invalid_email: 'Por favor, introduzca un correo electrónico válido.',
        error_short_password: 'La contraseña debe tener al menos 6 caracteres.',
        error_email_taken: 'Este correo electrónico ya está registrado.',
        error_wrong_credentials: 'Correo electrónico o contraseña incorrectos.',
        update_alert: 'Para actualizar la lista de películas en tiempo real:\n\n1. Abra la carpeta del proyecto y haga doble clic en el archivo "atualizar.bat".\n2. Esto iniciará la búsqueda automatizada en YouTube.\n3. Cuando el script termine, simplemente recargue esta página (F5) en el navegador.',
        warning_file_protocol: '<i class="fa-solid fa-triangle-exclamation" style="font-size: 1.1rem; color: #ffbe0b;"></i> <span><strong>Atención:</strong> YouTube bloquea la reproducción (Error 153) cuando el archivo se abre directamente (<code>file://</code>). Por favor, ejecute el archivo <strong>"iniciar_servidor.bat"</strong> en la carpeta del proyecto para ejecutarlo vía <code>http://localhost:8000</code>.</span>',
        warning_dismiss: 'Entendido',
        forgot_password: '¿Olvidé mi contraseña?',
        forgot_desc: 'Ingresa tu e-mail y te enviaremos un enlace para restablecer tu contraseña.',
        btn_send_reset: 'Enviar enlace de restablecimiento',
        forgot_success: '¡Correo enviado! Revisa tu bandeja de entrada.',
        back_to_login: '← Volver al inicio de sesión',
        error_too_many_requests: 'Demasiados intentos. Espera unos minutos y vuelve a intentarlo.',
        error_network: 'Error de conexión. Verifica tu internet.',
        error_generic: 'Ocurrió un error. Inténtalo de nuevo.',
        btn_cast_tv: 'Ver en TV',
        btn_cast_tv_title: 'Transmitir a la TV',
        cast_modal_title: 'Ver en TV',
        cast_option_mobile_title: 'Por Móvil / Celular',
        cast_option_mobile_desc: 'Escanee el código QR a continuación con la cámara de su móvil para abrir la película en la aplicación de YouTube y transmitir directamente a la TV:',
        btn_open_in_yt: 'Abrir en la App de YouTube',
        cast_option_pc_title: 'Por Computadora (Chrome / Edge)',
        cast_option_pc_desc: 'Seleccione el icono de transmisión <i class="fa-solid fa-square-rss" style="transform: rotate(90deg); color: var(--accent-cyan);"></i> en los controles inferiores del reproductor (solo aparece si la TV está encendida en el mismo Wi-Fi). <br><br><strong>Alternativa:</strong> Haga clic derecho en cualquier área vacía de esta página y seleccione <strong>"Transmitir transmisión al dispositivo"</strong> (en Edge) o <strong>"Transmitir..."</strong> (en Chrome).',
        seo_title: 'Lunera - Portal de Películas Completas en YouTube',
        seo_description: 'Vea cientos de películas completas, dobladas y subtituladas agregadas directamente de YouTube. Acceso rápido, organizado y sin registro obligatorio.',
        seo_keywords: 'películas completas, películas dobladas, películas gratis, youtube películas, ver películas online, cine gratis, películas completas youtube, lunera'
    },
    it: {
        subtitle: 'Film completi e doppiati da YouTube riuniti in un unico posto',
        cc_info: '<strong>Film stranieri?</strong> Attiva i sottotitoli (CC) nel player e passa alla traduzione automatica in Italiano nell\'ingranaggio <i class="fa-solid fa-gear"></i> del video. La registrazione non è obbligatoria, esiste per consentirti di creare la tua playlist. Se ti è piaciuto, condividilo!',
        btn_auth: '<i class="fa-regular fa-user"></i> Accedi / Registrati',
        placeholder_title: 'Nessun film selezionato',
        placeholder_desc: 'Seleziona un film qui sotto per iniziare a guardarlo',
        now_playing: 'IN RIPRODUZIONE ORA',
        loading_movies: 'Caricamento film...',
        meta_channel: 'Canale',
        meta_duration: 'Durata',
        btn_toggle_playlist_title: 'Salva per guardare dopo',
        btn_add_playlist: 'Aggiungi alla Playlist',
        btn_in_playlist: 'Nella Playlist',
        search_placeholder: 'Cerca per titolo, genere, canale o parola chiave...',
        all_channels: 'Tutti i Canali',
        sort_original: 'Ordine Originale',
        sort_pt: 'Portoghese (Brasile/Portogallo)',
        sort_es: 'Spagnolo',
        sort_en: 'Inglese',
        sort_it: 'Italiano',
        sort_fr: 'Francese',
        sort_ja: 'Giapponese',
        sort_zh: 'Cinese',
        sort_hi: 'Hindi',
        sort_tr: 'Turco',
        sort_ru: 'Russo',
        sort_de: 'Tedesco',
        filter_all: 'Tutti',
        filter_action: 'Azione e Avventura',
        filter_comedy: 'Commedia',
        filter_horror: 'Horror e Suspense',
        filter_scifi: 'Fantascienza e Fantasy',
        filter_documentary: 'Documentari',
        filter_other: 'Altri Film',
        filter_mylist: '<i class="fa-solid fa-bookmark" style="margin-right: 5px;"></i> La Mia Lista',
        available_movies: 'Film Disponibili',
        channels_label: 'canali',
        no_results_title: 'Nessun film trovato',
        no_results_desc: 'Prova a cercare con termini diversi o seleziona un\'altra categoria.',
        footer_copy: '&copy; 2026 Lunera. Film aggregati da YouTube in tempo reale.',
        footer_email_label: 'E-mail per contatti, domande, suggerimenti e complimenti:',
        footer_visitors: 'Visite:',
        footer_map_placeholder: 'Mappa visitatori — <strong>configura su flagcounter.com</strong>',
        update_list: '<i class="fa-solid fa-arrows-rotate"></i> Aggiorna Lista',
        tab_login: 'Accedi',
        tab_register: 'Registrati',
        label_email: 'E-mail',
        label_password: 'Password',
        placeholder_password: 'La tua password',
        placeholder_min_char: 'Minimo 6 caratteri',
        btn_login_submit: 'Accedi',
        btn_register_submit: 'Registrati',
        btn_logout: 'Esci',
        card_badge: 'FILM',
        duration_label: 'Durata',
        page_label: 'Pagina',
        page_of: 'di',
        page_first: 'Prima',
        page_previous: 'Precedente',
        page_next: 'Successiva',
        page_last: 'Ultima',
        cat_action: 'Azione e Avventura',
        cat_comedy: 'Commedia',
        cat_horror: 'Horror e Suspense',
        cat_scifi: 'Fantascienza e Fantasy',
        cat_documentary: 'Documentario',
        cat_other: 'Film',
        error_load_title: 'Errore nel caricamento dei film',
        error_load_desc: 'Verifica se il file "filmes.js" o "filmes.json" esiste o esegui "atualizar.bat" nella cartella del progetto.',
        error_no_data: 'Nessuna connessione con i dati',
        error_invalid_email: 'Per favore, inserisci un\'e-mail valida.',
        error_short_password: 'La password deve avere almeno 6 caratteri.',
        error_email_taken: 'Questa e-mail è già registrata.',
        error_wrong_credentials: 'E-mail o password errati.',
        update_alert: 'Per aggiornare la lista dei film in tempo reale:\n\n1. Apri la cartella del progetto e fai doppio clic sul file "atualizar.bat".\n2. Questo avvierà la ricerca automatizzata su YouTube.\n3. Quando lo script sarà terminato, ricarica semplicemente questa pagina (F5) nel browser.',
        warning_file_protocol: '<i class="fa-solid fa-triangle-exclamation" style="font-size: 1.1rem; color: #ffbe0b;"></i> <span><strong>Attenzione:</strong> YouTube blocca la riproduzione (Errore 153) quando il file viene aperto direttamente (<code>file://</code>). Per favore, esegui il file <strong>"iniciar_servidor.bat"</strong> nella cartella del progetto per eseguirlo tramite <code>http://localhost:8000</code>.</span>',
        warning_dismiss: 'Capito',
        forgot_password: 'Ho dimenticato la password',
        forgot_desc: 'Inserisci la tua e-mail e ti invieremo un link per reimpostare la password.',
        btn_send_reset: 'Invia link di reimpostazione',
        forgot_success: 'E-mail inviata! Controlla la tua casella di posta.',
        back_to_login: '← Torna al login',
        error_too_many_requests: 'Troppi tentativi. Attendi qualche minuto e riprova.',
        error_network: 'Errore di connessione. Controlla la tua internet.',
        error_generic: 'Si è verificato un errore. Riprova.',
        btn_cast_tv: 'Guarda in TV',
        btn_cast_tv_title: 'Trasmetti alla TV',
        cast_modal_title: 'Guarda in TV',
        cast_option_mobile_title: 'Da Smartphone',
        cast_option_mobile_desc: 'Scansiona il codice QR qui sotto con la fotocamera del tuo cellulare per aprire il film nell\'app YouTube e trasmetterlo direttamente alla TV:',
        btn_open_in_yt: 'Apri nell\'App YouTube',
        cast_option_pc_title: 'Da Computer (Chrome / Edge)',
        cast_option_pc_desc: 'Seleziona l\'icona di trasmissione <i class="fa-solid fa-square-rss" style="transform: rotate(90deg); color: var(--accent-cyan);"></i> nei controlli inferiori del player (appare solo se la TV è connessa al Wi-Fi). <br><br><strong>Alternativa:</strong> Fai clic con il tasto destro in un punto qualsiasi di questa pagina e seleziona <strong>"Trasmetti..."</strong>.',
        seo_title: 'Lunera - Portale di Film Completi su YouTube',
        seo_description: 'Guarda centinaia di film completi, doppiati e sottotitolati aggregati direttamente da YouTube. Accesso rapido, organizzato e senza registrazione obbligatoria.',
        seo_keywords: 'film completi, film doppiati, film gratis, youtube film, guardare film online, cinema gratis, film completi youtube, lunera'
    },
    fr: {
        subtitle: 'Films complets et doublés de YouTube réunis en un seul endroit',
        cc_info: '<strong>Films étrangers ?</strong> Activez les sous-titres (CC) dans le lecteur et passez à la traduction automatique en Français dans l\'engrenage <i class="fa-solid fa-gear"></i> de la vidéo. L\'inscription n\'est pas obligatoire, elle existe pour vous permettre de créer votre playlist. Si vous avez aimé, partagez-le !',
        btn_auth: '<i class="fa-regular fa-user"></i> Se connecter / S\'inscrire',
        placeholder_title: 'Aucun film sélectionné',
        placeholder_desc: 'Sélectionnez un film ci-dessous pour commencer à le regarder',
        now_playing: 'EN LECTURE MAINTENANT',
        loading_movies: 'Chargement des films...',
        meta_channel: 'Chaîne',
        meta_duration: 'Durée',
        btn_toggle_playlist_title: 'Enregistrer pour regarder plus tard',
        btn_add_playlist: 'Ajouter à la Playlist',
        btn_in_playlist: 'Dans la Playlist',
        search_placeholder: 'Rechercher par titre, genre, chaîne ou mot-clé...',
        all_channels: 'Toutes les Chaînes',
        sort_original: 'Ordre Original',
        sort_pt: 'Portugais (Brésil/Portugal)',
        sort_es: 'Espagnol',
        sort_en: 'Anglais',
        sort_it: 'Italien',
        sort_fr: 'Français',
        sort_ja: 'Japonais',
        sort_zh: 'Chinois',
        sort_hi: 'Hindi',
        sort_tr: 'Turc',
        sort_ru: 'Russe',
        sort_de: 'Allemand',
        filter_all: 'Tous',
        filter_action: 'Action et Aventure',
        filter_comedy: 'Comédie',
        filter_horror: 'Horreur et Suspense',
        filter_scifi: 'Science-Fiction et Fantaisie',
        filter_documentary: 'Documentaires',
        filter_other: 'Autres Films',
        filter_mylist: '<i class="fa-solid fa-bookmark" style="margin-right: 5px;"></i> Ma Liste',
        available_movies: 'Films Disponibles',
        channels_label: 'chaînes',
        no_results_title: 'Aucun film trouvé',
        no_results_desc: 'Essayez de rechercher avec des termes différents ou sélectionnez une autre catégorie.',
        footer_copy: '&copy; 2026 Lunera. Films agrégés de YouTube en temps réel.',
        footer_email_label: 'E-mail pour contact, questions, suggestions et compliments :',
        footer_visitors: 'Visites :',
        footer_map_placeholder: 'Carte des visiteurs — <strong>configurez sur flagcounter.com</strong>',
        update_list: '<i class="fa-solid fa-arrows-rotate"></i> Mettre à jour la Liste',
        tab_login: 'Se connecter',
        tab_register: 'S\'inscrire',
        label_email: 'E-mail',
        label_password: 'Mot de passe',
        placeholder_password: 'Votre mot de passe',
        placeholder_min_char: 'Minimum 6 caractères',
        btn_login_submit: 'Se connecter',
        btn_register_submit: 'S\'inscrire',
        btn_logout: 'Déconnexion',
        card_badge: 'FILM',
        duration_label: 'Durée',
        page_label: 'Page',
        page_of: 'de',
        page_first: 'Première',
        page_previous: 'Précédente',
        page_next: 'Suivante',
        page_last: 'Dernière',
        cat_action: 'Action et Aventure',
        cat_comedy: 'Comédie',
        cat_horror: 'Horreur et Suspense',
        cat_scifi: 'Science-Fiction et Fantaisie',
        cat_documentary: 'Documentaire',
        cat_other: 'Film',
        error_load_title: 'Erreur lors du chargement des films',
        error_load_desc: 'Vérifiez si le fichier "filmes.js" ou "filmes.json" existe ou exécutez "atualizar.bat" dans le dossier du projet.',
        error_no_data: 'Pas de connexion aux données',
        error_invalid_email: 'Veuillez entrer un e-mail valide.',
        error_short_password: 'Le mot de passe doit comporter au moins 6 caractères.',
        error_email_taken: 'Cet e-mail est déjà enregistré.',
        error_wrong_credentials: 'E-mail ou mot de passe incorrect.',
        update_alert: 'Pour mettre à jour la liste des films en temps réel :\n\n1. Ouvrez le dossier du projet et double-cliquez sur le fichier "atualizar.bat".\n2. Cela lancera la recherche automatisée sur YouTube.\n3. Lorsque le script sera terminé, rechargez simplement cette page (F5) dans le navigateur.',
        warning_file_protocol: '<i class="fa-solid fa-triangle-exclamation" style="font-size: 1.1rem; color: #ffbe0b;"></i> <span><strong>Attention :</strong> YouTube bloque la lecture (Erreur 153) lorsque le fichier est ouvert directement (<code>file://</code>). Veuillez exécuter le fichier <strong>"iniciar_servidor.bat"</strong> dans le dossier du projet pour le lancer via <code>http://localhost:8000</code>.</span>',
        warning_dismiss: 'Compris',
        forgot_password: 'Mot de passe oublié',
        forgot_desc: 'Entrez votre e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.',
        btn_send_reset: 'Envoyer le lien de réinitialisation',
        forgot_success: 'E-mail envoyé ! Vérifiez votre boîte de réception.',
        back_to_login: '← Retour à la connexion',
        error_too_many_requests: 'Trop de tentatives. Attendez quelques minutes et réessayez.',
        error_network: 'Erreur de connexion. Vérifiez votre internet.',
        error_generic: 'Une erreur est survenue. Réessayez.',
        btn_cast_tv: 'Regarder sur la TV',
        btn_cast_tv_title: 'Caster sur la TV',
        cast_modal_title: 'Regarder sur la TV',
        cast_option_mobile_title: 'Depuis le mobile',
        cast_option_mobile_desc: 'Scannez le code QR ci-dessous avec l\'appareil photo de votre téléphone pour ouvrir le film dans l\'application YouTube et le caster sur la TV :',
        btn_open_in_yt: 'Ouvrir dans l\'application YouTube',
        cast_option_pc_title: 'Depuis l\'ordinateur (Chrome / Edge)',
        cast_option_pc_desc: 'Sélectionnez l\'icône de diffusion <i class="fa-solid fa-square-rss" style="transform: rotate(90deg); color: var(--accent-cyan);"></i> dans les commandes du lecteur (n\'apparaît que si la TV est connectée au même Wi-Fi). <br><br><strong>Alternative :</strong> Faites un clic droit n\'importe où sur cette page et sélectionnez <strong>"Caster..."</strong>.',
        seo_title: 'Lunera - Portail de Films Complets sur YouTube',
        seo_description: 'Regardez des centaines de films complets, doublés et sous-titrés agrégés directement depuis YouTube. Accès rapide, organisé et sans inscription obligatoire.',
        seo_keywords: 'films complets, films doublés, films gratuits, youtube films, regarder films en ligne, cinéma gratuit, films complets youtube, lunera'
    },
    en: {
        subtitle: 'Full and dubbed movies from YouTube all in one place',
        cc_info: '<strong>Foreign films?</strong> Enable subtitles (CC) in the player and switch to automatic English translation in the gear <i class="fa-solid fa-gear"></i> of the video. Registration is not required — it exists so you can create your playlist. If you enjoyed it, please share!',
        btn_auth: '<i class="fa-regular fa-user"></i> Sign In / Sign Up',
        placeholder_title: 'No movie selected',
        placeholder_desc: 'Select a movie below to start watching',
        now_playing: 'NOW PLAYING',
        loading_movies: 'Loading movies...',
        meta_channel: 'Channel',
        meta_duration: 'Duration',
        btn_toggle_playlist_title: 'Save to watch later',
        btn_add_playlist: 'Add to Playlist',
        btn_in_playlist: 'In Playlist',
        search_placeholder: 'Search by title, genre, channel or keyword...',
        all_channels: 'All Channels',
        sort_original: 'Original Order',
        sort_pt: 'Portuguese (Brazil/Portugal)',
        sort_es: 'Spanish',
        sort_en: 'English',
        sort_it: 'Italian',
        sort_fr: 'French',
        sort_ja: 'Japanese',
        sort_zh: 'Chinese',
        sort_hi: 'Hindi',
        sort_tr: 'Turkish',
        sort_ru: 'Russian',
        sort_de: 'German',
        filter_all: 'All',
        filter_action: 'Action & Adventure',
        filter_comedy: 'Comedy',
        filter_horror: 'Horror & Thriller',
        filter_scifi: 'Sci-Fi & Fantasy',
        filter_documentary: 'Documentaries',
        filter_other: 'Other Movies',
        filter_mylist: '<i class="fa-solid fa-bookmark" style="margin-right: 5px;"></i> My List',
        available_movies: 'Available Movies',
        channels_label: 'channels',
        no_results_title: 'No movies found',
        no_results_desc: 'Try searching with different terms or select another category.',
        footer_copy: '&copy; 2026 Lunera. Movies aggregated from YouTube in real time.',
        footer_email_label: 'E-mail for contact, questions, suggestions and compliments:',
        footer_visitors: 'Visits:',
        footer_map_placeholder: 'Visitor map — <strong>set up at flagcounter.com</strong>',
        update_list: '<i class="fa-solid fa-arrows-rotate"></i> Update List',
        tab_login: 'Sign In',
        tab_register: 'Sign Up',
        label_email: 'E-mail',
        label_password: 'Password',
        placeholder_password: 'Your password',
        placeholder_min_char: 'Minimum 6 characters',
        btn_login_submit: 'Sign In',
        btn_register_submit: 'Sign Up',
        btn_logout: 'Sign Out',
        card_badge: 'MOVIE',
        duration_label: 'Duration',
        page_label: 'Page',
        page_of: 'of',
        page_first: 'First',
        page_previous: 'Previous',
        page_next: 'Next',
        page_last: 'Last',
        cat_action: 'Action & Adventure',
        cat_comedy: 'Comedy',
        cat_horror: 'Horror & Thriller',
        cat_scifi: 'Sci-Fi & Fantasy',
        cat_documentary: 'Documentary',
        cat_other: 'Movie',
        error_load_title: 'Error loading movies',
        error_load_desc: 'Check if the "filmes.js" or "filmes.json" file exists or run "atualizar.bat" in the project folder.',
        error_no_data: 'No data connection',
        error_invalid_email: 'Please enter a valid e-mail address.',
        error_short_password: 'Password must be at least 6 characters.',
        error_email_taken: 'This e-mail is already registered.',
        error_wrong_credentials: 'Incorrect e-mail or password.',
        update_alert: 'To update the movie list in real time:\n\n1. Open the project folder and double-click the "atualizar.bat" file.\n2. This will start the automated YouTube search.\n3. When the script finishes, simply reload this page (F5) in the browser.',
        warning_file_protocol: '<i class="fa-solid fa-triangle-exclamation" style="font-size: 1.1rem; color: #ffbe0b;"></i> <span><strong>Warning:</strong> YouTube blocks playback (Error 153) when the file is opened directly (<code>file://</code>). Please run the <strong>"iniciar_servidor.bat"</strong> file in the project folder to run it via <code>http://localhost:8000</code>.</span>',
        warning_dismiss: 'Got it',
        forgot_password: 'Forgot my password',
        forgot_desc: 'Enter your e-mail and we will send you a link to reset your password.',
        btn_send_reset: 'Send reset link',
        forgot_success: 'E-mail sent! Check your inbox.',
        back_to_login: '← Back to login',
        error_too_many_requests: 'Too many attempts. Wait a few minutes and try again.',
        error_network: 'Connection error. Check your internet.',
        error_generic: 'An error occurred. Please try again.',
        btn_cast_tv: 'Watch on TV',
        btn_cast_tv_title: 'Cast to TV',
        cast_modal_title: 'Watch on TV',
        cast_option_mobile_title: 'Using Mobile',
        cast_option_mobile_desc: 'Scan the QR Code below with your mobile camera to open the movie in the YouTube app and cast directly to your TV:',
        btn_open_in_yt: 'Open in YouTube App',
        cast_option_pc_title: 'Using Computer (Chrome / Edge)',
        cast_option_pc_desc: 'Select the cast icon <i class="fa-solid fa-square-rss" style="transform: rotate(90deg); color: var(--accent-cyan);"></i> in the bottom controls of the player (it only appears if the TV is turned on and connected to the same Wi-Fi). <br><br><strong>Alternative:</strong> Right-click anywhere on the page and select <strong>"Cast media to device"</strong> (in Edge) or <strong>"Cast..."</strong> (in Chrome).',
        seo_title: 'Lunera - Full Movies Portal on YouTube',
        seo_description: 'Watch hundreds of full, dubbed, and subtitled movies aggregated directly from YouTube. Fast access, organized, and no registration required.',
        seo_keywords: 'full movies, dubbed movies, free movies, youtube movies, watch movies online, free cinema, full movies youtube, lunera'
    },
    tr: {
        subtitle: 'YouTube\'dan tam ve dublajlı filmler tek bir yerde',
        cc_info: '<strong>Yabancı filmler mi?</strong> Oynatıcıda altyazıları (CC) etkinleştirin ve videonun dişli simgesinden <i class="fa-solid fa-gear"></i> otomatik Türkçe çevirisine geçin. Kayıt zorunlu değildir; oynatma listenizi oluşturabilmeniz için mevcuttur. Beğendiyseniz lütfen paylaşın!',
        btn_auth: '<i class="fa-regular fa-user"></i> Giriş Yap / Kayıt Ol',
        placeholder_title: 'Film seçilmedi',
        placeholder_desc: 'İzlemeye başlamak için aşağıdan bir film seçin',
        now_playing: 'ŞU AN OYNATILIYOR',
        loading_movies: 'Filmler yükleniyor...',
        meta_channel: 'Kanal',
        meta_duration: 'Süre',
        btn_toggle_playlist_title: 'Sonra izlemek için kaydet',
        btn_add_playlist: 'Oynatma Listesine Ekle',
        btn_in_playlist: 'Oynatma Listesinde',
        search_placeholder: 'Başlık, tür, kanal veya anahtar kelimeyle ara...',
        all_channels: 'Tüm Kanallar',
        sort_original: 'Orijinal Sıra',
        sort_pt: 'Portekizce (Brezilya/Portekiz)',
        sort_es: 'İspanyolca',
        sort_en: 'İngilizce',
        sort_it: 'İtalyanca',
        sort_fr: 'Fransızca',
        sort_ja: 'Japonca',
        sort_zh: 'Çince',
        sort_hi: 'Hintçe',
        sort_tr: 'Türkçe',
        sort_ru: 'Rusça',
        sort_de: 'Almanca',
        filter_all: 'Tümü',
        filter_action: 'Aksiyon & Macera',
        filter_comedy: 'Komedi',
        filter_horror: 'Korku & Gerilim',
        filter_scifi: 'Bilim Kurgu & Fantezi',
        filter_documentary: 'Belgeseller',
        filter_other: 'Diğer Filmler',
        filter_mylist: '<i class="fa-solid fa-bookmark" style="margin-right: 5px;"></i> Listem',
        available_movies: 'Mevcut Filmler',
        channels_label: 'kanal',
        no_results_title: 'Film bulunamadı',
        no_results_desc: 'Farklı terimlerle aramayı deneyin veya başka bir kategori seçin.',
        footer_copy: '&copy; 2026 Lunera. YouTube\'dan gerçek zamanlı film listesi.',
        footer_email_label: 'İletişim, sorular, öneriler ve övgüler için e-posta:',
        footer_visitors: 'Ziyaretler:',
        footer_map_placeholder: 'Ziyaretçi haritası — <strong>flagcounter.com\'da yapılandırın</strong>',
        update_list: '<i class="fa-solid fa-arrows-rotate"></i> Listeyi Güncelle',
        tab_login: 'Giriş Yap',
        tab_register: 'Kayıt Ol',
        label_email: 'E-posta',
        label_password: 'Şifre',
        placeholder_password: 'Şifreniz',
        placeholder_min_char: 'En az 6 karakter',
        btn_login_submit: 'Giriş Yap',
        btn_register_submit: 'Kayıt Ol',
        btn_logout: 'Çıkış Yap',
        card_badge: 'FİLM',
        duration_label: 'Süre',
        page_label: 'Sayfa',
        page_of: '/',
        page_first: 'İlk',
        page_previous: 'Önceki',
        page_next: 'Sonraki',
        page_last: 'Son',
        cat_action: 'Aksiyon & Macera',
        cat_comedy: 'Komedi',
        cat_horror: 'Korku & Gerilim',
        cat_scifi: 'Bilim Kurgu & Fantezi',
        cat_documentary: 'Belgesel',
        cat_other: 'Film',
        error_load_title: 'Filmler yüklenirken hata oluştu',
        error_load_desc: '"filmes.js" veya "filmes.json" dosyasının var olup olmadığını kontrol edin veya proje klasöründe "atualizar.bat" dosyasını çalıştırın.',
        error_no_data: 'Veri bağlantısı yok',
        error_invalid_email: 'Lütfen geçerli bir e-posta adresi girin.',
        error_short_password: 'Şifre en az 6 karakter olmalıdır.',
        error_email_taken: 'Bu e-posta zaten kayıtlı.',
        error_wrong_credentials: 'E-posta veya şifre yanlış.',
        update_alert: 'Film listesini gerçek zamanlı güncellemek için:\n\n1. Proje klasörünü açın ve "atualizar.bat" dosyasına çift tıklayın.\n2. Bu, YouTube\'da otomatik aramayı başlatacak.\n3. Betik tamamlandığında, tarayıcıda bu sayfayı yenileyin (F5).',
        warning_file_protocol: '<i class="fa-solid fa-triangle-exclamation" style="font-size: 1.1rem; color: #ffbe0b;"></i> <span><strong>Dikkat:</strong> YouTube, dosya doğrudan açıldığında (<code>file://</code>) oynatmayı engeller (Hata 153). Lütfen <code>http://localhost:8000</code> üzerinden çalıştırmak için proje klasöründeki <strong>"iniciar_servidor.bat"</strong> dosyasını çalıştırın.</span>',
        warning_dismiss: 'Anladım',
        forgot_password: 'Şifremi unuttum',
        forgot_desc: 'E-postanızı girin, şifrenizi sıfırlamak için size bir bağlantı gönderelim.',
        btn_send_reset: 'Sıfırlama bağlantısı gönder',
        forgot_success: 'E-posta gönderildi! Gelen kutunuzu kontrol edin.',
        back_to_login: '← Girişe geri dön',
        error_too_many_requests: 'Çok fazla deneme. Birkaç dakika bekleyip tekrar deneyin.',
        error_network: 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.',
        error_generic: 'Bir hata oluştu. Lütfen tekrar deneyin.',
        btn_cast_tv: 'TV\'de İzle',
        btn_cast_tv_title: 'TV\'ye Aktar',
        cast_modal_title: 'TV\'de İzle',
        cast_option_mobile_title: 'Mobilden',
        cast_option_mobile_desc: 'Filmi YouTube uygulamasında açıp doğrudan TV\'ye aktarmak için aşağıdaki QR kodunu telefonunuzun kamerasıyla tarayın:',
        btn_open_in_yt: 'YouTube Uygulamasında Aç',
        cast_option_pc_title: 'Bilgisayardan (Chrome / Edge)',
        cast_option_pc_desc: 'Oynatıcının alt kontrollerindeki yayınlama simgesini <i class="fa-solid fa-square-rss" style="transform: rotate(90deg); color: var(--accent-cyan);"></i> seçin (yalnızca TV aynı Wi-Fi ağındaysa görünür). <br><br><strong>Alternatif:</strong> Bu sayfada herhangi bir boş yere sağ tıklayın ve <strong>"Yayınla..."</strong> seçeneğini belirleyin.',
        seo_title: 'Lunera - YouTube\'da Tam Film Portal\u0131',
        seo_description: 'Do\u011frudan YouTube\'dan derlenen y\u00fczlerce tam, dublajl\u0131 ve altyaz\u0131l\u0131 filmi izleyin. H\u0131zl\u0131 eri\u015fim, d\u00fczenli ve zorunlu kay\u0131t yok.',
        seo_keywords: 'tam filmler, dublajl\u0131 filmler, \u00fccretsiz filmler, youtube filmler, online film izle, \u00fccretsiz sinema, tam filmler youtube, lunera'
    },
    hi: {
        subtitle: 'YouTube से पूर्ण और डब की गई फ़िल्में एक ही जगह',
        cc_info: '<strong>विदेशी फ़िल्में?</strong> प्लेयर में सबटाइटल (CC) चालू करें और वीडियो के गियर <i class="fa-solid fa-gear"></i> से स्वचालित हिंदी अनुवाद चुनें। पंजीकरण अनिवार्य नहीं है — यह आपकी प्लेलिस्ट बनाने के लिए है। अगर पसंद आया तो कृपया शेयर करें!',
        btn_auth: '<i class="fa-regular fa-user"></i> लॉग इन / साइन अप',
        placeholder_title: 'कोई फ़िल्म नहीं चुनी गई',
        placeholder_desc: 'देखना शुरू करने के लिए नीचे से कोई फ़िल्म चुनें',
        now_playing: 'अभी चल रहा है',
        loading_movies: 'फ़िल्में लोड हो रही हैं...',
        meta_channel: 'चैनल',
        meta_duration: 'अवधि',
        btn_toggle_playlist_title: 'बाद में देखने के लिए सहेजें',
        btn_add_playlist: 'प्लेलिस्ट में जोड़ें',
        btn_in_playlist: 'प्लेलिस्ट में है',
        search_placeholder: 'शीर्षक, शैली, चैनल या कीवर्ड से खोजें...',
        all_channels: 'सभी चैनल',
        sort_original: 'मूल क्रम',
        sort_pt: 'पुर्तगाली (ब्राजील/पुर्तगाल)',
        sort_es: 'स्पैनिश',
        sort_en: 'अंग्रेजी',
        sort_it: 'इतालवी',
        sort_fr: 'फ्रेंच',
        sort_ja: 'जापानी',
        sort_zh: 'चीनी',
        sort_hi: 'हिंदी',
        sort_tr: 'तुर्की',
        sort_ru: 'रूसी',
        sort_de: 'जर्मन',
        filter_all: 'सभी',
        filter_action: 'एक्शन & रोमांच',
        filter_comedy: 'कॉमेडी',
        filter_horror: 'हॉरर & थ्रिलर',
        filter_scifi: 'साइ-फ़ाई & फ़ैंटेसी',
        filter_documentary: 'वृत्तचित्र',
        filter_other: 'अन्य फ़िल्में',
        filter_mylist: '<i class="fa-solid fa-bookmark" style="margin-right: 5px;"></i> मेरी सूची',
        available_movies: 'उपलब्ध फ़िल्में',
        channels_label: 'चैनल',
        no_results_title: 'कोई फ़िल्म नहीं मिली',
        no_results_desc: 'अलग शब्दों से खोजें या दूसरी श्रेणी चुनें।',
        footer_copy: '&copy; 2026 Lunera. YouTube से रीयल-टाइम में फ़िल्में।',
        footer_email_label: 'संपर्क, प्रश्न, सुझाव और प्रशंसा के लिए ई-मेल:',
        footer_visitors: 'विज़िट:',
        footer_map_placeholder: 'विज़िटर मानचित्र — <strong>flagcounter.com पर सेट करें</strong>',
        update_list: '<i class="fa-solid fa-arrows-rotate"></i> सूची अपडेट करें',
        tab_login: 'लॉग इन',
        tab_register: 'साइन अप',
        label_email: 'ई-मेल',
        label_password: 'पासवर्ड',
        placeholder_password: 'आपका पासवर्ड',
        placeholder_min_char: 'कम से कम 6 अक्षर',
        btn_login_submit: 'लॉग इन',
        btn_register_submit: 'साइन अप',
        btn_logout: 'लॉग आउट',
        card_badge: 'फ़िल्म',
        duration_label: 'अवधि',
        page_label: 'पृष्ठ',
        page_of: 'का',
        page_first: 'पहला',
        page_previous: 'पिछला',
        page_next: 'अगला',
        page_last: 'अंतिम',
        cat_action: 'एक्शन & रोमांच',
        cat_comedy: 'कॉमेडी',
        cat_horror: 'हॉरर & थ्रिलर',
        cat_scifi: 'साइ-फ़ाई & फ़ैंटेसी',
        cat_documentary: 'वृत्तचित्र',
        cat_other: 'फ़िल्म',
        error_load_title: 'फ़िल्में लोड करने में त्रुटि',
        error_load_desc: 'जांचें कि "filmes.js" या "filmes.json" फ़ाइल मौजूद है या प्रोजेक्ट फ़ोल्डर में "atualizar.bat" चलाएं।',
        error_no_data: 'डेटा कनेक्शन नहीं है',
        error_invalid_email: 'कृपया एक वैध ई-मेल दर्ज करें।',
        error_short_password: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।',
        error_email_taken: 'यह ई-मेल पहले से पंजीकृत है।',
        error_wrong_credentials: 'ई-मेल या पासवर्ड गलत है।',
        update_alert: 'फ़िल्म सूची को रीयल-टाइम में अपडेट करने के लिए:\n\n1. प्रोजेक्ट फ़ोल्डर खोलें और "atualizar.bat" फ़ाइल पर डबल-क्लिक करें।\n2. यह YouTube पर स्वचालित खोज शुरू करेगा।\n3. स्क्रिप्ट समाप्त होने पर ब्राउज़र में इस पेज को रीलोड करें (F5)।',
        warning_file_protocol: '<i class="fa-solid fa-triangle-exclamation" style="font-size: 1.1rem; color: #ffbe0b;"></i> <span><strong>सावधान:</strong> जब फ़ाइल सीधे खोली जाती है (<code>file://</code>) तो YouTube प्लेबैक ब्लॉक करता है (त्रुटि 153)। कृपया <code>http://localhost:8000</code> के माध्यम से चलाने के लिए प्रोजेक्ट फ़ोल्डर में <strong>"iniciar_servidor.bat"</strong> फ़ाइल चलाएं।</span>',
        warning_dismiss: 'समझ गया',
        forgot_password: 'मैं अपना पासवर्ड भूल गया',
        forgot_desc: 'अपना ई-मेल दर्ज करें और हम आपको पासवर्ड रीसेट करने का लिंक भेजेंगे।',
        btn_send_reset: 'रीसेट लिंक भेजें',
        forgot_success: 'ई-मेल भेज दिया गया! अपना इनबॉक्स जांचें।',
        back_to_login: '← लॉगिन पर वापस जाएं',
        error_too_many_requests: 'बहुत अधिक प्रयास। कुछ मिनट प्रतीक्षा करें और पुनः प्रयास करें।',
        error_network: 'कनेक्शन त्रुटि। अपना इंटरनेट जांचें।',
        error_generic: 'एक त्रुटि हुई। कृपया पुनः प्रयास करें.',
        btn_cast_tv: 'टीवी पर देखें',
        btn_cast_tv_title: 'टीवी पर कास्ट करें',
        cast_modal_title: 'टीवी पर देखें',
        cast_option_mobile_title: 'मोबाइल से',
        cast_option_mobile_desc: 'फ़िल्म को YouTube ऐप में खोलने और सीधे टीवी पर कास्ट करने के लिए अपने मोबाइल कैमरे से नीचे दिए गए QR कोड को स्कैन करें:',
        btn_open_in_yt: 'YouTube ऐप में खोलें',
        cast_option_pc_title: 'कंप्यूटर से (Chrome / Edge)',
        cast_option_pc_desc: 'प्लेयर के निचले नियंत्रणों में कास्ट आइकन <i class="fa-solid fa-square-rss" style="transform: rotate(90deg); color: var(--accent-cyan);"></i> चुनें (यह केवल तभी दिखाई देता है जब टीवी एक ही वाई-फाई से जुड़ा हो)। <br><br><strong>विकल्प:</strong> इस पेज पर किसी भी खाली स्थान पर राइट-क्लिक करें और <strong>"कास्ट करें..."</strong> चुनें।',
        seo_title: 'Lunera - YouTube पर पूरी फ़िल्मों का पोर्टल',
        seo_description: 'YouTube से सीधे एकत्रित सैकड़ों पूर्ण, डब और सब्टाइटल वाली फ़िल्में देखें। तेज़ पहुँच, व्यवस्थित और बिना अनिवार्य पंजीकरण के।',
        seo_keywords: 'पूरी फ़िल्में, डब की गई फ़िल्में, मुफ़्त फ़िल्में, यूट्यूब फ़िल्में, ऑनलाइन फ़िल्में देखें, मुफ़्त सिनेमा, यूट्यूब पर पूरी फ़िल्में, lunera'
    },
    ja: {
        subtitle: 'YouTubeの完全版・吹き替え映画を1か所に集約',
        cc_info: '<strong>外国映画ですか？</strong> プレーヤーで字幕（CC）を有効にし、動画の歯車アイコン <i class="fa-solid fa-gear"></i> から日本語の自動翻訳に切り替えてください。登録は必須ではありません。プレイリストを作成するためのものです。気に入ったらぜひシェアしてください！',
        btn_auth: '<i class="fa-regular fa-user"></i> ログイン / 新規登録',
        placeholder_title: '映画が選択されていません',
        placeholder_desc: '視聴を開始するには、下から映画を選択してください',
        now_playing: '再生中',
        loading_movies: '映画を読み込んでいます...',
        meta_channel: 'チャンネル',
        meta_duration: '再生時間',
        btn_toggle_playlist_title: '後で見るために保存',
        btn_add_playlist: 'プレイリストに追加',
        btn_in_playlist: 'プレイリストに追加済み',
        search_placeholder: 'タイトル、ジャンル、チャンネル、キーワードで検索...',
        all_channels: 'すべてのチャンネル',
        sort_original: '元の順序',
        sort_pt: 'ポルトガル語 (ブラジル/ポルトガル)',
        sort_es: 'スペイン語',
        sort_en: '英語',
        sort_it: 'イタリア語',
        sort_fr: 'フランス語',
        sort_ja: '日本語',
        sort_zh: '中国語',
        sort_hi: 'ヒンディー語',
        sort_tr: 'トルコ語',
        sort_ru: 'ロシア語',
        sort_de: 'ドイツ語',
        filter_all: 'すべて',
        filter_action: 'アクション＆アドベンチャー',
        filter_comedy: 'コメディ',
        filter_horror: 'ホラー＆サスペンス',
        filter_scifi: 'SF＆ファンタジー',
        filter_documentary: 'ドキュメンタリー',
        filter_other: 'その他の映画',
        filter_mylist: '<i class="fa-solid fa-bookmark" style="margin-right: 5px;"></i> マイリスト',
        available_movies: '視聴可能な映画',
        channels_label: 'チャンネル',
        no_results_title: '映画が見つかりません',
        no_results_desc: '別のキーワードで検索するか、別のカテゴリーを選択してください。',
        footer_copy: '&copy; 2026 Lunera. YouTubeからリアルタイムで集約された映画。',
        footer_email_label: 'お問い合わせ、ご質問、ご提案、お褒めの言葉はこちらへ：',
        footer_visitors: '訪問者数：',
        footer_map_placeholder: '訪問者マップ — <strong>flagcounter.comで設定してください</strong>',
        update_list: '<i class="fa-solid fa-arrows-rotate"></i> リストを更新',
        tab_login: 'ログイン',
        tab_register: '新規登録',
        label_email: 'メールアドレス',
        label_password: 'パスワード',
        placeholder_password: 'パスワードを入力',
        placeholder_min_char: '6文字以上',
        btn_login_submit: 'ログイン',
        btn_register_submit: '登録する',
        btn_logout: 'ログアウト',
        card_badge: '映画',
        duration_label: '再生時間',
        page_label: 'ページ',
        page_of: '/',
        page_first: '最初',
        page_previous: '前へ',
        page_next: '次へ',
        page_last: '最後',
        cat_action: 'アクション＆アドベンチャー',
        cat_comedy: 'コメディ',
        cat_horror: 'ホラー＆サスペンス',
        cat_scifi: 'SF＆ファンタジー',
        cat_documentary: 'ドキュメンタリー',
        cat_other: '映画',
        error_load_title: '映画の読み込みエラー',
        error_load_desc: '「filmes.js」または「filmes.json」ファイルが存在するか確認するか、プロジェクトフォルダ内で「atualizar.bat」を実行してください。',
        error_no_data: 'データ接続がありません',
        error_invalid_email: '有効なメールアドレスを入力してください。',
        error_short_password: 'パスワードは6文字以上である必要があります。',
        error_email_taken: 'このメールアドレスは既に登録されています。',
        error_wrong_credentials: 'メールアドレスまたはパスワードが正しくありません。',
        update_alert: '映画リストをリアルタイムで更新するには：\n\n1. プロジェクトフォルダを開き、「atualizar.bat」ファイルをダブルクリックします。\n2. これによりYouTubeでの自動検索が開始されます。\n3. スクリプトが完了したら、ブラウザでこのページを再読み込み（F5）してください。',
        warning_file_protocol: '<i class="fa-solid fa-triangle-exclamation" style="font-size: 1.1rem; color: #ffbe0b;"></i> <span><strong>注意：</strong> ファイルを直接開いた場合（<code>file://</code>）、YouTubeは再生をブロックします（エラー153）。プロジェクトフォルダ内の<strong>「iniciar_servidor.bat」</strong>ファイルを実行し、<code>http://localhost:8000</code>経由で開いてください。</span>',
        warning_dismiss: '了解しました',
        forgot_password: 'パスワードをお忘れですか',
        forgot_desc: 'メールアドレスを入力すると、パスワード再設定用のリンクをお送りします。',
        btn_send_reset: '再設定リンクを送信',
        forgot_success: 'メールを送信しました！受信箱をご確認ください。',
        back_to_login: '← ログインに戻る',
        error_too_many_requests: '試行回数が多すぎます。数分待ってからもう一度お試しください。',
        error_network: '接続エラーです。インターネット接続をご確認ください。',
        error_generic: 'エラーが発生しました。もう一度お試しください。',
        btn_cast_tv: 'TVで見る',
        btn_cast_tv_title: 'TVにキャスト',
        cast_modal_title: 'TVで見る',
        cast_option_mobile_title: 'スマホから',
        cast_option_mobile_desc: 'スマホのカメラで下のQRコードをスキャンしてYouTubeアプリで映画を開き、TVに直接キャストします：',
        btn_open_in_yt: 'YouTubeアプリで開く',
        cast_option_pc_title: 'パソコンから (Chrome / Edge)',
        cast_option_pc_desc: 'プレーヤーの下部コントロールにあるキャストアイコン <i class="fa-solid fa-square-rss" style="transform: rotate(90deg); color: var(--accent-cyan);"></i> を選択します（TVが同じWi-Fiに接続されている場合のみ表示されます）。 <br><br><strong>代替方法：</strong> このページの空いている場所を右クリックし、<strong>「キャスト...」</strong>を選択します。',
        seo_title: 'Lunera - YouTube 完全映画ポータル',
        seo_description: 'YouTubeから直接集められた数百本の完全版・吹き替え・字幕付き映画をご覧ください。迅速なアクセス、整理された内容、登録不要。',
        seo_keywords: '完全映画, 吹き替え映画, 無料映画, YouTube 映画, 映画オンライン視聴, 無料シネマ, YouTube 完全映画, lunera'
    },
    zh: {
        subtitle: '汇集YouTube上的完整版和配音电影',
        cc_info: '<strong>外语电影？</strong>在播放器中开启字幕（CC），并在视频的齿轮图标 <i class="fa-solid fa-gear"></i> 中切换为中文自动翻译。注册不是必须的，它的存在是为了让您创建自己的播放列表。如果您喜欢，请分享给朋友！',
        btn_auth: '<i class="fa-regular fa-user"></i> 登录 / 注册',
        placeholder_title: '未选择电影',
        placeholder_desc: '请在下方选择一部电影开始观看',
        now_playing: '正在播放',
        loading_movies: '正在加载电影...',
        meta_channel: '频道',
        meta_duration: '时长',
        btn_toggle_playlist_title: '保存以便稍后观看',
        btn_add_playlist: '添加到播放列表',
        btn_in_playlist: '已在播放列表中',
        search_placeholder: '按标题、类型、频道或关键词搜索...',
        all_channels: '所有频道',
        sort_original: '原始顺序',
        sort_pt: '葡萄牙语 (巴西/葡萄牙)',
        sort_es: '西班牙语',
        sort_en: '英语',
        sort_it: '意大利语',
        sort_fr: '法语',
        sort_ja: '日语',
        sort_zh: '中文',
        sort_hi: '印地语',
        sort_tr: '土耳其语',
        sort_ru: '俄语',
        sort_de: '德语',
        filter_all: '全部',
        filter_action: '动作与冒险',
        filter_comedy: '喜剧',
        filter_horror: '恐怖与悬疑',
        filter_scifi: '科幻与奇幻',
        filter_documentary: '纪录片',
        filter_other: '其他电影',
        filter_mylist: '<i class="fa-solid fa-bookmark" style="margin-right: 5px;"></i> 我的列表',
        available_movies: '可观看电影',
        channels_label: '频道',
        no_results_title: '未找到电影',
        no_results_desc: '请尝试搜索其他关键词或选择其他分类。',
        footer_copy: '&copy; 2026 Lunera。实时汇集自YouTube的电影。',
        footer_email_label: '联系、咨询、建议和表扬请发邮件至：',
        footer_visitors: '访问量：',
        footer_map_placeholder: '访客地图 — <strong>请在flagcounter.com设置</strong>',
        update_list: '<i class="fa-solid fa-arrows-rotate"></i> 更新列表',
        tab_login: '登录',
        tab_register: '注册',
        label_email: '电子邮箱',
        label_password: '密码',
        placeholder_password: '请输入密码',
        placeholder_min_char: '至少6个字符',
        btn_login_submit: '登录',
        btn_register_submit: '注册',
        btn_logout: '退出登录',
        card_badge: '电影',
        duration_label: '时长',
        page_label: '页',
        page_of: '共',
        page_first: '首页',
        page_previous: '上一页',
        page_next: '下一页',
        page_last: '末页',
        cat_action: '动作与冒险',
        cat_comedy: '喜剧',
        cat_horror: '恐怖与悬疑',
        cat_scifi: '科幻与奇幻',
        cat_documentary: '纪录片',
        cat_other: '电影',
        error_load_title: '加载电影出错',
        error_load_desc: '请检查"filmes.js"或"filmes.json"文件是否存在，或在项目文件夹中运行"atualizar.bat"。',
        error_no_data: '没有数据连接',
        error_invalid_email: '请输入有效的电子邮箱。',
        error_short_password: '密码至少需要6个字符。',
        error_email_taken: '该邮箱已被注册。',
        error_wrong_credentials: '邮箱或密码错误。',
        update_alert: '要实时更新电影列表：\n\n1. 打开项目文件夹，双击"atualizar.bat"文件。\n2. 这将启动YouTube自动搜索。\n3. 脚本完成后，请在浏览器中重新加载此页面（F5）。',
        warning_file_protocol: '<i class="fa-solid fa-triangle-exclamation" style="font-size: 1.1rem; color: #ffbe0b;"></i> <span><strong>警告：</strong>当文件直接打开时（<code>file://</code>），YouTube会阻止播放（错误153）。请在项目文件夹中运行<strong>"iniciar_servidor.bat"</strong>文件，通过<code>http://localhost:8000</code>运行。</span>',
        warning_dismiss: '我知道了',
        forgot_password: '忘记密码',
        forgot_desc: '请输入您的电子邮箱，我们将发送重置密码的链接。',
        btn_send_reset: '发送重置链接',
        forgot_success: '邮件已发送！请查收您的收件箱。',
        back_to_login: '← 返回登录',
        error_too_many_requests: '尝试次数过多。请等待几分钟后重试。',
        error_network: '连接错误。请检查您的网络。',
        error_generic: '发生错误，请重试。',
        btn_cast_tv: '在电视上观看',
        btn_cast_tv_title: '投屏到电视',
        cast_modal_title: '在电视上观看',
        cast_option_mobile_title: '通过手机',
        cast_option_mobile_desc: '用手机摄像头扫描下方二维码，在YouTube应用中打开电影并直接投屏到电视：',
        btn_open_in_yt: '在YouTube应用中打开',
        cast_option_pc_title: '通过电脑 (Chrome / Edge)',
        cast_option_pc_desc: '选择播放器底部控制条中的投屏图标 <i class="fa-solid fa-square-rss" style="transform: rotate(90deg); color: var(--accent-cyan);"></i>（仅当电视连接在同一个Wi-Fi时显示）。 <br><br><strong>替代方法：</strong> 在此页面的任何空白处右键单击，然后选择 <strong>“投屏...”</strong>。',
        seo_title: 'Lunera - YouTube 完整电影门户',
        seo_description: '观看数百部直接从YouTube汇聚的完整版、配音和字幕电影。快速访问，有条理，无需强制注册。',
        seo_keywords: '完整电影, 配音电影, 免费电影, YouTube电影, 在线看电影, 免费影院, YouTube完整电影, lunera'
    },
    de: {
        subtitle: 'Vollständige und synchronisierte Filme von YouTube an einem Ort',
        cc_info: '<strong>Ausländische Filme?</strong> Aktivieren Sie die Untertitel (CC) im Player und wechseln Sie über das Zahnrad <i class="fa-solid fa-gear"></i> des Videos zur automatischen Übersetzung ins Deutsche. Die Registrierung ist nicht verpflichtend, sie dient lediglich dazu, Ihre eigene Playlist zu erstellen. Wenn es Ihnen gefallen hat, teilen Sie es bitte!',
        btn_auth: '<i class="fa-regular fa-user"></i> Anmelden / Registrieren',
        placeholder_title: 'Kein Film ausgewählt',
        placeholder_desc: 'Wählen Sie unten einen Film aus, um mit dem Ansehen zu beginnen',
        now_playing: 'WIRD JETZT WIEDERGEGEBEN',
        loading_movies: 'Filme werden geladen...',
        meta_channel: 'Kanal',
        meta_duration: 'Dauer',
        btn_toggle_playlist_title: 'Zum späteren Ansehen speichern',
        btn_add_playlist: 'Zur Playlist hinzufügen',
        btn_in_playlist: 'In der Playlist',
        search_placeholder: 'Suche nach Titel, Genre, Kanal oder Stichwort...',
        all_channels: 'Alle Kanäle',
        sort_original: 'Originalreihenfolge',
        sort_pt: 'Portugiesisch (Brasilien/Portugal)',
        sort_es: 'Spanisch',
        sort_en: 'Englisch',
        sort_it: 'Italienisch',
        sort_fr: 'Französisch',
        sort_ja: 'Japanisch',
        sort_zh: 'Chinesisch',
        sort_hi: 'Hindi',
        sort_tr: 'Türkisch',
        sort_ru: 'Russisch',
        sort_de: 'Deutsch',
        filter_all: 'Alle',
        filter_action: 'Action & Abenteuer',
        filter_comedy: 'Komödie',
        filter_horror: 'Horror & Thriller',
        filter_scifi: 'Sci-Fi & Fantasy',
        filter_documentary: 'Dokumentationen',
        filter_other: 'Andere Filme',
        filter_mylist: '<i class="fa-solid fa-bookmark" style="margin-right: 5px;"></i> Meine Liste',
        available_movies: 'Verfügbare Filme',
        channels_label: 'Kanäle',
        no_results_title: 'Keine Filme gefunden',
        no_results_desc: 'Versuchen Sie es mit anderen Suchbegriffen oder wählen Sie eine andere Kategorie.',
        footer_copy: '&copy; 2026 Lunera. Filme in Echtzeit von YouTube aggregiert.',
        footer_email_label: 'E-Mail für Kontakt, Fragen, Vorschläge und Lob:',
        footer_visitors: 'Besuche:',
        footer_map_placeholder: 'Besucherkarte — <strong>konfigurieren Sie auf flagcounter.com</strong>',
        update_list: '<i class="fa-solid fa-arrows-rotate"></i> Liste aktualisieren',
        tab_login: 'Anmelden',
        tab_register: 'Registrieren',
        label_email: 'E-Mail',
        label_password: 'Passwort',
        placeholder_password: 'Ihr Passwort',
        placeholder_min_char: 'Mindestens 6 Zeichen',
        btn_login_submit: 'Anmelden',
        btn_register_submit: 'Registrieren',
        btn_logout: 'Abmelden',
        card_badge: 'FILM',
        duration_label: 'Dauer',
        page_label: 'Seite',
        page_of: 'von',
        page_first: 'Erste',
        page_previous: 'Zurück',
        page_next: 'Weiter',
        page_last: 'Letzte',
        cat_action: 'Action & Abenteuer',
        cat_comedy: 'Komödie',
        cat_horror: 'Horror & Thriller',
        cat_scifi: 'Sci-Fi & Fantasy',
        cat_documentary: 'Dokumentation',
        cat_other: 'Film',
        error_load_title: 'Fehler beim Laden der Filme',
        error_load_desc: 'Überprüfen Sie, ob die Datei "filmes.js" oder "filmes.json" existiert, oder führen Sie "atualizar.bat" im Projektordner aus.',
        error_no_data: 'Keine Datenverbindung',
        error_invalid_email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
        error_short_password: 'Das Passwort muss mindestens 6 Zeichen lang sein.',
        error_email_taken: 'Diese E-Mail-Adresse ist bereits registriert.',
        error_wrong_credentials: 'Falsche E-Mail-Adresse oder Passwort.',
        update_alert: 'Um die Filmliste in Echtzeit zu aktualisieren:\n\n1. Öffnen Sie den Projektordner und doppelklicken Sie auf die Datei "atualizar.bat".\n2. Dadurch wird die automatisierte YouTube-Suche gestartet.\n3. Wenn das Skript fertig ist, laden Sie diese Seite einfach im Browser neu (F5).',
        warning_file_protocol: '<i class="fa-solid fa-triangle-exclamation" style="font-size: 1.1rem; color: #ffbe0b;"></i> <span><strong>Warnung:</strong> YouTube blockiert die Wiedergabe (Fehler 153), wenn die Datei direkt geöffnet wird (<code>file://</code>). Bitte führen Sie die Datei <strong>"iniciar_servidor.bat"</strong> im Projektordner aus, um sie über <code>http://localhost:8000</code> auszuführen.</span>',
        warning_dismiss: 'Verstanden',
        forgot_password: 'Passwort vergessen',
        forgot_desc: 'Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.',
        btn_send_reset: 'Link zum Zurücksetzen senden',
        forgot_success: 'E-Mail gesendet! Überprüfen Sie Ihren Posteingang.',
        back_to_login: '← Zurück zur Anmeldung',
        error_too_many_requests: 'Zu viele Versuche. Bitte warten Sie ein paar Minuten und versuchen Sie es erneut.',
        error_network: 'Verbindungsfehler. Überprüfen Sie Ihre Internetverbindung.',
        error_generic: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
        btn_cast_tv: 'Auf TV ansehen',
        btn_cast_tv_title: 'Auf TV streamen',
        cast_modal_title: 'Auf TV ansehen',
        cast_option_mobile_title: 'Vom Smartphone',
        cast_option_mobile_desc: 'Scannen Sie den unten stehenden QR-Code mit Ihrer Handykamera, um den Film in der YouTube-App zu öffnen und direkt auf den Fernseher zu streamen:',
        btn_open_in_yt: 'In der YouTube-App öffnen',
        cast_option_pc_title: 'Vom Computer (Chrome / Edge)',
        cast_option_pc_desc: 'Wählen Sie das Übertragungssymbol <i class="fa-solid fa-square-rss" style="transform: rotate(90deg); color: var(--accent-cyan);"></i> in den unteren Steuerelementen des Players (erscheint nur, wenn der Fernseher mit demselben WLAN verbunden ist). <br><br><strong>Alternative:</strong> Klicken Sie mit der rechten Maustaste auf eine beliebige freie Stelle auf dieser Seite und wählen Sie <strong>"Streamen..."</strong>.',
        seo_title: 'Lunera - Portal für vollständige Filme auf YouTube',
        seo_description: 'Sehen Sie hunderte von vollständigen, synchronisierten und untertitelten Filmen, die direkt von YouTube zusammengestellt wurden. Schneller Zugriff, organisiert und ohne Pflichtregistrierung.',
        seo_keywords: 'vollständige Filme, synchronisierte Filme, kostenlose Filme, YouTube Filme, Filme online schauen, kostenloses Kino, vollständige Filme YouTube, lunera'
    },
    ru: {
        subtitle: 'Полнометражные и дублированные фильмы с YouTube в одном месте',
        cc_info: '<strong>Зарубежные фильмы?</strong> Включите субтитры (CC) в плеере и переключитесь на автоматический перевод на русский язык в настройках <i class="fa-solid fa-gear"></i> видео. Регистрация не обязательна, она нужна для того, чтобы вы могли создать свой плейлист. Если вам понравилось, поделитесь, пожалуйста!',
        btn_auth: '<i class="fa-regular fa-user"></i> Войти / Регистрация',
        placeholder_title: 'Фильм не выбран',
        placeholder_desc: 'Выберите фильм ниже, чтобы начать просмотр',
        now_playing: 'СЕЙЧАС ВОСПРОИЗВОДИТСЯ',
        loading_movies: 'Загрузка фильмов...',
        meta_channel: 'Канал',
        meta_duration: 'Длительность',
        btn_toggle_playlist_title: 'Сохранить для просмотра позже',
        btn_add_playlist: 'Добавить в плейлист',
        btn_in_playlist: 'В плейлисте',
        search_placeholder: 'Поиск по названию, жанру, каналу или ключевому слову...',
        all_channels: 'Все каналы',
        sort_original: 'Исходный порядок',
        sort_pt: 'Португальский (Бразилия/Португалия)',
        sort_es: 'Испанский',
        sort_en: 'Английский',
        sort_it: 'Итальянский',
        sort_fr: 'Французский',
        sort_ja: 'Японский',
        sort_zh: 'Китайский',
        sort_hi: 'Хинди',
        sort_tr: 'Турецкий',
        sort_ru: 'Русский',
        sort_de: 'Немецкий',
        filter_all: 'Все',
        filter_action: 'Боевик и приключения',
        filter_comedy: 'Комедия',
        filter_horror: 'Ужасы и триллер',
        filter_scifi: 'Фантастика и фэнтези',
        filter_documentary: 'Документальные',
        filter_other: 'Другие фильмы',
        filter_mylist: '<i class="fa-solid fa-bookmark" style="margin-right: 5px;"></i> Мой список',
        available_movies: 'Доступные фильмы',
        channels_label: 'каналов',
        no_results_title: 'Фильмы не найдены',
        no_results_desc: 'Попробуйте поискать по другим словам или выберите другую категорию.',
        footer_copy: '&copy; 2026 Lunera. Фильмы собраны с YouTube в реальном времени.',
        footer_email_label: 'Электронная почта для связи, вопросов, предложений и отзывов:',
        footer_visitors: 'Посещения:',
        footer_map_placeholder: 'Карта посетителей — <strong>настройте на flagcounter.com</strong>',
        update_list: '<i class="fa-solid fa-arrows-rotate"></i> Обновить список',
        tab_login: 'Войти',
        tab_register: 'Регистрация',
        label_email: 'Эл. почта',
        label_password: 'Пароль',
        placeholder_password: 'Ваш пароль',
        placeholder_min_char: 'Минимум 6 символов',
        btn_login_submit: 'Войти',
        btn_register_submit: 'Зарегистрироваться',
        btn_logout: 'Выйти',
        card_badge: 'ФИЛЬМ',
        duration_label: 'Длительность',
        page_label: 'Страница',
        page_of: 'из',
        page_first: 'Первая',
        page_previous: 'Назад',
        page_next: 'Вперёд',
        page_last: 'Последняя',
        cat_action: 'Боевик и приключения',
        cat_comedy: 'Комедия',
        cat_horror: 'Ужасы и триллер',
        cat_scifi: 'Фантастика и фэнтези',
        cat_documentary: 'Документальный',
        cat_other: 'Фильм',
        error_load_title: 'Ошибка загрузки фильмов',
        error_load_desc: 'Проверьте, существует ли файл "filmes.js" или "filmes.json", либо запустите "atualizar.bat" в папке проекта.',
        error_no_data: 'Нет подключения к данным',
        error_invalid_email: 'Пожалуйста, введите действительный адрес электронной почты.',
        error_short_password: 'Пароль должен содержать не менее 6 символов.',
        error_email_taken: 'Этот адрес электронной почты уже зарегистрирован.',
        error_wrong_credentials: 'Неверный адрес электронной почты или пароль.',
        update_alert: 'Чтобы обновить список фильмов в реальном времени:\n\n1. Откройте папку проекта и дважды щёлкните файл "atualizar.bat".\n2. Это запустит автоматический поиск на YouTube.\n3. По завершении работы скрипта просто перезагрузите эту страницу в браузере (F5).',
        warning_file_protocol: '<i class="fa-solid fa-triangle-exclamation" style="font-size: 1.1rem; color: #ffbe0b;"></i> <span><strong>Внимание:</strong> YouTube блокирует воспроизведение (ошибка 153), если файл открыт напрямую (<code>file://</code>). Пожалуйста, запустите файл <strong>"iniciar_servidor.bat"</strong> в папке проекта, чтобы открыть через <code>http://localhost:8000</code>.</span>',
        warning_dismiss: 'Понятно',
        forgot_password: 'Забыли пароль',
        forgot_desc: 'Введите свой адрес электронной почты, и мы отправим вам ссылку для сброса пароля.',
        btn_send_reset: 'Отправить ссылку для сброса',
        forgot_success: 'Письмо отправлено! Проверьте свою почту.',
        back_to_login: '← Вернуться ко входу',
        error_too_many_requests: 'Слишком много попыток. Подождите несколько минут и попробуйте снова.',
        error_network: 'Ошибка соединения. Проверьте подключение к интернету.',
        error_generic: 'Произошла ошибка. Пожалуйста, попробуйте снова.',
        btn_cast_tv: 'Смотреть на ТВ',
        btn_cast_tv_title: 'Транслировать на ТВ',
        cast_modal_title: 'Смотреть на ТВ',
        cast_option_mobile_title: 'С телефона',
        cast_option_mobile_desc: 'Отсканируйте QR-код ниже камерой телефона, чтобы открыть фильм в приложении YouTube и транслировать его прямо на ТВ:',
        btn_open_in_yt: 'Открыть в приложении YouTube',
        cast_option_pc_title: 'С компьютера (Chrome / Edge)',
        cast_option_pc_desc: 'Выберите значок трансляции <i class="fa-solid fa-square-rss" style="transform: rotate(90deg); color: var(--accent-cyan);"></i> в элементах управления плеера (появляется только если ТВ подключен к той же сети Wi-Fi). <br><br><strong>Альтернатива:</strong> Нажмите правой кнопкой мыши в любом свободном месте страницы и выберите <strong>"Трансляция..."</strong>.',
        seo_title: 'Lunera - Портал полных фильмов на YouTube',
        seo_description: 'Смотрите сотни полных, дублированных и субтитрованных фильмов, собранных прямо с YouTube. Быстрый доступ, организованность и без обязательной регистрации.',
        seo_keywords: 'полные фильмы, дублированные фильмы, бесплатные фильмы, YouTube фильмы, смотреть фильмы онлайн, бесплатное кино, полные фильмы YouTube, lunera'
    }
};

// Get a translated string for the current language
function t(key) {
    return (translations[currentLang] && translations[currentLang][key]) || translations['pt'][key] || key;
}

// Apply translations to all static elements with data-i18n attributes
function applyStaticTranslations() {
    // Translate innerHTML for elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = t(key);
        if (text) el.innerHTML = text;
    });
    // Translate placeholders for elements with data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const text = t(key);
        if (text) el.placeholder = text;
    });
    // Translate titles for elements with data-i18n-title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        const text = t(key);
        if (text) el.title = text;
    });

    // Update Document Title and SEO Metadata
    document.title = t('seo_title');

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute('content', t('seo_description'));

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) metaKeywords.setAttribute('content', t('seo_keywords'));

    // Update Social Sharing Cards
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', t('seo_title'));

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', t('seo_description'));

    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', t('seo_title'));

    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) twitterDescription.setAttribute('content', t('seo_description'));
}

// Set language and re-render everything
function setLanguage(lang) {
    // Validate: only accept known languages
    if (!translations[lang]) return;

    currentLang = lang;
    localStorage.setItem('lunera_lang', lang);
    
    // Update <html lang> attribute for accessibility
    document.documentElement.lang = lang;

    // Update flag button active states
    document.querySelectorAll('.flag-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    
    // Apply static translations
    applyStaticTranslations();
    
    // Always re-apply auth UI with translated texts (even without movies)
    updateUserUI(false);

    // Re-render dynamic content only when movies are loaded
    if (movies.length > 0) {
        populateChannels();
        renderStreams();
        // Re-apply the active video info if a video is selected
        if (activeMovieId) {
            const activeMovie = movies.find(m => m.id === activeMovieId);
            if (activeMovie) {
                activeVideoTitle.textContent = activeMovie.title;
                activeVideoChannel.innerHTML = `<i class="fa-regular fa-user"></i> ${activeMovie.channel}`;
                activeVideoViewers.innerHTML = `<i class="fa-regular fa-clock"></i> ${t('duration_label')}: ${activeMovie.duration}`;
            }
        }
        updatePlaylistButtonState();
    }
}

// Categorization helper based on terms in title or channel
// Categoria e idioma do título agora vêm prontos do banco (colunas
// "category" e "title_lang", pré-calculadas pelo script de migração) —
// não precisam mais ser calculados aqui no navegador a cada filme.

// Map category name to user-friendly badge label (localized)
function getCategoryLabel(category) {
    const catKeys = {
        'action': 'cat_action',
        'comedy': 'cat_comedy',
        'horror': 'cat_horror',
        'scifi': 'cat_scifi',
        'documentary': 'cat_documentary',
        'other': 'cat_other'
    };
    const key = catKeys[category] || 'cat_other';
    return t(key);
}

// Load movies data — agora via API (Cloudflare Worker + Turso) em vez do
// filmes.json/filmes.js estático, que não escala para 600 mil+ filmes.
async function initApp() {
    // Verifica se o arquivo foi aberto diretamente via protocolo file://
    if (window.location.protocol === 'file:') {
        const warningBanner = document.createElement('div');
        warningBanner.style.cssText = 'background: linear-gradient(90deg, #ff3c00, #ff0055); color: white; text-align: center; padding: 12px 20px; font-weight: 500; font-size: 0.95rem; position: fixed; top: 0; left: 0; right: 0; z-index: 9999; box-shadow: 0 4px 15px rgba(255, 60, 0, 0.4); display: flex; justify-content: center; align-items: center; gap: 10px; flex-wrap: wrap; font-family: var(--font-body);';
        warningBanner.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="font-size: 1.1rem; color: #ffbe0b;"></i> <span><strong>Atenção:</strong> O YouTube bloqueia a reprodução (Erro 153) quando o arquivo é aberto diretamente (<code>file://</code>). Por favor, execute o arquivo <strong>"iniciar_servidor.bat"</strong> na pasta do projeto para rodar via <code>http://localhost:8000</code>.</span> <button onclick="this.parentElement.remove()" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: 600; margin-left: 10px;">Entendido</button>';
        document.body.prepend(warningBanner);
        document.body.style.paddingTop = '50px';
    }

    // Carrega a lista de canais uma única vez (usada no dropdown de filtro)
    try {
        const res = await fetch(`${API_BASE}/api/canais`);
        if (!res.ok) throw new Error('Falha ao carregar canais');
        const data = await res.json();
        allChannels = data.canais || [];
    } catch (err) {
        console.warn('Não foi possível carregar a lista de canais:', err);
        allChannels = [];
    }
    populateChannels();

    // Check user session
    checkSession();

    // Primeira renderização (busca a página 1 na API)
    await renderStreams();

    // Auto-load first movie in list (but don't autoplay to avoid browser blocks)
    if (movies.length > 0) {
        selectVideo(movies[0], false);
    }
}

// Select a movie and load it in the player
function selectVideo(movie, autoplay = true) {
    activeMovieId = movie.id;
    
    // Hide placeholder
    playerPlaceholder.classList.add('hidden');
    
    // Update player source
    const originParam = window.location.origin && window.location.origin !== 'null' ? `&origin=${encodeURIComponent(window.location.origin)}` : '';
    const autoplayParam = autoplay ? '&autoplay=1' : '';
    mainPlayer.src = `https://www.youtube.com/embed/${movie.id}?enablejsapi=1${autoplayParam}${originParam}`;
    
    // Update title and channel info
    activeVideoTitle.textContent = movie.title;
    activeVideoChannel.innerHTML = `<i class="fa-regular fa-user"></i> ${movie.channel}`;
    activeVideoViewers.innerHTML = `<i class="fa-regular fa-clock"></i> ${t('duration_label')}: ${movie.duration}`;
    
    // Update playlist button state
    updatePlaylistButtonState();
    
    // Highlight selected card
    document.querySelectorAll('.stream-card').forEach(card => {
        if (card.dataset.id === movie.id) {
            card.classList.add('active-card');
        } else {
            card.classList.remove('active-card');
        }
    });
}

// Busca a página atual de filmes na API, aplicando os filtros/busca/ordenação
// selecionados. Substitui o antigo filtro 100% em memória (que exigia ter
// todos os 600 mil+ filmes carregados no navegador).
async function buscarFilmesNaAPI() {
    // Caso especial: "Minha Lista" não é um filtro que a API entende — são
    // IDs específicos salvos localmente por usuário. Busca direto por eles.
    if (currentCategory === 'mylist') {
        const ids = (currentUser && userPlaylists[currentUser]) ? userPlaylists[currentUser] : [];
        if (ids.length === 0) {
            return { filmes: [], total: 0, total_paginas: 1, total_aproximado: false };
        }
        const res = await fetch(`${API_BASE}/api/filmes/por-ids?ids=${encodeURIComponent(ids.join(','))}`);
        if (!res.ok) throw new Error('Falha ao carregar Minha Lista');
        const data = await res.json();
        const filmes = data.filmes || [];
        return { filmes, total: filmes.length, total_paginas: 1, total_aproximado: false };
    }

    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('busca', searchQuery.trim());
    if (currentChannel !== 'all') params.set('canal_id', currentChannel);
    if (currentCategory !== 'all') params.set('categoria', currentCategory);
    if (currentSort !== 'original') params.set('idioma', currentSort);
    params.set('pagina', currentPage);

    const res = await fetch(`${API_BASE}/api/filmes?${params.toString()}`);
    if (!res.ok) throw new Error('Falha ao consultar a API de filmes');
    return await res.json();
}

// Render movies grid based on filters and search with pagination
async function renderStreams() {
    const requestId = ++renderRequestId; // identifica esta chamada específica

    let data;
    try {
        data = await buscarFilmesNaAPI();
    } catch (err) {
        console.error('Erro ao buscar filmes:', err);
        // Se uma busca mais nova já foi disparada, ignora este erro antigo
        if (requestId !== renderRequestId) return;
        showErrorMessage();
        return;
    }

    // Se o usuário já disparou outra busca/filtro enquanto esta requisição
    // estava em andamento, descarta este resultado desatualizado.
    if (requestId !== renderRequestId) return;

    movies = data.filmes || [];
    currentTotalPages = data.total_paginas || 1;
    currentTotalResults = data.total || movies.length;
    currentTotalAproximado = !!data.total_aproximado;

    // Clear grid
    streamsGrid.innerHTML = '';

    // Update results count (mostra "3000+" quando a contagem for aproximada)
    resultsCount.textContent = currentTotalAproximado ? `${currentTotalResults}+` : currentTotalResults;

    if (movies.length === 0) {
        noResults.classList.remove('hidden');
        paginationContainer.innerHTML = '';
        return;
    }

    noResults.classList.add('hidden');

    // Safety check for currentPage bounds
    if (currentPage < 1) currentPage = 1;
    if (currentPage > currentTotalPages) currentPage = currentTotalPages;

    // Render cards (a API já devolve só os 250 filmes da página atual)
    movies.forEach(movie => {
        const card = document.createElement('div');
        card.className = `stream-card ${movie.id === activeMovieId ? 'active-card' : ''}`;
        card.dataset.id = movie.id;
        
        const inPlaylist = currentUser && userPlaylists[currentUser] && userPlaylists[currentUser].includes(movie.id);
        const favBtnClass = inPlaylist ? 'btn-card-favorite in-playlist' : 'btn-card-favorite';
        const favIconClass = inPlaylist ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
        
        card.innerHTML = `
            <div class="card-thumbnail-wrapper">
                <img src="${movie.thumbnail}" alt="${movie.title}" loading="lazy">
                <button class="${favBtnClass}" title="${t('btn_toggle_playlist_title')}" data-id="${movie.id}">
                    <i class="${favIconClass}"></i>
                </button>
                <span class="card-badge-live" style="background-color: #ff3c00;"><i class="fa-solid fa-ticket"></i> ${t('card_badge')}</span>
                <span class="card-badge-viewers" style="background: rgba(0,0,0,0.85);"><i class="fa-regular fa-clock"></i> ${movie.duration}</span>
            </div>
            <div class="card-details">
                <h3 class="card-title" title="${movie.title}">${movie.title}</h3>
                <div class="card-meta">
                    <span class="card-channel" title="${movie.channel}">
                        <i class="fa-solid fa-video"></i> ${movie.channel}
                    </span>
                    <span class="card-category-tag">${getCategoryLabel(movie.category)}</span>
                </div>
            </div>
        `;
        
        // click on favorite button
        const btnFav = card.querySelector('.btn-card-favorite');
        btnFav.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleWatchLater(movie.id);
        });
        
        // Click behavior
        card.addEventListener('click', () => {
            selectVideo(movie, true);
            // Scroll smoothly to player on mobile viewports
            if (window.innerWidth < 992) {
                playerSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
        
        streamsGrid.appendChild(card);
    });
    
    // Render pagination buttons
    renderPagination(currentTotalPages);
}

// Render pagination controls
function renderPagination(totalPages) {
    paginationContainer.innerHTML = '';

    if (totalPages <= 1) return;

    // ── Calcula o intervalo de páginas a mostrar ──────────────────
    // Mostra até 5 páginas ao redor da página atual (2 antes + atual + 2 depois)
    const DELTA = 2;
    let rangeStart = Math.max(1, currentPage - DELTA);
    let rangeEnd   = Math.min(totalPages, currentPage + DELTA);

    // Ajusta para sempre mostrar 5 botões quando possível
    if (rangeEnd - rangeStart < DELTA * 2) {
        if (rangeStart === 1) {
            rangeEnd = Math.min(totalPages, rangeStart + DELTA * 2);
        } else {
            rangeStart = Math.max(1, rangeEnd - DELTA * 2);
        }
    }

    // ── Helper: cria botão de página numerada ─────────────────────
    function criarBtnPagina(num) {
        const btn = document.createElement('button');
        btn.className = 'pagination-btn pagination-num' + (num === currentPage ? ' active' : '');
        btn.textContent = num;
        btn.disabled = num === currentPage;
        btn.addEventListener('click', () => changePage(num));
        return btn;
    }

    // ── Helper: cria reticências ──────────────────────────────────
    function criarReticencias() {
        const span = document.createElement('span');
        span.className = 'pagination-ellipsis';
        span.textContent = '…';
        return span;
    }

    // ── Primeira página ───────────────────────────────────────────
    const btnFirst = document.createElement('button');
    btnFirst.className = 'pagination-btn';
    btnFirst.innerHTML = `<i class="fa-solid fa-angles-left"></i> ${t('page_first')}`;
    btnFirst.disabled = currentPage === 1;
    btnFirst.addEventListener('click', () => changePage(1));
    paginationContainer.appendChild(btnFirst);

    // ── Anterior ──────────────────────────────────────────────────
    const btnPrev = document.createElement('button');
    btnPrev.className = 'pagination-btn';
    btnPrev.innerHTML = `<i class="fa-solid fa-angle-left"></i>`;
    btnPrev.title = t('page_previous');
    btnPrev.disabled = currentPage === 1;
    btnPrev.addEventListener('click', () => changePage(currentPage - 1));
    paginationContainer.appendChild(btnPrev);

    // ── Reticências iniciais (se necessário) ──────────────────────
    if (rangeStart > 1) {
        paginationContainer.appendChild(criarReticencias());
    }

    // ── Botões numerados ──────────────────────────────────────────
    for (let i = rangeStart; i <= rangeEnd; i++) {
        paginationContainer.appendChild(criarBtnPagina(i));
    }

    // ── Reticências finais (se necessário) ────────────────────────
    if (rangeEnd < totalPages) {
        paginationContainer.appendChild(criarReticencias());
    }

    // ── Próxima ───────────────────────────────────────────────────
    const btnNext = document.createElement('button');
    btnNext.className = 'pagination-btn';
    btnNext.innerHTML = `<i class="fa-solid fa-angle-right"></i>`;
    btnNext.title = t('page_next');
    btnNext.disabled = currentPage === totalPages;
    btnNext.addEventListener('click', () => changePage(currentPage + 1));
    paginationContainer.appendChild(btnNext);

    // ── Última página ─────────────────────────────────────────────
    const btnLast = document.createElement('button');
    btnLast.className = 'pagination-btn';
    btnLast.innerHTML = `${t('page_last')} <i class="fa-solid fa-angles-right"></i>`;
    btnLast.disabled = currentPage === totalPages;
    btnLast.addEventListener('click', () => changePage(totalPages));
    paginationContainer.appendChild(btnLast);

    // ── Info de página ────────────────────────────────────────────
    const infoSpan = document.createElement('span');
    infoSpan.className = 'pagination-info';
    infoSpan.textContent = `${t('page_label')} ${currentPage} ${t('page_of')} ${totalPages}`;
    paginationContainer.appendChild(infoSpan);
}

// Change page helper
function changePage(page) {
    currentPage = page;
    renderStreams();
    // Scroll smoothly back to top of the grid
    document.querySelector('.streams-section').scrollIntoView({ behavior: 'smooth' });
}

// Populate the channel select dropdown using the cached list from /api/canais
// (carregada uma única vez em initApp — não dá mais para escanear o array
// "movies", que agora contém só a página atual, não a base inteira).
function populateChannels() {
    // allChannels vem como [{channel_id, channel, total}, ...] já ordenado
    // por quantidade de filmes (do mais popular ao menos popular).
    const sortedChannels = [...allChannels].sort((a, b) =>
        (a.channel || '').localeCompare(b.channel || '', 'pt', { sensitivity: 'base' })
    );

    // Clear and build options — value agora é o channel_id (usado pela API),
    // não mais o nome do canal.
    channelSelect.innerHTML = `<option value="all" data-i18n="all_channels">${t('all_channels')}</option>`;
    sortedChannels.forEach(c => {
        const option = document.createElement('option');
        option.value = c.channel_id;
        option.textContent = c.channel;
        channelSelect.appendChild(option);
    });

    // Update channels count badge
    const channelsCountEl = document.getElementById('channelsCount');
    if (channelsCountEl) channelsCountEl.textContent = allChannels.length;
}

// Display error if no data could be loaded
function showErrorMessage() {
    streamsGrid.innerHTML = '';
    noResults.classList.remove('hidden');
    
    const icon = noResults.querySelector('.spin-disc');
    if (icon) {
        icon.className = 'fa-solid fa-triangle-exclamation';
        icon.style.color = '#ff3c00';
    }
    
    const title = noResults.querySelector('h3');
    if (title) title.textContent = t('error_load_title');
    
    const desc = noResults.querySelector('p');
    if (desc) desc.textContent = t('error_load_desc');
    
    activeVideoTitle.textContent = t('error_no_data');
}

// Event Listeners
// Busca agora consulta a API a cada digitação — usamos debounce (400ms)
// para não disparar uma requisição de rede a cada letra digitada.
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    currentPage = 1;
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
        renderStreams();
    }, 400);
});

filtersContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
        // Toggle active button style
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        currentCategory = e.target.dataset.category;
        currentPage = 1;
        renderStreams();
    }
});

channelSelect.addEventListener('change', (e) => {
    currentChannel = e.target.value;
    currentPage = 1;
    renderStreams();
});

// Language sort dropdown — re-renders placing chosen language titles first
langSortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    currentPage = 1;
    renderStreams();
});


// =====================================================================
// AUTENTICAÇÃO — Firebase
// =====================================================================

// Aguarda o Firebase inicializar antes de observar estado
function initFirebaseAuth() {
    if (!window.firebaseAuth) {
        // Firebase ainda não carregou (module import é assíncrono)
        setTimeout(initFirebaseAuth, 100);
        return;
    }

    // Observa login/logout automático
    window.firebaseAuth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user.email;
            currentUserUID = user.uid;
            // Carrega playlist do Firestore
            try {
                const items = await window.firebaseAuth.loadPlaylist(user.uid);
                userPlaylists[user.email] = items;
            } catch (e) {
                userPlaylists[user.email] = [];
            }
        } else {
            currentUser = null;
            currentUserUID = null;
            userPlaylists = {};
        }
        updateUserUI();
    });
}

// Handle user registration via Firebase
async function handleRegister(e) {
    e.preventDefault();
    const email = registerEmailInput.value.trim();
    const password = registerPasswordInput.value;

    registerErrorMsg.classList.add('hidden');

    if (!validateEmail(email)) {
        showError(registerErrorMsg, t('error_invalid_email'));
        return;
    }
    if (password.length < 6) {
        showError(registerErrorMsg, t('error_short_password'));
        return;
    }

    try {
        await window.firebaseAuth.register(email, password);
        closeModal();
        registerForm.reset();
    } catch (err) {
        const msg = firebaseErrorMsg(err.code);
        showError(registerErrorMsg, msg);
    }
}

// Handle user login via Firebase
async function handleLoginSubmit(e) {
    e.preventDefault();
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value;

    loginErrorMsg.classList.add('hidden');

    try {
        await window.firebaseAuth.login(email, password);
        closeModal();
        loginForm.reset();
    } catch (err) {
        const msg = firebaseErrorMsg(err.code);
        showError(loginErrorMsg, msg);
    }
}

// Handle forgot password
async function handleForgotPassword() {
    const email = document.getElementById('forgotEmail').value.trim();
    const errorEl = document.getElementById('forgotError');
    const successEl = document.getElementById('forgotSuccess');

    errorEl.classList.add('hidden');
    successEl.classList.add('hidden');

    if (!validateEmail(email)) {
        showError(errorEl, t('error_invalid_email'));
        return;
    }

    try {
        await window.firebaseAuth.sendPasswordReset(email);
        successEl.textContent = t('forgot_success');
        successEl.classList.remove('hidden');
        document.getElementById('forgotEmail').value = '';
    } catch (err) {
        showError(errorEl, firebaseErrorMsg(err.code));
    }
}

// Log out via Firebase
async function handleLogout() {
    await window.firebaseAuth.logout();
}

// Traduz códigos de erro do Firebase para mensagens amigáveis
function firebaseErrorMsg(code) {
    const map = {
        'auth/email-already-in-use': t('error_email_taken'),
        'auth/invalid-email':        t('error_invalid_email'),
        'auth/weak-password':        t('error_short_password'),
        'auth/user-not-found':       t('error_wrong_credentials'),
        'auth/wrong-password':       t('error_wrong_credentials'),
        'auth/invalid-credential':   t('error_wrong_credentials'),
        'auth/too-many-requests':    t('error_too_many_requests'),
        'auth/network-request-failed': t('error_network'),
    };
    return map[code] || t('error_generic');
}

// Check session — agora gerenciado pelo Firebase onAuthStateChanged
function checkSession() {
    updateUserUI(false);
}

// Update authentication UI elements based on current session
function updateUserUI(shouldRender = true) {
    if (currentUser) {
        userAuthSection.innerHTML = `
            <div class="user-email-display">
                <span><i class="fa-solid fa-circle-user"></i> <span>${currentUser}</span></span>
                <button id="btnLogout" class="btn-logout">${t('btn_logout')}</button>
            </div>
        `;
        document.getElementById('btnLogout').addEventListener('click', handleLogout);
        filterMyListBtn.classList.remove('hidden');
    } else {
        userAuthSection.innerHTML = `
            <button id="btnOpenAuth" class="btn-auth" data-i18n="btn_auth">${t('btn_auth')}</button>
        `;
        document.getElementById('btnOpenAuth').addEventListener('click', openModal);
        filterMyListBtn.classList.add('hidden');
        if (currentCategory === 'mylist') {
            currentCategory = 'all';
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector('.filter-btn[data-category="all"]').classList.add('active');
        }
    }

    updatePlaylistButtonState();
    if (shouldRender) renderStreams();
}

// Email regex validator
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Helper to show auth error
function showError(element, message) {
    element.textContent = message;
    element.classList.remove('hidden');
}

// Modal handling functions
function openModal() {
    authModal.classList.add('active');
    switchTab('login');
}

function closeModal() {
    authModal.classList.remove('active');
    loginErrorMsg.classList.add('hidden');
    registerErrorMsg.classList.add('hidden');
    document.getElementById('forgotError').classList.add('hidden');
    document.getElementById('forgotSuccess').classList.add('hidden');
    loginForm.reset();
    registerForm.reset();
}

// Cast to TV Modal handlers
function openCastModal() {
    if (!activeMovieId) return;
    
    // YouTube link (standard shortlink format opens natively in apps)
    const ytUrl = `https://youtu.be/${activeMovieId}`;
    
    // Set direct link
    if (btnOpenInYT) {
        btnOpenInYT.href = ytUrl;
    }
    
    // Generate QR Code URL using QR Server API
    if (castQrCode) {
        castQrCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=06090e&bgcolor=ffffff&data=${encodeURIComponent(ytUrl)}`;
    }
    
    if (castModal) {
        castModal.classList.add('active');
    }
}

function closeCastModal() {
    if (castModal) {
        castModal.classList.remove('active');
    }
}

function switchTab(tab) {
    const forgotForm = document.getElementById('forgotForm');
    document.querySelector('.modal-tabs').classList.remove('hidden');

    if (tab === 'login') {
        tabLoginBtn.classList.add('active');
        tabRegisterBtn.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        forgotForm.classList.add('hidden');
    } else if (tab === 'register') {
        tabLoginBtn.classList.remove('active');
        tabRegisterBtn.classList.add('active');
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        forgotForm.classList.add('hidden');
    } else if (tab === 'forgot') {
        loginForm.classList.add('hidden');
        registerForm.classList.add('hidden');
        forgotForm.classList.remove('hidden');
        document.querySelector('.modal-tabs').classList.add('hidden');
    }
}



// Toggle movie inside watch later list of current user
async function toggleWatchLater(movieId) {
    if (!currentUser || !currentUserUID) {
        openModal();
        return;
    }

    if (!userPlaylists[currentUser]) {
        userPlaylists[currentUser] = [];
    }

    const index = userPlaylists[currentUser].indexOf(movieId);
    if (index > -1) {
        userPlaylists[currentUser].splice(index, 1);
    } else {
        userPlaylists[currentUser].push(movieId);
    }

    // Salva no Firestore
    try {
        await window.firebaseAuth.savePlaylist(currentUserUID, userPlaylists[currentUser]);
    } catch (e) {
        console.warn('Erro ao salvar playlist:', e);
    }

    updatePlaylistButtonState();

    if (currentCategory === 'mylist') {
        renderStreams();
    } else {
        const cardFavoriteBtn = document.querySelector(`.stream-card[data-id="${movieId}"] .btn-card-favorite`);
        if (cardFavoriteBtn) {
            const inList = userPlaylists[currentUser].includes(movieId);
            cardFavoriteBtn.classList.toggle('in-playlist', inList);
            cardFavoriteBtn.querySelector('i').className = inList ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
        }
    }
}

// Update playlist buttons UI
function updatePlaylistButtonState() {
    if (!activeMovieId || !btnTogglePlaylist) return;
    
    if (currentUser && userPlaylists[currentUser] && userPlaylists[currentUser].includes(activeMovieId)) {
        btnTogglePlaylist.classList.add('in-playlist');
        btnTogglePlaylist.innerHTML = `<i class="fa-solid fa-bookmark"></i> <span data-i18n="btn_in_playlist">${t('btn_in_playlist')}</span>`;
    } else {
        btnTogglePlaylist.classList.remove('in-playlist');
        btnTogglePlaylist.innerHTML = `<i class="fa-regular fa-bookmark"></i> <span data-i18n="btn_add_playlist">${t('btn_add_playlist')}</span>`;
    }
}

// Setup auth modal and form event listeners
function setupAuthListeners() {
    btnCloseAuth.addEventListener('click', closeModal);
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) closeModal();
    });

    tabLoginBtn.addEventListener('click', () => switchTab('login'));
    tabRegisterBtn.addEventListener('click', () => switchTab('register'));

    loginForm.addEventListener('submit', handleLoginSubmit);
    registerForm.addEventListener('submit', handleRegister);

    // Esqueci minha senha
    document.getElementById('btnForgotPassword').addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('forgot');
    });
    document.getElementById('btnBackToLogin').addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('login');
    });
    document.getElementById('btnSendReset').addEventListener('click', handleForgotPassword);

    if (btnTogglePlaylist) {
        btnTogglePlaylist.addEventListener('click', () => toggleWatchLater(activeMovieId));
    }

    // Cast to TV Listeners
    if (btnCastTV) {
        btnCastTV.addEventListener('click', openCastModal);
    }
    if (btnCloseCast) {
        btnCloseCast.addEventListener('click', closeCastModal);
    }
    if (castModal) {
        castModal.addEventListener('click', (e) => {
            if (e.target === castModal) closeCastModal();
        });
    }

    // Inicia observador Firebase
    initFirebaseAuth();
}

// ── Contador de visitas (CountAPI) ───────────────────────────────
// Chave única para o Lunera — mude para um nome exclusivo seu se quiser
const COUNTER_KEY = 'lunera-visitas-2026';

async function loadVisitorCount() {
    const el = document.getElementById('visitorCount');
    if (!el) return;
    try {
        const res = await fetch(`https://countapi.mileshilliard.com/api/v1/hit/${COUNTER_KEY}`);
        if (!res.ok) throw new Error('API indisponível');
        const data = await res.json();
        // Formata o número com separador de milhar
        el.textContent = Number(data.value).toLocaleString('pt-BR');
    } catch (err) {
        // Se a API estiver fora do ar, exibe traço sem quebrar o site
        el.textContent = '—';
        console.warn('Contador de visitas indisponível:', err.message);
    }
}

// Setup language selector event listeners
function setupLanguageSelector() {
    // Delegation no container (fallback)
    const languageSelector = document.getElementById('languageSelector');
    if (languageSelector) {
        languageSelector.addEventListener('click', (e) => {
            const flagBtn = e.target.closest('.flag-btn');
            if (flagBtn && flagBtn.dataset.lang) {
                setLanguage(flagBtn.dataset.lang);
            }
        });
    }
    // Listener direto em cada botão (garante funcionamento mesmo sem bubbling)
    document.querySelectorAll('.flag-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.lang) setLanguage(btn.dataset.lang);
        });
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupAuthListeners();
    setupLanguageSelector();
    loadVisitorCount();
    
    // Restore saved language (apply after initApp so elements exist)
    if (currentLang && currentLang !== 'pt') {
        setLanguage(currentLang);
    } else {
        // Even for PT, set flag as active and apply static translations
        document.querySelectorAll('.flag-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === 'pt');
        });
    }
});
