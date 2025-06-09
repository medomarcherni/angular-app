// profile-form.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileService } from '../../../core/api/profile/profile.service';
import { ScopeService } from '../../../core/api/scope/scope.service';
import { Profile } from '../../../shared/models/profile.model';

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    TranslateModule
  ],
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss']
})
export class ProfileFormComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ProfileFormComponent>);
  private profileService = inject(ProfileService);
  private scopeService = inject(ScopeService);
  private data = inject(MAT_DIALOG_DATA, { optional: true });

  isEdit = !!this.data?.profile;
  scopes = this.scopeService.scopes;

  profileForm = this.fb.group({
    code: ['', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(10),
      Validators.pattern(/^[a-zA-Z0-9]+$/),
      Validators.pattern(/^(?![0-9]+$)/)
    ]],
    description: ['', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(30)
    ]],
    scopes: [[''], Validators.required]
  });

  ngOnInit() {
    if (this.isEdit) {
      this.profileForm.patchValue(this.data.profile);
    }
  }

  onSubmit() {
    if (this.profileForm.invalid) return;

    const formValue = this.profileForm.value;
    
    if (this.isEdit) {
      this.profileService.updateProfile(
        this.data.profile.id,
        formValue as Partial<Profile>
      );
    } else {
      this.profileService.addProfile(formValue as Partial<Profile>);
    }

    this.dialogRef.close(true);
  }

  onCancel(){
    this.dialogRef.close();
  }
}