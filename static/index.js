let words = null
let sidebar = document.getElementsByClassName('sidebar')[0]
let update = document.getElementsByClassName('update')[0]
let command_line = document.getElementsByClassName('command_line')[0]
command_line.is_show = false
command_line.input = document.getElementsByClassName('command_line_input')[0]
let box = document.getElementsByClassName("box")[0]
let word = document.getElementsByClassName("word")[0]
let pronounce = document.getElementsByClassName("pron")[0]
let meanings = document.getElementsByClassName("meanings")[0]
let mark = document.getElementsByClassName("mark")[0]
let numerator = document.getElementsByClassName("numerator")[0]
let denominator = document.getElementsByClassName("denominator")[0]
let suspand = document.getElementsByClassName("suspand")[0]
mark.style.display = "none"

let index = 0

let interval = null
let is_interval_closed = true

function get_units() {
  fetch("/unit").
    then((response) => response.json()).
    then((data) => {
      console.log(typeof (data))
      console.log(data)
      show_units(data)
    })
}
get_units()

let backgroundColor = {}
backgroundColor.colors = ["red", "orange", "yellow", "green", "cyan", "blue", "purple"]
backgroundColor.index = 0
backgroundColor.top = () => {
  color = backgroundColor.colors[backgroundColor.index]
  backgroundColor.index = (backgroundColor.index + 1) % 7
  return color
}

function show_units(units) {
  units.forEach((unit) => {
    unit = unit['unit']
    console.log(unit)
    sidebar_item = document.createElement("div")
    sidebar_item.classList.add("sidebar_item")
    sidebar_item.innerHTML = unit
    sidebar_item.onclick = () => {
      getwords(unit)
    }
    // sidebar_item.onmouseleave = (event) => {
    //   event.target.style.backgroundColor = "white"
    // }
    // sidebar_item.onmouseover = (event) => {
    //   event.target.style.backgroundColor = backgroundColor.top()
    //   console.log(unit)
    // }
    sidebar.appendChild(sidebar_item)
  })

}


function shuffle(arr) {
  return arr
  //return arr.sort(() => Math.random() - 0.5);
}


function update_fraction() {
  numerator.innerHTML = index + 1
}

function show_word() {
  if (index == words.length) {
    index = 0
  }
  update_fraction()

  word.innerHTML = words[index]['word']
  pronounce.innerHTML = words[index]['phonetic']
  show_meanings()
}

function show_meaning(meaning) {
  meaning_div = document.createElement("div")
  pos = document.createElement("span")
  meaning_ch = document.createElement("span")
  meaning_div.classList.add("meaning")
  pos.classList.add("pos")
  meaning_ch.classList.add("meaning_ch")

  pos.innerHTML = meaning['part_of_speech']
  meaning_ch.innerHTML = meaning['definitions']
  meaning_div.appendChild(pos)
  meaning_div.appendChild(meaning_ch)
  meanings.appendChild(meaning_div)
}

function show_meanings() {
  meanings.innerHTML = ""
  console.log(words[index]['definitions_list'])
  definitions_list = JSON.parse(words[index]['definitions_list'])
  console.log(typeof (definitions_list))
  definitions_list.forEach(show_meaning)
  index = index + 1
}


function getwords(unit) {
  fetch("/getword", {
    method: 'POST',
    body: JSON.stringify({ 'unit': unit }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).
    then((response) => response.json()).
    then((data) => {
      words = shuffle(data)
      denominator.innerHTML = words.length
      index = 0
    }).
    then(show_word)
}


update.onclick = () => {
  fetch("/update_revise", {
    method: 'POST',
    body: JSON.stringify({ 'word_id': words[index]['id'] }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).
    then((response) => {
      fetch("/getword").
        then((response) => response.json()).
        then((data) => {
          words = shuffle(data)
          denominator.innerHTML = words.length
          index = 0
        }).
        then(show_word)
    })
}

suspand.style.right = -(suspand.offsetWidth + 5) + 'px'
suspand.is_show = true
suspand.show = () => {
  if (suspand.is_show) {
    suspand.style.right = -(suspand.offsetWidth + 5) + 'px'
    suspand.is_show = false
  }
  else {
    suspand.style.right = '10px'
    suspand.is_show = true
  }
}

startInterval = () => {
  interval = setInterval(show_word, 3000)
  is_interval_closed = false
  // suspand.style.display = 'none'
  if (suspand.is_show) {
    suspand.show()
  }
}

closeInterval = () => {
  clearInterval(interval)
  is_interval_closed = true;
  // suspand.style.display = 'flex'
  if (!suspand.is_show) {
    suspand.show()
  }
}

box.onclick = () => {
  if (mark.style.display === "none") {
    mark.style.display = "block"
  }
  else {
    mark.style.display = "none"
  }
}

suspand.onclick = () => {
  startInterval()
}

startInterval()

// 处理触摸事件
let startX, startY; // 定义开始触摸的坐标

// 处理触摸开始事件
function handleTouchStart(event) {
  let touchobj = event.changedTouches[0]; // 获取第一个触摸点
  startX = touchobj.clientX; // 触摸开始的X坐标
  startY = touchobj.clientY; // 触摸开始的Y坐标
}

// 处理触摸结束事件
function handleTouchEnd(event) {
  let touchobj = event.changedTouches[0]; // 获取第一个触摸点
  let x2 = touchobj.clientX; // 触摸结束的X坐标
  let y2 = touchobj.clientY; // 触摸结束的Y坐标

  let diffX = x2 - startX; // X坐标的变化量
  let diffY = y2 - startY; // Y坐标的变化量

  // if (Math.abs(diffX) < 20 && Math.abs(diffY) < 20) {
  //   if (suspand.is_show) {
  //     startInterval()
  //   }
  //   else {
  //     closeInterval()
  //   }
  // }

  // 判断滑动方向
  if (Math.abs(diffX) > Math.abs(diffY)) {
    // 横向滑动
    if (diffX > 0) {
      // 左滑
      closeInterval()
      index = index - 2
      if (index < 0) {
        index = words.length - 1
      }
      show_word(); // 更新内容
    } else {
      // 右滑
      closeInterval()
      show_word()
    }
  }
}

// 绑定触摸事件
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchend', handleTouchEnd, false);

document.addEventListener(
  "keypress",
  (event) => {
    const keyname = event.key;

    if (keyname === ":") {
      command_line.style.top = '0'
      command_line.is_show = true
      command_line.input.focus()
    }

    if (keyname === "Enter" && document.activeElement == command_line.input) {
      word = command_line.input.value.slice(1, command_line.input.value.length)
    }

    if (keyname === "[" && event.ctrlKey) {
      if (document.activeElement === command_line.input) {
        command_line.style.top = '-7vh'
        command_line.is_show = false
        command_line.input.value = ''
      }
    }

    if (document.activeElement !== command_line.input) {
      if (keyname === "l") {
        closeInterval()
        show_word()
      }

      if (keyname === "h") {
        closeInterval()
        index = index - 2
        if (index < 0) {
          index = words.length - 1
        }
        show_word()
      }

      if (keyname === "m") {
        if (mark.style.display === "none") {
          mark.style.display = "block"
        }
        else {
          mark.style.display = "none"
        }
      }

      if (keyname === " ") {
        if (is_interval_closed) {
          startInterval()
        }
        else {
          closeInterval()
        }
      }
    }
  },
  false
)

