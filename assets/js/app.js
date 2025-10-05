const AppTitle = '⛅Időjárás App';
const Author = '2025 ©️';
const Company = 'Pálinkás Andor';
const ServerURL = 'http://localhost:3000';

let title = document.getElementById('appTitle');
let company = document.getElementById('company');
let author = document.getElementById('author');
let lightmodeBtn = document.getElementById('lightmodeBtn');
let darkmodeBtn = document.getElementById('darkmodeBtn');
let main = document.querySelector('main');

title.innerHTML = AppTitle;
company.innerHTML = Company;
author.innerHTML = Author;

let loggedUser = null;
let theme = 'light';

/*-- Téma beállítása --*/
lightmodeBtn.addEventListener('click', ()=>setTheme('light'));
darkmodeBtn.addEventListener('click', ()=>setTheme('dark'));

function loadTheme() {
    theme = localStorage.getItem('SCTheme') || 'light';
    setTheme(theme);
}

function saveTheme(theme) { 
    localStorage.setItem('SCTheme', theme); 
}

function setTheme(selectedTheme) {
    theme = selectedTheme;

    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);

    document.documentElement.setAttribute('data-bs-theme', theme);

    setThemeBtn(theme);

    saveTheme(theme);
}

function setThemeBtn(theme) {
    if(theme==='light'){ 
        lightmodeBtn.classList.add('hide'); 
        darkmodeBtn.classList.remove('hide'); 
    } else { 
        lightmodeBtn.classList.remove('hide'); 
        darkmodeBtn.classList.add('hide'); 
    }
}
async function getProfile() {
    if (!loggedUser || !loggedUser.id) return;

    const nameField = document.getElementById('nameField');
    const emailField = document.getElementById('emailField');

    try {
        const res = await fetch(`${ServerURL}/users/${loggedUser.id}`);
        if (!res.ok) throw new Error('Hiba a felhasználó lekérdezése során');

        const user = await res.json();
        nameField.value = user.name;
        emailField.value = user.email;
    } catch (err) {
        showMessage('danger', 'Hiba', err.message || err);
    }
}

// Felhasználó lekérdezés és render
async function getLoggedUser() {
    loadLoggedUser();
    updateMenu();

    if (loggedUser) {
        await render('profile');
    } else {
        await render('login');
    }
}
/* renderek */
let render = async (view) => {
    try {
        const response = await fetch(`views/${view}.html`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        main.innerHTML = await response.text();

        switch(view){
            case 'profile':
                await getProfile(); 
                break;
            case 'main':
                setDate();
                await getIdojaras();
                renderIdojaras();
                break;
            case 'statistics':
                setTimeout(() => loadChart(), 100);
                break;
            case "calendar":
                // Kis késleltetés, hogy biztosan betöltődjön a HTML
                setTimeout(() => initCalendar(), 100);
                break;
        }
    } catch (error) {
        console.error('Hiba a render során:', error);
        showMessage('danger', 'Hiba', 'Oldal betöltési hiba');
    }
}

/*-- Bejelentkezve --*/
function loadLoggedUser() {
    const storedUser = sessionStorage.getItem('loggedUser');
    if (storedUser) {
        loggedUser = JSON.parse(storedUser);
    } else {
        loggedUser = null;
    }
}

function setLoggedUser(user) {
    if (user && user.id) {
        loggedUser = user;
        sessionStorage.setItem('loggedUser', JSON.stringify(user));
        console.log('User bejelentkezve:', user.name);
    } else {
        console.error('Érvénytelen user objektum:', user);
    }
}

async function getLoggedUser(){
    const mainMenu = document.getElementById('mainMenu');
    const userMenu = document.getElementById('userMenu');

    if(sessionStorage.getItem('loggedUser')){
        loggedUser = JSON.parse(sessionStorage.getItem('loggedUser'));
        mainMenu.style.display = 'none';
        userMenu.style.display = 'flex'; 
        await render('profile');
    } else {
        loggedUser = null;
        mainMenu.style.display = 'flex';
        userMenu.style.display = 'none';
        await render('login');
    }
    return loggedUser
}


(async ()=>{
    loadTheme();
    await getLoggedUser();
})();