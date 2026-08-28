export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

export function fail(message: string, status = 400): Response {
  return json({ ok: false, error: message }, status);
}

export async function readXmlBody(request: Request): Promise<{ xml: string; sourceName: string }> {
  const type = request.headers.get("content-type") ?? "";
  if (type.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    const pasted = form.get("xml");
    if (file instanceof File) {
      return { xml: await file.text(), sourceName: file.name || "upload.xml" };
    }
    if (typeof pasted === "string") {
      return { xml: pasted, sourceName: String(form.get("sourceName") || "pasted.xml") };
    }
    throw new Error("No XML file or xml field in form.");
  }
  if (type.includes("application/json")) {
    const body = (await request.json()) as { xml?: string; sourceName?: string };
    if (!body.xml) throw new Error("JSON body needs an xml string.");
    return { xml: body.xml, sourceName: body.sourceName || "api.xml" };
  }
  const xml = await request.text();
  return { xml, sourceName: "pasted.xml" };
}
