import type { GoogleSheetsCredentials, StorageState } from '../../types/finance'
import type { StorageProvider } from './StorageProvider'

/**
 * Código de referencia para el Google Apps Script Web App que actúa como
 * base de datos key-value respaldada por una hoja de cálculo. Desplegar como
 * "Web App" (ejecutar como propietario, acceso "cualquiera con el enlace") y
 * usar la URL resultante como `webAppUrl`. Se muestra también en el panel de
 * sincronización de la app para que el usuario pueda copiarlo.
 */
export const GOOGLE_APPS_SCRIPT_TEMPLATE = `function doGet(e) {
  const key = e.parameter.key;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('data') ||
                SpreadsheetApp.getActiveSpreadsheet().insertSheet('data');
  const rows = sheet.getDataRange().getValues();
  const row = rows.find(r => r[0] === key);
  return ContentService.createTextOutput(JSON.stringify({ key, value: row ? row[1] : null }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('data') ||
                SpreadsheetApp.getActiveSpreadsheet().insertSheet('data');
  const rows = sheet.getDataRange().getValues();
  const rowIndex = rows.findIndex(r => r[0] === body.key);
  if (rowIndex >= 0) {
    sheet.getRange(rowIndex + 1, 2).setValue(body.value);
  } else {
    sheet.appendRow([body.key, body.value]);
  }
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}`

/**
 * Persiste el estado como un par clave-valor en un Google Apps Script Web App,
 * usando Google Sheets como base de datos. `storageKey` identifica la fila.
 */
export class SheetsProvider implements StorageProvider {
  readonly kind = 'sheets' as const
  private credentials: GoogleSheetsCredentials

  constructor(credentials: GoogleSheetsCredentials) {
    this.credentials = credentials
  }

  async load(): Promise<StorageState | null> {
    const url = new URL(this.credentials.webAppUrl)
    url.searchParams.set('key', this.credentials.storageKey)

    const response = await fetch(url.toString())
    if (!response.ok) throw new Error(`Google Sheets: HTTP ${response.status}`)

    const payload = (await response.json()) as { value: string | null }
    if (!payload.value) return null
    return JSON.parse(payload.value) as StorageState
  }

  async save(state: StorageState): Promise<void> {
    const response = await fetch(this.credentials.webAppUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ key: this.credentials.storageKey, value: JSON.stringify(state) }),
    })
    if (!response.ok) throw new Error(`Google Sheets: HTTP ${response.status}`)
  }
}
