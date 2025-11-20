#!/bin/sh
set -e

# Lista arquivos adicionados/modificados no commit
FILES=$(git diff --cached --name-only --diff-filter=AM)

# 1️⃣ Bloquear extensões proibidas
if echo "$FILES" | grep -qE '(\.env|\.pem|\.key|\.crt|\.p12|\.keystore)$'; then
  echo "❌ Você está tentando commitar arquivos sensíveis (.env, .pem, .key, .crt...)!"
  exit 1
fi

# 2️⃣ Buscar padrões suspeitos em arquivos de código
for file in $FILES; do
  if [ -f "$file" ] && echo "$file" | grep -qE '\.(js|ts|tsx|jsx|json)$'; then
    if git diff --cached "$file" | grep -qEI --color=never '(\+.*(API_KEY|SECRET|AWS_SECRET|BEGIN PRIVATE KEY|sk_live_|ghp_))'; then
      echo "❌ Possível chave/segredo encontrado no arquivo: $file"
      exit 1
    fi
  fi
done

echo "✅ Nenhum segredo detectado, commit liberado!"
exit 0