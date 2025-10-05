let chart = null;

function loadChart() {
    if (!idojaras) idojaras = [];

    let today = new Date();
    today.setHours(0, 0, 0, 0);

    // Szűrés: csak a mai nap és a jövő
    let dataToUse = idojaras.filter(item => {
        let d = new Date(item.date);
        d.setHours(0, 0, 0, 0);
        return d >= today;
    });

    // Csoportosítás dátum szerint
    let grouped = {};
    dataToUse.forEach(item => {
        const dateStr = item.date;
        if (!grouped[dateStr]) {
            grouped[dateStr] = {
                minFok: Number(item.minFok),
                maxFok: Number(item.maxFok),
                idojarasAdat: item.idojarasAdat
            };
        } else {
            // Több adat esetén összegzés vagy max/min
            grouped[dateStr].minFok = Math.min(grouped[dateStr].minFok, Number(item.minFok));
            grouped[dateStr].maxFok = Math.max(grouped[dateStr].maxFok, Number(item.maxFok));
        }
    });

    // DataPoints létrehozása
    let dataPoints = Object.keys(grouped).sort().map(dateStr => {
        const dp = grouped[dateStr];
        const [y, m, d] = dateStr.split('-').map(Number);
        return {
            x: new Date(y, m - 1, d),
            y: [dp.minFok, dp.maxFok],
            name: dp.idojarasAdat
        };
    });

    // Ha már van chart, töröljük
    if (chart) chart.destroy();

    chart = new CanvasJS.Chart("chartContainer", {
        title: { text: "Weekly Weather Forecast" },
        axisX: {
            labelFormatter: function(e) {
                const options = { weekday: 'short', day: 'numeric' };
                return e.value.toLocaleDateString('hu-HU', options);
            }
        },
        axisY: { suffix: " °C", maximum: 50, minimum: -50, gridThickness: 0 },
        toolTip: { shared: true, content: "{name}</br>Min: {y[0]}°C, Max: {y[1]}°C" },
        data: [{
            type: "rangeSplineArea",
            fillOpacity: 0.1,
            color: "#91AAB1",
            dataPoints: dataPoints
        }]
    });

    chart.render();


    // Ikonok hozzáadása
    addImages(chart, dataPoints);
}

// Funkció az ikonok hozzáadásához
function addImages(chart, dataPoints) {
    const container = $("#chartContainer>.canvasjs-chart-container");
    dataPoints.forEach((dp, i) => {
        let src = "";
        if(dp.name === "sunny") src = "https://canvasjs.com/wp-content/uploads/images/gallery/gallery-overview/sunny.png";
        if(dp.name === "rainy") src = "https://canvasjs.com/wp-content/uploads/images/gallery/gallery-overview/rainy.png";
        if(dp.name === "cloudy") src = "https://canvasjs.com/wp-content/uploads/images/gallery/gallery-overview/cloudy.png";
        if(dp.name === "snowy") src = "./snowy.png";

        const img = $("<img>").attr("src", src).css({ position: "absolute", width: "40px" }).appendTo(container);
        positionImage(chart, img, i, dp);
    });

    // Resize esemény a képek újrapozicionálásához
    $(window).resize(() => {
        dataPoints.forEach((dp, i) => {
            const imgs = container.children(`img`).eq(i);
            positionImage(chart, imgs, i, dp);
        });
    });
}

// Funkció a képek pozicionálásához
function positionImage(chart, img, index, dp) {
    const imageCenter = chart.axisX[0].convertValueToPixel(dp.x) - 20;
    const imageTop = chart.axisY[0].convertValueToPixel(chart.axisY[0].maximum);
    img.css({ left: imageCenter + "px", top: imageTop + "px" });
}