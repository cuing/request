'use strict';
(function mainFunc () {
  var subObj = selector('.subLiNode');
  var addObj = selector('.addLiNode');
  var liParent = selector('ol');
  var requestMethod = selector('.requestMethod');
  var urlObj = selector('.urlValue');
  var respType = selector('.respType');
  var respResult = selector('.respResult');
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
    // paramKey.setAttribute('class', 'param-key');
    paramKey.setAttribute('placeholder', '参数名称');
    // paramValue.setAttribute('class', 'param-value');
    paramValue.classList.add('param-value');
    paramValue.setAttribute('placeholder', '参数值');

    params.classList.add('params');
    // params.setAttribute('class', 'params');
    params.appendChild(paramKey);
    params.appendChild(paramValue);
    params.appendChild(select);
    frag.appendChild(params);
    return frag;
  }

  function selector(sel) {
    return document.querySelector(sel);
  }
  
  // 元素节点
  function createE(name) {
    return document.createElement(name);
  }

  // 文本节点
  function createT(str) {
    return document.createTextNode(str);
  }

  function addClass(el, cname) {
    el.classList && el.classList.add(cname);
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

  function createElement(eleName, text, cn) {
    var ele = document.createElement(eleName),
        txt;
    if (cn) {
      ele.setAttribute('class', cn);
    }
    if (text) {
      txt = document.createTextNode(text);
      ele.appendChild(txt);
    }
    return ele;
  }

  function jsontohtml(data, ele) {
    if (Array.isArray(data)) {
      var i = 0,
          l = data.length;
      var collapse = createE('div');
      var ct = document.createTextNode('[');
      collapse.setAttribute('class', 'collapse');
      collapse.appendChild(ct);
      ele.appendChild(collapse);
      for (; i < l; i++) {
        var liele = createE('li');
        var item = data[i];
        var iValue;
        if (item !== null && typeof item === 'object') {
          // iValue = createElement('ul');
          iValue = createE('ul');
          liele.appendChild(iValue);
          ele.appendChild(liele);
          jsontohtml(item, iValue);
        } else {
          iValue = createE('span');
          var it = document.createTextNode(item+',');
          iValue.setAttribute('class', 'arrayValue');
          iValue.appendChild(it);
          // iValue = createElement('span', item + ',', + 'arrayValue');
          liele.appendChild(iValue);
          ele.appendChild(liele);
        }
      }

      // var collapseClose = createElement('div', '],', 'collapse');
      var collapseClose = createE('div');
      var ct = document.createTextNode(']');
      collapseClose.setAttribute('class', 'collapse');
      collapseClose.appendChild(ct);
      ele.appendChild(collapseClose);
    } else if (toStr.call(data) === '[object Object]') {
      var collapseOpen = createE('div');
      var ct = document.createTextNode('{');
      collapseOpen.setAttribute('class', 'collapse');
      collapseOpen.appendChild(ct);
      // var collapseOpen = createElement('div', '{', 'collapse');
      ele.appendChild(collapseOpen);
      for (var j in data) {
        if (data.hasOwnProperty(j)) {
          var jtem = data[j];
          var liele = createE('li');
          // var liele = createElement('li');
          if (jtem !== null && typeof jtem === 'object') {
            var jprop = createE('div');
            var jt = document.createTextNode(j + ': ');
            jprop.setAttribute('class', 'divProp');
            jprop.appendChild(jt);

            var jValue = createE('ul');
            liele.appendChild(jprop);
            liele.appendChild(jValue);
            ele.appendChild(liele);
            jsontohtml(jtem, jValue);
          } else {
            var jprop = createE('span');
            var jt = document.createTextNode(j + ': ');
            jprop.setAttribute('class', 'spanProp');
            jprop.appendChild(jt);

            var jValue = createE('span');
            var jtt = document.createTextNode(jtem + ',');
            jValue.setAttribute('class', 'spanValue');
            jValue.appendChild(jtt);

            liele.appendChild(jprop);
            liele.appendChild(jValue);
            ele.appendChild(liele);
          }
        }
      }
      var collapseClose = createE('div');
      var ct = document.createTextNode('}');
      collapseClose.setAttribute('class', 'collapse');
      collapseClose.appendChild(ct);
      // var collapseClose = createElement('div', '},', 'collapse');
      ele.appendChild(collapseClose);
    }
  }

  function callback(obj) {
    return obj;
  }

  function requestActive(method) {
    function handler() {
      var result;
      var rt = respType.value;
      if (rt === 'string') {
        respResult.innerText = xhr.response;
        return;
      } else {
        try {
          result = rt === 'jsonp' ? eval(xhr.response) : JSON.parse(xhr.response);
        } catch(err) {
          console.log(err);
          alert('返回数据格式正确');
          return false;
        }

        var ule = createE('ul');
        respResult.appendChild(ule);
        respResult.innerHTML = '';
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

  var liNode = creatLiNode();

  function addEvent() {
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
  }
  addEvent();
}());