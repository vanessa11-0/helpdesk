import { Component, OnInit, inject, signal } from '@angular/core';
import { UsersService } from './interfaces/services/users.service';
import { User, UserRole } from './interfaces/user.interface';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  private readonly usersService = inject(UsersService);

  users = signal<User[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.usersService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onRoleChanged(event: { userId: string; role: UserRole }): void {
    this.usersService.updateRole(event).subscribe({
      next: (updatedUser) => {
        this.users.update(list =>
          list.map(u => u.id === updatedUser.id ? updatedUser : u)
        );
      }
    });
  }

  onStatusToggled(event: { userId: string; isActive: boolean }): void {
    this.usersService.toggleActiveState(event.userId, event.isActive).subscribe({
      next: (updatedUser) => {
        this.users.update(list =>
          list.map(u => u.id === updatedUser.id ? updatedUser : u)
        );
      }
    });
  }
}