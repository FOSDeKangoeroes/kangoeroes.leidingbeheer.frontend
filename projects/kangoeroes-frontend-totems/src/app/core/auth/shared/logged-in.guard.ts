
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import decode from 'jwt-decode';
import { AuthService } from 'projects/kangoeroes-frontend-leidingbeheer/src/app/core/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {

  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.isAuthenticated()) {

      const token = decode(this.authService.getToken());
      const roles: string[] = token['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

      if (roles.includes('opperhoofd')) {
        return true;

      } else {

        this.router.navigate(['/forbidden']);
        return false;
      }
    }

    this.authService.login();
    return false;
  }
}
