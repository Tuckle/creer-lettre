
var addedCountries = false;
var currentContent = null;
var file_path = null;
var contentKeys = ["intro", "para1", "para2", "para3", "finale"];
var ouCount = 0;
var contentKeysNames = {
    "intro": "Introduction",
    "para1": "Paragraphe 1",
    "para2": "Paragraphe 2",
    "para3": "Paragraphe 3",
    "finale": "Formule finale"
}
var vars = {
    "m": true,
    "civilite": "Monsieur",
    "objet": ""
};

function getVar(name, replacement) {
    if(name in vars && vars[name].toString().length > 0) {
        return vars[name]
    }
    return replacement;
}

function walkTheDOM(node, func)
{
    func(node);
    node = node.firstChild;
    while (node)
    {
        walkTheDOM(node, func);
        node = node.nextSibling;
    }
}

function getParagraphContent(para) {
    var string = ""
    //    console.log(para)
    //    console.log(para.children)
    var elem = para.firstChild
    //    for(var i = 0; i < para.children.length; i++) {
    while(elem) {
        //        var elem = para.children[i]
        if(elem.tagName === "INPUT") {
            var val = elem.value.trim()
            if (val.length <= 0) {
                val = "(" + elem.getAttribute("placeholder") + ")"
            }
            string += val
        } else {
            string += elem.textContent
        }
        elem = elem.nextSibling
    }    
    return string
}

function refreshInputs() {
    $(':input').each(function() {
        if(this.value) {
            save(this)
        }
        if(!this.hasAttribute('savecall')) {
            this.oninput = $.debounce(250, function(e) {
                //                console.log("working i guess")
                //                console.log(e.srcElement.value)
                if($(this).val().length > 0){
                    this.style.border = '2px solid green'
                } else {
                    this.style.border = '2px solid #DCE4EC'
                }
                if(this.getAttribute("id") === "civilite" && $(this).val() === "Madame, Monsieur") {
                    document.getElementById("nomc").disabled = true
                    document.getElementById("prenomc").disabled = true
                } else if(this.hasAttribute("tip") && this.getAttribute("tip") === "selectwrite") {
                    if(parseInt(this.selectedIndex) === parseInt(this.getAttribute("index")) - 1) {
                        var newEl = document.createElement("input")
                        newEl.setAttribute("placeholder", this.getAttribute("vall"))
                        console.log(this.parentElement)
                        this.parentNode.replaceChild(newEl, this)
                        refreshInputs()
                    }
                }
                save(e.srcElement)
            })
            //            this.onfocusout = function(e) {
            ////                console.log("focusout")
            ////                console.log(e.target.value)
            //                save(e.target)
            //            } 
            this.setAttribute("savecall", "true")
        }
    });
}

