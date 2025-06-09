import { Component, computed, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AsyncPipe } from '@angular/common';
import { Scope } from '../../../shared/models/scope.model';
import { ScopeService } from '../../../core/api/scope/scope.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { ScopeFormComponent } from '../scope-form/scope-form.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-scope-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  templateUrl: './scope-list.component.html',
  styleUrls: ['./scope-list.component.scss']
})
export class ScopeListComponent {
  private scopeService = inject(ScopeService);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);

  displayedColumns = ['rank', 'name', 'description', 'comment', 'condition', 'actions'];
  scopes = this.scopeService.scopes;
  loading = this.scopeService.loading;

  ngOnInit() {
    this.loadScopes();
  }

  loadScopes() {
    this.scopeService.getScopes().subscribe();
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(ScopeFormComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadScopes();
      }
    });
  }

  openEditDialog(scope: Scope) {
    const dialogRef = this.dialog.open(ScopeFormComponent, {
      width: '600px',
      data: { scope }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadScopes();
      }
    });
  }
}