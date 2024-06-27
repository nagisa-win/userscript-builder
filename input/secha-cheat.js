// ==UserScript==
// @name         找色差作弊
// @namespace    http://tampermonkey.net/
// @version      2024-06-18
// @description  try to take over the world!
// @author       You
// @match        https://www.shj.work/tools/secha/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=shj.work
// @grant        none
// ==/UserScript==

(function() {
    const blocks = '#box > span';

    function findUnique(arr) {
        let pre, cur;
        for (const i in arr) {
            const v = arr[i];
            if (pre && cur && pre !== cur) {
                if (v !== pre) return +i - 2;
                if (v !== cur) return +i - 1;
            }
            pre = cur;
            cur = v;
        }
    }

    const intr = setInterval(() => {
        if (document.querySelectorAll(blocks).length) {
            clearTimeout(intr);
            start();
        }
    }, 500);

    function start() {
        const doms = document.querySelectorAll(blocks);
        const colors = [];
        doms.forEach(b => {
            b.style.backgroundColor && colors.push(b.style.backgroundColor);
        });

        const diff = findUnique(colors);
        const dom = doms[diff];
        if (dom) {
            dom.style.border = '10px solid yellow';
        }
        setTimeout(() => {
            start();
        }, 10);
    }
})();