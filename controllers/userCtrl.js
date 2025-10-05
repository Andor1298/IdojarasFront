/*RegExp*/ 
const passwdRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
const emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function registration() {
    let nameField = document.getElementById('nameField');
    let emailField = document.getElementById('emailField');
    let passwordField = document.getElementById('passwordField');
    let confirmField = document.getElementById('confirmPasswordField');

    if (nameField.value == '' || passwordField.value == '' || emailField.value == '' || confirmField.value == '')  {
        showMessage('danger','Hiba','Nem adtál meg minden adatot!');
        return;
    }

    if (passwordField.value != confirmField.value) {
        showMessage('danger','Hiba','A két jelszó nem egyezik!');
        return;
    }

    if (!passwdRegExp.test(passwordField.value)) {
        showMessage('danger','Hiba','A megadott jelszó nem elég biztonságos!');
        return;
    }

    if (!emailRegExp.test(emailField.value)) {
        showMessage('danger','Hiba','Nem megfelelő e-mail cím!');
        return;
    }

    try {
        console.log('Küldött adatok:', {
            name: nameField.value,
            email: emailField.value,
            password: passwordField.value
        });

        const res = await fetch(`${ServerURL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: nameField.value,
                email: emailField.value,
                password: passwordField.value
            })
        });

        console.log('Válasz státusz:', res.status);
        console.log('Válasz headers:', res.headers);
        

        const responseText = await res.text();
        console.log('Válasz szöveg:', responseText);


        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('JSON parse hiba:', parseError);
            showMessage('danger','Hiba', `Szerver nem JSON választ adott: ${responseText}`);
            return;
        }

        if (res.status === 200) {
            showMessage('success','Sikeres regisztáció', data.msg);
            nameField.value = "";
            emailField.value = "";
            passwordField.value = "";
            confirmField.value = "";
        } else {
            showMessage('danger','Hiba', data.msg || 'Ismeretlen hiba');
        }
    } catch (err) {
        console.error('Fetch hiba:', err);
        showMessage('danger','Hiba', err.message || 'Hálózati hiba');
    }
}



async function login() {
    const emailField = document.getElementById('emailField');
    const passwordField = document.getElementById('passwordField');

    if (!emailField.value || !passwordField.value) {
        showMessage('danger','Hiba','Nem adtál meg minden adatot!');
        return;
    }

    try {
        const res = await fetch(`${ServerURL}/users/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                email: emailField.value,
                password: passwordField.value
            })
        });

        console.log('Login response status:', res.status);
        

        const responseText = await res.text();
        console.log('Login response text:', responseText);

        let user;
        try {
            user = JSON.parse(responseText);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            showMessage('danger', 'Hiba', 'Szerver hiba a bejelentkezés során');
            return;
        }

        if (user && user.id) {
            // Sikeres bejelentkezés
            setLoggedUser(user);
            showMessage('success', 'Sikeres bejelentkezés', `Üdvözöljük, ${user.name}!`);
            
 
            emailField.value = "";
            passwordField.value = "";
            

            setTimeout(() => {
                getLoggedUser(); 
                render('main'); 
            }, 1500);
            
        } else {
            // Sikertelen bejelentkezés
            showMessage('danger', 'Hiba', user.msg || 'Hibás email vagy jelszó!');
        }

    } catch (err) {
        console.error('Login error:', err);
        showMessage('danger','Hiba', err.message || 'Hálózati hiba történt');
    }
}

function logout() {
    sessionStorage.removeItem('loggedUser');
    getLoggedUser();
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

function updateProfile() {
    let nameField = document.getElementById('nameField');
    let emailField = document.getElementById('emailField');

    if (nameField.value == '' || emailField.value == '') {
        showMessage('danger', 'Hiba', 'Nem adtál meg minden adatot!');
        return;
    }

    if (!emailRegExp.test(emailField.value)) {
        showMessage('danger', 'Hiba', 'Nem megfelelő e-mail cím!');
        return;
    }

    if (nameField.value == '' || emailField.value == '') {
        showMessage('Hiba', 'Nem adtál meg minden adatot!');
        return;
    }

    if (!emailRegExp.test(emailField.value)) {
        showMessage('danger','Hiba', 'Nem megfelelő email cím!');
        return;
    }

    try {
        
    } catch (error) {
        showMessage('danger','Hiba', error);
    }

    getLoggedUser();
}

async function updatePassword() {
    let currentPassField = document.getElementById('passwordField');
    let newPassField = document.getElementById('newPasswordField');
    let newPassConfirmField = document.getElementById('newPasswordConfirmField');

    if (newPassField.value != newPassConfirmField.value) {
        showMessage('danger','Hiba', 'A két új jelszó nem egyezik!');
        return;
    }

    try {
        const res = await fetch(`${ServerURL}/users/password`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: loggedUser.id,
                currentPass: currentPassField.value,
                newPass: newPassField.value
            })
        });

        const reply = await res.json();
        if (res.status == 400) {
            showMessage('Hiba', reply.msg);
        } else {
            showMessage('success','Siker', reply.msg);
        }

    } catch (error) {
        showMessage('danger','Hiba', error);
    }

    currentPassField.value = "";
    newPassField.value = "";
    newPassConfirmField.value = "";
}
async function updateProfile() {
    const nameField = document.getElementById('nameField');
    const emailField = document.getElementById('emailField');

    if (!nameField.value || !emailField.value) {
        showMessage('danger', 'Hiba', 'Nem adtál meg minden adatot!');
        return;
    }

    if (!emailRegExp.test(emailField.value)) {
        showMessage('danger', 'Hiba', 'Nem megfelelő e-mail cím!');
        return;
    }

    try {
        const res = await fetch(`${ServerURL}/users/profile`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: loggedUser.id,
                name: nameField.value,
                email: emailField.value
            })
        });

        const data = await res.json();
        
        if (res.ok) {
            showMessage('success', 'Siker', data.msg);
            // Frissítjük a sessionStorage-t
            loggedUser.name = data.newName || nameField.value;
            loggedUser.email = data.newEmail || emailField.value;
            sessionStorage.setItem('loggedUser', JSON.stringify(loggedUser));
        } else {
            showMessage('danger', 'Hiba', data.msg);
        }
    } catch (error) {
        showMessage('danger', 'Hiba', 'Hiba a profil frissítése során');
    }
}