import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ScopeFormComponent } from './scope-form.component';
import { ScopeService } from '../../../core/api/scope/scope.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

describe('ScopeFormComponent', () => {
  let component: ScopeFormComponent;
  let fixture: ComponentFixture<ScopeFormComponent>;

  let mockScopeService: jasmine.SpyObj<ScopeService>;
  let mockNotification: jasmine.SpyObj<NotificationService>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<ScopeFormComponent>>;

  const defaultData = { scope: { id: '1', rank: '5', name: 'Test', description: 'Desc', comment: '', condition: '' } };

  beforeEach(async () => {
    mockScopeService = jasmine.createSpyObj('ScopeService', ['addScope', 'updateScope', 'getNextAvailableRank']);
    mockScopeService.getNextAvailableRank.and.returnValue('1');
  
    mockNotification = jasmine.createSpyObj('NotificationService', ['showSuccess', 'showError']);
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
  
    await TestBed.configureTestingModule({
      imports: [ ScopeFormComponent, TranslateModule.forRoot() ],
      providers: [
        { provide: ScopeService, useValue: mockScopeService },
        { provide: NotificationService, useValue: mockNotification },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: null }
      ]
    }).compileComponents();
  });
  

  function createComponent(data?: any) {
    if (data) {
      TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: data });
    } else {
      TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: null });
    }
    fixture = TestBed.createComponent(ScopeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should patch form with data if editing', () => {
    createComponent(defaultData);
    expect(component.scopeForm.value.rank).toBe(defaultData.scope.rank.toString());
    expect(component.scopeForm.value.name).toBe(defaultData.scope.name);
    expect(component.scopeForm.value.description).toBe(defaultData.scope.description);
  });

  it('should patch rank with next available rank if creating', () => {
    mockScopeService.getNextAvailableRank.and.returnValue('7');
    createComponent();
    expect(component.scopeForm.value.rank).toBe('7');
  });

  it('should prevent submission if form invalid', () => {
    createComponent(defaultData);
    component.scopeForm.controls['rank'].setValue('');
    component.onSubmit();
    expect(mockScopeService.updateScope).not.toHaveBeenCalled();
    expect(mockScopeService.addScope).not.toHaveBeenCalled();
  });

  it('should call addScope on submit if creating and valid', fakeAsync(() => {
    createComponent();
    mockScopeService.addScope.and.returnValue(of(null));

    component.scopeForm.controls['rank'].setValue('10');
    component.scopeForm.controls['name'].setValue('Name');
    component.scopeForm.controls['description'].setValue('Desc');

    component.onSubmit();
    tick();

    expect(mockScopeService.addScope).toHaveBeenCalledWith(jasmine.objectContaining({
      rank: '10',
      name: 'Name',
      description: 'Desc'
    }));
    expect(mockNotification.showSuccess).toHaveBeenCalledWith('scopes.created');
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  }));

  it('should handle updateScope error', fakeAsync(() => {
    createComponent(defaultData);
    mockScopeService.updateScope.and.returnValue(throwError(() => new Error('err')));

    component.scopeForm.controls['rank'].setValue('10');
    component.scopeForm.controls['name'].setValue('Name');
    component.scopeForm.controls['description'].setValue('Desc');

    component.onSubmit();
    tick();

    expect(mockNotification.showError).toHaveBeenCalledWith('scopes.update_error');
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  }));

  it('should handle addScope error', fakeAsync(() => {
    createComponent();
    mockScopeService.addScope.and.returnValue(throwError(() => new Error('err')));

    component.scopeForm.controls['rank'].setValue('10');
    component.scopeForm.controls['name'].setValue('Name');
    component.scopeForm.controls['description'].setValue('Desc');

    component.onSubmit();
    tick();

    expect(mockNotification.showError).toHaveBeenCalledWith('scopes.create_error');
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  }));

  it('should close dialog on cancel', () => {
    createComponent();
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should prevent non-digit keys on onKeyDown', () => {
    createComponent();
    const event = new KeyboardEvent('keydown', { key: 'a' });
    spyOn(event, 'preventDefault');

    component.onKeyDown(event);

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should allow digit keys on onKeyDown', () => {
    createComponent();
    const event = new KeyboardEvent('keydown', { key: '5' });
    spyOn(event, 'preventDefault');

    component.onKeyDown(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should process onPaste replacing non-digits and leading zeros', () => {
    createComponent();

    const clipboardData = {
      getData: () => '00789abc'
    } as any;

    const event = {
      preventDefault: jasmine.createSpy('preventDefault'),
      clipboardData
    } as unknown as ClipboardEvent;

    component.onPaste(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.scopeForm.get('rank')?.value).toBe('789');
  });
});
