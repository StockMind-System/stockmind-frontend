import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../models/user.model';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const roles = (route.data['roles'] ?? []) as UserRole[];
  return inject(AuthService).hasAnyRole(roles) || inject(Router).createUrlTree(['/dashboard']);
};
