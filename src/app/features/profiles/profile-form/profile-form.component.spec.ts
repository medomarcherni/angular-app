import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileFormComponent } from './profile-form.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProfileService } from '../../../core/api/profile/profile.service';
import { ScopeService } from '../../../core/api/scope/scope.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { Profile } from '../../../shared/models/profile.model';

describe('ProfileFormComponent', () => {
    let component: ProfileFormComponent;
    let fixture: ComponentFixture<ProfileFormComponent>;
    let mockDialogRef: jasmine.SpyObj<MatDialogRef<ProfileFormComponent>>;
    let mockProfileService: jasmine.SpyObj<ProfileService>;
    let mockScopeService: jasmine.SpyObj<ScopeService>;
    let translateService: TranslateService;

    const mockScopes = ['scope1', 'scope2', 'scope3'];
    const mockProfile: Partial<Profile> = {
        id: '1',
        code: 'test01',
        description: 'Test profile description',
        scopes: ['scope1']
    };

    beforeEach(async () => {
        mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
        mockProfileService = jasmine.createSpyObj('ProfileService', ['addProfile', 'updateProfile']);
        mockScopeService = jasmine.createSpyObj('ScopeService', { scopes: mockScopes });

        await TestBed.configureTestingModule({
            imports: [
                ProfileFormComponent,
                ReactiveFormsModule,
                MatDialogModule,
                MatFormFieldModule,
                MatInputModule,
                MatButtonModule,
                MatSelectModule,
                MatDatepickerModule,
                NoopAnimationsModule,
                TranslateModule.forRoot()
            ],
            providers: [
                FormBuilder,
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: ProfileService, useValue: mockProfileService },
                { provide: ScopeService, useValue: mockScopeService },
                { provide: MAT_DIALOG_DATA, useValue: {} }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ProfileFormComponent);
        component = fixture.componentInstance;
        translateService = TestBed.inject(TranslateService);

        // Mock translation service
        spyOn(translateService, 'instant').and.callFake((key: string) => key);
        spyOn(translateService, 'get').and.returnValue(of(''));

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Form Initialization', () => {
        it('should initialize form with empty values when no data provided', () => {
            expect(component.profileForm.value).toEqual({
                code: '',
                description: '',
                scopes: ['']
            });
        });

        it('should patch form values when edit mode', () => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                imports: [
                    ProfileFormComponent,
                    ReactiveFormsModule,
                    MatDialogModule,
                    MatFormFieldModule,
                    MatInputModule,
                    MatButtonModule,
                    MatSelectModule,
                    MatDatepickerModule,
                    NoopAnimationsModule,
                    TranslateModule.forRoot()
                ],
                providers: [
                    FormBuilder,
                    { provide: MatDialogRef, useValue: mockDialogRef },
                    { provide: ProfileService, useValue: mockProfileService },
                    { provide: ScopeService, useValue: mockScopeService },
                    { provide: MAT_DIALOG_DATA, useValue: { profile: mockProfile } }
                ]
            }).compileComponents();

            const editFixture = TestBed.createComponent(ProfileFormComponent);
            const editComponent = editFixture.componentInstance;
            editFixture.detectChanges();

            expect(editComponent.isEdit).toBeTrue();
            expect(editComponent.profileForm.value).toEqual({
                code: mockProfile.code,
                description: mockProfile.description,
                scopes: mockProfile.scopes
            });
        });
    });

    describe('Form Validation', () => {
        it('should make code field required', () => {
            const codeControl = component.profileForm.get('code');
            codeControl?.setValue('');
            expect(codeControl?.hasError('required')).toBeTrue();
        });

        it('should validate code min length (5)', () => {
            const codeControl = component.profileForm.get('code');
            codeControl?.setValue('1234');
            expect(codeControl?.hasError('minlength')).toBeTrue();
        });

        it('should validate code max length (10)', () => {
            const codeControl = component.profileForm.get('code');
            codeControl?.setValue('12345678901');
            expect(codeControl?.hasError('maxlength')).toBeTrue();
        });

        it('should validate code pattern (alphanumeric)', () => {
            const codeControl = component.profileForm.get('code');
            codeControl?.setValue('test@');
            expect(codeControl?.hasError('pattern')).toBeTrue();
        });

        it('should validate code cannot be all numbers', () => {
            const codeControl = component.profileForm.get('code');
            codeControl?.setValue('12345');
            expect(codeControl?.hasError('pattern')).toBeTrue();
        });

        it('should make description field required', () => {
            const descControl = component.profileForm.get('description');
            descControl?.setValue('');
            expect(descControl?.hasError('required')).toBeTrue();
        });

        it('should validate description min length (10)', () => {
            const descControl = component.profileForm.get('description');
            descControl?.setValue('short');
            expect(descControl?.hasError('minlength')).toBeTrue();
        });

        it('should validate description max length (30)', () => {
            const descControl = component.profileForm.get('description');
            descControl?.setValue('This description is way too long to be valid for the form field');
            expect(descControl?.hasError('maxlength')).toBeTrue();
        });

        it('should make scopes field required', () => {
            const scopesControl = component.profileForm.get('scopes');
            scopesControl?.setValue([]);
            expect(scopesControl?.hasError('required')).toBeTrue();
        });
    });

    describe('Form Submission', () => {
        it('should not submit if form is invalid', () => {
            component.profileForm.setValue({
                code: '',
                description: '',
                scopes: []
            });
            component.onSubmit();
            expect(mockProfileService.addProfile).not.toHaveBeenCalled();
            expect(mockProfileService.updateProfile).not.toHaveBeenCalled();
            expect(mockDialogRef.close).not.toHaveBeenCalled();
        });

        it('should call addProfile when not in edit mode', () => {
            component.profileForm.setValue({
                code: 'valid01',
                description: 'Valid description',
                scopes: ['scope1']
            });
            component.onSubmit();
            expect(mockProfileService.addProfile).toHaveBeenCalledWith({
                code: 'valid01',
                description: 'Valid description',
                scopes: ['scope1']
            });
            expect(mockDialogRef.close).toHaveBeenCalledWith(true);
        });

        it('should call updateProfile when in edit mode', () => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                imports: [
                    ProfileFormComponent,
                    ReactiveFormsModule,
                    MatDialogModule,
                    MatFormFieldModule,
                    MatInputModule,
                    MatButtonModule,
                    MatSelectModule,
                    MatDatepickerModule,
                    NoopAnimationsModule,
                    TranslateModule.forRoot()
                ],
                providers: [
                    FormBuilder,
                    { provide: MatDialogRef, useValue: mockDialogRef },
                    { provide: ProfileService, useValue: mockProfileService },
                    { provide: ScopeService, useValue: mockScopeService },
                    { provide: MAT_DIALOG_DATA, useValue: { profile: mockProfile } }
                ]
            }).compileComponents();

            const editFixture = TestBed.createComponent(ProfileFormComponent);
            const editComponent = editFixture.componentInstance;
            editFixture.detectChanges();

            editComponent.profileForm.setValue({
                code: 'updated01',
                description: 'Updated description',
                scopes: ['scope2']
            });
            editComponent.onSubmit();
            expect(mockProfileService.updateProfile).toHaveBeenCalledWith('1', {
                code: 'updated01',
                description: 'Updated description',
                scopes: ['scope2']
            });
            expect(mockDialogRef.close).toHaveBeenCalledWith(true);
        });
    });

    describe('Cancel', () => {
        it('should close dialog on cancel', () => {
            component.onCancel();
            expect(mockDialogRef.close).toHaveBeenCalled();
        });
    });
});