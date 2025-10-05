function showMessage(severity, title, message) {
    let messageBox = document.querySelector('#messageBox');
    messageBox.innerHTML = '';
    let h3 = document.createElement('h3');
    let p = document.createElement('p');
    let btn = document.createElement('button');
    messageBox.classList.remove('hide');
    h3.innerHTML = title;
    p.innerHTML = message;
    p.classList.add('m-0', 'p-0')
    btn.classList.add('btn-close');
    btn.setAttribute('data-bs-dismiss', 'alert');
    btn.setAttribute('aria-label', 'Close');
    messageBox.classList.add('alert', `alert-${severity}`, 'alert-dismissable', 'fade', 'show');
    messageBox.setAttribute('role', 'alert');

    messageBox.appendChild(h3);
    messageBox.appendChild(p);
    //messageBox.appendChild(btn);

    setTimeout(()=>{
        messageBox.classList.remove('show');
        messageBox.classList.add('hide');
    }, 3000)
}