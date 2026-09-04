import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { UsersRoutingModule } from './users-routing.module';
import { UserListComponent } from './pages/user-list/user-list.component';

@NgModule({
  declarations: [UserListComponent],
  imports: [SharedModule, UsersRoutingModule]
})
export class UsersModule {}
