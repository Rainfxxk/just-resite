const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// 获取命令行参数中的文件名
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log('Please provide the JSON file name as a command line argument.');
  process.exit(1);
}

const jsonFileName = args[0];
const dbFilePath = path.resolve(__dirname, 'words.db');
const jsonFilePath = path.resolve(__dirname, jsonFileName);

const db = new sqlite3.Database(dbFilePath);

db.run(`CREATE TABLE IF NOT EXISTS words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word TEXT NOT NULL,
    phonetic TEXT,
    definitions_list TEXT,
    unit TEXT
  )`, function (err) {
  if (err) {
    return console.log(err.message);
  }
  console.log("Table created successfully");
});

// 读取 JSON 文件
fs.readFile(jsonFilePath, 'utf8', function (err, data) {
  if (err) {
    return console.log(err.message);
  }
  const wordsData = JSON.parse(data);
  console.log(wordsData)

  // 插入数据
  const insertStmt = db.prepare(`INSERT INTO words (word, phonetic, definitions_list, unit) VALUES (?, ?, ?, ?)`);

  wordsData.words.forEach(word => {
    insertStmt.run([
      word.word,
      word.phonetic,
      JSON.stringify(word.definitions_list), // 将数组转换为字符串存储
      jsonFileName  // 使用文件名作为 unit 字段的值
    ]);
  });

  insertStmt.finalize();


  db.all(`SELECT * FROM words`, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Words in the database:");
    console.log(rows);
  });

  db.close()
})