function refreshLettre(scopes) {
    console.log(scopes)
    var arr = scopes.split(',')
    if(arr.includes("content")) {
        arr = arr.concat(contentKeys)
    }
    for(var i = 0; i < arr.length; i++) {
        var scope = arr[i]
        if(scope === "user") {
            document.getElementById("lettre-user").value = "" + 
                getVar("prenom", "Prenom(s)") + " " + getVar("nom", "Nom(s)") + "\n" + getVar("rue", "Nom de la rue") + " " + getVar("numero", "et numéro") + "\n" + getVar("code-postal", "Code postal") + " " + getVar("localite", "Ville") + ", " + getVar("pays", "Pays") + "\nTél. : " + getVar("tel", "Tel.") + "\nEmail :  " + getVar("emailc", "Email")
        } else if(scope === "dest") {
            var dest = document.getElementById("lettre-dest")
            var civilite = getVar("civilite", "Civilité")
            dest.value = "" 
            if(civilite !== "Madame, Monsieur") {
                dest.value += "À l’attention de " + 
                    civilite + " " + getVar("prenomc", "Prenom(s)") + " " + getVar("nomc", "Nom(s)")
            } else {
                dest.value += civilite
            }
            dest.value += "\n" + getVar("poste", "Poste au sein de l’établissement") + "\n" + 
                getVar("org", "Nom de l’établissement") + "\n" + getVar("ruec", "Nom de la rue") + " " + getVar("numeroc", "et numéro") + "\n" + getVar("code-postalc", "Code postal") + " " + getVar("localitec", "Ville") + ", " + getVar("paysc", "Pays")
        } else if(scope === "date") {
            document.getElementById("lettre-date").value = getVar("localitec", "Ville") + ", le " + getVar("date-day", "day") + " " + getVar("date-month", "month") + " " + getVar("date-year", "year")
        } else if(scope === "objet") {
            document.getElementById("lettre-objet").value = "Poste " + getVar("objet", "(Objet)")
        } else if(scope === "civilite") {
            var elem = document.getElementById("lettre-civilite")
            var poste = getVar("poste", "Poste au sein de l’établissement")
            var vowelRegex = '^[aieouAIEOU].*'
            var matched = poste.match(vowelRegex)
            elem.value = getVar("civilite", "(Civilité)")
            if(elem.value === "Monsieur" || elem.value === "Madame") {
                if(matched) {
                    elem.value += " l'"
                } else {
                    if(elem.value === "Monsieur") {
                        elem.value += " le " 
                    } else {
                        elem.value += " la "
                    }
                }
                elem.value += poste
            }
        } else if (contentKeys.includes(scope)) {
            document.getElementById("lettre-" + scope).value = "";
            //            console.log("going in", scope)
            // add all paragraphs
            $("div[area=" + scope + "]").each(function() {
                var elem = document.getElementById("lettre-" + scope);
                var type = this.getAttribute("tip")
                if(type === "plus") {
                    var check = this.lastChild.firstChild.firstChild
                    if(check.checked) {
                        //                        elem.value += "\t"
                        elem.value += getParagraphContent(this.firstChild) + "\n"
                    }
                } else {
                    //                    elem.value += "\t"
                    elem.value += getParagraphContent(this.firstChild) + "\n"
                }
            })
            var elem = document.getElementById("lettre-" + scope)
            //            elem.value = elem.value.replace('\n', '\n\t')
            elem.value = elem.value.trim()
            $(elem).height(10)
            if(elem.scrollHeight !== elem.clientHeight) {
                $(elem).height(elem.scrollHeight)
            }
            //            elem.style.textIndent = "30px"
            //            $(elem).height(0).height(elem.scrollHeight)
            //            resizeTextarea(elem.getAttribute("id"))
            //            elem.setAttribute("rows", elem.value.split('\n').length - 1)
        } else if (scope === "signature") { 
            document.getElementById("lettre-signature").value = getVar("prenom", "Prenom(s)") + " " + getVar("nom", "Nom(s)")
        }
    }
}


function refreshScopeOnly(obj) {
    var parent = obj.parentElement
    var refreshArea = null;
    for(var i = 0; i < 10; i++) {
        if(parent.hasAttribute("area")) {
            refreshArea = parent.getAttribute("area")
            break
        }
        parent = parent.parentElement
    }
    if(refreshArea !== null) {
        refreshLettre(refreshArea)
    }
}

function save(obj) {
    var key = obj.getAttribute("id")
    var parent = obj.parentElement
    var refreshArea = null;
    for(var i = 0; i < 10; i++) {
        if(parent.hasAttribute("area")) {
            refreshArea = parent.getAttribute("area")
            break
        }
        parent = parent.parentElement
    }
    if(obj.tagName.toLowerCase() === "input") {
        vars[key] = obj.value
        if(obj.hasAttribute("upper")) {
            vars[key] = obj.value.toUpperCase()
        }
    } else if(obj.tagName.toLowerCase() === "select") {
        vars[key] = obj.value // obj.options[obj.selectedIndex].text
    }

    if(refreshArea !== null) {
        refreshLettre(refreshArea)
    }
    //    console.log("saved")
    //    console.log(key + "_" + refreshArea)
}

