import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PartnerFormComponent } from '../partner-form/partner-form.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { PartnerService } from '../../../core/api/partner/partner.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { MatTooltip } from '@angular/material/tooltip';
import { HighlightPipe } from '../../../shared/pipes/highlight.pipe';

@Component({
  selector: 'app-partner-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltip,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    TranslateModule,
    HighlightPipe
  ],
  templateUrl: './partner-list.component.html',
  styleUrls: ['./partner-list.component.scss']
})
export class PartnerListComponent {
  private partnerService = inject(PartnerService);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);

  displayedColumns = ['status', 'hostingType', 'alias', 'queueName', 'application', 'description', 'actions'];
  partners = signal<any[]>([]);
  filteredPartners = signal<any[]>([]);
  loading = this.partnerService.loading;
  searchControl = new FormControl('');
  searchTerm: string = '';

  ngOnInit() {
    this.loadPartners();
    this.setupSearch();
  }

  loadPartners() {
    this.partnerService.getPartners().subscribe(partners => {
      this.partners.set(partners);
      this.filterPartners();
    });
  }

  setupSearch() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.filterPartners());
  }

  filterPartners() {
    this.searchTerm = this.searchControl.value?.toLowerCase() || '';
    this.filteredPartners.set(
      this.partners().filter(partner => {
        console.log(partner)
        console.log(Object.values(partner))
        return Object.values(partner).some((val: any) => {
            console.log(val)
            return val?.toString().toLowerCase().includes(this.searchTerm)
        }
            
        )
      })
    );
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(PartnerFormComponent, {
      width: '800px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPartners();
      }
    });
  }

  openEditDialog(partner: any) {
    const dialogRef = this.dialog.open(PartnerFormComponent, {
      width: '800px',
      data: { partner }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPartners();
      }
    });
  }
}