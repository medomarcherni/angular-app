// profile.service.ts
import { inject, Injectable, signal } from '@angular/core';
import { of } from 'rxjs/internal/observable/of';
import { delay, tap } from 'rxjs/operators';
import { Profile } from '../../../shared/models/profile.model';
import { NotificationService } from '../../services/notification/notification.service';


@Injectable({ providedIn: 'root' })
export class ProfileService {
  profiles = signal<Partial<Profile>[]>([]);
  loading = signal(false);
  notification = inject(NotificationService);

  constructor() {
    this.profiles.set([
      {
        id: '1',
        code: 'ADMIN',
        description: 'Profile with full access',
        scopes: ['Global'],
        createdAt: new Date(),
        updatedAt: new Date(),
        lastModifiedBy: 'system'
      }
    ]);
  }

  getProfiles() {
    this.loading.set(true);
    return of(this.profiles()).pipe(delay(300))
      .subscribe({
      
        next: () => this.loading.set(false),
        error: () => {
          this.loading.set(false);
          this.notification.showError('profiless.load_error');
        }
      })
  }

  addProfile(profile: Partial<Profile>) {
    this.loading.set(true);
    const newProfile: Partial<Profile> = {
      ...profile,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastModifiedBy: 'current-user'
    };
    
    this.profiles.update(profiles => [...profiles, newProfile]);
    this.loading.set(false);
    this.notification.showSuccess('profile.created');
  }

  updateProfile(id: string, profile: Partial<Profile>) {
    this.loading.set(true);
    this.profiles.update(profiles => 
      profiles.map(p => 
        p.id === id 
          ? { ...p, ...profile, updatedAt: new Date(), lastModifiedBy: 'current-user' }
          : p
      )
    );
    this.loading.set(false);
    this.notification.showSuccess('profile.updated');
  }
}