import * as fs from 'fs';
import * as path from 'path';
import { parseBeeahWorkbookFile } from '../parsers/beeah-workbook-parser';
import { reportingRepository } from '../repositories/reporting-repository';
import { env } from '../../env';

export async function importWorkbookFile(relativeFilePath: string, periodCode: string = '2026-03'): Promise<void> {
  const absolutePath = path.resolve(process.cwd(), relativeFilePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error('Target Excel report workbook file not found at path: ' + absolutePath);
  }
  const fileBuffer = fs.readFileSync(absolutePath);
  const arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);
  const parsedDataset = parseBeeahWorkbookFile(arrayBuffer, periodCode);
  await reportingRepository.save(parsedDataset);
  console.log('🚀 Ingestion complete: Aligned ' + parsedDataset.reportingRows.length + ' ledger entries smoothly.');
}
