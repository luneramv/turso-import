import { createClient } from "@libsql/client/web";

const PAGE_SIZE = 250;
const TETO_CONTAGEM_BUSCA = 3000; // teto de contagem para buscas por texto (evita timeout em termos comuns)

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
            if (path === "/api/filmes") {
                return await handleFilmes(client, url, origin);
            }
            if (path === "/api/filmes/por-ids") {
                return await handleFilmesPorIds(client, url, origin);
            }
            if (path === "/api/canais") {
                return await handleCanais(client, origin);
            }
            if (path === "/api/stats") {
                return await handleStats(client, origin);
            }

            return jsonResponse({ erro: "Rota não encontrada" }, origin, 404);
        } catch (err) {
            return jsonResponse({ erro: "Erro interno", detalhe: String(err) }, origin, 500);
        }
    },
};

const COLUNAS_FILME = "f.id, f.title, f.channel, f.channel_id, f.url, f.duration, f.views, f.thumbnail, f.category, f.title_lang";

async function handleFilmes(client, url, origin) {
    const params = url.searchParams;
    const busca = (params.get("busca") || "").trim();
    const canalId = params.get("canal_id") || "";
    const categoria = params.get("categoria") || ""; // action | comedy | horror | scifi | documentary | other
    const idioma = params.get("idioma") || ""; // ordenação por idioma preferido (soft) — traz esse idioma primeiro, sem esconder os demais
    const lingua = params.get("lingua") || ""; // filtro RÍGIDO por idioma do título — só mostra filmes desse idioma. "all" = sem filtro.
    const pagina = Math.max(1, parseInt(params.get("pagina") || "1", 10));
    const ordenar = params.get("ordenar") || "title"; // title | views | duration
    const offset = (pagina - 1) * PAGE_SIZE;

    const ordenarMap = {
        title: "f.title COLLATE NOCASE ASC",
        views: "f.views_count DESC",
        duration: "f.duration_seconds DESC",
    };
    let orderBy = ordenarMap[ordenar] || ordenarMap.title;

    // Ordenação suave por idioma preferido (não esconde os outros, só prioriza)
    if (idioma) {
        orderBy = `(f.title_lang = '${idioma.replace(/'/g, "")}') DESC, ${orderBy}`;
    }

    // Monta condições WHERE dinamicamente
    const condicoes = [];
    const argsBase = [];

    if (canalId) {
        condicoes.push("f.channel_id = ?");
        argsBase.push(canalId);
    }
    if (categoria) {
        condicoes.push("f.category = ?");
        argsBase.push(categoria);
    }
    // Filtro rígido por idioma do título (bandeiras do topo). "all" ou vazio = sem filtro.
    if (lingua && lingua !== "all") {
        condicoes.push("f.title_lang = ?");
        argsBase.push(lingua);
    }

    let sql, args, countSql, countArgs;

    if (busca) {
        const ftsQuery = busca
            .split(/\s+/)
            .filter(Boolean)
            .map((w) => `${w.replace(/["]/g, "")}*`)
            .join(" ");

        const whereParts = ["filmes_fts MATCH ?", ...condicoes];
        const where = whereParts.join(" AND ");

        sql = `
            SELECT ${COLUNAS_FILME}
            FROM filmes_fts fts
            JOIN filmes f ON f.id = fts.id
            WHERE ${where}
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?
        `;
        args = [ftsQuery, ...argsBase, PAGE_SIZE, offset];

        countSql = `
            SELECT COUNT(*) as total FROM (
                SELECT f.id
                FROM filmes_fts fts
                JOIN filmes f ON f.id = fts.id
                WHERE ${where}
                LIMIT ${TETO_CONTAGEM_BUSCA}
            )
        `;
        countArgs = [ftsQuery, ...argsBase];
    } else {
        const where = condicoes.length > 0 ? condicoes.join(" AND ") : "1=1";

        sql = `
            SELECT ${COLUNAS_FILME}
            FROM filmes f
            WHERE ${where}
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?
        `;
        args = [...argsBase, PAGE_SIZE, offset];

        countSql = `SELECT COUNT(*) as total FROM filmes f WHERE ${where}`;
        countArgs = argsBase;
    }

    const [resultado, totalResult] = await Promise.all([
        client.execute({ sql, args }),
        client.execute({ sql: countSql, args: countArgs }),
    ]);

    const total = Number(totalResult.rows[0]?.total || 0);
    const totalAproximado = busca && total >= TETO_CONTAGEM_BUSCA;

    return jsonResponse(
        {
            filmes: resultado.rows,
            pagina,
            por_pagina: PAGE_SIZE,
            total,
            total_paginas: Math.ceil(total / PAGE_SIZE),
            total_aproximado: totalAproximado,
        },
        origin
    );
}

// GET /api/filmes/por-ids?ids=id1,id2,id3  -> usado pela "Minha Lista"
async function handleFilmesPorIds(client, url, origin) {
    const idsParam = url.searchParams.get("ids") || "";
    const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 500);

    if (ids.length === 0) {
        return jsonResponse({ filmes: [] }, origin);
    }

    const placeholders = ids.map(() => "?").join(",");
    const sql = `SELECT ${COLUNAS_FILME} FROM filmes f WHERE f.id IN (${placeholders})`;

    const resultado = await client.execute({ sql, args: ids });
    return jsonResponse({ filmes: resultado.rows }, origin);
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
