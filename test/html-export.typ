// html-export.typ
// Подключайте: #import "html-export.typ": *
// Компиляция: typst compile --features html input.typ output.html

// #import "@preview/html:0.1.0": html

// Math: заменяем на контейнеры для KaTeX (inline и block)
#show math.equation.where(block: false): it => {
  if target() == "html" {
    html.elem(
      "span",
      attr("class", "katex-inline")
    )[
      #raw("\\(" + repr(it) + "\\)")
    ]
  } else {q
    it
  }
}

#show math.equation.where(block: true): it => {
  if target() == "html" {
    html.elem(
      "div",
      attr("class", "katex-block")
    )[
      #raw("\\[" + repr(it) + "\\]")
    ]
  } else {
    it
  }
}

// Raw code: добавляем class=lang для highlight.js
#show raw.where(block: true): it => {
  if target() == "html" {
    let lang = if it.lang.len() > 0 { it.lang.first() } else { none }
    html.elem(
      "pre",
      attr("class", 
        if lang != none { "hljs language-" + str(lang) } else { "hljs" }
      )
    )[
      #it.body
    ]
  } else {
    it
  }
}

#show raw.where(block: false): it => {
  if target() == "html" {
    html.elem("code", attr("class", "hljs"))[ #it.body ]
  } else {
    it
  }
}