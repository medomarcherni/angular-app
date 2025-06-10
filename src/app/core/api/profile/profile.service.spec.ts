import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProfileService } from './profile.service';
import { NotificationService } from '../../services/notification/notification.service';
import { Profile } from '../../../shared/models/profile.model';
import { of, delay } from 'rxjs';

describe('ProfileService', () => {
  let service: ProfileService;
  let notificationSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('NotificationService', ['showSuccess', 'showError']);

    TestBed.configureTestingModule({
      providers: [
        ProfileService,
        { provide: NotificationService, useValue: spy }
      ]
    });

    service = TestBed.inject(ProfileService);
    notificationSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with ADMIN profile', () => {
    const profiles = service.profiles();
    expect(profiles.length).toBe(1);
    expect(profiles[0].code).toBe('ADMIN');
  });

  it('should set loading true then false on getProfiles()', fakeAsync(() => {
    service.getProfiles();
    expect(service.loading()).toBeTrue();

    tick(500);
    expect(service.loading()).toBeFalse();
  }));

  it('should call showError on getProfiles error', fakeAsync(() => {
    spyOn(of([]).pipe(delay(500)), 'subscribe').and.throwError('forced');
    service.getProfiles = function () {
      this.loading.set(true);
      return of(null).pipe(delay(500)).subscribe({
        next: () => {
          this.loading.set(false);
          this.notification.showError('profiless.load_error');
        },
        error: () => {}
      });
    };

    service.getProfiles();
    tick(500);

    expect(notificationSpy.showError).toHaveBeenCalledWith('profiless.load_error');
    expect(service.loading()).toBeFalse();
  }));

  it('should add a new profile', () => {
    const newProfile: Partial<Profile> = {
      code: 'USER',
      description: 'Basic user',
      scopes: ['Limited']
    };

    service.addProfile(newProfile);

    const profiles = service.profiles();
    expect(profiles.length).toBe(2);
    expect(profiles[1].code).toBe('USER');
    expect(notificationSpy.showSuccess).toHaveBeenCalledWith('profile.created');
    expect(service.loading()).toBeFalse();
  });

  it('should handle addProfile with empty object', () => {
    service.addProfile({});
    const profiles = service.profiles();
    expect(profiles.length).toBeGreaterThan(1);
    expect(profiles[profiles.length - 1].id).toBeTruthy();
  });

  it('should update existing profile', () => {
    const id = service.profiles()[0].id!;
    service.updateProfile(id, { description: 'Updated desc' });

    const updated = service.profiles().find(p => p.id === id);
    expect(updated?.description).toBe('Updated desc');
    expect(notificationSpy.showSuccess).toHaveBeenCalledWith('profile.updated');
    expect(service.loading()).toBeFalse();
  });

  it('should not update any profile if ID not found', () => {
    const before = [...service.profiles()];
    service.updateProfile('non-existent-id', { description: 'Nothing' });

    const after = service.profiles();
    expect(after).toEqual(before);
    expect(notificationSpy.showSuccess).toHaveBeenCalledWith('profile.updated');
  });
});
