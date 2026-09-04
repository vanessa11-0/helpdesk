import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { refreshInterceptor } from './interceptors/refresh.interceptor';

/**
 * El orden importa: authInterceptor firma la petición y refreshInterceptor,
 * al quedar más cerca del backend, es el primero en ver el 401 de respuesta.
 */
@NgModule({
  imports: [CommonModule],
  providers: [provideHttpClient(withInterceptors([authInterceptor, refreshInterceptor]))]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parent?: CoreModule) {
    if (parent) {
      throw new Error('CoreModule ya fue cargado. Impórtalo únicamente en AppModule.');
    }
  }
}
