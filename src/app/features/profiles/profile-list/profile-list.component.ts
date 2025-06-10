import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProfileFormComponent } from '../profile-form/profile-form.component';
import { MatDialog } from '@angular/material/dialog';
import { ProfileService } from '../../../core/api/profile/profile.service';
import { TranslatePipe } from '@ngx-translate/core';
import { Profile } from '../../../shared/models/profile.model';

@Component({
  selector: 'app-profile-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    TranslatePipe,
    DatePipe,
    MatProgressSpinnerModule,
  ],
  templateUrl: './profile-list.component.html',
  styleUrl: './profile-list.component.scss'
})
export class ProfileListComponent {
  private profileService = inject(ProfileService);
  private dialog = inject(MatDialog);
  
  displayedColumns = ['code', 'description', 'scopes', 'createdAt', 'updatedAt', 'actions'];
  profiles = this.profileService.profiles;
  loading = this.profileService.loading;

  ngOnInit() {
    this.profileService.getProfiles();
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(ProfileFormComponent, { width: '600px' });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.profileService.getProfiles();
      }
    });
  }

  openEditDialog(profile: Profile) {
    const dialogRef = this.dialog.open(ProfileFormComponent, {
      width: '600px',
      data: { profile }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.profileService.getProfiles();
      }
    });
  }

  refresh() {
    this.profileService.getProfiles();
  }
}