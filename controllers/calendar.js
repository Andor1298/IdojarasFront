let calendar = null;

async function getCalendarData() {
    try {
        console.log('Naptár adatok lekérése...');
        const res = await fetch(`${ServerURL}/idojaras/users/${loggedUser.id}`);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('Naptár adatok:', data);


        const calendarEvents = data.map(item => {

            let color = '#3788d8'; 
            if (item.idojarasAdat === 'sunny') color = '#ffc107'; // sárga
            if (item.idojarasAdat === 'rainy') color = '#0d6efd'; // kék
            if (item.idojarasAdat === 'cloudy') color = '#6c757d'; // szürke
            if (item.idojarasAdat === 'snowy') color = '#0dcaf0'; // világoskék

            return {
                title: `${item.minFok}°C - ${item.maxFok}°C`,
                start: item.date,
                description: `Időjárás: ${item.idojarasAdat}`,
                backgroundColor: color,
                borderColor: color,
                textColor: '#ffffff'
            };
        });

        console.log('Calendar events:', calendarEvents);
        return calendarEvents;

    } catch (error) {
        console.error('Hiba a naptár adatok lekérésekor:', error);
        showMessage('danger', 'Hiba', 'Nem sikerült betölteni a naptár adatokat');
        return [];
    }
}

async function initCalendar() {
    const calendarEl = document.getElementById('calendar');
    
    if (!calendarEl) {
        console.error('Naptár elem nem található!');
        return;
    }

    try {

        if (calendar) {
            calendar.destroy();
        }

        // Lekérjük az adatokat
        const events = await getCalendarData();

        // Létrehozzuk a naptárt
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'hu',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listWeek'
            },
            buttonText: {
                today: 'Ma',
                month: 'Hónap',
                week: 'Hét',
                list: 'Lista'
            },
            events: events,
            eventDisplay: 'block',
            eventTimeFormat: {
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false
            },
            eventDidMount: function(info) {
                // Tooltip hozzáadása
                info.el.setAttribute('title', info.event.extendedProps.description);
            }
        });

        calendar.render();
        console.log('Naptár sikeresen inicializálva');

    } catch (error) {
        console.error('Hiba a naptár inicializálásakor:', error);
        showMessage('danger', 'Hiba', 'Nem sikerült betölteni a naptárt');
    }
}