import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { Observable, map, startWith } from 'rxjs';
import { PartnerService } from '../../../core/api/partner/partner.service';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-partner-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatAutocompleteModule,
    TranslateModule,
    AsyncPipe
  ],
  templateUrl: './partner-form.component.html',
  styleUrls: ['./partner-form.component.scss']
})
export class PartnerFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<PartnerFormComponent>);
  private partnerService = inject(PartnerService);
  private notification = inject(NotificationService);
  private data = inject(MAT_DIALOG_DATA, { optional: true });

  isEdit = !!this.data?.partner;
  filteredQueueNames!: Observable<string[]>;
  hostingTypes: string[] = ['MQ', 'DIRECTORY', 'PRINTER', 'S3'];
  availableHostingTypes: string[] = this.hostingTypes;

  partnerForm: FormGroup = this.fb.group({
    status: ['ACTIVE'],
    hostingType: ['', Validators.required],
    alias: ['', Validators.required],
    queueName: ['', [Validators.required]],
    application: [''],
    description: ['', Validators.required]
  });

  ngOnInit() {
    this.setupQueueNameAutocomplete();
    
    if (this.isEdit) {
      this.partnerForm.patchValue(this.data.partner);
      this.partnerForm.get('status')?.disable();
    } else {
      // Simulate scope rank check
      const hasRank3Scope = true; // Replace with actual logic
      this.partnerForm.patchValue({ status: hasRank3Scope ? 'ACTIVE' : 'INACTIVE' });
    }

    this.partnerForm.get('hostingType')?.valueChanges.subscribe(type => {
      this.updateHostingTypeConstraints(type);
    });

    this.partnerForm.get('queueName')?.valueChanges.subscribe(queueName => {
      this.updateAvailableHostingTypes(queueName);
    });
  }

  setupQueueNameAutocomplete() {
    this.filteredQueueNames = this.partnerForm.get('queueName')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterQueueNames(value || ''))
    );
  }

  private _filterQueueNames(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.partnerService.getQueueNames().filter(
      option => option.toLowerCase().includes(filterValue)
    );
  }

  updateAvailableHostingTypes(queueName: string) {
    if (['MQ_FROM_PAP_MSG', 'DIR_FLXTW094'].includes(queueName)) {
      this.availableHostingTypes = ['MQ', 'DIRECTORY'];
    } else if (queueName === 'MQ_FROM_KEMM_WWIL_MSG') {
      this.availableHostingTypes = ['S3'];
    } else {
      this.availableHostingTypes = this.hostingTypes;
    }

    const currentType = this.partnerForm.get('hostingType')?.value;
    if (!this.availableHostingTypes.includes(currentType)) {
      this.partnerForm.get('hostingType')?.setValue('');
    }
  }

  updateHostingTypeConstraints(type: string) {
    const applicationControl = this.partnerForm.get('application');
    if (['PRINTER', 'S3'].includes(type)) {
      applicationControl?.setValidators([Validators.required]);
    } else {
      applicationControl?.clearValidators();
    }
    applicationControl?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.partnerForm.invalid) return;

    const formValue = this.partnerForm.getRawValue();

    if (this.isEdit) {
      this.partnerService.updatePartner(this.data.partner.id, formValue).subscribe({
        next: () => {
          this.notification.showSuccess('partners.updated');
          this.dialogRef.close(true);
        },
        error: () => this.notification.showError('partners.update_error')
      });
    } else {
      this.partnerService.addPartner(formValue).subscribe({
        next: () => {
          this.notification.showSuccess('partners.created');
          this.dialogRef.close(true);
        },
        error: () => this.notification.showError('partners.create_error')
      });
    }
  }

  onCancel(){
    this.dialogRef.close();
  }
}