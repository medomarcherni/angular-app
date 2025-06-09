import { Injectable, signal } from '@angular/core';
import { delay, of, tap } from 'rxjs';
import { Scope } from '../../../shared/models/scope.model';
import { NotificationService } from '../../services/notification/notification.service';


@Injectable({ providedIn: 'root' })
export class ScopeService {
  scopes = signal<Partial<Scope>[]>([
    {
      description: "Global scope",
      id: "1749395076694",
      name: "Global",
      rank: '1',
    }
  ]);
  loading = signal(false);

  constructor(private notification: NotificationService) {}

  getScopes() {
    this.loading.set(true);
    return of(this.scopes()).pipe(
      delay(500),
      tap({
        next: () => this.loading.set(false),
        error: () => {
          this.loading.set(false);
          this.notification.showError('scopes.load_error');
        }
      })
    );
  }

  getNextAvailableRank(): string {
    const existingRanks: number [] = this.scopes().map(s => parseInt(s.rank || '0')) as number [];
    if (existingRanks.length === 0) return '1';
    return (Math.max(...existingRanks) + 1).toString();
  }

  addScope(scope:Partial<Scope>) {
    this.loading.set(true);
    const newScope: Partial<Scope> = {
      ...scope,
      id: Date.now().toString()
    };
    
    // Handle rank swapping if needed
    const existingScope = this.scopes().find(s => s.rank === scope.rank);
    if (existingScope) {
      const updatedScopes = this.scopes().map(s => 
        s.id === existingScope.id ? { ...s, rank: this.getNextAvailableRank() } : s
      );
      this.scopes.set([...updatedScopes, newScope]);
    } else {
      this.scopes.update(scopes => [...scopes, newScope]);
    }

    return of(null).pipe(
      delay(500),
      tap(() => this.loading.set(false))
    );
  }

  updateScope(id: string, scope: Partial<Scope>) {
    this.loading.set(true);
    this.scopes.update(scopes => 
      scopes.map(s => s.id === id ? { ...s, ...scope } : s)
    );
    return of(null).pipe(
      delay(500),
      tap(() => this.loading.set(false))
    );
  }
}