Array.prototype.empty_or = function(value) {
  if (this.length == 0) {
    return value;
  }

  return this;
}

class CodeBlock {
  constructor() {
    this.syntax = {};
    this.value  = "";
    this.parsed = [];
  }

  update() {
    this.parsed = this.parse();    
  }

  parse() {
    return CodeBlock.parse(this.value, this.syntax);
  }

  get innerHTML() { 
    return (
      this.parsed
      .join("")
      .trim()
      .replace(/\n/gm, "</br>")
      );
  }
  
  /**
   * 
   * @param {string} text 
   * @param {{syntax:{match:RegExp, style: String}[]}} options 
   */
  static parse(text, options) {
    var
      result = [],
      match, left, right;

    for (const syntax of options.syntax) {
      match = [...text.matchAll(
        (syntax.word != false) 
          ? (new RegExp(syntax.match.source+"[\\s$]", syntax.match.flags))
          : syntax.match
        )][0];
      
      if (!match) continue;
      
      left  = text.slice(0, 
        (match[1] != (void 0)) ? 
          (match.index + match[0].length - match[1].length)
          : match.index
        );
      right = text.slice(match.index + match[0].length);
      
      result.push(
        this.parse(left, options).empty_or(left),
        `<span style="color:${options.colors[syntax.style]?.color??"while"}; font-style: ${options.colors[syntax.style]?.style??"normal"}; font-weight: ${options.colors[syntax.style]?.weight??"normal"}">${match?.at(1) ?? match.at(0)}</span>`, 
        this.parse(right, options).empty_or(right));
        
      return result.flat();
    }
    return result.flat();
  }
}

const js_syntax = {
  colors: {
    var_kw: {
      style: "italic",
      color:"hsl(42, 61%, 61%)"
    },
    varname: {
      style: "normal",
      color:"hsl(20, 80%, 60%)"
    }
  },
  syntax: [
    {
      word: false,
      match: /var\s+([\w_$][\d\w_$]*)/gm, //
      style: "varname"
    },
    { 
      match: /var/gm,
      style: "var_kw"
    },
  ]
};

class CodeBlockElement extends HTMLElement {
  constructor() {
    super();
    this.cb = new CodeBlock();
    this.cb.syntax = js_syntax;
    this.langname = "cpp";
  }
  
  connectedCallback() {
    let upd = () => {
      this.cb.value = this.innerHTML;
      this.cb.update();
      this.innerHTML = `<div class="lang">${this.getAttribute("lang") ?? ""}</div>`+this.cb.innerHTML;
    };

    upd();

    this.addEventListener("change", upd);
    // браузер вызывает этот метод при добавлении элемента в документ
    // (может вызываться много раз, если элемент многократно добавляется/удаляется)
  }

  disconnectedCallback() {
    // браузер вызывает этот метод при удалении элемента из документа
    // (может вызываться много раз, если элемент многократно добавляется/удаляется)
  }

  static get observedAttributes() {
    return [/* массив имён атрибутов для отслеживания их изменений */];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // вызывается при изменении одного из перечисленных выше атрибутов
  }

  adoptedCallback() {
    // вызывается, когда элемент перемещается в новый документ
    // (происходит в document.adoptNode, используется очень редко)
  }
}

window.addEventListener("load", () => {
  customElements.define("code-block", CodeBlockElement);
});