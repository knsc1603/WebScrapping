import playwright from 'playwright';
import xlsx from 'xlsx'; // para usar playwright 

(async () => {
    const data = {}; 

    const urls = [
        { url: "https://teclab.edu.ar/tecnologia-y-desarrollo/lenguajes-de-programacion-mas-usados/", site: "Teclab" },
        { url: "https://worldcampus.saintleo.edu/blog/estudiar-sistemas-computacionales-cuales-son-los-lenguajes-de-programacion-mas-utilizados-en-la-actualidad", site: "WorldCampus" },
        { url: "https://keepcoding.io/blog/lenguajes-de-programacion-mas-demandados/", site: "KeepCoding" }
    ];

// EXTRACCION TECLAB
async function extraccionTeclab(page) {
    return await page.$$eval('ol[class="wp-block-list"] a', items =>
        items.slice(0, 5).map(item => item.innerText.trim())
    );
}

// EXTRACCION WORLDCAMPUS
async function extraccionWorldCampus(page) {
    return await page.$$eval('div[class="mt-3"] h3', items =>
        items.map(item => item.innerText.trim())
    );
}

//EXTRACCION KEEPCODING
async function extraccionKeepCoding(page) {
    return await page.$$eval('ul[class="ez-toc-list ez-toc-list-level-1 "] li', items =>
        items.slice(0, 5).map(item => item.innerText.trim())
    );
}

    for (const browserType of ['chromium']) {
        const browser = await playwright[browserType].launch(); // ACCESO AL NAVEGADOR A UTILIZAR
        const context = await browser.newContext(); // CREA UNA NUEVA VENTANA 
        const page = await context.newPage(); // CREA UNA PESTAÑA

        for (const { url, site } of urls) {
            await page.goto(url); // NAVEGO A LA URL ESPECIFICADA
            await page.waitForTimeout(1000); // ESPERA A QUE CARGUE LA PAGINA

            let languages = []; // CREO UN ARRAY VACIO PARA ALMACENAR LOS LENGUAJES EXTRAIDOS

            // DEPENDIENDO DE CADA SITIO, EXTRAIGO 
            if (url.includes("teclab")) {
                languages = await extraccionTeclab(page); // LLAMO A LA FUNCION
            } else if (url.includes("worldcampus")) {
                languages = await extraccionWorldCampus(page); // LLAMO A LA FUNCION
            } else if (url.includes("keepcoding")) {
                languages = await extraccionKeepCoding(page); // LLAMO A LA FUNCION 
            }

            data[site] = languages;  // GUARDO LOS LENGUAJES EXTRAIDOS
        }

        await browser.close(); // CIERRO EL NAVEGADOR 
    }

    const maxRows = Math.max(...Object.values(data).map(langs => langs.length)); // DETERMINO EL N° MAXIMO DE FILAS 
    const worksheetData = Array.from({ length: maxRows }, (_, i) => { // CREO UN ARRAY EN EL QUE CADA OBJETO ES UNA FILA DEL EXCEL
        const row = {};
        for (const site in data) {
            row[site] = data[site][i] || '';  
        }
        return row;
    });

    const workbook = xlsx.utils.book_new(); // CREO UN NUEVO ARCHIVO EXCEL
    const worksheet = xlsx.utils.json_to_sheet(worksheetData); // CONVIERTO LOS DATOS EN FORMATO JSON 
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Lenguajes más demandados');
    
    xlsx.writeFile(workbook, 'Top_Lenguajes_Mas_Demandados_2024.xlsx'); // GUARDO EL ARCHIVO EXCEL 
    console.log('Archivo creado Lenguajes_Mas_Demandados_2024.xlsx');
})();