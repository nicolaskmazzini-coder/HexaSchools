# HexaSchools

Gestão institucional (escolas, membros, turmas) separada da plataforma de cursos [Hexavante](https://github.com/nicolaskmazzini-coder/Hexavante-Project).

## Stack

- Next.js 16, Auth.js v5, Prisma 6, MariaDB/MySQL, Tailwind CSS 4

## Desenvolvimento

```bash
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

Aplicação em **http://localhost:3001**. Configure `NEXT_PUBLIC_HEXAVANTE_URL` apontando para o Hexavante (padrão: `http://localhost:3000`).

## Integração com Hexavante

Cursos institucionais podem vincular um **slug** de curso publicado no Hexavante (`platformCourseSlug`). Alunos acessam o conteúdo diretamente na plataforma Hexavante.

## Contas demo (seed)

| Conta | Senha |
|-------|-------|
| diretor@hexaschools.com | Diretor123! |
| professor@hexaschools.com | Professor123! |
| aluno@hexaschools.com | Aluno123! |
