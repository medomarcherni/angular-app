import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight',
  standalone: true
})
export class HighlightPipe implements PipeTransform {
  transform(value: string, searchText: string): string {
    if (!searchText || !value) return value;

    const escapedSearch = this.escapeRegExp(searchText);
    const regex = new RegExp(escapedSearch, 'gi');
    return value.replace(regex, match => `<span class="highlight">${match}</span>`);
  }

  private escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}