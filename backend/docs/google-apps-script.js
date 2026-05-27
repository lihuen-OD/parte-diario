const SHEET_NAME = "Hoja 1";

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return jsonResponse({
        ok: false,
        error: "No se encontró la hoja: " + SHEET_NAME
      });
    }

    const rawBody = e && e.postData && e.postData.contents
      ? e.postData.contents
      : "{}";

    const body = JSON.parse(rawBody);

    if (!body.registros || !Array.isArray(body.registros)) {
      return jsonResponse({
        ok: false,
        error: "Formato inválido. Se esperaba registros[]"
      });
    }

    if (body.registros.length === 0) {
      return jsonResponse({
        ok: true,
        inserted: 0,
        message: "Sin registros para guardar"
      });
    }

    ensureHeaders(sheet);

    const rows = body.registros.map((r) => [
      r.parteId || "",
      r.detalleId || "",
      r.localId || "",
      r.fecha || "",
      r.dia || "",
      r.trabajador || "",
      r.actividad || "",
      r.predio || "",
      r.horas || "",
      r.total || "",
      r.observaciones || "",
      r.cargadoPor || "",
      r.fechaCarga || "",
      new Date()
    ]);

    sheet
      .getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length)
      .setValues(rows);

    return jsonResponse({
      ok: true,
      inserted: rows.length
    });

  } catch (err) {
    return jsonResponse({
      ok: false,
      error: err && err.message ? err.message : String(err)
    });
  }
}

function doGet() {
  return jsonResponse({
    ok: true,
    message: "Conector Parte Diario activo"
  });
}

function ensureHeaders(sheet) {
  const headers = [
    "Parte ID",
    "Detalle ID",
    "Local ID",
    "Fecha",
    "Día",
    "Trabajador",
    "Actividad",
    "Predio",
    "Horas",
    "Total",
    "Observaciones",
    "Cargado por",
    "Fecha carga sistema",
    "Fecha sync Google Sheets"
  ];

  const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const hasHeaders = firstRow.some((cell) => cell !== "");

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