function getText(value, disableInputs=false) {
    var el = document.createElement("p")
    el.style.textIndent = "50px"
    for (var i = 0; i < value.length; i++) {
        if(typeof value[i] === 'string' || value[i] instanceof String) {
            el.innerHTML = el.innerHTML + value[i]
        } else if(value[i][0] === "f") {
            if(vars["gen"] === "F") {
                el.innerHTML = el.innerHTML + value[i][1]
            }
        } else if(value[i][0] === "m") {
            if(vars["gen"] === "M") {
                el.innerHTML = el.innerHTML + value[i][1]
            }
        } else if(value[i][0] === "textbox") {
            var box = document.createElement("input")
            box.setAttribute("type", "text")
            box.setAttribute("placeholder", value[i][1])
            if(disableInputs) {
                box.disabled = true
            }
            box.addEventListener("oninput",
                                 $.debounce(250, function(e) {
                //                console.log("working i guess")
                //                console.log(e.srcElement.value)
                refreshScopeOnly(e.srcElement)
            }))
            el.appendChild(box)
        } else if(value[i][0] === "select") {
            var box = document.createElement("select")
            //            box.setAttribute("type", "text")
            //            box.setAttribute("placeholder", value[i][1])
            for(var j = 1; j < value[i].length; j++) {
                var opt = document.createElement("option")
                opt.innerHTML = value[i][j]
                box.appendChild(opt)
            }
            if(disableInputs) {
                box.disabled = true
            }
            box.addEventListener("onchange",
                                 $.debounce(250, function(e) {
                //                console.log("working i guess")
                //                console.log(e.srcElement.value)
                refreshScopeOnly(e.srcElement)
            }))
            el.appendChild(box)
        } else if(value[i][0] === "selectwrite") {
            var box = document.createElement("select")
            //            box.setAttribute("type", "text")
            //            box.setAttribute("placeholder", value[i][1])
            for(var j = 1; j < value[i].length - 1; j++) {
                var opt = document.createElement("option")
                opt.innerHTML = value[i][j]
                box.appendChild(opt)
            }
            var opt = document.createElement("option")
            var vall = value[i][value[i].length - 1]
            opt.innerHTML = vall
            //            opt.onclick = function(e) {
            //                var el = e.srcElement
            //                var parent = el.parentElement
            //                var newEl = document.createElement("input")
            //                newEl.setAttribute("placeholder", el.innerHTML)
            //                parent.parentElement.replaceChild(parent, newEl)
            //            }
            box.setAttribute("tip", "selectwrite")
            box.setAttribute("index", value[i].length - 1)
            box.setAttribute("vall", vall)
            box.appendChild(opt)

            if(disableInputs) {
                box.disabled = true
            }
            box.addEventListener("onchange",
                                 $.debounce(250, function(e) {
                //                console.log("working i guess")
                //                console.log(e.srcElement.value)
                refreshScopeOnly(e.srcElement)
            }))
            el.appendChild(box)
        } else if(value[i][0] === "var") {
            if(value[i][1] === "civilite") {
                var elem = ""
                var poste = getVar("poste", "Poste au sein de l’établissement")
                var vowelRegex = '^[aieouAIEOU].*'
                var matched = poste.match(vowelRegex)
                elem = getVar("civilite", "(Civilité)")
                if(elem === "Monsieur" || elem === "Madame") {
                    if(matched) {
                        elem += " l'"
                    } else {
                        if(elem === "Monsieur") {
                            elem += " le " 
                        } else {
                            elem += " la "
                        }
                    }
                    elem += poste
                }
                el.innerHTML = el.innerHTML + elem
            } else {
                el.innerHTML = el.innerHTML + vars[value[i][1]]
            }
        } else {
            console.log(value[i][0])
        }
    }
    return el
}

