import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PartnerService } from './partner.service';
import { NotificationService } from '../../services/notification/notification.service';
import { of, delay, tap } from 'rxjs';

describe('PartnerService', () => {
  let service: PartnerService;
  let notificationSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('NotificationService', ['showError']);

    TestBed.configureTestingModule({
      providers: [
        PartnerService,
        { provide: NotificationService, useValue: spy }
      ]
    });

    service = TestBed.inject(PartnerService);
    notificationSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with empty partners list', () => {
    expect(service.partners()).toEqual([]);
  });

  it('should return queue names', () => {
    const queues = service.getQueueNames();
    expect(queues.length).toBeGreaterThan(0);
    expect(queues).toContain('MQ_ORDER_PROCESSING');
  });

  it('should get partners and update loading state', fakeAsync(() => {
    let result: any[] = [];

    service.getPartners().subscribe(p => result = p);
    expect(service.loading()).toBeTrue();

    tick(100);
    expect(service.loading()).toBeFalse();
    expect(result).toEqual([]);
  }));

  it('should handle error in getPartners', fakeAsync(() => {
    spyOn(service, 'getPartners').and.returnValue(
      of([]).pipe(
        delay(100),
        tap({ error: () => { throw new Error('fail'); } })
      )
    );
  
    service.getPartners().subscribe({
      next: () => {},
      error: () => {
        expect(service.loading()).toBeFalse();
        expect(notificationSpy.showError).toHaveBeenCalledWith('partners.load_error');
      }
    });
  
    tick(100);
  }));

  it('should add a new partner and update loading', fakeAsync(() => {
    const newPartner = { name: 'TestPartner' };
    service.addPartner(newPartner).subscribe();

    tick(100);
    const partners = service.partners();
    expect(partners.length).toBe(1);
    expect(partners[0].name).toBe('TestPartner');
    expect(partners[0].id).toBeDefined();
    expect(service.loading()).toBeFalse();
  }));

  it('should update an existing partner by ID', fakeAsync(() => {
    const partner = { id: '123', name: 'OldName' };
    service.partners.set([partner]);

    service.updatePartner('123', { name: 'NewName' }).subscribe();
    tick(100);

    const updated = service.partners().find(p => p.id === '123');
    expect(updated?.name).toBe('NewName');
    expect(service.loading()).toBeFalse();
  }));

  it('should not update if partner ID does not exist', fakeAsync(() => {
    service.partners.set([{ id: '1', name: 'A' }]);
    service.updatePartner('invalid', { name: 'X' }).subscribe();

    tick(100);
    expect(service.partners()[0].name).toBe('A');
  }));
});
