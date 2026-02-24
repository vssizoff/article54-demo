//#import "html-export.typ"

#show math.equation.where(block: false): it => {
  if target() == "html" {
    html.elem("span", attrs: (role: "math"), html.frame(it))
  } else {
    it
  }
}

#show math.equation.where(block: true): it => {
  if target() == "html" {
    html.elem("figure", attrs: (role: "math"), html.frame(it))
  } else {
    it
  }
}

// --- Код → элементы для highlight.js ---

// Все блочные raw-блоки
#show raw.where(block: true): it => {
  if target() == "html" {
    let lang-name = if it.lang.len() > 0 {
      it.lang.at(0)
    } else {
      none
    }

    html.elem(
      "pre",
      attrs: (
        class: if lang-name == none {
          "hljs"
        } else {
        "hljs language-" + it.lang
      },
    ),
      html.elem(
        "code",
        it.text,
      ),
    )
  } else {
    it
  }
}

= Заголовок

Обычный текст с inline math $a^2 + b^2 = c^2$ и блоком:

$ a^2 + b^2 = c^2 $

$ sum_(i=0)^n a_i = 2^(1+i) $

```typescript
let x: number = 1;
console.log(x);
```