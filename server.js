'use strict';
require('dotenv').config()
const express = require("express")
const request = require("request")
const log4js = require("log4js")
const errorhandler = require("errorhandler")
const fs = require("fs")
const tmp = require("tmp")
const path = require("path")
const helmet = require("helmet")
const filtersNanjWiki = require("./filters")
const {
  JSDOM
} = require("jsdom")

log4js.configure({
    appenders: {
	    access: { type: 'console' },
    },
    categories: {
    	default: { appenders: [ 'access' ], level: process.env.debug ? 'debug' : 'info' },
    }
})
const logger = log4js.getLogger()
const app = express()
app.use(helmet())
app.use(log4js.connectLogger(logger))
app.use(errorhandler())

function getNanjWiki(nanjWikiUrl, savePath, filterTitle) {
    return new Promise((resolve, reject) => {
        request(nanjWikiUrl, (e, r, body) => {
                if(e) {
                    return reject(e)
                }
                if(r.statusCode !== 200) {
                    return reject(`unexpected response ${r.statusText}`)
                }
                const dom = new JSDOM(body)
                for(const data of dom.window.document.querySelectorAll("div#content > blockquote > p.quotation")) {
                    const filterBody = data.textContent
                    if(filterBody.indexOf('!') === -1) {
                        continue
                    }
                    if(filterBody.indexOf(filterTitle) === -1) {
                        continue
                    }
                    const savePathTmp = path.resolve(path.dirname(savePath), path.basename(tmp.tmpNameSync()))
                    try {
                        fs.writeFileSync(savePathTmp, filterBody)
                        fs.renameSync(savePathTmp, savePath)
                    }
                    catch(e) {
                        return reject(e)
                    }
                    return resolve(filterBody)
                }
                return reject(`filter not found: ${filterTitle}`)
        })
    }).catch(e => {
        logger.error(e)
        try {
            return Promise.resolve(fs.readFileSync(savePath))
        }
        catch(e) {
            return Promise.reject(e)
        }
    }).catch (e => {
        logger.fatal(e)
    })
}

app.get("/healthz", (req, res) => {
    res.status(200).send("");
})

for(const [ k, v ] of Object.entries(filtersNanjWiki)) {
    const routePath = "/" + k
    const savePath = path.resolve("CACHE_" + k)
    app.get(routePath, (req, res) => {
        getNanjWiki(v['url'], savePath, v['title']).then((filterBody) => {
            logger.debug('GET ' + routePath)
            res.send(filterBody)
        }).catch(() => {
            res.status(400)
        })
    });
}

app.get("/280blocker_adblock.txt", (request, response) => {
    const now = new Date(), y = now.getFullYear(), m = ('0' + (now.getMonth() + 1)).slice(-2)
    logger.debug('GET /280blocker_adblock.txt')
    response.redirect(`https://280blocker.net/files/280blocker_adblock_${y}${m}.txt`)
});

app.use((req, res, next) => {
    const error = new Error('Cannot ' + req.method + ' ' + req.path);
    error.status = 404;
    next(error);
})

const listener = app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
    console.log("Your app is listening on port " + listener.address().port)
});
