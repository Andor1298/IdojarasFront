let idojaras = [];
let editMode = false;
let selectedIdojaras = null;

/*-- Dátum beállítása --*/
function setDate() {
    let today = new Date().toISOString().split('T')[0];
    let dateField = document.getElementById("dateField");

    dateField.setAttribute('min', today);

    let nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    dateField.setAttribute('max', nextYear.toISOString().split('T')[0]);
}

async function getProfile() {
    const nameField = document.getElementById('nameField');
    const emailField = document.getElementById('emailField');

    try {
        const res = await fetch(`${ServerURL}/users/${loggedUser.id}`);
        const user = await res.json();
        nameField.value = user.name;
        emailField.value = user.email;
    } catch (error) {
        showMessage('danger','Hiba', error.message || error);
    }
}

/*-- Hozzáadás / Frissítés --*/
async function add() {
    let date = document.getElementById('dateField').value;
    let minFok = Number(document.getElementById('minFokField').value);
    let maxFok = Number(document.getElementById('maxFokField').value);
    let idojarasAdat = document.getElementById('idojarasField').value;

    if (!date || !minFok && minFok !== 0 || !maxFok && maxFok !== 0 || !idojarasAdat) {
        showMessage('danger','Hiba','Nem adtál meg minden adatot!');
        return;
    }

    if (minFok > maxFok) {
        showMessage('danger','Hiba','A minimum nem lehet nagyobb, mint a maximum!');
        return;
    }

    if (minFok < -50 || minFok > 50 || maxFok < -50 || maxFok > 60) {
        showMessage('danger','Hiba','A hőmérséklet -50 és 50°C között lehet csak!');
        return;
    }
     // Ellenőrzés: van-e már rekord ugyanarra a napra
    let existing = idojaras.find(i => i.date === date && i.userId === loggedUser.id);
    if (existing && !selectedIdojaras) { 
        showMessage('danger','Hiba','Már van adat erre a napra! Szerkeszd a meglévőt.');
        return;
    }
    try {
        if (selectedIdojaras) {
            // Frissítés
            let res = await fetch(`${ServerURL}/idojaras/${selectedIdojaras.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: loggedUser.id,
                    date,
                    minFok,
                    maxFok,
                    idojarasAdat
                })
            });
            let data = await res.json();
            if (res.status === 200) showMessage('success','Ok',data.msg);
            else showMessage('danger','Hiba',data.msg);
        } else {
            // Új rekord
            let res = await fetch(`${ServerURL}/idojaras`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: loggedUser.id,
                    date,
                    minFok,
                    maxFok,
                    idojarasAdat
                })
            });
            let data = await res.json();
            if (res.status === 200) showMessage('success','Ok',data.msg);
            else showMessage('danger','Hiba',data.msg);
        }
        await getIdojaras();
        renderIdojaras();
        cancel();
    } catch(err) {
        console.log(err);
        showMessage('danger','Hiba','Hiba az adatok küldése során!');
    }
}

/*-- Lekérdezés --*/
async function getIdojaras() {
    try {
        let res = await fetch(`${ServerURL}/idojaras/users/${loggedUser.id}`);
        idojaras = await res.json();
        idojaras.sort((a,b) => new Date(b.date) - new Date(a.date));
    } catch(err) {
        console.log(err);
        showMessage('danger','Hiba','Hiba az adatok lekérdezése során!');
    }
}

/*-- Adatok renderelése --*/
function renderIdojaras() {
    let tbody = document.querySelector('tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    idojaras.forEach((ido,index) => {
        let tr = document.createElement('tr');

        tr.innerHTML = `
            <td class="text-center">${index+1}.</td>
            <td>${ido.date}</td>
            <td class="text-end">${ido.minFok}°C - ${ido.maxFok}°C (${ido.idojarasAdat})</td>
            <td class="text-end">
                <button class="btn btn-warning btn-sm me-2" onclick="editIdojaras(${index})"><i class="bi bi-pencil-fill"></i></button>
                <button class="btn btn-danger btn-sm" onclick="deleteIdojaras(${index})"><i class="bi bi-trash-fill"></i></button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

/*-- Szerkesztés --*/
function editIdojaras(index) {
    selectedIdojaras = idojaras[index];
    document.getElementById('dateField').value = selectedIdojaras.date;
    document.getElementById('minFokField').value = selectedIdojaras.minFok;
    document.getElementById('maxFokField').value = selectedIdojaras.maxFok;
    document.getElementById('idojarasField').value = selectedIdojaras.idojarasAdat;

    toggleMode(true);
}

/*-- Törlés --*/
async function deleteIdojaras(index) {
    if (!confirm('Biztosan törlöd az időjárás adatot?')) return;

    try {
        let res = await fetch(`${ServerURL}/idojaras/${idojaras[index].id}`, { method: 'DELETE' });
        let data = await res.json();
        if (res.status === 200) showMessage('success','Törölve!',data.msg);
        else showMessage('danger','Hiba',data.msg);

        await getIdojaras();
        renderIdojaras();
        cancel();
    } catch(err) {
        console.log(err);
        showMessage('danger','Hiba','Hiba az adatok törlése során!');
    }
}

/*-- Mód váltás --*/
function toggleMode(mode) {
    let addBtn = document.getElementById('addBtn');
    let updateBtn = document.getElementById('updateBtn');
    let delBtn = document.getElementById('delBtn');
    let cancelBtn = document.getElementById('cancelBtn');

    if (mode) {
        addBtn.classList.add('hide');
        updateBtn.classList.remove('hide');
        delBtn.classList.remove('hide');
        cancelBtn.classList.remove('hide');
    } else {
        addBtn.classList.remove('hide');
        updateBtn.classList.add('hide');
        delBtn.classList.add('hide');
        cancelBtn.classList.add('hide');
    }
}

/*-- Mégse --*/
function cancel() {
    toggleMode(false);
    selectedIdojaras = null;
    document.getElementById('dateField').value = '';
    document.getElementById('minFokField').value = '';
    document.getElementById('maxFokField').value = '';
    document.getElementById('idojarasField').value = 'sunny';
}