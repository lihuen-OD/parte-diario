import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { exportService } from './export.service';

export const exportController = {
  partesXlsx: asyncHandler(async (_req: Request, res: Response) => {
    const workbook = await exportService.buildPartesWorkbook();
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=partes.xlsx');
    res.send(Buffer.from(buffer));
  }),
};