function getModal(modalId, ous, elemId, sectionId) {
    var title = contentKeysNames[sectionId]
    var modal = document.createElement("div")
    var len = ous.length;
    var btnId = elemId + "Btn";
    modal.setAttribute("class", "modal fade")
    modal.setAttribute("id", modalId)
    modal.setAttribute("data-backdrop", "static")
    modal.setAttribute("data-keyboard", "false")
    modal.setAttribute("tabindex", "-1")
    modal.setAttribute("aria-labelledby", modalId + "Label")
    modal.setAttribute("aria-hidden", "true")

    var modalDiag = document.createElement("div")
    modalDiag.setAttribute("class", "modal-dialog modal-lg")
    var modalContent = document.createElement("div")
    modalContent.setAttribute("class", "modal-content")

    var modalHeader = document.createElement("div")
    modalHeader.setAttribute("class", "modal-header")
    var modalTitle = document.createElement("h5")
    modalTitle.setAttribute("class", "modal-title")
    modalTitle.innerHTML = title
    modalHeader.appendChild(modalTitle)
    modalContent.appendChild(modalHeader)

    var modalBody = document.createElement("div")
    modalBody.setAttribute("class", "modal-body")

    for(var i = 0; i < len; i ++) {
        var txt = getText(ous[i], true)
        txt.setAttribute("fromModal", "true")
        txt.setAttribute("link", elemId)
        txt.setAttribute("index", i)
        txt.setAttribute("mid", modalId)
        txt.setAttribute("sectionid", sectionId)
        $(modalBody).data("arr", ous)
        txt.onclick = function (param) {
            elem = param.srcElement
            var id = elem.getAttribute("link")
            var index = parseInt(elem.getAttribute("index"))
            var arr = $(modalBody).data("arr")
            var modId = elem.getAttribute("mid")
            document.getElementById(id).innerHTML = getText(arr[index]).innerHTML
            var btn = document.getElementById(btnId)
            btn.innerHTML = '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-hand-thumbs-up" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a9.84 9.84 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733.058.119.103.242.138.363.077.27.113.567.113.856 0 .289-.036.586-.113.856-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.163 3.163 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16v-1c.563 0 .901-.272 1.066-.56a.865.865 0 0 0 .121-.416c0-.12-.035-.165-.04-.17l-.354-.354.353-.354c.202-.201.407-.511.505-.804.104-.312.043-.441-.005-.488l-.353-.354.353-.354c.043-.042.105-.14.154-.315.048-.167.075-.37.075-.581 0-.211-.027-.414-.075-.581-.05-.174-.111-.273-.154-.315L12.793 9l.353-.354c.353-.352.373-.713.267-1.02-.122-.35-.396-.593-.571-.652-.653-.217-1.447-.224-2.11-.164a8.907 8.907 0 0 0-1.094.171l-.014.003-.003.001a.5.5 0 0 1-.595-.643 8.34 8.34 0 0 0 .145-4.726c-.03-.111-.128-.215-.288-.255l-.262-.065c-.306-.077-.642.156-.667.518-.075 1.082-.239 2.15-.482 2.85-.174.502-.603 1.268-1.238 1.977-.637.712-1.519 1.41-2.614 1.708-.394.108-.62.396-.62.65v4.002c0 .26.22.515.553.55 1.293.137 1.936.53 2.491.868l.04.025c.27.164.495.296.776.393.277.095.63.163 1.14.163h3.5v1H8c-.605 0-1.07-.081-1.466-.218a4.82 4.82 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z"/></svg>'
            btn.style.backgroundColor = "green"
            $('#' + modId).modal('hide')

            var parent = elem.parentElement
            for(var j = 0; j < parent.children.length; j++) {
                var currElem = parent.children[j]
                if(currElem.tagName == "P") {
                    currElem.style.borderStyle = 'outset'
                }
            }
            elem.style.borderStyle = 'dotted'
            refreshInputs()
        }
        txt.style.borderStyle = 'outset'
        txt.style.cursor = 'pointer'


        modalBody.appendChild(txt)
        if(i != len - 1) {
            modalBody.appendChild(document.createElement("br"))
            var ouElem = document.createElement("center")
            ouElem.innerHTML = "OU"
            ouElem.style.fontWeight = 'bold'
            ouElem.fontSize = "100px"
            modalBody.appendChild(ouElem)
            modalBody.appendChild(document.createElement("br"))
        }
    }

    modalContent.appendChild(modalBody)

    var modalFooter = document.createElement("div")
    modalFooter.setAttribute("class", "modal-footer")
    var closeBtn = document.createElement("button")
    closeBtn.setAttribute("type", "button")
    closeBtn.setAttribute("class", "btn btn-secondary")
    closeBtn.setAttribute("data-dismiss", "modal")
    closeBtn.innerHTML = "Close"
    modalFooter.appendChild(closeBtn)
    modalContent.appendChild(modalFooter)

    modalDiag.appendChild(modalContent)
    modal.appendChild(modalDiag)
    return modal
}


