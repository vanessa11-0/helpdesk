import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User, UserRole } from '../../interfaces/user.interface';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent {
  @Input({ required: true }) users: User[] = [];
  @Output() roleChanged = new EventEmitter<{ userId: string; role: UserRole }>();
  @Output() statusToggled = new EventEmitter<{ userId: string; isActive: boolean }>();

  availableRoles: UserRole[] = ['Cliente', 'Agente', 'Administrador'];

  onRoleChange(userId: string, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newRole = select.value as UserRole;
    this.roleChanged.emit({ userId, role: newRole });
  }

  onToggleStatus(user: User): void {
    this.statusToggled.emit({ userId: user.id, isActive: !user.isActive });
  }
}