# Chat IA Engine — High Performance Stack

Sistema de Chat IA escalável e dinâmico, construído com arquitetura de microserviços integrada em um Monorepo profissional. O projeto utiliza Next.js 16 para uma interface de alta performance e FastAPI como motor de processamento de linguagem natural.

![Dashboard Preview](template.png)

![Next.js](https://img.shields.io/npm/v/next?style=for-the-badge&logo=next.js&logoColor=white&color=000000&label=next)
![TypeScript](https://img.shields.io/npm/v/typescript?style=for-the-badge&logo=typescript&logoColor=white&color=3178C6&label=typescript)
![Tailwind CSS](https://img.shields.io/npm/v/tailwindcss?style=for-the-badge&logo=tailwindcss&logoColor=white&color=06B6D4&label=tailwindcss)![TypeScript](https://img.shields.io/npm/v/typescript?style=for-the-badge&logo=typescript&logoColor=white&color=3178C6&label=typescript)
![Tailwind CSS](https://img.shields.io/npm/v/tailwindcss?style=for-the-badge&logo=tailwindcss&logoColor=white&color=06B6D4&label=tailwindcss)
![Prisma](https://img.shields.io/npm/v/prisma?style=for-the-badge&logo=prisma&logoColor=white&color=2D3748&label=prisma)
![Python](https://img.shields.io/badge/python-3.12+-3776AB?style=for-the-badge&logo=python&logoColor=white)

![Github Repo Size](https://img.shields.io/github/repo-size/LeonardoFirme/chat_ia?style=for-the-badge&logo=github&color=000000)
![Github License](https://img.shields.io/github/license/LeonardoFirme/chat_ia?style=for-the-badge&logo=github&color=000000)

![Dashboard Preview](page.png)

## 🚀 Tecnologias Core

### Frontend (Platform/SaaS)
- **Framework:** Next.js 16+ (App Router).
- **Estilização:** Tailwind CSS v4 (Standard Latest) com suporte nativo a Dark Mode (`dark:`).
- **Linguagem:** TypeScript (Tipagem estrita sem falhas).
- **ORM:** Prisma para persistência de dados em MySQL.
- **Segurança:** Proxy reverso (`proxy.ts`) para chamadas de API e autenticação via JWT.

### Backend (Engine)
- **Framework:** FastAPI (Python 3.12+).
- **LLM Provider:** Groq Cloud API (Llama 3.3 Engine).
- **Streaming:** Implementação de Server-Sent Events (SSE) para respostas em tempo real.

---



## 🛠️ Configuração do Ambiente

### 1. Pré-requisitos
- Node.js 20+ / npm.
- Python 3.12+.
- MySQL Server ativo.

### 2. Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto (ou dentro de `frontend/`) seguindo o modelo:
```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/chatbot-py"
JWT_SECRET="sua_chave_secreta_jwt"
NEXT_PUBLIC_API_URL="http://localhost:8000"
GROQ_API_KEY="gsk_sua_chave_aqui"

```

### 3. Instalação e Banco de Dados

```bash
# Instalação das dependências do Frontend
cd frontend
npm install

# Configuração do Banco de Dados
npx prisma generate
npx prisma migrate dev --name init

```

### 4. Motor de IA (Python)

```bash
# Instalação das dependências do Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

```

---

## 💻 Execução

Para rodar o projeto em ambiente de desenvolvimento:

1. **Iniciar Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --port 8000 --reload

```


2. **Iniciar Frontend:**
```bash
cd frontend
npm run dev

```



---

## 🎨 Padrões de Interface

A estrutura segue um layout minimalista rigoroso:

* **Light Mode:** Títulos em `text-gray-800`, fundos `bg-white`, bordas `border-gray-200`.
* **Dark Mode:** Títulos em `text-gray-50`, fundos `bg-gray-950`, bordas `border-gray-800`.
* **Botões:** `bg-gray-800` (Light) / `bg-gray-50` (Dark) com transições suaves de hover.

---

## 🔒 Segurança e Dados

* **Deleção de Conta:** O sistema permite a exclusão permanente do usuário e todas as suas threads via transação atômica no banco de dados.
* **Middleware:** Substituído por arquitetura de `proxy.ts` dentro de `src/` para compatibilidade com Next.js 16.

---

**Autor:**

[![Leonardo Firme](https://img.shields.io/badge/Leonardo_Firme-fff1f0?style=for-the-badge&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAtGVYSWZJSSoACAAAAAYAEgEDAAEAAAABAAAAGgEFAAEAAABWAAAAGwEFAAEAAABeAAAAKAEDAAEAAAACAAAAEwIDAAEAAAABAAAAaYcEAAEAAABmAAAAAAAAADAAAAABAAAAMAAAAAEAAAAGAACQBwAEAAAAMDIxMAGRBwAEAAAAAQIDAACgBwAEAAAAMDEwMAGgAwABAAAA//8AAAKgBAABAAAAFAAAAAOgBAABAAAAFAAAAAAAAABI3lMXAAAACXBIWXMAAAdiAAAHYgE4epnbAAAFTmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDI2LTAyLTI0PC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkRhdGE+eyZxdW90O2RvYyZxdW90OzomcXVvdDtEQUhDUDFxOFZJbyZxdW90OywmcXVvdDt1c2VyJnF1b3Q7OiZxdW90O1VBRGVpdFlhb0RJJnF1b3Q7LCZxdW90O2JyYW5kJnF1b3Q7OiZxdW90O0VRVUlQRSBQUklNRSAyLjAmcXVvdDt9PC9BdHRyaWI6RGF0YT4KICAgICA8QXR0cmliOkV4dElkPjc0NjJmMDZkLWNlMjYtNDgyNS04NmVjLTRmM2ZjMTYyYzAxMjwvQXR0cmliOkV4dElkPgogICAgIDxBdHRyaWI6RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz5MZW9uYXJkbyBGaXJtZSAtIDE8L3JkZjpsaT4KICAgPC9yZGY6QWx0PgogIDwvZGM6dGl0bGU+CiA8L3JkZjpEZXNjcmlwdGlvbj4KCiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0nJwogIHhtbG5zOnBkZj0naHR0cDovL25zLmFkb2JlLmNvbS9wZGYvMS4zLyc+CiAgPHBkZjpBdXRob3I+TGVvbmFyZG8gRmlybWU8L3BkZjpBdXRob3I+CiA8L3JkZjpEZXNjcmlwdGlvbj4KCiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0nJwogIHhtbG5zOnhtcD0naHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyc+CiAgPHhtcDpDcmVhdG9yVG9vbD5DYW52YSBkb2M9REFIQ1AxcThWSW8gdXNlcj1VQURlaXRZYW9ESSBicmFuZD1FUVVJUEUgUFJJTUUgMi4wPC94bXA6Q3JlYXRvclRvb2w+CiA8L3JkZjpEZXNjcmlwdGlvbj4KPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KPD94cGFja2V0IGVuZD0ncic/PmClpIcAAAONSURBVDiNjZRbbxw1FMenTYEiWkUUVEhKGyXtzoyvMx7PJtuFdgARpaRcWiBtUlHSZFOgNyF4gCIhRUIgQAKeEDwhBI/9EnwBHnlH6lsVLrtje7z7wmDPZVm1acEv67U9P//POf9jx6mGnnWn09DtiMB7Juf8PruWb27udG4buePsqNcVY5Pd0G3mm87Oam/MyRNnl4y8BRnC1b8one5if14R/7Km7nQNuBOa75AULejQ3xABOJNS95IKGgeKzX4TXheh/90vTqnKjpsQ7tMB+LEfwtfs/xtLzlgNzpNkt4rIVzIEi8MLZvi4IuDzPseLjg7Q05LC65K6nRQ0jmdHwZQO3Q1B3WdFAK9stb29ldIirC6DRzKOv8mYvzygPs4pfahLvYWMwQ/6jLzr/Mn5eBaj8zl07lfMf0Vz8KXyvEn7sYzQC2mAniyARqX93YqJp+boq7mJSAbwolH2mcCYCkr3G87ZQnJG/JUBJ6SAcLgquT9Rzv0JycD6qMItjv1Bi5wr1MZkRjP8VrFvz8Z4rQD2wrAhGVwr56itOHi5zo9dV4Q8Uf8XR+l+U8APf280DkjOJwaMLheiKFoWAT4zrKJJcqfX9B/5FUITOn47n5raXViDgznF0ItFcZyyOBlCBwUFZxXx3tER+tqEfkEQ8FzBqkNJQz/ph+D54jZOltQc4UUonrdXRuSiPZdxeEjHYF1ytCEAQIqCOR15F/KnyMP27GbFKkvPZ8YVR5fs/I8YHbSK672BvYDBq4LDlQzyQ7cg3KOMpTRzTxRmrk09hFVOz0J/RYYosHMdwTfr3PU5el8F/vcWNPzGNETG0Q+a42ulC5ZGgFUetfGYjsvipBE4Jrg/n7e9yWwWnbdFEBS+123i2LanNF1icvtxl6PDo4w7oTZfLbjvZqv1YI/hNR3TddMBfnlmaUzE+AvVDE4b7z1mcvnGtrBRn6UxTnrcP1n6EHUUp5/WZ9KEPyoZLnwpYrrcZV58V+C/xTF9GaHLZe7wKeP+9hDIwSk1S1pWvWnBq3Xu7zpuVJUSpoUsqBfj9d/MY2DXbiVwj4jhlVI5WMxmybHRyLZXV0nfarNJxfFPVk29Jziet0Uq5gxe+/vEkQfuqe52qDH3R3Uuf06SXVmMX5cQPm7C7qQMHP9PdduB0wifFiE8JwN80jxP35rHYlVgl45e/P+B1TOvETqsI/yJ6duXavPeC/YPs8xznmb7DmIAAAAASUVORK5CYII=&logoColor=white)](https://github.com/LeonardoFirme)

---