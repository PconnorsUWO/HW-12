export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;

        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        try {
            // Route handling
            if (path === '/register' && request.method === 'POST') {
                return await handleRegister(request, env, corsHeaders);
            }

            if (path === '/login' && request.method === 'POST') {
                return await handleLogin(request, env, corsHeaders);
            }

            if (path === '/allergies' && request.method === 'GET') {
                return await handleGetAllergies(request, env, corsHeaders);
            }

            if (path === '/allergies' && request.method === 'PUT') {
                return await handleUpdateAllergies(request, env, corsHeaders);
            }

            return new Response('Not Found', { status: 404, headers: corsHeaders });
        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
    },
};

// Register new user
async function handleRegister(request, env, corsHeaders) {
    const { username, password_hash, allergies } = await request.json();

    if (!username || !password_hash) {
        return new Response(JSON.stringify({ error: 'Username and password_hash required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    try {
        // Insert user
        const result = await env.DB.prepare(
            'INSERT INTO users (username, password_hash) VALUES (?, ?)'
        ).bind(username, password_hash).run();

        const userId = result.meta.last_row_id;

        // Insert allergies if provided
        if (allergies && allergies.length > 0) {
            for (const allergy of allergies) {
                await env.DB.prepare(
                    'INSERT INTO allergies (user_id, allergy) VALUES (?, ?)'
                ).bind(userId, allergy).run();
            }
        }

        return new Response(JSON.stringify({ success: true, userId }), {
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return new Response(JSON.stringify({ error: 'Username already exists' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
        throw error;
    }
}

// Login - get user info
async function handleLogin(request, env, corsHeaders) {
    const { username } = await request.json();

    if (!username) {
        return new Response(JSON.stringify({ error: 'Username required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const user = await env.DB.prepare(
        'SELECT id, username, password_hash FROM users WHERE username = ?'
    ).bind(username).first();

    if (!user) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify(user), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
}

// Get user allergies
async function handleGetAllergies(request, env, corsHeaders) {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
        return new Response(JSON.stringify({ error: 'userId required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const { results } = await env.DB.prepare(
        'SELECT allergy FROM allergies WHERE user_id = ?'
    ).bind(userId).all();

    const allergies = results.map(row => row.allergy);

    return new Response(JSON.stringify({ allergies }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
}

// Update user allergies
async function handleUpdateAllergies(request, env, corsHeaders) {
    const { userId, allergies } = await request.json();

    if (!userId) {
        return new Response(JSON.stringify({ error: 'userId required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Delete existing allergies
    await env.DB.prepare('DELETE FROM allergies WHERE user_id = ?').bind(userId).run();

    // Insert new allergies
    if (allergies && allergies.length > 0) {
        for (const allergy of allergies) {
            await env.DB.prepare(
                'INSERT INTO allergies (user_id, allergy) VALUES (?, ?)'
            ).bind(userId, allergy).run();
        }
    }

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
}
