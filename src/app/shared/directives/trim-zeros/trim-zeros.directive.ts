import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({ 
    selector: '[trimZeros]',
    standalone: true 
})
export class TrimZerosDirective {
  constructor(private ngControl: NgControl) {}

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    const trimmed = value.replace(/^0+/, '') || '0';
    this.ngControl.control?.setValue(trimmed, { emitEvent: false });
  }
}