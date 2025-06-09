import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScopeListComponent } from './scope-list.component';
import { ScopeService } from '../../../core/api/scope/scope.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { signal } from '@angular/core';
import { ScopeFormComponent } from '../scope-form/scope-form.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationService } from '../../../core/services/translation/translation.service';

describe('ScopeListComponent', () => {
  let component: ScopeListComponent;
  let fixture: ComponentFixture<ScopeListComponent>;
  let mockScopeService: any;
  let mockMatDialog: any;

  beforeEach(() => {
    mockScopeService = {
      scopes: signal([]),
      loading: signal(false),
      getScopes: jasmine.createSpy('getScopes').and.returnValue(of([]))
    };

    mockMatDialog = {
      open: jasmine.createSpy()
    };

    TestBed.configureTestingModule({
      imports: [ScopeListComponent, NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [
        { provide: ScopeService, useValue: mockScopeService },
        { provide: NotificationService, useValue: {} },
        { provide: MatDialog, useValue: mockMatDialog },
        TranslationService
      ]
    });

    fixture = TestBed.createComponent(ScopeListComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call getScopes on init', () => {
    component.ngOnInit();
    expect(mockScopeService.getScopes).toHaveBeenCalledTimes(1);
  });

  it('should call getScopes in loadScopes()', () => {
    component.loadScopes();
    expect(mockScopeService.getScopes).toHaveBeenCalled();
  });

  it('should open create dialog and reload scopes after close', () => {
    mockMatDialog.open.and.returnValue({
      afterClosed: () => of(true)
    });

    component.openCreateDialog();

    expect(mockMatDialog.open).toHaveBeenCalledWith(ScopeFormComponent, {
      width: '600px'
    });

    expect(mockScopeService.getScopes).toHaveBeenCalled();
  });

  it('should open edit dialog with scope and reload scopes after close', () => {
    const mockScope = { id: '456461', name: 'Test', rank: '1', description: 'scope' };

    component.ngOnInit(); // Appel 1

    mockMatDialog.open.and.returnValue({
      afterClosed: () => of(true)
    });

    component.openEditDialog(mockScope);

    expect(mockMatDialog.open).toHaveBeenCalledWith(ScopeFormComponent, {
      width: '600px',
      data: { scope: mockScope }
    });

    expect(mockScopeService.getScopes).toHaveBeenCalledTimes(2); // init + edit
  });

  it('should NOT reload scopes if dialog is closed with falsy value (edit)', () => {
    const mockScope = { id: '456461', name: 'Test', rank: '1', description: 'scope' };

    mockMatDialog.open.and.returnValue({
      afterClosed: () => of(null)
    });

    component.openEditDialog(mockScope);

    expect(mockScopeService.getScopes).toHaveBeenCalledTimes(0);
  });

  it('should NOT reload scopes if dialog is closed with falsy value (create)', () => {
    mockMatDialog.open.and.returnValue({
      afterClosed: () => of(undefined)
    });

    component.openCreateDialog();

    expect(mockScopeService.getScopes).toHaveBeenCalledTimes(0);
  });

  it('should expose columns list', () => {
    expect(component.displayedColumns).toEqual([
      'rank', 'name', 'description', 'comment', 'condition', 'actions'
    ]);
  });

  it('should expose scopes and loading signals', () => {
    expect(component.scopes()).toEqual([]);
    expect(component.loading()).toBeFalse();
  });
});
