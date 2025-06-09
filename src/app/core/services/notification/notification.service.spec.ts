import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslationService } from '../translation/translation.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let translationSpy: jasmine.SpyObj<TranslationService>;

  beforeEach(() => {
    const snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);
    const translationMock = jasmine.createSpyObj('TranslationService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: TranslationService, useValue: translationMock }
      ]
    });

    service = TestBed.inject(NotificationService);
    snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    translationSpy = TestBed.inject(TranslationService) as jasmine.SpyObj<TranslationService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show success message', () => {
    translationSpy.get.and.callFake((key: string) => key);

    service.showSuccess('profile.created');

    expect(translationSpy.get).toHaveBeenCalledWith('profile.created', undefined);
    expect(translationSpy.get).toHaveBeenCalledWith('common.close');
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'profile.created',
      'common.close',
      { duration: 3000, panelClass: ['success-snackbar'] }
    );
  });

  it('should show error message', () => {
    translationSpy.get.and.callFake((key: string) => key);

    service.showError('partners.load_error');

    expect(translationSpy.get).toHaveBeenCalledWith('partners.load_error', undefined);
    expect(translationSpy.get).toHaveBeenCalledWith('common.close');
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'partners.load_error',
      'common.close',
      { duration: 5000, panelClass: ['error-snackbar'] }
    );
  });
});
