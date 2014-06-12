var_dump = dump_obj;
function dump_obj(obj, tabs, depth) {
	var str = new String();
	if (tabs == null)
		tabs = "  ";
	if (depth == 0)
		return " OUT OF DEPTH";
	if (depth == null)
		depth = 3;
	for (var port in obj) {
		str += port + ":\n" + tabs;
		if (typeof obj[port] == "object") {
			str += dump_obj(obj[port], tabs+"  ", depth - 1);
		}
		else {
			str += obj[port];
		}
		str += "\n<br/>";
	}
	return str;
}
function unescapeHTML(str) {
	var el = document.createElement("div");
	/*
	if (el.innerHTML != null && el.textContent != null) {
		el.innerHTML = str;
		str = el.textContent;
	}
	else*/ {
		str = str.replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '“').replace(/&quot;/g, '\"').replace(/&amp;/g, '&')
				 .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
				 .replace(/&quot;/g, '"');
	}
	return str;
}

// 把<>"等转为html实体
function escapeHTML (str) {
	var el = document.createElement("div");
	el.innerText = el.textContent = str;
	return el.innerHTML;
} 

// 获得元素内的纯文本
function getInnerText(str) {
	var el = document.createElement("div");
	el.innerHTML = str;
	if (el.textContent != null) {
		return el.textContent;
	} else {
		return el.innerText;
	}
}

// 将所有<>纯标签，即<>里只有字母的开、闭标签
function delTags(str) {
	if (str == null)
		return str;
	return str.replace(/<[\/]*\w+>/g,"");
}

function getFileSize (obj) {
	var filesize = 0;
	if (obj.files) {
		filesize = parseInt(obj.files[0].size);
	}
	else {
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		filesize = parseInt(fso.getFile(obj).size);
	}
	
	return filesize;
}

function setEleText(el, text) {
	if (el.innerText == null) {
		el.textContent = text;
	}
	else {
		el.innerText = text;
	}
}

function getEleText(el) {
	if (el.innerText == null) {
		return el.textContent;
	}
	return el.innerText;
}

var addOnload = function (fn) {
	if (window.onload != "function") {
		window.onload = fn;
	} else {
		var ofn = window.onload;
		window.onload = function() {
			ofn();
			fn();
		}
	}
};

// 将一个函数绑定一个上下文
function FunBindWithObj(fn, obj) {
	return function () {
		return fn.apply(obj, arguments);
	};
};

// 获取表单里面的数据，返回一个json形式的对象
// 参数 form 为表单对象，由原生js的getElementById 获得，filler 为字符串
// 对于表单中空值的元素，默认忽略，也可以设置填充值：filler 来填充空值
function getFormData (form, filler) {
	var data = {};
	var pairs = FormGetKeyValue(form);
	for (var name in pairs) {
		var value = pairs[name];
		var o = genObjFromUrlKeyVal(name, value);
		var key = popUrlKey(name)[0];

		if (!data[key])
			data[key] = {};
		data[key] = extendDeep(data[key], o[key]);
	}
	return data;
}

function FormGetKeyValue(form, filler) {
	var data = {};
	for (var i = 0; i < form.length; ++i) {
		var el = form[i];
		var name = el.name;
		var value = el.value;
		// 对于　checkbox 和 radiobox，它们的value值永远是"on"，所以必须取checked值
		if (el.type == 'checkbox' || el.type == 'radio') {
			if (el.type == 'radio' && !el.checked) {
				continue;
			}
			if (!el.checked)
				value = '';
		}
		if (name.length == 0)
			continue;
		if (typeof value == 'string' && value.length == 0) {
			if (filler)
				value = filler;
		}

		data[name] = value;
	}
	return data;
}

/**
 * 把参数名和参数值写入到当前 url 中去，有两种形式：
 * (1) addArgToUrl('argName', argVal, true/false)
 * (2) addArgToUrl({'argName': argVal}, true/false)
 * 此函数不会清空原来的查询串，如果原来的查询串已经存在，则更新，否则为加入
 */
function addArgToUrl(argName, argVal, nojump) {
	// 将 url 中原有的查询串提取成数组, 即 indexArr[0] = "key=value";
	var indexArr = document.location.search.substr(1).split("&");;
	var hashArr = Array();
	// 将 url 中原有的查询串提取成 hash 数组的形式, 即 hash['key'] = value
	for (var i in indexArr) {
		var str = indexArr[i];
		var arr = str.split('=');
		if (arr[0].length == 0)
			continue;
		hashArr[arr[0]] = arr[1];
	}

	if (typeof argName == 'string') {
		hashArr[argName] = argVal;
	} else {
		argArr = argName;
		var isobj = true;
		nojump = argVal;
		for(var propName in argArr) {
			hashArr[propName] = argArr[propName];
		}
	}
	var indexArr = Array();
	for (var hash in hashArr) {
		indexArr.push(hash + "=" + hashArr[hash]);
	}
	var ret = document.location.pathname + "?" + indexArr.join("&");
	if (!nojump)
		document.location.href = ret;
	return ret;
}
/**
 * 与 addArgToUrl 差不多，只是会清空原来的查询串
 */
