import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './interceptors/jwt.interceptor';
import { refreshTokenInterceptor } from './interceptors/refresh-token.interceptor';

@NgModule({
  imports: [CommonModule],
  providers: [
    provideHttpClient(
      withInterceptors([jwtInterceptor, refreshTokenInterceptor])
    )
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule ya ha sido cargado. Impórtalo únicamente en AppModule.');
    }
  }
}