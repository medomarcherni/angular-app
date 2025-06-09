import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { TranslateModule } from '@ngx-translate/core';
import { Scope } from '../../../shared/models/scope.model';
import { ScopeService } from '../../../core/api/scope/scope.service';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-scope-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    TranslateModule
  ],
  templateUrl: './scope-form.component.html',
  styleUrls: ['./scope-form.component.scss']
})
export class ScopeFormComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ScopeFormComponent>);
  private scopeService = inject(ScopeService);
  private notification = inject(NotificationService);
  private data = inject(MAT_DIALOG_DATA, { optional: true });

  isEdit = !!this.data?.scope;
  maxRank = 999;

  scopeForm = this.fb.group({
    rank: ['', [
      Validators.required,
      Validators.min(0),
      Validators.max(this.maxRank)
    ]],
    name: ['', Validators.required],
    description: ['', Validators.required],
    comment: [''],
    condition: ['']
  });

  ngOnInit() {
    if (this.isEdit) {
      this.scopeForm.patchValue(this.data.scope);
    } else {
      // Auto-increment rank
      const nextRank = this.scopeService.getNextAvailableRank();
      this.scopeForm.patchValue({ rank: nextRank.toString() });
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    // retirer non-chiffres
    const numericValue = pastedText.replace(/\D/g, '');
    // retirer zéros de tête
    const withoutLeadingZeros = numericValue.replace(/^0+/, '') || '0';
    // limiter à 3 caractères
    const cleanValue = withoutLeadingZeros.slice(0, 3);
    this.scopeForm.get('rank')?.setValue(cleanValue);
  }
  

  onKeyDown(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    if (allowedKeys.includes(event.key)) return;
    if (!/[0-9]/.test(event.key)) event.preventDefault();
  }

  onSubmit() {
    if (this.scopeForm.invalid) {
      return;
    }

    const formValue = this.scopeForm.value;
    const rank = parseInt(formValue.rank || '0');

    if (this.isEdit && this.scopeForm.controls.rank.value !== null) {
      this.scopeService.updateScope(this.data.scope.id, formValue as Partial<Scope>).subscribe({
        next: () => {
          this.notification.showSuccess('scopes.updated');
          this.dialogRef.close(true);
        },
        error: () => this.notification.showError('scopes.update_error')
      });
    } else {
      this.scopeService.addScope(formValue as Partial<Scope>).subscribe({
        next: () => {
          this.notification.showSuccess('scopes.created');
          this.dialogRef.close(true);
        },
        error: () => this.notification.showError('scopes.create_error')
      });
    }
  }

  onCancel() {
    this.dialogRef.close()
  }
}