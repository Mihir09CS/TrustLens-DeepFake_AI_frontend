function toAscii(input) {
  return String(input ?? "").replace(/[^\x20-\x7E]/g, "?");
}

function escapePdfText(input) {
  return toAscii(input)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapLine(line, maxChars = 92) {
  const text = toAscii(line).trim();
  if (!text) return [""];
  const words = text.split(/\s+/);
  const out = [];
  let current = words[0] || "";

  for (let i = 1; i < words.length; i += 1) {
    const candidate = `${current} ${words[i]}`;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      out.push(current);
      current = words[i];
    }
  }
  out.push(current);
  return out;
}

function paginate(lines, maxLinesPerPage = 46) {
  const pages = [];
  let current = [];

  for (const line of lines) {
    const wrapped = wrapLine(line);
    for (const segment of wrapped) {
      if (current.length >= maxLinesPerPage) {
        pages.push(current);
        current = [];
      }
      current.push(segment);
    }
  }

  if (current.length || pages.length === 0) pages.push(current);
  return pages;
}

function buildPdfFromPages(pages) {
  const objects = [];
  const pageRefs = [];

  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  const pagesObjIndex = objects.length;
  objects.push("");

  let nextObj = 3;
  const pageObjectIds = [];
  const contentObjectIds = [];

  for (let i = 0; i < pages.length; i += 1) {
    pageObjectIds.push(nextObj);
    contentObjectIds.push(nextObj + 1);
    nextObj += 2;
  }

  const fontObjectId = nextObj;

  for (let i = 0; i < pages.length; i += 1) {
    const pageId = pageObjectIds[i];
    const contentId = contentObjectIds[i];
    pageRefs.push(`${pageId} 0 R`);

    const pageObj = [
      `${pageId} 0 obj`,
      "<<",
      "/Type /Page",
      "/Parent 2 0 R",
      "/MediaBox [0 0 595 842]",
      `/Resources << /Font << /F1 ${fontObjectId} 0 R >> >>`,
      `/Contents ${contentId} 0 R`,
      ">>",
      "endobj",
      "",
    ].join("\n");
    objects.push(pageObj);

    const contentLines = pages[i].map((line) => `(${escapePdfText(line)}) Tj`);
    const stream = [
      "BT",
      "/F1 11 Tf",
      "14 TL",
      "1 0 0 1 50 800 Tm",
      contentLines.length ? contentLines[0] : "() Tj",
      ...contentLines.slice(1).flatMap((line) => ["T*", line]),
      "ET",
    ].join("\n");

    const contentObj = [
      `${contentId} 0 obj`,
      `<< /Length ${stream.length} >>`,
      "stream",
      stream,
      "endstream",
      "endobj",
      "",
    ].join("\n");
    objects.push(contentObj);
  }

  objects.push(
    `${fontObjectId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`,
  );

  objects[pagesObjIndex] = [
    "2 0 obj",
    `<< /Type /Pages /Count ${pages.length} /Kids [${pageRefs.join(" ")}] >>`,
    "endobj",
    "",
  ].join("\n");

  const encoder = new TextEncoder();
  const chunks = ["%PDF-1.4\n"];
  const offsets = [0];
  let byteLen = encoder.encode(chunks[0]).length;

  for (const obj of objects) {
    offsets.push(byteLen);
    chunks.push(obj);
    byteLen += encoder.encode(obj).length;
  }

  const xrefStart = byteLen;
  const xrefCount = objects.length + 1;
  let xref = `xref\n0 ${xrefCount}\n`;
  xref += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i += 1) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }

  const trailer = [
    "trailer",
    `<< /Size ${xrefCount} /Root 1 0 R >>`,
    "startxref",
    String(xrefStart),
    "%%EOF",
  ].join("\n");

  chunks.push(xref, trailer);
  return chunks.join("");
}

export function downloadPdfReport({ filename, title, lines }) {
  const safeTitle = title || "Analysis Report";
  const generatedAt = new Date().toLocaleString();
  const preface = [
    safeTitle,
    `Generated: ${generatedAt}`,
    "",
    ...(Array.isArray(lines) ? lines : []),
  ];
  const pages = paginate(preface);
  const pdf = buildPdfFromPages(pages);
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "analysis-report.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function createReportProof({ reportType, summary = {}, scanId = null }) {
  try {
    const token = localStorage.getItem("sentinel_token");
    if (!token) return null;
    const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const res = await fetch(`${base}/api/scan/proof`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reportType, summary, scanId }),
    });
    const body = await res.json();
    if (!res.ok) return null;
    return body?.data || null;
  } catch {
    return null;
  }
}
