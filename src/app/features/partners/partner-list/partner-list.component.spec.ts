import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { PartnerListComponent } from './partner-list.component';
import { PartnerService } from '../../../core/api/partner/partner.service';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { signal } from '@angular/core';

describe('PartnerListComponent', () => {
  let component: PartnerListComponent;
  let fixture: ComponentFixture<PartnerListComponent>;
  let mockPartnerService: jasmine.SpyObj<PartnerService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockNotification: jasmine.SpyObj<NotificationService>;

  const mockPartners = [
    { alias: 'Alpha', application: 'App1', description: 'Desc1', status: 'active', hostingType: 'cloud', queueName: 'Q1' },
    { alias: 'Beta', application: 'App2', description: 'Desc2', status: 'inactive', hostingType: 'on-premise', queueName: 'Q2' }
  ];

  beforeEach(async () => {
    mockPartnerService = jasmine.createSpyObj('PartnerService', ['getPartners'], { loading: signal(false) });
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockNotification = jasmine.createSpyObj('NotificationService', ['showSuccess', 'showError']);

    await TestBed.configureTestingModule({
      imports: [PartnerListComponent, NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [
        { provide: PartnerService, useValue: mockPartnerService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: NotificationService, useValue: mockNotification }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PartnerListComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load partners on init', fakeAsync(() => {
    mockPartnerService.getPartners.and.returnValue(of(mockPartners));
    fixture.detectChanges();
    tick();
    expect(mockPartnerService.getPartners).toHaveBeenCalled();
    expect(component.partners()).toEqual(mockPartners);
  }));

  it('should filter partners based on search term', fakeAsync(() => {
    mockPartnerService.getPartners.and.returnValue(of(mockPartners));
    fixture.detectChanges();
    tick();

    component.searchControl.setValue('Beta');
    tick(300);

    const filtered = component.filteredPartners();
    expect(filtered.length).toBe(1);
    expect(filtered[0].alias).toBe('Beta');
  }));

  it('should open create dialog and reload partners after close', fakeAsync(() => {
    mockPartnerService.getPartners.and.returnValue(of(mockPartners));
    const afterClosed$ = of(true);
    mockDialog.open.and.returnValue({ afterClosed: () => afterClosed$ } as any);

    fixture.detectChanges();
    tick();

    component.openCreateDialog();
    tick();

    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockPartnerService.getPartners).toHaveBeenCalledTimes(2);
  }));

  it('should open edit dialog with partner and reload after close', fakeAsync(() => {
    mockPartnerService.getPartners.and.returnValue(of(mockPartners));
    const afterClosed$ = of(true);
    mockDialog.open.and.returnValue({ afterClosed: () => afterClosed$ } as any);

    fixture.detectChanges();
    tick();

    component.openEditDialog(mockPartners[0]);
    tick();

    expect(mockDialog.open).toHaveBeenCalledWith(jasmine.any(Function), jasmine.objectContaining({
      width: '800px',
      data: { partner: mockPartners[0] }
    }));
    expect(mockPartnerService.getPartners).toHaveBeenCalledTimes(2);
  }));
});
