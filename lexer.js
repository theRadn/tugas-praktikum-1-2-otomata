const MULTI_CHAR_OPS = ['==', '++', '--', '||', '&&', '===', '!==', '+=', '-=', '*=', '/=', '%=', '!='];

const LANGUAGE_KEYWORDS = {
    javascript: new Set([
        "if", "else", "function", "return", "let", "const", "var", "true", "false",
        "null", "undefined", "for", "while", "do", "switch", "case", "break",
        "continue", "try", "catch", "finally", "throw", "class", "extends",
        "import", "export", "await", "async", "typeof", "instanceof", "this", "new"
    ]),
    python: new Set([
        "if", "else", "elif", "def", "return", "class", "True", "False", "None",
        "for", "while", "break", "continue", "import", "from", "as", "try",
        "except", "finally", "raise", "with", "lambda", "yield", "async", "await",
        "in", "is", "and", "or", "not", "pass", "del", "global", "nonlocal"
    ]),
    java: new Set([
        "if", "else", "public", "static", "void", "return", "class", "interface",
        "extends", "implements", "package", "import", "new", "this", "super",
        "for", "while", "do", "switch", "case", "break", "continue", "try",
        "catch", "finally", "throw", "throws", "private", "protected", "final",
        "abstract", "synchronized", "volatile", "transient", "instanceof", "enum"
    ]),
    cpp: new Set([
        "if", "else", "int", "include", "return", "namespace", "using", "class",
        "struct", "template", "typename", "public", "private", "protected",
        "virtual", "override", "const", "static", "extern", "inline", "auto",
        "new", "delete", "this", "friend", "operator", "try", "catch", "throw",
        "bool", "char", "float", "double", "void", "switch", "case", "break"
    ]),
    c: new Set([
        "if", "else", "switch", "case", "struct", "typedef", "return", "void",
        "int", "char", "float", "double", "sizeof", "static", "extern", "const",
        "volatile", "register", "auto", "break", "continue", "do", "while",
        "for", "goto", "if", "enum", "union", "signed", "unsigned", "long", "short"
    ]),
    ruby: new Set([
        "if", "else", "elsif", "def", "end", "return", "module", "class", "self",
        "yield", "super", "begin", "rescue", "ensure", "nil", "true", "false",
        "and", "or", "not", "unless", "until", "while", "for", "do", "next",
        "break", "retry", "redo", "alias", "undef", "defined?"
    ]),
    go: new Set([
        "if", "else", "func", "package", "import", "chan", "range", "type",
        "struct", "interface", "map", "var", "const", "return", "defer", "go",
        "select", "switch", "case", "default", "fallthrough", "for", "break",
        "continue", "goto", "bool", "string", "error", "nil", "true", "false"
    ])
};

const MATH_FUNCTIONS = new Set([
    "abs", "acos", "asin", "atan", "atan2", "ceil", "cos", "cosh", 
    "exp", "floor", "log", "log10", "max", "min", "pow", "random", 
    "round", "sin", "sinh", "sqrt", "tan", "tanh", "trunc"
]);

const select = document.getElementById('langSelect');
select.innerHTML = '';
Object.keys(LANGUAGE_KEYWORDS).forEach(lang => {
    const option = document.createElement('option');
    option.value = lang;
    option.textContent = lang === 'cpp' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1);
    select.appendChild(option);
});

