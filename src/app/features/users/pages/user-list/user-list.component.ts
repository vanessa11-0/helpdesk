import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ROLE_LABELS, User, UserRole } from '@core/models';
import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly auth = inject(AuthService);

  readonly roles: UserRole[] = ['admin', 'agent', 'client'];
  readonly roleLabels = ROLE_LABELS;

  readonly users = signal<User[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  /** Id del usuario cuyo cambio de rol está en vuelo, para deshabilitar su fila. */
  readonly savingUserId = signal<string | null>(null);

  readonly currentUserId = computed(() => this.auth.currentUser()?.id ?? null);

  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * La API impide que un admin se quite a sí mismo el rol de admin, así que su
   * propio selector se deja bloqueado en lugar de dejarle provocar un 400.
   */
  isSelf(user: User): boolean {
    return user.id === this.currentUserId();
  }

  onRoleChange(user: User, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const role = select.value as UserRole;

    if (role === user.role) {
      return;
    }

    this.savingUserId.set(user.id);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.userService.updateRole(user.id, role).subscribe({
      next: (updated) => {
        this.savingUserId.set(null);
        this.users.update((list) => list.map((u) => (u.id === updated.id ? updated : u)));
        this.successMessage.set(
          `${updated.name} ahora tiene el rol ${ROLE_LABELS[updated.role]}.`
        );
      },
      error: (err: unknown) => {
        this.savingUserId.set(null);
        // Se revierte el select al valor real que sigue teniendo el servidor.
        select.value = user.role;
        this.errorMessage.set(
          AuthService.describeError(err, 'No se pudo cambiar el rol del usuario.')
        );
      }
    });
  }

  private loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: (err: unknown) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          AuthService.describeError(err, 'No se pudo cargar la lista de usuarios.')
        );
      }
    });
  }
}
