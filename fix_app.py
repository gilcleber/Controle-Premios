import re

# Ler o arquivo
with open(r'c:\Users\Gil Cleber\Desktop\GIL CLEBER\Controle-Premios-main\App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Padrão antigo (com escape de barras)
old_pattern = r"const path = window\.location\.pathname;\s*const radioMatch = path\.match\(/\^\\\/radio\\\/\(\[\^\\\/\]\+\)/\);\s*if \(radioMatch\) \{\s*setRadioSlug\(radioMatch\[1\]\);\s*setIsRadioMode\(true\);\s*\}"

# Novo código
new_code = """const params = new URLSearchParams(window.location.search);
    const radioParam = params.get('radio');
    
    if (radioParam) {
      setRadioSlug(radioParam);
      setIsRadioMode(true);
    }"""

# Substituir
content = re.sub(old_pattern, new_code, content, flags=re.DOTALL)

# Salvar
with open(r'c:\Users\Gil Cleber\Desktop\GIL CLEBER\Controle-Premios-main\App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Arquivo atualizado com sucesso!")
