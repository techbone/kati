import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import type { ExportService, RecordExportInput } from '@/contracts/services';

import { buildHtml } from './buildHtml';

/**
 * Clinic record PDF: pure HTML → expo-print → share sheet.
 */
export function createExportService(): ExportService {
  return {
    buildHtml,

    async sharePdf(input: RecordExportInput): Promise<void> {
      const html = buildHtml(input);
      const { uri } = await Print.printToFileAsync({ html });

      const available = await Sharing.isAvailableAsync();
      if (!available) {
        throw new Error('Sharing is not available on this device.');
      }

      const safeName = input.child.name.replace(/[^\w\- ]+/g, '').trim() || 'child';
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        UTI: 'com.adobe.pdf',
        dialogTitle: `Kati — ${safeName} immunization record`,
      });
    },
  };
}

export const exportService: ExportService = createExportService();
