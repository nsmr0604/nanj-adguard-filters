'use strict';
// 静的サイト(GitHub Pages)用: フィルタを取得して dist/ に書き出す
const fs = require("fs")
const path = require("path")
const { JSDOM } = require("jsdom")
const filters = require("./filters")

const out = path.resolve("dist")
fs.mkdirSync(out, { recursive: true })

async function main() {
    const pages = {}
    let failed = 0
    for (const [name, v] of Object.entries(filters)) {
        try {
            if (!pages[v.url]) {
                const res = await fetch(v.url)
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                pages[v.url] = new JSDOM(await res.text())
            }
            let body = null
            for (const p of pages[v.url].window.document.querySelectorAll("div#content > blockquote > p.quotation")) {
                const t = p.textContent
                if (t.indexOf('!') !== -1 && t.indexOf(v.title) !== -1) { body = t; break }
            }
            if (body === null) throw new Error(`filter not found: ${v.title}`)
            fs.writeFileSync(path.join(out, name), body)
            console.log(`ok ${name}`)
        } catch (e) {
            failed++
            console.error(`failed ${name}: ${e}`)
        }
    }
    const now = new Date(), y = now.getFullYear(), m = ('0' + (now.getMonth() + 1)).slice(-2)
    const url = `https://280blocker.net/files/280blocker_adblock_${y}${m}.txt`
    const links = [...Object.keys(filters)].map(n => `<li><a href="${n}">${n}</a></li>`).join("")
    fs.writeFileSync(path.join(out, "index.html"),
        `<!doctype html><meta charset="utf-8"><title>nanj-adguard-filters</title><ul>${links}<li><a href="${url}">280blocker_adblock.txt</a></li></ul>`)
    if (failed === Object.keys(filters).length) process.exit(1)
}
main()
