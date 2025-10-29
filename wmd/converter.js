
async function grabMD(article) {
    try{
        const response = await fetch(article);
        const text = await response.text();
        return text;
    }
    catch (error){
        console.log(error);
    }
}
async function load(article){
    const trueText = await grabMD(article);
    return trueText;
}


const parseMarkup = function(input) {
     // ---------- 1) HEADER ----------
  const title = (input.match(/^=(.+?)=/m) || ["", ""])[1].trim();
  const description = (input.match(/'''([\s\S]+?)'''/m) || ["", ""])[1].trim();
  const date = (input.match(/"""(.+?)"""/m) || ["", ""])[1].trim();

  // ---------- 2) FOOTNOTES (GLOBAL PASS) ----------
  // Matches lines like: [[1| psalm 110:1]]
  const footnoteLineRegex = /^\s*\[\[\s*(\d+)\s*\|\s*([^\]]+?)\s*\]\]\s*$/gm;
  const footnotes = [];
  const seen = new Set();

  // Collect in order of appearance
  let m;
  while ((m = footnoteLineRegex.exec(input)) !== null) {
    const num = String(m[1]).trim();
    const txt = String(m[2]).trim();
    if (!seen.has(num)) {
      seen.add(num);
      footnotes.push({ num, text: txt });
    }
  }

  // Remove those footnote lines from the text before section parsing
  const inputWithoutFootnoteLines = input.replace(footnoteLineRegex, "").trim();

  // ---------- 3) SECTIONS ----------
  // Capture sections until next "==...==" or EOF
  const sectionRegex = /^==\s*(.+?)\s*==\s*([\s\S]*?)(?=^==\s*.+?\s*==|$)/gm;
  const sections = [];
  let s;

  while ((s = sectionRegex.exec(inputWithoutFootnoteLines)) !== null) {
    const sectionTitle = s[1].trim();
    let body = s[2].trim();

    // Inline markers: $n$ -> <sup>[n]</sup>
    body = body.replace(/\$(\d+)\$/g, (_, n) => `<sup>[${n}]</sup>`);

    sections.push({ title: sectionTitle, body });
  }

  // ---------- 4) HTML OUTPUT ----------
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
    html += `
    <p class="text-header">${sec.title}</p>
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
    <em>Published on ${date}</em>
    <br><br>
    <h3>Footnotes</h3>
    <hr><br>
`;

  // Render collected footnotes
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
      for (let i=0;i<document.getElementsByClassName("converter").length;i++){
        let currElem = document.getElementsByClassName("converter")[i];
        currElem.innerHTML = await convert(`./${currElem.id}.th`)
      }
}
change()
