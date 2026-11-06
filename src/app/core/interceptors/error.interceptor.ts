import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const hadActiveSession = auth.isAuthenticated();
  return next(request).pipe(catchError((error: HttpErrorResponse) => {
    if (error.status === 401 && hadActiveSession && !request.url.endsWith('/auth/login')) {
      auth.expireSession();
      void router.navigate(['/auth/login'], { queryParams: { reason: 'expired' } });
    }
    return throwError(() => error);
  }));
};
