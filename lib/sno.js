function random(e) {
    return Math.floor(Math.random() * e);
}
function toggle(e) {
    return !e;
}
const getElms = () => {
        var e,
            t = [];
        for (i = 0, e = document.getElementsByTagName("*"); i < e.length; i++) t.push(e[i]);
        return t;
    },
    elements = getElms(),
    parseData = () => {
        var hasDataTag,
            possible = !1;
        let data = document.querySelector("[data]").getAttribute("data"),
            okay;
        return eval(
            (data = `()=>{ return new Proxy(${data}, {set(target,property,value){target[property] = value;$render();return true;}})}`)
        )();
    },
    data = parseData(),
    parseReval = () => {
        var e = [],
            t = Array.from(document.querySelectorAll("[react]"));
        for (let r = 0; r < t.length; r++) e.push({ elem: t[r], oldTxt: t[r].innerHTML, pre: "", post: "" });
        return e;
    },
    reval = parseReval(),
    revaluate = (template) =>
        template.replace(/{{(.*?)}}/g, (_, expression) => {
            try {
                for (let i = 0; i < Object.keys(data).length; i++)
                    expression.includes(Object.keys(data)[i]) &&
                        (expression = expression.replaceAll(`${Object.keys(data)[i]}`, `data.${Object.keys(data)[i]}`));
                return eval(expression);
            } catch (error) {
                return `{{${expression}}}`;
            }
        }),
    renderReval = () => {
        if (reval.length > 0) for (i = 0; i < reval.length; i++) reval[i].elem.innerHTML = revaluate(reval[i].oldTxt);
    },
    parseFors = () => {
        let e,
            t = [];
        for (i = 0; i < elements.length; i++)
            null != (e = elements[i].getAttribute("for")) && t.push({ elem: elements[i], attr: e });
        return t;
    },
    fors = parseFors(),
    renderFors = () => {
        for (i = 0; i < fors.length; i++) {
            fors[i].elem.innerHTML = "";
            let e = "",
                t = fors[i].elem.getAttribute("item"),
                r = fors[i].attr;
            for (q = 0; q < data[r].length; q++) e += t.replaceAll("{{item}}", data[r][q]).replaceAll("{{i}}", q);
            fors[i].elem.innerHTML = e;
        }
    },
    renderIfs = () => {
        if (ifs.length > 0)
            for (i = 0; i < ifs.length; i++) {
                let trueAttr = ifs[i].attr;
                for (q = 0; q < Object.keys(data).length; q++)
                    trueAttr.includes(Object.keys(data)[q]) &&
                        (trueAttr = trueAttr.replace(Object.keys(data)[q], `data[Object.keys(data)[${q}]]`));
                eval(trueAttr) ? (ifs[i].elem.style.display = "") : (ifs[i].elem.style.display = "none");
            }
    },
    $render = () => {
        renderReval(), renderIfs(), renderFors();
    },
    parseScreen = () => {
        var e,
            t = [];
        for (i = 0; i < elements.length; i++)
            null != (e = elements[i].getAttribute("computer"))
                ? t.push({ elem: elements[i], attr: "computer" })
                : null != elements[i].getAttribute("mobile") && t.push({ elem: elements[i], attr: "mobile" });
        return t;
    },
    screens = parseScreen(),
    renderScreens = () => {
        for (i = 0; i < screens.length; i++)
            "mobile" == screens[i].attr &&
                (window.innerWidth <= 1000
                    ? (screens[i].elem.style.display = "")
                    : (screens[i].elem.style.display = "none")),
                "computer" == screens[i].attr &&
                    (window.innerWidth > 1000
                        ? (screens[i].elem.style.display = "")
                        : (screens[i].elem.style.display = "none"));
    },
    parseIf = () => {
        var e,
            t = [];
        for (i = 0; i < elements.length; i++)
            null != (e = elements[i].getAttribute("if")) &&
                t.push({ elem: elements[i], attr: e, computed: void 0, pre: "", post: "" });
        return t;
    },
    ifs = parseIf(),
    exe = () => {
        var hasExe;
        for (i = 0; i < elements.length; i++)
            if (null != (hasExe = elements[i].getAttribute("eval"))) {
                for (q = 0; q < Object.keys(data).length; q++)
                    hasExe.includes(Object.keys(data)[q]) &&
                        (hasExe = hasExe.replace(Object.keys(data)[q], `data[Object.keys(data)[${q}]]`));
                eval(hasExe);
            }
        $render();
    };
exe();
const allowInclReturn = (e, t) => {
        ((xhttp = new XMLHttpRequest()).onreadystatechange = function () {
            4 == this.readyState && 200 == this.status && (e.innerHTML = this.responseText);
        }),
            xhttp.open("GET", t, !0),
            xhttp.send();
    },
    parseIncl = () => {
        let e;
        for (i = 0; i < elements.length; i++)
            (e = elements[i].getAttribute("incl")), (elem = elements[i]), null != e && allowInclReturn(elem, e);
    };
parseIncl();
const parseBind = () => {
        let e,
            t = [];
        for (i = 0; i < elements.length; i++)
            if (null != (e = elements[i].getAttribute("bind")))
                for (q = 0; q < Object.keys(data).length; q++)
                    e.includes(Object.keys(data)[q]) && t.push({ elem: elements[i], attr: e });
        return t;
    },
    bound = parseBind(),
    renderBinds = () => {
        let e;
        for (i = 0; i < bound.length; i++)
            bound[i].elem.addEventListener("input", function (t) {
                setTimeout(() => {
                    (data[(e = bound[i].attr)] = bound[i].elem.value), $render();
                }, 0);
            });
    };
renderBinds();
const $ = (change) => {
    let update = change;
    for (let i = 0; i < Object.keys(data).length; i++)
        update.includes(Object.keys(data)[i]) &&
            (update = update.replaceAll(Object.keys(data)[i], `data.${Object.keys(data)[i]}`));
    eval(update);
};
(window.main = function () {
    requestAnimationFrame(main), renderScreens();
}),
    main(),
    $render();
