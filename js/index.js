'use strict';
(function mainFunc () {

  function selector(sel) {
    return document.querySelector(sel);
  }

  function getId(sel) {
    return document.getElementById(sel);
  }
  
  // 元素节点
  function createE(name) {
    return document.createElement(name);
  }

  // 文本节点
  function createT(str) {
    return document.createTextNode(str);
  }

  var subObj = selector('.subLiNode');
  var addObj = selector('.addLiNode');
  var liParent = selector('ol');
  var requestMethod = selector('.requestMethod');
  var urlObj = selector('.urlValue');
  var respType = selector('.respType');
  var respResult = selector('.respResult');
  var addToList = selector('.addToList');
  var candidateList = getId('candidateList');
  var toStr = Object.prototype.toString;

  function creatLiNode() {
    var frag = document.createDocumentFragment();
    var params = createE('li');
    var paramKey = createE('input');
    var paramValue = paramKey.cloneNode(true);
    var select = createE('select');
    var optionS = createE('option');
    var optionO = optionS.cloneNode(true);
    var optionB = optionS.cloneNode(true);
    var textS = createT('string');
    var textO = createT('object');
    var textB = createT('boolean');
    optionS.setAttribute('value', 'string');
    optionS.appendChild(textS);
    optionB.setAttribute('value', 'boolean');
    optionB.appendChild(textB);
    optionO.setAttribute('value', 'object');
    optionO.appendChild(textO);
    select.setAttribute('value', 'string');
    select.appendChild(optionS);
    select.appendChild(optionO);
    select.appendChild(optionB);

    paramKey.classList.add('param-key');
    paramKey.setAttribute('placeholder', '参数名称');
    paramValue.classList.add('param-value');
    paramValue.setAttribute('placeholder', '参数值');

    params.classList.add('params');
    params.appendChild(paramKey);
    params.appendChild(paramValue);
    params.appendChild(select);
    frag.appendChild(params);
    return frag;
  }


  function removeLiNode() {
    var cns = liParent.childNodes,
        len = cns.length,
        i = len - 1;
    for (; i >= 0; i--) {
      var item = cns[i];
      if (item.nodeType === 1) {
        item.remove();
        break;
      }
    }
  }

  function filterData(method) {
    var cns = liParent.childNodes,
        i = 0,
        l = cns.length,
        cnsPost = {},
        cnsGet = '',
        isObj = false;

    if (method == 'post') {
      isObj = true;
    }

    for (; i < l; i++) {
      var item = cns[i];
      var key = item.querySelector('.param-key').value.trim();
      if (!key) {
        continue;
      }
      var value = item.querySelector('.param-value').value.trim();
      var type = item.querySelector('select').value.trim();
      if (isObj) {
        if (type === 'object') {
          try {
            value = JSON.parse(value);
          } catch (err) {
            console.log(err);
          }
        }

        if (type === 'boolean') {
          if (!!value) {
            value = true;
          } else {
            value = false;
          }
        }
        cnsPost[key] = value;
      } else {
        cnsGet += key + '=' + value + '&';
      }
    }

    if (isObj) {
      return cnsPost;
    }
    return cnsGet;
  }

  function jsontohtml(data, ele) {
    var ct, liele, collapseClose;
    if (Array.isArray(data)) {
      var i = 0,
          l = data.length;
      var collapse = createE('div');
      ct = document.createTextNode('[');
      collapse.setAttribute('class', 'collapse');
      collapse.appendChild(ct);
      ele.appendChild(collapse);
      for (; i < l; i++) {
        liele = createE('li');
        var item = data[i];
        var iValue;
        if (item !== null && typeof item === 'object') {
          iValue = createE('ul');
          liele.appendChild(iValue);
          ele.appendChild(liele);
          jsontohtml(item, iValue);
        } else {
          iValue = createE('span');
          var it = document.createTextNode(item+',');
          iValue.setAttribute('class', 'arrayValue');
          iValue.appendChild(it);
          liele.appendChild(iValue);
          ele.appendChild(liele);
        }
      }

      collapseClose = createE('div');
      ct = document.createTextNode(']');
      collapseClose.setAttribute('class', 'collapse');
      collapseClose.appendChild(ct);
      ele.appendChild(collapseClose);
    } else if (toStr.call(data) === '[object Object]') {
      var collapseOpen = createE('div');
      var jprop, jt;
      ct = document.createTextNode('{');
      collapseOpen.setAttribute('class', 'collapse');
      collapseOpen.appendChild(ct);
      ele.appendChild(collapseOpen);
      for (var j in data) {
        if (data.hasOwnProperty(j)) {
          var jtem = data[j];
          liele = createE('li');
          var jValue;
          if (jtem !== null && typeof jtem === 'object') {
            jprop = createE('div');
            jt = document.createTextNode(j + ': ');
            jprop.setAttribute('class', 'divProp');
            jprop.appendChild(jt);

            jValue = createE('ul');
            liele.appendChild(jprop);
            liele.appendChild(jValue);
            ele.appendChild(liele);
            jsontohtml(jtem, jValue);
          } else {
            jprop = createE('span');
            jt = document.createTextNode(j + ': ');
            jprop.setAttribute('class', 'spanProp');
            jprop.appendChild(jt);

            jValue = createE('span');
            var jtt = document.createTextNode(jtem + ',');
            jValue.setAttribute('class', 'spanValue');
            jValue.appendChild(jtt);

            liele.appendChild(jprop);
            liele.appendChild(jValue);
            ele.appendChild(liele);
          }
        }
      }
      collapseClose = createE('div');
      ct = document.createTextNode('}');
      collapseClose.setAttribute('class', 'collapse');
      collapseClose.appendChild(ct);
      ele.appendChild(collapseClose);
    }
  }

  function callback(obj) {
    return obj;
  }

  function jsonpRequest(xyUrl, callback) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = xyUrl;
    //借鉴了jQuery的script跨域方法
    script.onload = script.onreadystatechange = function(){
        if((!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')){
            callback && callback();
            if ( head && script.parentNode ) {
                head.removeChild( script );
            }
        }
    };
  }

  function requestActive(method) {
    function handler() {
      var result;
      var rt = respType.value;
      if (rt === 'string') {
        respResult.innerText = xhr.response;
        return;
      } else if (rt ==='html') {
        respResult.innerHTML = xhr.response;

      } else {
        try {
          result = rt === 'jsonp' ? eval(xhr.response) : JSON.parse(xhr.response);
        } catch(err) {
          console.log(err);
          showErrorMsg('返回数据格式正确');
          return false;
        }

        var ule = createE('ul');
        respResult.innerHTML = '';
        respResult.appendChild(ule);
        jsontohtml(result, ule);
      }
    }
    if (!urlObj.value.trim()) {
      return false;
    }
    var xhr = new XMLHttpRequest();
    xhr.onload = handler;
    var urls = urlObj.value.trim();

    if (method === 'get') {
      if (urls.indexOf('www') === 0) {
        urls = 'http://' + urls;
      }
      if (urls[urls.length - 1] !== '?') {
        urls += '?';
      }
      urls += filterData();
      xhr.open('get', urls, true);
      xhr.send(null);
    } else {
      xhr.open('post', urls, true);
      var data = filterData('post');
      xhr.send(data);
    }
  }

  function showErrorMsg(msg) {
    var pe = createE('p');
    var errorMsg = createT(msg);
    pe.appendChild(errorMsg);
    pe.classList.add('errorMsg');
    selector('section').appendChild(pe);
    setTimeout(function() {
      pe.parentNode.removeChild(pe);
    }, 3000);
  }

  function addEvent() {
    var liNode = creatLiNode();

    subObj.addEventListener('click', function() {
      removeLiNode();
    }, false);

    addObj.addEventListener('click', function() {
      liParent.appendChild(liNode.cloneNode(true));
    }, false);

    requestMethod.addEventListener('click', function(e) {
      var bt = e.srcElement;
      if (bt.nodeType !== 1) {
        return false;
      }
      var cn = bt.className;
      cn === 'get' ? requestActive('get') : requestActive('post');
    }, false);

    addToList.addEventListener('click', function() {
      var url = urlObj.value.trim();
      var urlReg = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
      if (urlReg.test(url)) {
        var urlList = localStorage.getItem('urlList') ? JSON.parse(localStorage.getItem('urlList')) : [];
        var idx = urlList.indexOf(url);
        if (idx > -1) {
          urlList.splice(idx, 1);
          var cacheLi = candidateList.querySelector('option[value="' + url + '"]');
          if (cacheLi) {
            cacheLi.remove();
            cacheLi = null;
          }
        }
        urlList.unshift(url);
        localStorage.setItem('urlList', JSON.stringify(urlList));
        var opt = createE('option');
        opt.setAttribute('value', url);
        if (candidateList.firstElementChild) {
          candidateList.insertBefore(opt, candidateList.firstElementChild);
        } else {
          candidateList.appendChild(opt);
        }
      } else {
        showErrorMsg('URL有错误');
      }

      return false;
    }, false);
  }
  addEvent();
}());