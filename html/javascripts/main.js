const button = document.getElementById("submit");
const chatDOM = document.getElementById("chat");
let icon_url = "images/oldman_75.png";
button.addEventListener("click", smt, false);
document.getElementById("join").addEventListener("click", join, false);
document.getElementById("imagesubmit").addEventListener("click", uploadImage, false);
document.getElementById("textform").addEventListener('keypress', 　e => {
    const key = e.which || e.keyCode;
    if (key === 13) smt();
}, false);

function smt() {
    const chatText = document.getElementById("textform").value;
    if (chatText !== "") addcontent(true, chatText, null);
}
let imgn = 0;
function addcontent(p, t, u) {
    let person = "";
    let icon = u;
    if (p) {
        person = " me";
        icon = icon_url;
    }
    if (t) {
        let text = escape_html(t);
        text = text.replace(/^( |　)*/g,"").replace(/^$/,"虚無");
        const img = text.match(/https?:\/\/[\w/:%#\$&\?\(\)~\.=\+\-]+(jpg|png|gif|tif|bmp)/ig);
        const video = text.match(/https?:\/\/[\w/:%#\$&\?\(\)~\.=\+\-]+(mp4|webm|mpg)/ig);
        const audio = text.match(/https?:\/\/[\w/:%#\$&\?\(\)~\.=\+\-]+(m4a|mp3|ogg|opus|wav|flac)/ig);
        const turl = text.match(/https?:\/\/[\w/:%#\$&\?\(\)~\.=\+\-]+/ig);
        let ary = [];
        if (img) {
            for (let n in img) {
                if (ary.indexOf(img[n]) == -1) {
                    imgn++;
                    text = text.replace(img[n], `<a href="${img[n]}" target="_blank"><img id="img-${imgn}" class="chatImg" src="${img[n]}"></a>`);
                    ary.push(img[n]);
                }
            }
        }
        else if (video) {
            for (let n in video) {
                if (ary.indexOf(video[n]) == -1) {
                    imgn++;
                    text = text.replace(video[n], `<video id="img-${imgn}" src="${video[n]}" controls>`);
                    ary.push(video[n]);
                }
            }
        }
        else if (audio) {
            for (let n in audio) {
                if (ary.indexOf(audio[n]) == -1) {
                    text = text.replace(audio[n], `<audio src="${audio[n]}" controls>`);
                    ary.push(audio[n]);
                }
            }
        }
        else if (turl) {
            for (let n in turl) {
                if (ary.indexOf(turl[n]) == -1) {
                    text = text.replace(turl[n], `<a href="${turl[n]}" target="_blank">${turl[n]}</a>`);
                    ary.push(turl[n])
                }
            }
        }
        //text.replace(/https?:\/\/[\w/:%#\$&\?\(\)~\.=\+\-]+(jpg|png|gif|tif)$/ig,"");
        chatDOM.insertAdjacentHTML("beforeend", `<div class="content${person}">
    <img src="${escape_html(icon)}">
    <p>${text}</p>
    </div>`);
        if (img || video) document.getElementById(`img-${imgn}`).addEventListener("load", scrl, false);
        scrl();
        if (p) {
            socket.emit('chatdata', { url: icon_url, data: escape_html(t) });
            document.getElementById("textform").value = "";
        }
    }
}
let reader = new FileReader();
function join() {
    const file = document.getElementById("fileForm").files[0];
    if (file) {
        reader.ep = true;
        reader.addEventListener('load', yupload, false);
        reader.readAsArrayBuffer(file);
    }
}
function uploadImage() {
    const file = document.getElementById("imagefileForm").files[0];
    if (file) {
        reader.ep = false;
        reader.addEventListener('load', yupload, false);
        reader.readAsArrayBuffer(file);
    }
    document.getElementById("imagefileForm").value = null;
}
function yupload(i) {
    //console.log(i);
    let fd = new FormData();
    fd.append("expiresAt", "null");
    fd.append("imagedata", new Blob([new Uint8Array(reader.result)]));
    fd.append("name", "jainPicture");
    fetch("https://yabumi.cc/api/images.json", {
        mode: 'cors',
        method: 'POST',
        body: fd
    }).then((response)=> {
        return response.json();
    }).then((json)=> {
        if (!json.id) {
            alert("ファイルがおかしいよ");
            return;
        }
        if (i.target.ep) {
            icon_url = json.url;
            document.getElementById("login").style.display = "none";
        }
        else {
            document.getElementById("textform").value += ` ${json.url}`;
        }
    });
}
function scrl() {
    scrollTo(0, chatDOM.clientHeight);
}
//https://qiita.com/saekis/items/c2b41cd8940923863791
function escape_html(string) {
    if (typeof string !== 'string') {
        return string;
    }
    return string.replace(/[&'`"<>]/g, (match)=> {
        return {
            '&': '&amp;',
            "'": '&#x27;',
            '`': '&#x60;',
            '"': '&quot;',
            '<': '&lt;',
            '>': '&gt;',
        }[match]
    });
}
//socket
let host = location.host;
if(host==="")host="http://localhost";
let socket = io.connect(`${host}:3000`);
socket.on('chat', (data) => {
    addcontent(false, data.text, data.url);
});