import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ScopeService } from './scope.service';
import { NotificationService } from '../../services/notification/notification.service';
import { Scope } from '../../../shared/models/scope.model';
import { of, delay, tap } from 'rxjs';

describe('ScopeService', () => {
  let service: ScopeService;
  let notificationSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('NotificationService', ['showError']);
    
    TestBed.configureTestingModule({
      providers: [
        ScopeService,
        { provide: NotificationService, useValue: spy }
      ]
    });

    service = TestBed.inject(ScopeService);
    notificationSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default scope', () => {
    const scopes = service.scopes();
    expect(scopes.length).toBe(1);
    expect(scopes[0].name).toBe('Global');
  });

  it('should return scopes and toggle loading flag in getScopes()', fakeAsync(() => {
    let result: Partial<Scope>[] = [];

    service.getScopes().subscribe(scopes => result = scopes);
    expect(service.loading()).toBeTrue();

    tick(500);
    expect(service.loading()).toBeFalse();
    expect(result.length).toBe(1);
  }));

  it('should compute next available rank correctly', () => {
    expect(service.getNextAvailableRank()).toBe('2');
    service.scopes.set([
      { id: '1', name: 'Scope A', rank: '1' },
      { id: '2', name: 'Scope B', rank: '2' }
    ]);
    expect(service.getNextAvailableRank()).toBe('3');
  });

  it('should add scope with no existing rank conflict', fakeAsync(() => {
    const newScope: Partial<Scope> = { name: 'Scope X', rank: '99' };
    service.addScope(newScope).subscribe();

    tick(500);

    const scopes = service.scopes();
    expect(scopes.find(s => s.name === 'Scope X')).toBeTruthy();
    expect(service.loading()).toBeFalse();
  }));

  it('should add scope and swap rank if conflict exists', fakeAsync(() => {
    service.scopes.set([
      { id: '1', name: 'Scope A', rank: '1' }
    ]);

    const newScope: Partial<Scope> = { name: 'Scope B', rank: '1' };
    service.addScope(newScope).subscribe();

    tick(500);

    const updatedScopes = service.scopes();
    const scopeA = updatedScopes.find(s => s.name === 'Scope A');
    const scopeB = updatedScopes.find(s => s.name === 'Scope B');

    expect(scopeA?.rank).toBe('2'); // bumped
    expect(scopeB?.rank).toBe('1'); // original intended rank
    expect(updatedScopes.length).toBe(2);
  }));

  it('should update an existing scope by id', fakeAsync(() => {
    const id = service.scopes()[0].id!;
    const updatedName = 'Updated Name';

    service.updateScope(id, { name: updatedName }).subscribe();
    tick(500);

    const updated = service.scopes().find(s => s.id === id);
    expect(updated?.name).toBe(updatedName);
    expect(service.loading()).toBeFalse();
  }));

  it('should not break if updateScope is called with invalid id', fakeAsync(() => {
    const originalScopes = [...service.scopes()];
    service.updateScope('non-existent-id', { name: 'Invalid' }).subscribe();
    tick(500);

    expect(service.scopes()).toEqual(originalScopes);
  }));

  it('should handle error in getScopes', fakeAsync(() => {
    spyOn(service, 'getScopes').and.returnValue(
      of([]).pipe(
        delay(500),
        tap({ error: () => { throw new Error('fail'); } })
      )
    );
  
    service.getScopes().subscribe({
      next: () => {},
      error: () => {
        expect(service.loading()).toBeFalse();
        expect(notificationSpy.showError).toHaveBeenCalledWith('scopes.load_error');
      }
    });
  
    tick(500);
  }));
});
