import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './layout/components/navbar/navbar.component';
import { SidebarComponent } from './layout/components/sidebar/sidebar.component';
import { MainLayoutComponent } from './layout/components/main-layout/main-layout.component';

import { jwtInterceptor } from './core/auth/interceptors/jwt.interceptor';
import { refreshTokenInterceptor } from './core/auth/interceptors/refresh-token.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SidebarComponent,
    MainLayoutComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    provideHttpClient(
      withInterceptors([jwtInterceptor, refreshTokenInterceptor])
    )
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }