import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { TranslationService } from '../../../core/services/translation/translation.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let translationService: jasmine.SpyObj<TranslationService>;

  beforeEach(async () => {
    const translationSpy = jasmine.createSpyObj('TranslationService', ['setLanguage']);

    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
        MatToolbarModule,
        MatButtonModule,
        MatMenuModule,
        MatIconModule,
        RouterTestingModule, // Replaced RouterLink and RouterLinkActive with RouterTestingModule
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: TranslationService, useValue: translationSpy },
        TranslateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    translationService = TestBed.inject(TranslationService) as jasmine.SpyObj<TranslationService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject TranslationService', () => {
    expect(component.translation).toBeTruthy();
    expect(component.translation).toEqual(translationService);
  });

  describe('changeLanguage', () => {
    it('should call setLanguage on translation service with provided language', () => {
      const testLanguage = 'fr';
      component.changeLanguage(testLanguage);
      expect(translationService.setLanguage).toHaveBeenCalledWith(testLanguage);
    });

    it('should handle different language codes', () => {
      const languages = ['en', 'es', 'de', 'fr'];
      languages.forEach(lang => {
        component.changeLanguage(lang);
        expect(translationService.setLanguage).toHaveBeenCalledWith(lang);
        translationService.setLanguage.calls.reset();
      });
    });
  });
});