function setArgToUrl(argName, argVal, nojump) {
	//var indexArr = document.location.search.substr(1).split("&");;
	var hashArr = Array();
	/*
	for (var i in indexArr) {
		var str = indexArr[i];
		var arr = str.split('=');
		if (arr[0].length == 0)
			continue;
		hashArr[arr[0]] = arr[1];
	}
	*/

	if (typeof argName == 'string') {
		hashArr[argName] = argVal;
	} else {
		argArr = argName;
		var isobj = true;
		nojump = argVal;
		for(var propName in argArr) {
			hashArr[propName] = argArr[propName];
		}
	}
	var indexArr = Array();
	for (var hash in hashArr) {
		indexArr.push(hash + "=" + hashArr[hash]);
	}
	var ret = document.location.pathname + "?" + indexArr.join("&");
	if (!nojump)
		document.location.href = ret;
	return ret;
}
/* 判断当前事件是否回车，为了兼容 firefox，传参的时候必须显示给出event，因为event在firefox中是默认存在的
   例：<input type='text' onkeyup="if (isEnter(event)) { do something here... }" /> */
function isEnter(event) {
	var e = event || window.event; 
	return (e.keyCode == 13);
}

function popup(anchor) {
	window.open(anchor.href, "");
}


// extend deeply
function extendDeep(o1, o2, override) {
	for (var p in o2) {
		if (o1.hasOwnProperty(p)) {
			if (typeof o2[p] == 'object')
				o1[p] = extendDeep(o1[p], o2[p], override);
			else if (override)
				o1[p] = o2[p];
		} else {
			o1[p] = o2[p];
		}
	};
	return o1;
}

// pop a key string such as 'advanceSearch[SGTABLEID][searchMethod]'
// returns ["advanceSearch", "SGTABLEID[searchMethod]"]
function popUrlKey(orgkey) {
	key = orgkey.substring(0, orgkey.indexOf('['));
	// the left of orgkey after extract key
	orgleft = orgkey.substring(orgkey.indexOf('[')+1);
	val = orgleft.replace(']', '');
	return [key, val];
}

/** 
 * generate object
 * 
 * @param String orgkey = 'advanceSearch[SGTABLEID][searchMethod]'
 * @param String orgval = '1'
 * 
 * @return {advanceSearch:{SGTABLEID:{searchMethod:1}}}
 * 
 */
function genObjFromUrlKeyVal(orgkey, orgval) {

	var arr = orgkey.match(/\[.+\]/);
	// can not define o as 'o = {}', or the o will be a global variable
	var o = {};
	// has inner key
	if (arr) {
		arr = popUrlKey(orgkey);
		//console.log(arr);
		key = arr[0];
		innerKey = arr[1];
		o[key] = genObjFromUrlKeyVal(innerKey, orgval);
	} else {
		o[orgkey] = orgval;
	}
	return o;
}

/**
 * 获得 URL 中搜索部分，并转换为对象
 * 
 * @param string url
 * @return 若当前 url 为 http://zf2-tutorial.localhost/Model/get?tableName=SendOrderDtl&advanceSearch%5BSGTABLEID%5D%5BsearchText%5D=1&advanceSearch%5BSGTABLEID%5D%5BsearchMethod%5D=%3D
 * 			则返回的结果为:
 * 			{
 * 				advanceSearch: {
 * 					SGTABLEID: {
 * 						searchMethod: "=",
 * 						searchText: "1",
 * 					},
 * 				},
 * 				tableName: "SendOrderDtl",
 * 			}
 * 
 */
function getSearchObj(url) {
	// encoded search string
	if (url)
		ecSrh = url.substring(url.indexOf('?'));
	else
		ecSrh = location.search;
	ecSrh.substr(1).split('&');
	kvPairs = decodeURI(ecSrh.substr(1)).split('&');
	var o = {};
	for (var i = kvPairs.length - 1; i >= 0; i--) {
		pair = kvPairs[i];
		arr = pair.split('=');
		key = arr[0];
		val = decodeURIComponent(arr[1]);

		//console.log([key, val]);
		o = extendDeep(o, genObjFromUrlKeyVal(key, val), true);
	};
	return o;
}

// 打开一个新窗口，并写入 txt
function WinOpen(txt) {
	mesg=open("cnrose","DisplayWindow"/*,"toolbar=no,,menubar=no,location=no,scrollbars=no"*/);
	mesg.document.write(txt);
}

function getBase64Image(img) {
    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // Get the data-URL formatted image
    // Firefox supports PNG and JPEG. You could check img.src to guess the
    // original format, but be aware the using "image/jpg" will re-encode the image.
    var dataURL = canvas.toDataURL("image/png");
    return dataURL;

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}
