import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User, UserRole } from '@core/models/user.model';
import { UserManagementService } from '../../interfaces/services/user-management.service';

@Component({
  selector: 'app-user-form-modal',
  templateUrl: './user-form-modal.component.html',
  styleUrls: ['./user-form-modal.component.scss']
})
export class UserFormModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserManagementService);

  @Input() userToEdit: User | null = null;
  @Output() closeModal = new EventEmitter<boolean>();

  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  userForm!: FormGroup;

  ngOnInit(): void {
    this.userForm = this.fb.group({
      name: [this.userToEdit?.name || '', [Validators.required, Validators.minLength(3)]],
      email: [this.userToEdit?.email || '', [Validators.required, Validators.email]],
      role: [this.userToEdit?.role || 'Cliente', [Validators.required]],
      password: ['', this.userToEdit ? [] : [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const formData = this.userForm.value;

    const request$ = this.userToEdit
      ? this.userService.updateUser(this.userToEdit.id, formData)
      : this.userService.createUser(formData);

    request$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModal.emit(true);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Error al procesar la solicitud.');
        this.isSubmitting.set(false);
      }
    });
  }

  onCancel(): void {
    this.closeModal.emit(false);
  }
}