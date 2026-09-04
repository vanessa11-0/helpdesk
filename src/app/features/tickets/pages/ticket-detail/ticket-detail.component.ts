import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  Ticket,
  TicketComment,
  UpdateTicketRequest,
  User
} from '@core/models';
import {
  EditableTicketField,
  canAssignTicket,
  canComment,
  canDeleteTicket,
  canUpdateTicket,
  editableTicketFields
} from '@core/permissions/ticket-permissions';
import { AuthService } from '@core/services/auth.service';
import { TicketService } from '@core/services/ticket.service';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html'
})
export class TicketDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ticketService = inject(TicketService);
  private readonly userService = inject(UserService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly statuses = TICKET_STATUSES;
  readonly priorities = TICKET_PRIORITIES;

  readonly ticket = signal<Ticket | null>(null);
  readonly comments = signal<TicketComment[]>([]);
  readonly agents = signal<User[]>([]);
  private readonly directory = signal<Record<string, User>>({});

  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly isSaving = signal(false);
  readonly isAssigning = signal(false);
  readonly isPostingComment = signal(false);

  private readonly role = this.auth.userRole;
  private readonly userId = computed(() => this.auth.currentUser()?.id ?? null);

  readonly isAdmin = computed(() => this.role() === 'admin');
  readonly canEdit = computed(() => canUpdateTicket(this.role(), this.ticket(), this.userId()));
  readonly canAssign = computed(() => canAssignTicket(this.role()));
  readonly canDelete = computed(() => canDeleteTicket(this.role()));
  readonly canAddComment = computed(() => canComment(this.ticket()));

  /** Campos que este rol puede tocar; el formulario se arma sólo con ellos. */
  readonly editableFields = computed<EditableTicketField[]>(() =>
    this.canEdit() ? editableTicketFields(this.role()) : []
  );

  editForm = new FormGroup({});
  readonly assignControl = new FormControl<string>('', { nonNullable: true });
  readonly commentControl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(2)]
  });

  /**
   * Se escucha `paramMap` en lugar de leer el snapshot una sola vez: al ir de
   * /tickets/t_001 a /tickets/t_004 el router reutiliza esta misma instancia y
   * con el snapshot se quedarían los datos del ticket anterior en pantalla.
   */
  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id');
      if (!id) {
        void this.router.navigate(['/tickets']);
        return;
      }
      this.load(id);
    });
  }

  showsField(field: EditableTicketField): boolean {
    return this.editableFields().includes(field);
  }

  /**
   * El directorio de nombres sólo lo puede cargar un admin. Para el resto de
   * roles se cae a `fallback` en vez de enseñar el identificador interno.
   */
  userName(id: string | null, fallback = 'Sin asignar'): string {
    if (!id) {
      return fallback;
    }
    if (id === this.userId()) {
      return 'Yo';
    }
    return this.directory()[id]?.name ?? fallback;
  }

  assignedLabel(assignedTo: string | null): string {
    return assignedTo === null
      ? 'Sin asignar'
      : this.userName(assignedTo, 'Asignado a un agente');
  }

  createdByLabel(createdBy: string): string {
    return this.userName(createdBy, 'Otro usuario');
  }

  /** Envía sólo los campos que cambiaron, dentro de los permitidos al rol. */
  onSave(): void {
    const current = this.ticket();
    if (!current || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const values = this.editForm.value as UpdateTicketRequest;
    const changes: UpdateTicketRequest = {};
    for (const field of this.editableFields()) {
      const next = values[field];
      if (next !== undefined && next !== current[field]) {
        Object.assign(changes, { [field]: next });
      }
    }

    if (Object.keys(changes).length === 0) {
      return;
    }

    this.isSaving.set(true);
    this.actionError.set(null);

    this.ticketService.updateTicket(current.id, changes).subscribe({
      next: (updated) => {
        this.isSaving.set(false);
        this.applyTicket(updated);
      },
      error: (err: unknown) => {
        this.isSaving.set(false);
        this.actionError.set(AuthService.describeError(err, 'No se pudo actualizar el ticket.'));
      }
    });
  }

  onAssign(): void {
    const current = this.ticket();
    const agentId = this.assignControl.value;
    if (!current || !agentId) {
      return;
    }

    this.isAssigning.set(true);
    this.actionError.set(null);

    this.ticketService.assignTicket(current.id, agentId).subscribe({
      next: (updated) => {
        this.isAssigning.set(false);
        this.applyTicket(updated);
      },
      error: (err: unknown) => {
        this.isAssigning.set(false);
        this.actionError.set(AuthService.describeError(err, 'No se pudo asignar el ticket.'));
      }
    });
  }

  onAddComment(): void {
    const current = this.ticket();
    if (!current || this.commentControl.invalid) {
      this.commentControl.markAsTouched();
      return;
    }

    this.isPostingComment.set(true);
    this.actionError.set(null);

    this.ticketService.addComment(current.id, this.commentControl.value.trim()).subscribe({
      next: (comment) => {
        this.isPostingComment.set(false);
        this.comments.update((list) => [...list, comment]);
        this.commentControl.reset('');
      },
      error: (err: unknown) => {
        this.isPostingComment.set(false);
        this.actionError.set(AuthService.describeError(err, 'No se pudo enviar el comentario.'));
      }
    });
  }

  onDelete(): void {
    const current = this.ticket();
    if (!current) {
      return;
    }
    if (!confirm('¿Eliminar el ticket "' + current.title + '"? Esta acción no se puede deshacer.')) {
      return;
    }

    this.ticketService.deleteTicket(current.id).subscribe({
      next: () => void this.router.navigate(['/tickets']),
      error: (err: unknown) =>
        this.actionError.set(AuthService.describeError(err, 'No se pudo eliminar el ticket.'))
    });
  }

  private load(id: string): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    // Estado del ticket anterior, por si el router reutiliza el componente.
    this.actionError.set(null);
    this.comments.set([]);
    this.commentControl.reset('');

    forkJoin({
      ticket: this.ticketService.getTicketById(id),
      comments: this.ticketService.getComments(id)
    }).subscribe({
      next: ({ ticket, comments }) => {
        this.applyTicket(ticket);
        this.comments.set(comments);
        this.isLoading.set(false);
        this.loadAdminData();
      },
      error: (err: unknown) => {
        this.isLoading.set(false);
        this.loadError.set(
          AuthService.describeError(err, 'No se pudo cargar el ticket solicitado.')
        );
      }
    });
  }

  /** Nombres de usuario y lista de agentes: sólo el admin puede pedirlos. */
  private loadAdminData(): void {
    if (!this.isAdmin()) {
      return;
    }
    this.userService.getDirectory(true).subscribe({
      next: (dir) => this.directory.set(dir),
      error: () => this.directory.set({})
    });
    this.userService.getAgents().subscribe({
      next: (agents) => this.agents.set(agents),
      error: () => this.agents.set([])
    });
  }

  private applyTicket(ticket: Ticket): void {
    this.ticket.set(ticket);
    this.assignControl.setValue(ticket.assignedTo ?? '');
    this.buildEditForm(ticket);
  }

  /**
   * El formulario se construye desde cero con los controles que el rol puede
   * modificar, de modo que la vista no pueda enviar un campo prohibido.
   */
  private buildEditForm(ticket: Ticket): void {
    const controls: Record<string, FormControl> = {};

    for (const field of this.editableFields()) {
      switch (field) {
        case 'title':
          controls['title'] = new FormControl(ticket.title, {
            nonNullable: true,
            validators: [Validators.required, Validators.minLength(5)]
          });
          break;
        case 'description':
          controls['description'] = new FormControl(ticket.description, {
            nonNullable: true,
            validators: [Validators.required, Validators.minLength(10)]
          });
          break;
        case 'priority':
          controls['priority'] = new FormControl(ticket.priority, { nonNullable: true });
          break;
        case 'status':
          controls['status'] = new FormControl(ticket.status, { nonNullable: true });
          break;
      }
    }

    this.editForm = new FormGroup(controls);
  }
}
