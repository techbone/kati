/**
 * Track C — clinic PDF export.
 *
 * Handoff for Track B: replace the card-screen export stub with
 * `exportService.sharePdf({ child, items, summary, scheduleSource, generatedAt })`
 * after the premium gate (`pdf-export`) allows it.
 */
export { buildHtml } from './buildHtml';
export { createExportService, exportService } from './exportService';