const lexer = (input, language = 'javascript') => {
    const tokens = [];
    const keywords = LANGUAGE_KEYWORDS[language] || {};
    let i = 0;

    while (i < input.length) {
        const char = input[i];

        if (char === ' ' || char === '\n' || char === '\t') {
            i++;
            continue;
        }

        if (char >= '0' && char <= '9') {
            let num = "";
            let isFloat = false;

            while (i < input.length) {
                const current = input[i];
                const next = input[i + 1];

                if (current >= '0' && current <= '9') {
                    num += current;
                    i++;
                } else if (current === '.' && next >= '0' && next <= '9') { // Only consume the dot if it's followed by a number (Float)
                    if (isFloat) break; 
                    isFloat = true;
                    num += current;
                    i++;
                } else { // It's a dot followed by a letter (Method) or something else // Leave it for the "singular dot" if-statement to catch
                    break;
                }
            }

            tokens.push({ type: 'NUMBER', value: parseFloat(num), isFloat: isFloat });
            continue;
        }

        if ("+-*/=|&!^%".includes(char)) {
            let three = input.slice(i, i + 3);
            let two = input.slice(i, i + 2);

            if (MULTI_CHAR_OPS.includes(three)) {
                tokens.push({ type: 'OPERATOR', value: three });
                i += 3;
            } else if (MULTI_CHAR_OPS.includes(two)) {
                tokens.push({ type: 'OPERATOR', value: two });
                i += 2;
            } else {
                tokens.push({ type: 'OPERATOR', value: input[i] });
                i += 1;
            }
            continue;
        }

        if ("({[".includes(char)) {
            tokens.push({ type: 'OPEN_PAREN', value: char });
            i++;
            continue;
        }

        if (")}]".includes(char)) {
            tokens.push({ type: 'CLOSE_PAREN', value: char });
            i++;
            continue;
        }

        if (";".includes(char)) {
            tokens.push({ type: 'SEMICOLON', value: char });
            i++;
            continue;
        }

        if (char === '.') {
            tokens.push({ type: 'DOT', value: char });
            i++;
            continue;
        }

        if (char === ',') {
            tokens.push({ type: 'COMMA', value: char });
            i++;
            continue;
        }

        if (char === ':') {
            tokens.push({ type: 'COLON', value: char });
            i++;
            continue;
        }

        if ("<>".includes(char)) {
            let comparison = char;
            if (i + 1 < input.length && input[i + 1] === '=') {
                comparison += '=';
                i += 2;
            } else {
                i++;
            }
            tokens.push({ type: 'COMPARISON', value: comparison });
            continue;
        }

        if ("@#$%^&~`".includes(char)) {
            tokens.push({ type: 'SYMBOL', value: char });
            i++;
            continue;
        }

        if (char === '"' || char === "'") {
            let str = "";
            i++; // Skip the opening quote
            while (i < input.length && input[i] !== char) {
                str += input[i];
                i++;
            }
            i++; // Skip the closing quote
            tokens.push({ type: 'STRING', value: `"${str}"` });
            continue;
        }

        if ("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_".includes(char)) {
            let identifier = "";
            while (i < input.length && ("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-".includes(input[i]) || (input[i] >= '0' && input[i] <= '9'))) {
                identifier += input[i];
                i++;
            }
            if (keywords.has(identifier)) {
                tokens.push({ type: 'KEYWORD', value: identifier });
            } else if (MATH_FUNCTIONS.has(identifier)) {
                tokens.push({ type: 'MATH_FUNCTION', value: identifier });
            } else {
                tokens.push({ type: 'IDENTIFIER', value: identifier });
            }
            continue;
        }

        tokens.push({ type: 'UNKNOWN', value: char });
        i++;
        


    }
    return tokens;
}

const editor = document.getElementById('editor');
const output = document.getElementById('tokenOutput');
const langSelect = document.getElementById('langSelect');
const fileInput = document.getElementById('fileInput');
const submitBtn = document.getElementById('runLexer');

function runLexer() {
    const code = editor.value;
    output.innerHTML = '';
    if (!code.trim()) return;

    try {
        const tokens = lexer(code, langSelect.value);
        tokens.forEach(t => {
            const badge = document.createElement('div');
            badge.className = 'token-badge';
            badge.setAttribute('data-type', t.type);
            
            badge.innerHTML = `
                <span class="token-type">${t.type}</span>
                <span class="token-value">${t.value}</span>
            `;
            output.appendChild(badge);
        });
    } catch (e) {
        output.innerHTML = `<div style="color: #f44336; padding: 20px; border: 1px solid #f44336; border-radius: 4px; background: #2d1a1a;">
            <strong>Lexical Error:</strong> ${e.message}
        </div>`;
    }
}

submitBtn.addEventListener('click', runLexer);

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        editor.value = e.target.result;
        runLexer();
    };
    reader.readAsText(file);
});
