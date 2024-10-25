const express = require('express')
const app = express()
const port = 2005

const sqlite3 = require('sqlite3').verbose()

var db = new sqlite3.Database(
    './words.db')

var moment = require('moment')
time = moment().format('YYYY-MM-DD')

let revise_curve = {
    1 : 2,
    2 : 4,
    4 : 7,
    7 : 15,
    15 : 30,
    30 : 60
}

function update_revise_time() {
    yesterday = moment().subtract(1, 'days')
    yesterday_str = yesterday.format("YYYY-MM-DD")
    db.all("SELECT * FROM revise where time =?", [yesterday_str], (err, result) => {
        result.forEach((row) => {
            word_id = row['word_id']
            next_time = row['next_time']
            next_time_str = moment().subtract(1, 'day').add(next_time, 'days').format("YYYY-MM-DD")
            db.run("UPDATE revise SET time = ?, next_time = ? WHERE word_id =?", [next_time_str, revise_curve[next_time.toString()], word_id])
        })
    })
}

app.use(express.static('static'))
app.use(express.json()); // 用于解析JSON格式的POST请求
app.use(express.urlencoded({ extended: true })); // 用于解析URL编码的POST请求

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/unit', (req, res) => {
    db.all('select distinct words.unit from words', (err, rows) => {
        if (err) {
            return console.log(err.message)
        }
        units = rows
        res.send(units)
    })
})

app.post('/getword', (req, res) => {
    db.all('select words.* from words where unit = ?', [req.body["unit"]], (err, rows) => {
        if (err) {
            return console.log(err.message)
        }
        words = rows
        res.send(words)
    })
})

app.post('/getmeaning', (req, res) => {
    db.all("select id, pos, meaning_ch from meanings where word_id = ?", [req.body['word_id']], (err, rows) => {
        res.send(rows)
    })
})

app.post('/update_revise', (req, res) => {
    update_revise_time()
    res.send("ok")
})

app.listen(port, () => {})


