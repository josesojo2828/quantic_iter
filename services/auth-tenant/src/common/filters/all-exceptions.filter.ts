import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    console.error('[Error Occurred]:', exception);

    
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? (exception.getResponse() as any).message || exception.message
        : 'Error interno del servidor';

    const errorName =
      exception instanceof HttpException
        ? exception.name
        : 'InternalServerError';

    response.status(status).json({
      success: false,
      statusCode: status,
      error: errorName,
      message: Array.isArray(message) ? message[0] : message, // Handle validation errors array
      timestamp: new Date().toISOString(),
    });
  }
}