function addOu(value, c, myId) {
    var title = contentKeysNames[myId]
    ouCount += 1;
    var ouId = "ou" + ouCount.toString();
    var modalId = "modal" + ouCount.toString();

    var el = document.createElement("div")
    el.setAttribute("tip", "ou")
    el.style.display = 'flex'
    el.style.justifyContent = 'space-between'
    //    el.setAttribute("class", "row")
    var txt = getText(value[0])
    txt.setAttribute("id", ouId)
    el.setAttribute("area", myId)
    el.appendChild(txt)
    var change = document.createElement("button")
    change.setAttribute("type", "button")
    change.setAttribute("class", "btn btn-success")
    //    change.innerHTML = '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-counterclockwise" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.83 6.706a5 5 0 0 0-7.103-3.16.5.5 0 1 1-.454-.892A6 6 0 1 1 2.545 5.5a.5.5 0 1 1 .91.417 5 5 0 1 0 9.375.789z"/><path fill-rule="evenodd" d="M7.854.146a.5.5 0 0 0-.708 0l-2.5 2.5a.5.5 0 0 0 0 .708l2.5 2.5a.5.5 0 1 0 .708-.708L5.707 3 7.854.854a.5.5 0 0 0 0-.708z"/></svg>'
    change.innerHTML = '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-puzzle" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M4.605 2.5V2v.5zM3.61 3.6l.498-.043V3.55l-.498.05zM7 2.5h.5A.5.5 0 0 0 7 2v.5zm-.676 1.454l.304.397-.304-.397zm3.352 0l-.304.397.304-.397zM9 2.5V2a.5.5 0 0 0-.5.5H9zm3.39 1.1l-.498-.05v.007l.498.043zM12.1 7l-.498-.043a.5.5 0 0 0 .498.543V7zm1.854-.676l.397.304-.397-.304zm0 3.352l.397-.304-.397.304zM12.1 9v-.5a.5.5 0 0 0-.498.542L12.1 9zm.29 3.4l-.498.043v.007l.498-.05zM9 13.5h-.5a.5.5 0 0 0 .5.5v-.5zm.676-1.454l-.304-.397.304.397zm-3.352 0l.304-.397-.304.397zM7 13.5v.5a.5.5 0 0 0 .5-.5H7zm-2.395 0V13v.5zm-.995-1.1l.498.05v-.007L3.61 12.4zM3.9 9l.498.042A.5.5 0 0 0 3.9 8.5V9zm-1.854.676l-.397-.304.397.304zm0-3.352l-.397.304.397-.304zM3.9 7v.5a.5.5 0 0 0 .498-.543L3.9 7zm.705-5a1.5 1.5 0 0 0-1.493 1.65l.995-.1A.5.5 0 0 1 4.605 3V2zM7 2H4.605v1H7V2zm.5.882V2.5h-1v.382h1zm-.872 1.469c.375-.287.872-.773.872-1.469h-1c0 .195-.147.42-.48.675l.608.794zM6.5 4.5l.001-.006a.113.113 0 0 1 .012-.025.459.459 0 0 1 .115-.118l-.608-.794c-.274.21-.52.528-.52.943h1zM8 5c-.491 0-.912-.1-1.19-.24a.86.86 0 0 1-.271-.194.213.213 0 0 1-.039-.063V4.5h-1c0 .568.447.947.862 1.154C6.807 5.877 7.387 6 8 6V5zm1.5-.5v.003a.213.213 0 0 1-.039.064.86.86 0 0 1-.27.193C8.91 4.9 8.49 5 8 5v1c.613 0 1.193-.123 1.638-.346.415-.207.862-.586.862-1.154h-1zm-.128-.15c.065.05.099.092.115.119.008.013.01.021.012.025L9.5 4.5h1c0-.415-.246-.733-.52-.943l-.608.794zM8.5 2.883c0 .696.497 1.182.872 1.469l.608-.794c-.333-.255-.48-.48-.48-.675h-1zm0-.382v.382h1V2.5h-1zm2.895-.5H9v1h2.395V2zm1.493 1.65A1.5 1.5 0 0 0 11.395 2v1a.5.5 0 0 1 .498.55l.995.1zm-.29 3.392l.29-3.4-.996-.085-.29 3.4.996.085zm.284-.542H12.1v1h.782v-1zm.675-.48c-.255.333-.48.48-.675.48v1c.696 0 1.182-.497 1.469-.872l-.794-.608zm.943-.52c-.415 0-.733.246-.943.52l.794.608a.459.459 0 0 1 .118-.115.113.113 0 0 1 .025-.012L14.5 6.5v-1zM16 8c0-.613-.123-1.193-.346-1.638-.207-.415-.586-.862-1.154-.862v1h.003l.01.003a.237.237 0 0 1 .053.036.86.86 0 0 1 .194.27c.14.28.24.7.24 1.191h1zm-1.5 2.5c.568 0 .947-.447 1.154-.862C15.877 9.193 16 8.613 16 8h-1c0 .491-.1.912-.24 1.19a.86.86 0 0 1-.194.271.214.214 0 0 1-.063.039H14.5v1zm-.943-.52c.21.274.528.52.943.52v-1l-.006-.001a.113.113 0 0 1-.025-.012.458.458 0 0 1-.118-.115l-.794.608zm-.675-.48c.195 0 .42.147.675.48l.794-.608c-.287-.375-.773-.872-1.469-.872v1zm-.782 0h.782v-1H12.1v1zm.788 2.858l-.29-3.4-.996.084.29 3.401.996-.085zM11.395 14a1.5 1.5 0 0 0 1.493-1.65l-.995.1a.5.5 0 0 1-.498.55v1zM9 14h2.395v-1H9v1zm.5-.5v-.382h-1v.382h1zm0-.382c0-.195.147-.42.48-.675l-.608-.794c-.375.287-.872.773-.872 1.469h1zm.48-.675c.274-.21.52-.528.52-.943h-1l-.001.006a.113.113 0 0 1-.012.025.459.459 0 0 1-.115.118l.608.794zm.52-.943c0-.568-.447-.947-.862-1.154C9.193 10.123 8.613 10 8 10v1c.492 0 .912.1 1.19.24.14.07.226.14.271.194a.214.214 0 0 1 .039.063v.003h1zM8 10c-.613 0-1.193.123-1.638.346-.415.207-.862.586-.862 1.154h1v-.003l.003-.01a.214.214 0 0 1 .036-.053.859.859 0 0 1 .27-.194C7.09 11.1 7.51 11 8 11v-1zm-2.5 1.5c0 .415.246.733.52.943l.608-.794a.459.459 0 0 1-.115-.118.113.113 0 0 1-.012-.025L6.5 11.5h-1zm.52.943c.333.255.48.48.48.675h1c0-.696-.497-1.182-.872-1.469l-.608.794zm.48.675v.382h1v-.382h-1zM4.605 14H7v-1H4.605v1zm-1.493-1.65A1.5 1.5 0 0 0 4.605 14v-1a.5.5 0 0 1-.498-.55l-.995-.1zm.29-3.393l-.29 3.401.996.085.29-3.4-.996-.086zm-.284.543H3.9v-1h-.782v1zm-.675.48c.255-.333.48-.48.675-.48v-1c-.696 0-1.182.497-1.469.872l.794.608zm-.943.52c.415 0 .733-.246.943-.52l-.794-.608a.459.459 0 0 1-.118.115.112.112 0 0 1-.025.012L1.5 9.5v1zM0 8c0 .613.123 1.193.346 1.638.207.415.586.862 1.154.862v-1h-.003a.213.213 0 0 1-.064-.039.86.86 0 0 1-.193-.27C1.1 8.91 1 8.49 1 8H0zm1.5-2.5c-.568 0-.947.447-1.154.862C.123 6.807 0 7.387 0 8h1c0-.492.1-.912.24-1.19a.86.86 0 0 1 .194-.271.213.213 0 0 1 .063-.039H1.5v-1zm.943.52c-.21-.274-.528-.52-.943-.52v1l.006.001a.112.112 0 0 1 .025.012c.027.016.068.05.118.115l.794-.608zm.675.48c-.195 0-.42-.147-.675-.48l-.794.608c.287.375.773.872 1.469.872v-1zm.782 0h-.782v1H3.9v-1zm-.788-2.858l.29 3.4.996-.085-.29-3.4-.996.085z"/></svg>'
    //    change.innerHTML = "c"
    change.setAttribute("id", ouId + "Btn")
    change.setAttribute("title", "switch paragraph")
    change.setAttribute("index", 0)
    change.setAttribute("data-toggle", "modal")
    change.setAttribute("data-target", "#" + modalId)
    //    $(change).data("arr", value)
    //    change.onclick = function(param) {
    //        elem = param.srcElement
    //        elem.setAttribute("style", "background-color: #488ad6")
    //        var index = change.getAttribute("index")
    //        if(index !== parseInt(index, 10)) {
    //            index = parseInt(index, 10)
    //        }
    //        index = index + 1
    //        index = index % value.length
    //        var arr = $(change).data('arr')
    //        change.setAttribute("index", index)
    //        txt.innerHTML = getText(arr[index]).innerHTML
    //    }    
    el.appendChild(change)    
    el.appendChild(getModal(modalId, value, ouId, myId))    
    c.appendChild(el)
}

