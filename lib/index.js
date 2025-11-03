// Grab the Article to start
async function load(article){
    try{
        const response = await fetch(article);
        const text = await response.text();
        return text;
    }
    catch (error){
        console.log(error);
    }
}
// Parse the Markdown format into HTML
const parseMarkup = function(input){
    // To normalize the input
    input = String(input).replace(/\r\n?/g, '\n');
    // Header
    const title = (input.match(/^#\s+(.+?)\s*$/m) || ["", ""])[1].trim();
    const description = (input.match(/__([\s\S]+?)__/m) || ["", ""])[1].trim();
    const date = (input.match(/~\s*(.+?)\s*~/m) || ["", ""])[1].trim();
    // Footnotes
    const footnotes = [];
    const seen = new Set();
    const addFootnote = (num, text) => {
        const key = String(num).trim();
        const val = String(text || "").trim();
        if (!seen.has(key)) {
            seen.add(key);
            footnotes.push({ num: key, text: val });
        }
    };
    const legacyFootnoteLineRegex = /^\s*\[\[\s*(\d+)\s*\|\s*([^\]]+?)\s*\]\]\s*$/gm;
    let m;
    while ((m = legacyFootnoteLineRegex.exec(input)) !== null) addFootnote(m[1], m[2]);
    let working = input.replace(legacyFootnoteLineRegex, '').trim();
    if (title) working = working.replace(/^#\s+.+?$/m, '').trim();
    if (description) working = working.replace(/__[\s\S]+?__/m, '').trim();
    if (date) working = working.replace(/~\s*.+?\s*~/m, '').trim();
    // Sections 
    const sectionRegex = /^##\s*(.+?)\s*\n([\s\S]*?)(?=^##\s*.+?\s*$|$)/gm;
    const mdInlineRefRegex = /\[([^\]]+?)\]\(\s*(\d+)\s*\)/g;
    const italicRegex = /_([^_]+)_/g;
    const sections = [];
    let s;
    while ((s = sectionRegex.exec(working)) !== null) {
        const sectionTitle = s[1].trim();
        let body = s[2].trim();
        body = body
            .replace(/\$(\d+)\$/g, (_, n) => `<sup>[${n}]</sup>`)
            .replace(mdInlineRefRegex, (m0, txt, n) => {
                addFootnote(n, txt);
                return `<sup>[${n}]</sup>`;
            })
            .replace(italicRegex, '<em>$1</em>');
        sections.push({ title: sectionTitle, body });
    }
    if (sections.length === 0) {
        let stripped = working;
        stripped = stripped
            .replace(/\$(\d+)\$/g, (_, n) => `<sup>[${n}]</sup>`)
            .replace(mdInlineRefRegex, (m0, txt, n) => {
                addFootnote(n, txt);
                return `<sup>[${n}]</sup>`;
            })
            .replace(italicRegex, '<em>$1</em>') // italics
            .trim();
        if (stripped) sections.push({ title: "", body: stripped });
    }
    // HTML Output
    let html = `
        <div class="body">
            <div class="body-text">
                <div class="mobile-header">
                <br>
                <p class="text-header">${title}</p>
                <p class="mobile-bulk">
                    ${description}
                </p><br>
            </div>
    `;

    sections.forEach(sec => {
        if (sec.title) html += `\n    <p class="text-header">${sec.title}</p>`;
        html += `
            <p class="bulk-text">
                &emsp;&emsp;${sec.body}
            </p>
            <br><br>
        `;
    });

    html += `
        </div>
        <div class="sidebar">
            <h3>${title}</h3>
            <hr><br>
            <p>${description}</p>
            <br>
            <em>${date}</em>
            <br><br>
            <h3>Footnotes</h3>
            <hr><br>
    `;

    footnotes.forEach(fn => {
        html += `<p><sup>[${fn.num}]</sup> ${fn.text}</p>\n`;
    });

    html += `
            </div>
        </div>
    `.trim();

    return html;
}

async function convert(article) {
    try {
        const text = await load(article);
        const html = parseMarkup(text);
        return html;
    } catch (error) {
        console.error(error);
    }
}
async function change(){
    for (let i=0;i<document.getElementsByClassName("article").length;i++){
        let currElem = document.getElementsByClassName("article")[i];
        currElem.innerHTML = await convert(`./assets/${currElem.id}.md`)
    }
}
change();