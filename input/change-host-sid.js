// ==UserScript==
// @name         切换搜索词和sid
// @namespace    http://tampermonkey.net/
// @version      1.0.6
// @description  切换搜索词和sid https://ku.baidu-int.com/d/GwPNLacR3Tt0vO
// @author       RYZENX
// @match        *://*.baidu.com/s?*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=baidu.com
// @grant        none
// @run-at       document-end
// ==/UserScript==

(() => {
    'use strict';

    const ONLINE_HOST_WISE = 'm.baidu.com';
    const ONLINE_HOST_PC = 'www.baidu.com';
    let ONLINE_HOST = ONLINE_HOST_WISE;
    // 获取query
    const href = location.href;
    const urlObj = new URL(href);
    let search = urlObj.search;
    if (search.startsWith('?')) {
        search = search.substring(1);
    }
    if (urlObj.host.startsWith('www.')) {
        ONLINE_HOST = ONLINE_HOST_PC;
    }
    const queries = search.split('&').map(i => i.split('='));
    // 获取sid和搜索词
    const sid = (queries.find(i => i[0] === 'sid') || [])[1];
    const wordArg = (queries.find(i => i[0] === 'word' || i[0] === 'wd') || []);
    const word = wordArg[1];
    const curWordKey = wordArg[0];
    // 存储sid和搜索词
    let storedSids = localStorage.getItem('sids') || '';
    storedSids = json(storedSids) || [];
    if (sid && !storedSids.includes(sid)) {
        storedSids.push(sid);
    }
    storedSids.sort((a, b) => Number.parseInt(a) - Number.parseInt(b)); // 排个序方便找
    let storedWords = localStorage.getItem('words') || '';
    storedWords = json(storedWords) || [];
    if (word && !storedWords.includes(word)) {
        storedWords.push(word);
    }
    localStorage.setItem('words', JSON.stringify(storedWords));
    localStorage.setItem('sids', JSON.stringify(storedSids));

    function json(strings) {
        try {
            return JSON.parse(strings);
        } catch (e) {
            return '';
        }
    }

    function getRandom() {
        return Math.random().toString(16).substring(2, 8);
    }

    function changeSearchQuery(key, val) {
        let newSearch = '';
        if (!queries.find(i => i[0] === key)) {
            newSearch = [...queries, [key, val]].map(i => i.join('=')).join('&');
        } else {
            newSearch = queries
                .map(i => {
                    if (i[0] === key) {
                        return [key, val].join('=');
                    } else {
                        return i.join('=');
                    }
                })
                .join('&');
        }
        location.href = [urlObj.origin, urlObj.pathname, `?${newSearch}`].join('');
    }

    function changeHost(newHost = ONLINE_HOST) {
        location.href = [urlObj.protocol, '//', newHost, urlObj.pathname, `?${search}`].join('');
    }

    function clearStorage(key) {
        if (!key) {
            localStorage.removeItem('sids');
            localStorage.removeItem('words');
            return;
        }
        localStorage.removeItem(key);
    }

    function exportStorage() {
        const sids = localStorage.getItem('sids');
        const words = localStorage.getItem('words');
        const res = {
            sids: json(sids),
            words: json(words),
        };
        console.log("'" + JSON.stringify(res) + "'");
        return res;
    }

    function importStorage(res) {
        res = json(res);
        const {sids = [], words = []} = res;
        localStorage.setItem('sids', JSON.stringify(sids));
        localStorage.setItem('words', JSON.stringify(words));
        location.reload();
    }

    function injectMenu() {
        const random = getRandom();
        console.log(
            `injectMenu-${random} 更新文档：https://ku.baidu-int.com/d/GwPNLacR3Tt0vO`,
            '\n导出的函数:',
            '\nchangeSearchQuery, \nchangeHost, \nclearStorage, \nexportStorage, \nimportStorage',
        );
        window['changeSearchQuery'] = changeSearchQuery;
        window['changeHost'] = changeHost;
        window['clearStorage'] = clearStorage;
        window['exportStorage'] = exportStorage;
        window['importStorage'] = importStorage;

        const html = `
<div>
    <span>sid:</span>
    <select id="sid-select-${random}">
        <option value="0">无sid</option>
${storedSids
    .map(i => `<option value="${i}" ${i === sid ? 'selected' : ''}>${i}</option>`)
    .join('')}
        <option value="-1"> ==清空sid==</option>
    </select>
</div>
<div>
    <span>Q:</span>
    <select id="word-select-${random}">
${storedWords
    .map(
        i =>
            `<option value="${i}" ${i === word ? 'selected' : ''}>${decodeURIComponent(
                i
            )}</option>`
    )
    .join('')}
        <option value="-1"> ==清空word==</option>
    </select>
</div>
<div>
    <span>Env:</span>
    ${
        urlObj.host === ONLINE_HOST
            ? '<span style="color: red;">线上</span>'
            : '<span style="color: green;">线下</span><button onclick="changeHost()">切换线上</button>'
    }
</div>
        `;
        const menuRoot = document.createElement('div');
        menuRoot.id = `menu-${random}`;
        menuRoot.innerHTML = html;
        document.body.appendChild(menuRoot);

        const style = `
#menu-${random} {
    position: absolute;
    width: 100%;
    box-sizing: border-box;
    top: 0;
    left: 0;
    line-height: 20px;
    display: flex;
    background: rgba(255, 255, 255, .2);
    box-shadow: 0 2px 4px rgba(255, 255, 255, .5);
    -webkit-backdrop-filter: blur(2px);
    backdrop-filter: blur(2px);
    padding: 0 4px;
    z-index: 999;
}

#menu-${random} button {
    border-radius: 4px;
    padding: 0 4px;
    margin: 0 4px;
    box-shadow: 0 2px 4px #ccc;
}

#menu-${random} select {
    max-width: 120px;
}

        `;
        const styleRoot = document.createElement('style');
        styleRoot.innerHTML = style;
        document.body.appendChild(styleRoot);

        const js = `
const select = document.querySelector('#sid-select-${random}');
select.addEventListener('change', e => {
    let sid = e.target.value;
    if (sid === '0') {
        sid = '';
    }
    if (sid === '-1') {
        clearStorage('sids');
        location.reload();
        return;
    }
    changeSearchQuery('sid', sid);
});

const wordSelect = document.querySelector('#word-select-${random}');
wordSelect.addEventListener('change', e => {
    let word = e.target.value;
    if (word === '-1') {
        clearStorage('words');
        location.reload();
        return;
    }
    if (word) {
        changeSearchQuery('${curWordKey}', word);
    }
});
        `;
        const scriptRoot = document.createElement('script');
        scriptRoot.innerHTML = js;
        document.body.appendChild(scriptRoot);
    }

    injectMenu();
})();
