import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  availableLangs = signal(['en', 'fr']);
  currentLang = signal('en');

  constructor(private translate: TranslateService) {
    this.translate.addLangs(this.availableLangs());
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  setLanguage(lang: string) {
    this.currentLang.set(lang);
    this.translate.use(lang);
  }

  get(key: string | string[], params?: any): string {
    return this.translate.instant(key, params);
  }
}