export function basicAuth(request) {
    const authHeader = request.headers.get('Authorization');
    const basic = 'Basic ' + Buffer.from(`${process.env.BASIC_USER}:${process.env.BASIC_PASS}`).toString('base64');
    if (authHeader !== basic) {
      return new Response('Unauthorized', { status: 401 });
    }
    return null;
}