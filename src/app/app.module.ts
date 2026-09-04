import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from '@shared/shared.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { LayoutModule } from './layout/layout.module';
import { UnauthorizedComponent } from '@shared/pages/unauthorized/unauthorized.component';

@NgModule({
  declarations: [AppComponent, UnauthorizedComponent],
  imports: [BrowserModule, SharedModule, AppRoutingModule, CoreModule, LayoutModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
