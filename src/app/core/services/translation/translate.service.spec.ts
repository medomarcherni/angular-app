import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  let service: TranslationService;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('TranslateService', ['addLangs', 'setDefaultLang', 'use', 'instant']);

    TestBed.configureTestingModule({
      providers: [
        TranslationService,
        { provide: TranslateService, useValue: spy }
      ]
    });

    service = TestBed.inject(TranslationService);
    translateServiceSpy = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize available languages', () => {
    expect(translateServiceSpy.addLangs).toHaveBeenCalledWith(['en', 'fr']);
    expect(translateServiceSpy.setDefaultLang).toHaveBeenCalledWith('en');
    expect(translateServiceSpy.use).toHaveBeenCalledWith('en');
    expect(service.currentLang()).toBe('en');
  });

  it('should change language', () => {
    service.setLanguage('fr');
    expect(service.currentLang()).toBe('fr');
    expect(translateServiceSpy.use).toHaveBeenCalledWith('fr');
  });

  it('should get translated string using instant', () => {
    translateServiceSpy.instant.and.returnValue('Hello');
    const result = service.get('greeting');
    expect(result).toBe('Hello');
    expect(translateServiceSpy.instant).toHaveBeenCalledWith('greeting', undefined);
  });

  it('should get translated string with parameters', () => {
    const params = { name: 'John' };
    translateServiceSpy.instant.and.returnValue('Hello John');
    const result = service.get('hello.name', params);
    expect(result).toBe('Hello John');
    expect(translateServiceSpy.instant).toHaveBeenCalledWith('hello.name', params);
  });
});
