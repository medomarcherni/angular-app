import { Injectable, signal } from '@angular/core';
import { delay, of, tap } from 'rxjs';
import { NotificationService } from '../../services/notification/notification.service';

@Injectable({ providedIn: 'root' })
export class PartnerService {
  partners = signal<any[]>([]);
  loading = signal(false);
  queueNames = [
    'MQ_FROM_PAP_MSG',
    'DIR_FLXTW094',
    'MQ_FROM_KEMM_WWIL_MSG',
    'PRINTER_MAIN',
    'S3_BACKUP_STORAGE',
    'MQ_ORDER_PROCESSING'
  ];

  constructor(private notification: NotificationService) {}

  getPartners() {
    this.loading.set(true);
    return of(this.partners()).pipe(
      delay(300),
      tap({
        next: () => this.loading.set(false),
        error: () => {
          this.loading.set(false);
          this.notification.showError('partners.load_error');
        }
      })
    );
  }

  getQueueNames(): string[] {
    return this.queueNames;
  }

  addPartner(partner: any) {
    this.loading.set(true);
    const newPartner = {
      ...partner,
      id: Date.now().toString()
    };
    this.partners.update(partners => [...partners, newPartner]);
    return of(null).pipe(
      delay(300),
      tap(() => this.loading.set(false))
    );
  }

  updatePartner(id: string, partner: any) {
    this.loading.set(true);
    this.partners.update(partners => 
      partners.map(p => p.id === id ? { ...p, ...partner } : p)
    );
    return of(null).pipe(
      delay(300),
      tap(() => this.loading.set(false))
    );
  }
}