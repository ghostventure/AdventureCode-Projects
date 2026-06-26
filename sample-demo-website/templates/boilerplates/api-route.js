export async function GET() {
  return Response.json({
    ok: true,
    data: []
  });
}

export async function POST(request) {
  const body = await request.json();

  return Response.json({
    ok: true,
    received: body
  });
}
