import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslationService } from '../translation/translation.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private snackBar = inject(MatSnackBar);
  private translation = inject(TranslationService);

  showSuccess(messageKey: string, params?: any) {
    this.snackBar.open(
      this.translation.get(messageKey, params),
      this.translation.get('common.close'),
      { duration: 3000, panelClass: ['success-snackbar'] }
    );
  }

  showError(messageKey: string, params?: any) {
    this.snackBar.open(
      this.translation.get(messageKey, params),
      this.translation.get('common.close'),
      { duration: 5000, panelClass: ['error-snackbar'] }
    );
  }
}