function addPlus(value, c, myId) {
    var child = document.createElement("div")
    child.setAttribute("class", "input-group")
    child.setAttribute("tip", "plus")
    child.setAttribute("area", myId)
    child.style.display = 'flex'
    child.style.justifyContent = 'space-between'
    //    var child1 = document.createElement("div")
    //    child.setAttribute("class", "row")
    //    child1.setAttribute("class", "col")
    var txt = getText(value[0])
    //    child1.appendChild(txt)
    //    txt.setAttribute("class", "col")
    //    console.log(value[0])
    child.append(txt)

    var appendDiv = document.createElement("input-group-append")
    var textDiv = document.createElement("input-group-text")

    var plus = document.createElement("input")
    plus.setAttribute("type", "checkbox")
    plus.style.width = "50px"
    plus.style.height = "50px"
    plus.title = "Check to add this paragraph"
    plus.style.cursor = 'pointer'
    textDiv.appendChild(plus)
    //    plus.setAttribute("class", "col-")
    appendDiv.appendChild(textDiv)
    child.appendChild(appendDiv)
    //    child.append(plus)
    //    c.appendChild(child)
    //    c.appendChild(plus)
    c.appendChild(child)
    console.log("plus")
}

function addText(value, c, myId) {
    var child = document.createElement("div")
    child.setAttribute("tip", "text")
    child.setAttribute("area", myId)
    //    child.setAttribute("class", "row")
    child.append(getText(value[0]))
    c.appendChild(child)
}


