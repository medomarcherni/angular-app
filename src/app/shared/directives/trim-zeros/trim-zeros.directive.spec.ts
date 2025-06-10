import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TrimZerosDirective } from './trim-zeros.directive';
import { Component } from '@angular/core';

// Create a test component to host the directive
@Component({
  standalone: true,
  imports: [TrimZerosDirective, ReactiveFormsModule],
  template: `<input type="text" [formControl]="control" trimZeros>`
})
class TestComponent {
  control = new FormControl('');
}

describe('TrimZerosDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let inputEl: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should trim leading zeros on input', () => {
    inputEl.value = '000123';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    
    expect(component.control.value).toBe('123');
  });

  it('should keep the value if no leading zeros', () => {
    inputEl.value = '123';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    
    expect(component.control.value).toBe('123');
  });

  it('should set to "0" if input becomes empty after trimming', () => {
    inputEl.value = '000';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    
    expect(component.control.value).toBe('0');
  });

  it('should handle empty string input', () => {
    inputEl.value = '';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    
    expect(component.control.value).toBe('0');
  });

  it('should preserve non-leading zeros', () => {
    inputEl.value = '1002';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    
    expect(component.control.value).toBe('1002');
  });

  it('should work with mixed characters (though this might not be the intended use)', () => {
    inputEl.value = '00abc123';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    
    expect(component.control.value).toBe('abc123');
  });
});