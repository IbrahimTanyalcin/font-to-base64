mimeTypes = {
  eot: {mime: "application/vnd.ms-fontobject", format: "format('embedded-opentype')"},
  woff: {mime: "font/woff", format: "format('woff')"},
  ttf: {mime: "font/ttf", format: "format('truetype')"},
  svg: {mime: "image/svg+xml", format: "format('svg')"}
}
var fontFace="",
    src="",
    script="",
    taskq="",
    loader = document.querySelector("div.loader"),
    fontName= document.getElementById("font-name"),
    testDiv= document.getElementById("test-div"),
    action = ((inputs) => () => {
      	const arrIn = [...inputs]; 
      	return arrIn.indexOf(arrIn.filter(d => d.checked)[0]) ? "download" : "clipboard";
    })(document.getElementById("action-div").children);
function base64convert (files) {
  if(!files.length){
  	return;
  }
  loader.style.display = "block";
  fontFace = "";
  src = "";
  script = "";
  taskq = "";
  new Promise(res => {
  	 [...files].forEach((f,i) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const extension =  f.name.split(".").pop(),
              dataURL = "data:" + mimeTypes[extension].mime
                + ";charset=utf-8;base64,"
                + e.currentTarget.result.split(",").slice(-1);
        src += `  src: url('${dataURL}') ${mimeTypes[extension].format};\n`;
        if (files.length === i + 1) {
          res(src.slice(0,-1))
        }
      }
      reader.readAsDataURL(f);
    });
  }).then(src => {
  	fontFace = (`@font-face {
      font-family: ${fontName.value};
      ${src}
      font-weight: normal;
      font-style: normal;
      font-display: block;
    }`).replace(/^\s+/gim, m => m.slice(0,-4));
    var scriptBody = (
        `document.querySelector('style[nonstd-font-name="${fontName.value}"')?.remove();
        const styl = document.createElement("style");
        styl.setAttribute("nonstd-font-name", "${fontName.value}");
        styl.textContent = \`${fontFace}\`;
        document.head.appendChild(styl);`
    ).replace(/^\s+/gim, "");
    script = "!function(){\n" + scriptBody.replace(/^(.*)/gim,"  $1") + "\n}();";
    taskq = "!function(){\n" 
            + "  function load(){\n"
            +      scriptBody.replace(/^(.*)/gim,"    $1")
            + "  \n  }\n"
            + "  load._taskqId = 'load-font-" + fontName.value + "';\n"
            + "  load._taskqWaitFor = [];\n"
            + "}();"
    document.getElementById("font-embed")?.remove();
    const fEmbed = document.createElement("script");
    fEmbed.id = "font-embed";
    fEmbed.textContent = script;
  	document.head.appendChild(fEmbed);
    loader.style.display = "none";
    testDiv.style.setProperty("font-family", `${fontName.value}`, "important");
  });
}

document.querySelector("button:nth-last-of-type(4)").addEventListener("click",function(){
  if(action() === "clipboard") {
  	copyTextToClipboard(fontFace);
  } else {
  	download({payload: fontFace, type: "text/css", name: `${fontName.value}`});
  }
  /*navigator.clipboard.writeText(fontFace).then(function() {
    console.log('Copied @font-face to clipboard');
  }, function(err) {
    console.error('Could not copy to clipboard: ', err);
  });*/
});
document.querySelector("button:nth-last-of-type(3)").addEventListener("click",function(){
 if (action() === "clipboard") {
 	copyTextToClipboard(src);
 } else {
 	download({payload: src, name: `${fontName.value}`});
 }
	/*navigator.clipboard.writeText(src).then(function() {
    console.log('Copied "src" to clipboard');
  }, function(err) {
    console.error('Could not copy to clipboard: ', err);
  });*/
});

document.querySelector("button:nth-last-of-type(2)").addEventListener("click",function(){
 if (action() === "clipboard") {
 	copyTextToClipboard(script);
 } else {
 	download({payload: script, type: "text/javascript", name: `${fontName.value}`});
 }
	/*navigator.clipboard.writeText(src).then(function() {
    console.log('Copied "src" to clipboard');
  }, function(err) {
    console.error('Could not copy to clipboard: ', err);
  });*/
});

document.querySelector("button:nth-last-of-type(1)").addEventListener("click",function(){
 if (action() === "clipboard") {
 	copyTextToClipboard(taskq);
 } else {
 	download({payload: taskq, type: "text/javascript", name: `${fontName.value}`});
 }
	/*navigator.clipboard.writeText(src).then(function() {
    console.log('Copied "src" to clipboard');
  }, function(err) {
    console.error('Could not copy to clipboard: ', err);
  });*/
});

https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
function copyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
 // Place in the top-left corner of screen regardless of scroll position.
  textArea.style.position = 'fixed';
  textArea.style.top = 0;
  textArea.style.left = 0;

  // Ensure it has a small width and height. Setting to 1px / 1em
  // doesn't work as this gives a negative w/h on some browsers.
  textArea.style.width = '200em';
  textArea.style.height = '200em';

  // We don't need padding, reducing the size if it does flash render.
  textArea.style.padding = 0;

  // Clean up any borders.
  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';

  // Avoid flash of the white box if rendered for any reason.
  textArea.style.background = 'transparent';
  textArea.value = text;

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Copying text command was ' + msg);
  } catch (err) {
    console.log('Oops, unable to copy', err);
  }
  document.body.removeChild(textArea);
}

function download({payload, name = "download",type = "text/plain"}) {
    const blob = new Blob([payload], {type}),
          url = URL.createObjectURL(blob),
  a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}