function refreshPage() {
    json = currentContent
    var c = document.getElementById("paras")
    c.innerHTML = ""
    vars["objet"] = json["name"]
    for(var ci = 0; ci < contentKeys.length; ci++) {
        var myKey = contentKeys[ci];
        var value = currentContent[myKey]
        var nc = document.createElement("center")
        nc.innerHTML = contentKeysNames[myKey]
        nc.style.fontSize = "25px"
        c.appendChild(nc)
        for(var i = 0; i < value.length; i ++) {
            if(value[i][0] == "ou") {
                addOu(value[i].slice(1), c, myKey)
            }
            else if(value[i][0] == "plus") {
                addPlus(value[i].slice(1), c, myKey)
            } else {
                addText(value[i].slice(1), c, myKey)
            }
        }
    }
    refreshLettre("user,dest,date,objet,civilite,content,signature")
    refreshInputs()
}

function refreshObject() {
    var e = document.getElementById("objet")
    var selected = e.options[e.selectedIndex]
    var path = "res/docs/" + selected.getAttribute("path")
    $.getJSON(path, function(json) {
        console.log(json)
        ouCount = 0;
        currentContent = json;
        refreshPage()
    });
}

function refreshAll(id) {
    var elem = document.getElementById(id)
    vars[elem.getAttribute("id")] = $(elem).val()
    refreshPage()
}

