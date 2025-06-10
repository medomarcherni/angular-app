import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from './shared/components/header/header.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        HeaderComponent,
        RouterTestingModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    
    spyOn(translateService, 'setDefaultLang');
    spyOn(translateService, 'use');
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize translations on ngOnInit', () => {
    fixture.detectChanges();
    expect(translateService.setDefaultLang).toHaveBeenCalledWith('en');
    expect(translateService.use).toHaveBeenCalledWith('en');
  });

  it('should contain router-outlet', () => {
    fixture.detectChanges();
    const routerOutlet = fixture.nativeElement.querySelector('router-outlet');
    expect(routerOutlet).toBeTruthy();
  });

  it('should contain app-header', () => {
    fixture.detectChanges();
    const header = fixture.nativeElement.querySelector('app-header');
    expect(header).toBeTruthy();
  });
});