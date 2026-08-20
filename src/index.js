import { createClient } from "@libsql/client/web";

const PAGE_SIZE = 250;

// Cabeçalhos CORS — libera acesso a partir do seu site no Cloudflare Pages
function corsHeaders(origin) {
    return {
        "Access-Control-Allow-Origin": origin || "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };
}

function jsonResponse(data, origin, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            ...corsHeaders(origin),
        },
    });
}

export default {
    async fetch(request, env) {
        const origin = request.headers.get("Origin");

        if (request.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders(origin) });
        }

        const client = createClient({
            url: env.TURSO_URL,
            authToken: env.TURSO_AUTH_TOKEN,
        });

        const url = new URL(request.url);
        const path = url.pathname;

        try {
            // GET /api/filmes  -> lista paginada, com busca/filtro/ordenação opcionais
            if (path === "/api/filmes") {
                return await handleFilmes(client, url, origin);
            }

            // GET /api/canais  -> lista de canais distintos (para o filtro por canal)
            if (path === "/api/canais") {
                return await handleCanais(client, origin);
            }

            // GET /api/stats -> total de filmes na base (para exibir no site)
            if (path === "/api/stats") {
                return await handleStats(client, origin);
            }

            return jsonResponse({ erro: "Rota não encontrada" }, origin, 404);
        } catch (err) {
            return jsonResponse({ erro: "Erro interno", detalhe: String(err) }, origin, 500);
        }
    },
};

async function handleFilmes(client, url, origin) {
    const params = url.searchParams;
    const busca = (params.get("busca") || "").trim();
    const canalId = params.get("canal_id") || "";
    const pagina = Math.max(1, parseInt(params.get("pagina") || "1", 10));
    const ordenar = params.get("ordenar") || "title"; // title | views | duration
    const offset = (pagina - 1) * PAGE_SIZE;

    const ordenarMap = {
        title: "f.title COLLATE NOCASE ASC",
        views: "f.views_count DESC",
        duration: "f.duration_seconds DESC",
    };
    const orderBy = ordenarMap[ordenar] || ordenarMap.title;

    // Teto para a contagem em buscas por texto: termos comuns (ex: "star")
    // podem casar com milhares de títulos no FTS5, e contar TODOS eles a
    // cada requisição é caro. Contamos até este teto e paramos por ali —
    // isso ainda dá uma paginação numerada útil sem arriscar timeout.
    const TETO_CONTAGEM_BUSCA = 3000;

    let sql, args, countSql, countArgs;

    if (busca) {
        // Busca por texto via FTS5 (rápida, acento-insensível)
        const ftsQuery = busca
            .split(/\s+/)
            .filter(Boolean)
            .map((w) => `${w.replace(/["]/g, "")}*`)
            .join(" ");

        let where = "filmes_fts MATCH ?";
        args = [ftsQuery];
        if (canalId) {
            where += " AND f.channel_id = ?";
            args.push(canalId);
        }

        sql = `
            SELECT f.id, f.title, f.channel, f.channel_id, f.url, f.duration, f.views, f.thumbnail
            FROM filmes_fts fts
            JOIN filmes f ON f.id = fts.id
            WHERE ${where}
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?
        `;
        args = [...args, PAGE_SIZE, offset];

        // Contagem com teto: conta no máximo TETO_CONTAGEM_BUSCA linhas
        // casadas, em vez de escanear todas as correspondências.
        countSql = `
            SELECT COUNT(*) as total FROM (
                SELECT f.id
                FROM filmes_fts fts
                JOIN filmes f ON f.id = fts.id
                WHERE ${where}
                LIMIT ${TETO_CONTAGEM_BUSCA}
            )
        `;
        countArgs = args.slice(0, canalId ? 2 : 1);
    } else {
        let where = "1=1";
        args = [];
        if (canalId) {
            where = "f.channel_id = ?";
            args.push(canalId);
        }

        sql = `
            SELECT f.id, f.title, f.channel, f.channel_id, f.url, f.duration, f.views, f.thumbnail
            FROM filmes f
            WHERE ${where}
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?
        `;
        args = [...args, PAGE_SIZE, offset];

        // Sem busca por texto: contar tudo é barato (não precisa de teto),
        // já é rápido graças ao índice em title/views/duration.
        countSql = `SELECT COUNT(*) as total FROM filmes f WHERE ${where}`;
        countArgs = canalId ? [canalId] : [];
    }

    const [resultado, totalResult] = await Promise.all([
        client.execute({ sql, args }),
        client.execute({ sql: countSql, args: countArgs }),
    ]);

    let total = Number(totalResult.rows[0]?.total || 0);
    const totalAtingiuTeto = busca && total >= TETO_CONTAGEM_BUSCA;

    return jsonResponse(
        {
            filmes: resultado.rows,
            pagina,
            por_pagina: PAGE_SIZE,
            total,
            total_paginas: Math.ceil(total / PAGE_SIZE),
            total_aproximado: totalAtingiuTeto, // true = "3000+", não é o número exato
        },
        origin
    );
}

async function handleCanais(client, origin) {
    const result = await client.execute(`
        SELECT channel_id, channel, COUNT(*) as total
        FROM filmes
        WHERE channel_id IS NOT NULL AND channel_id != ''
        GROUP BY channel_id
        ORDER BY total DESC
        LIMIT 500
    `);
    return jsonResponse({ canais: result.rows }, origin);
}

async function handleStats(client, origin) {
    const result = await client.execute("SELECT COUNT(*) as total FROM filmes");
    return jsonResponse({ total_filmes: Number(result.rows[0]?.total || 0) }, origin);
}
