import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentService } from './modules/finance/application/document.service';
import { DocumentType } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';

async function verify() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const documentService = app.get(DocumentService);

  console.log('--- Verification: Finance Service ---');

  try {
    const testDoc = {
      type: DocumentType.INVOICE,
      tenantId: 'tenant-123',
      customerId: 'cust-456',
      subtotal: 1000,
      taxRate: 0.21,
      currency: 'USD',
      items: [{ desc: 'Servicios de Consultoría', price: 1000 }],
    };

    console.log('Generating test invoice...');
    const result = await documentService.create(testDoc);

    console.log('✅ Document created in DB:', result.id);
    console.log('   Number:', result.number);
    console.log('   Total:', result.total);
    console.log('   Storage Path:', result.storagePath);

    // Verify file exists
    const filePath = path.join(process.cwd(), 'storage', result.storagePath as string);
    const content = await fs.readFile(filePath, 'utf-8');
    console.log('✅ File contents verified:\n', content);

    console.log('--- Verification Successful! ---');
  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await app.close();
  }
}

verify();