function addCountries() {
    if(addedCountries) {
        return
    }
    $.getJSON("res/docs/countries.json", function(json) {
        var box = document.getElementById("pays");
        var boxc = document.getElementById("paysc");
        box.innerHTML = ""
        boxc.innerHTML = ""
        json = json.sort(function(f, s) {if(f["name"] > s["name"]) return 1; return -1;})
        for(var i = 0; i < json.length; i++) {
            var child = document.createElement("option")
            var childc = document.createElement("option")
            child.innerHTML = json[i]["name"]
            childc.innerHTML = json[i]["name"]
            box.appendChild(child)
            boxc.appendChild(childc)
        }
        addCountries = true
        //console.log(json); // this will show the info it in firebug console
    });
    $.getJSON("res/docs/objets.json", function(json) {
        var box = document.getElementById("objet");
        const keys = Object.keys(json);
        file_path = keys[0]
        for(var i =0; i < keys.length; i++) {
            var child = document.createElement("option")
            child.innerHTML = json[keys[i]]
            child.setAttribute("path", keys[i])
            box.appendChild(child)
        }
        refreshObject()
    });
    var d = new Date();
    document.getElementById("date-day").value = d.getDate()
    document.getElementById("date-month").selectedIndex = d.getMonth()
    document.getElementById("date-year").value = d.getFullYear()
}

addCountries()
//refreshInputs()

function getPDF() {
    var doc = new jsPDF()

    var user = document.getElementById("lettre-user")
    doc.text($(user).val(), 10, 15)

    var dest = document.getElementById("lettre-dest")
    doc.text($(dest).val(), 100, 50)

    var myVar = document.getElementById("lettre-date")
    doc.text($(myVar).val(), 10, 100)
    var myVar = document.getElementById("lettre-objet")
    doc.text($(myVar).val(), 10, 110)
    var myVar = document.getElementById("lettre-civilite")
    doc.text($(myVar).val(), 10, 120)
    var myVar = document.getElementById("lettre-intro")
    doc.text(doc.splitTextToSize($(myVar).val(), 180), 10, 130)
    var myVar = document.getElementById("lettre-para1")
    doc.text(doc.splitTextToSize($(myVar).val(), 180), 10, 160)
    var myVar = document.getElementById("lettre-para2")
    doc.text(doc.splitTextToSize($(myVar).val(), 180), 10, 190)
    var myVar = document.getElementById("lettre-para3")
    doc.text(doc.splitTextToSize($(myVar).val(), 180), 10, 220)
    var myVar = document.getElementById("lettre-finale")
    doc.text(doc.splitTextToSize($(myVar).val(), 180), 10, 250)
    var myVar = document.getElementById("lettre-signature")
    doc.text(doc.splitTextToSize($(myVar).val(), 180), 100, 270)

    doc.save('lettre.pdf')
    // http://raw.githack.com/MrRio/jsPDF/master/docs/jsPDF.html#text
}
