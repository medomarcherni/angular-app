import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileListComponent } from './profile-list.component';
import { MatDialog } from '@angular/material/dialog';
import { signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProfileService } from '../../../core/api/profile/profile.service';
import { ProfileFormComponent } from '../profile-form/profile-form.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

const mockProfiles = signal([
  { id: '1', code: 'ADMIN', description: 'Admin profile', scopes: ['Global'] }
]);
const mockLoading = signal(false);

class MockProfileService {
  profiles = mockProfiles;
  loading = mockLoading;
  getProfiles = jasmine.createSpy('getProfiles');
}

class MockMatDialog {
  open() {
    return {
      afterClosed: () => of(true)
    };
  }
}

describe('ProfileListComponent', () => {
  let component: ProfileListComponent;
  let fixture: ComponentFixture<ProfileListComponent>;
  let profileService: MockProfileService;
  let dialog: MatDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileListComponent, BrowserAnimationsModule, TranslateModule.forRoot()],
      providers: [
        { provide: ProfileService, useClass: MockProfileService },
        { provide: MatDialog, useClass: MockMatDialog },
        TranslateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileListComponent);
    component = fixture.componentInstance;
    profileService = TestBed.inject(ProfileService) as any;
    dialog = TestBed.inject(MatDialog);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getProfiles on ngOnInit', () => {
    component.ngOnInit();
    expect(profileService.getProfiles).toHaveBeenCalled();
  });

  it('should call getProfiles after closing create dialog', () => {
    spyOn(dialog, 'open').and.callThrough();
    component.openCreateDialog();
    expect(dialog.open).toHaveBeenCalledWith(ProfileFormComponent, {
      width: '600px'
    });
    expect(profileService.getProfiles).toHaveBeenCalled();
  });

  it('should call getProfiles after closing edit dialog', () => {
    const profile = { id: '1', code: 'ADMIN', description: 'test', scopes: [] as string[] };
    spyOn(dialog, 'open').and.callThrough();
    component.openEditDialog(profile);
    expect(dialog.open).toHaveBeenCalled();
    expect(profileService.getProfiles).toHaveBeenCalled();
  });

  it('should refresh profiles when refresh is called', () => {
    component.refresh();
    expect(profileService.getProfiles).toHaveBeenCalled();
  });
});
