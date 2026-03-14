import { CallHandler, ExecutionContext, GatewayTimeoutException, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, TimeoutError, catchError, timeout } from 'rxjs';

@Injectable()
export class RequestTimeoutInterceptor implements NestInterceptor {
  constructor(private readonly timeoutInMillis: number) {}

  async intercept(_context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    return next.handle().pipe(
      timeout(this.timeoutInMillis),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          throw new GatewayTimeoutException(err.message);
        }

        throw err;
      })
    );
  }
}
