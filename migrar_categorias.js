// migrar_categorias.js
//
// Roda UMA VEZ para pré-calcular "category" e "title_lang" de todos os
// filmes direto no banco Turso — a mesma lógica que antes rodava no
// navegador (getCategory / detectLanguageFromTitle do app.js antigo),
// só que agora grava o resultado como colunas, para a Worker poder
// filtrar/ordenar por elas via SQL.
//
// USO (dentro da pasta Worker\, no PowerShell):
//   npm install @libsql/client   (se ainda não tiver)
//   $env:TURSO_URL="libsql://...."
//   $env:TURSO_AUTH_TOKEN="...."
//   node migrar_categorias.js

import { createClient } from "@libsql/client";

const TURSO_URL = process.env.TURSO_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_AUTH_TOKEN) {
    console.error("Defina as variáveis de ambiente TURSO_URL e TURSO_AUTH_TOKEN antes de rodar.");
    console.error('Exemplo (PowerShell): $env:TURSO_URL="libsql://..."');
    process.exit(1);
}

const client = createClient({ url: TURSO_URL, authToken: TURSO_AUTH_TOKEN });

// ── Mesma lógica do app.js original (getCategory) ──────────────────────
function getCategory(title, channel) {
    title = (title || "").toLowerCase();

    if (
        title.includes("ação") || title.includes("acao") || title.includes("aventura") ||
        title.includes("action") || title.includes("faroeste") || title.includes("guerra") ||
        title.includes("luta") || title.includes("mestre") || title.includes("combate") ||
        title.includes("policial") || title.includes("crime") || title.includes("tropa de elite") ||
        title.includes("vingança") || title.includes("vinganca")
    ) return "action";

    if (
        title.includes("comédia") || title.includes("comedia") || title.includes("comedy") ||
        title.includes("funny") || title.includes("humor") || title.includes("desenho") ||
        title.includes("animação") || title.includes("animacao")
    ) return "comedy";

    if (
        title.includes("terror") || title.includes("suspense") || title.includes("horror") ||
        title.includes("thriller") || title.includes("medo") || title.includes("premonição") ||
        title.includes("premonicao") || title.includes("misterio") || title.includes("mistério")
    ) return "horror";

    if (
        title.includes("ficção") || title.includes("ficcao") || title.includes("sci-fi") ||
        title.includes("sci fi") || title.includes("scifi") || title.includes("fantasia") ||
        title.includes("alien") || title.includes("espacial") || title.includes("magia") ||
        title.includes("futuro")
    ) return "scifi";

    if (
        title.includes("documentário") || title.includes("documentario") || title.includes("doc") ||
        title.includes("história real") || title.includes("biografia")
    ) return "documentary";

    return "other";
}

// ── Mesma lógica do app.js original (detectLanguageFromTitle) ──────────
function detectLanguageFromTitle(title) {
    if (!title) return "original";
    title = title.toLowerCase();

    if (title.includes("dublado") || title.includes("pt-br") || title.includes("português") || title.includes("legendado pt") || title.includes("brasileiro")) return "pt";
    if (title.includes("español") || title.includes("latino") || title.includes("castellano") || title.includes("pelicula") || title.includes("película")) return "es";
    if (title.includes("italiano") || title.includes("film completo i")) return "it";
    if (title.includes("français") || title.includes("film complet e") || title.includes("vostfr") || title.includes(" vf")) return "fr";
    if (title.includes("english") || title.includes("full movie") || title.includes("subbed")) return "en";
    if (title.includes("türkçe") || title.includes("dublaj") || title.includes("tek parça")) return "tr";
    if (title.includes("hindi") || title.includes("dubbed h")) return "hi";
    if (title.includes("日本語") || title.includes("映画")) return "ja";
    if (title.includes("中文") || title.includes("完整版")) return "zh";
    if (title.includes("deutsch") || title.includes("ganzer film")) return "de";
    if (title.includes("русский") || title.includes("фильм")) return "ru";

    return "original";
}

const BATCH_SIZE = 500; // filmes processados por leva (transação em lote)

async function garantirColunas() {
    console.log("Verificando/criando colunas category e title_lang...");
    const schema = await client.execute("PRAGMA table_info(filmes)");
    const colunas = schema.rows.map((r) => r.name);

    if (!colunas.includes("category")) {
        await client.execute("ALTER TABLE filmes ADD COLUMN category TEXT");
        console.log("  + coluna category criada");
    }
    if (!colunas.includes("title_lang")) {
        await client.execute("ALTER TABLE filmes ADD COLUMN title_lang TEXT");
        console.log("  + coluna title_lang criada");
    }
}

async function contarTotal() {
    const r = await client.execute("SELECT COUNT(*) as total FROM filmes");
    return Number(r.rows[0].total);
}

async function migrar() {
    await garantirColunas();
    const total = await contarTotal();
    console.log(`Total de filmes: ${total}`);

    let processados = 0;
    let ultimoId = "";

    while (true) {
        // Pagina por id (rowid textual) para não usar OFFSET gigante, que
        // fica cada vez mais lento conforme cresce.
        const pagina = await client.execute({
            sql: `SELECT id, title, channel FROM filmes WHERE id > ? ORDER BY id LIMIT ?`,
            args: [ultimoId, BATCH_SIZE],
        });

        if (pagina.rows.length === 0) break;

        const statements = pagina.rows.map((row) => ({
            sql: "UPDATE filmes SET category = ?, title_lang = ? WHERE id = ?",
            args: [getCategory(row.title, row.channel), detectLanguageFromTitle(row.title), row.id],
        }));

        await client.batch(statements, "write");

        processados += pagina.rows.length;
        ultimoId = pagina.rows[pagina.rows.length - 1].id;

        if (processados % 5000 < BATCH_SIZE) {
            console.log(`  ${processados} / ${total} processados...`);
        }
    }

    console.log(`Concluído: ${processados} filmes atualizados.`);

    console.log("Criando índices em category e title_lang...");
    await client.execute("CREATE INDEX IF NOT EXISTS idx_filmes_category ON filmes(category)");
    await client.execute("CREATE INDEX IF NOT EXISTS idx_filmes_title_lang ON filmes(title_lang)");
    console.log("Índices criados. Migração finalizada!");
}

migrar().catch((err) => {
    console.error("Erro na migração:", err);
    process.exit(1);
});
