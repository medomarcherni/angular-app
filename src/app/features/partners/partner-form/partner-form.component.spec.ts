import {
    ComponentFixture,
    TestBed,
    fakeAsync,
    tick,
} from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PartnerFormComponent } from './partner-form.component';
import { PartnerService } from '../../../core/api/partner/partner.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';

describe('PartnerFormComponent', () => {
    let mockPartnerService: jasmine.SpyObj<PartnerService>;
    let mockNotification: jasmine.SpyObj<NotificationService>;
    let mockDialogRef: jasmine.SpyObj<MatDialogRef<PartnerFormComponent>>;

    beforeEach(() => {
        mockPartnerService = jasmine.createSpyObj('PartnerService', [
            'addPartner',
            'updatePartner',
            'getQueueNames',
        ]);
        mockNotification = jasmine.createSpyObj('NotificationService', [
            'showSuccess',
            'showError',
        ]);
        mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
        mockPartnerService.getQueueNames.and.returnValue([
            'MQ_FROM_PAP_MSG',
            'DIR_FLXTW094',
            'MQ_FROM_KEMM_WWIL_MSG',
        ]);
    });

    describe('Create Mode', () => {
        let component: PartnerFormComponent;
        let fixture: ComponentFixture<PartnerFormComponent>;

        beforeEach(async () => {
            await TestBed.configureTestingModule({
                imports: [
                    PartnerFormComponent,
                    TranslateModule.forRoot(),
                    ReactiveFormsModule,
                ],
                providers: [
                    { provide: PartnerService, useValue: mockPartnerService },
                    { provide: NotificationService, useValue: mockNotification },
                    { provide: MatDialogRef, useValue: mockDialogRef },
                    { provide: MAT_DIALOG_DATA, useValue: null },
                ],
            }).compileComponents();

            fixture = TestBed.createComponent(PartnerFormComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should call addPartner and show success on create', fakeAsync(() => {
            component.partnerForm.setValue({
                status: 'ACTIVE',
                hostingType: 'MQ',
                alias: 'new-alias',
                queueName: 'MQ_FROM_PAP_MSG',
                application: '',
                description: 'new description',
            });

            mockPartnerService.addPartner.and.returnValue(of(null));

            component.onSubmit();
            tick();

            expect(mockPartnerService.addPartner).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    alias: 'new-alias',
                })
            );
            expect(mockNotification.showSuccess).toHaveBeenCalledWith(
                'partners.created'
            );
            expect(mockDialogRef.close).toHaveBeenCalledWith(true);
        }));

        it('should call showError on addPartner failure', fakeAsync(() => {
            component.partnerForm.setValue({
                status: 'ACTIVE',
                hostingType: 'MQ',
                alias: 'new-alias',
                queueName: 'MQ_FROM_PAP_MSG',
                application: '',
                description: 'new description',
            });

            mockPartnerService.addPartner.and.returnValue(
                throwError(() => new Error('error'))
            );

            component.onSubmit();
            tick();

            expect(mockNotification.showError).toHaveBeenCalledWith(
                'partners.create_error'
            );
            expect(mockDialogRef.close).not.toHaveBeenCalled();
        }));

        it('should reset hostingType if queueName changes to invalid option', () => {
            component.partnerForm.get('hostingType')?.setValue('S3');
            component.partnerForm.get('queueName')?.setValue('MQ_FROM_PAP_MSG'); // valid: MQ, DIRECTORY
            component.updateAvailableHostingTypes('MQ_FROM_PAP_MSG');
            expect(component.partnerForm.get('hostingType')?.value).toBe('');
        });
    });

    describe('Edit Mode', () => {
        let component: PartnerFormComponent;
        let fixture: ComponentFixture<PartnerFormComponent>;
        const existingPartner = {
            id: '1',
            status: 'ACTIVE',
            hostingType: 'MQ',
            alias: 'edit-alias',
            queueName: 'MQ_FROM_PAP_MSG',
            application: '',
            description: 'edited desc',
        };

        beforeEach(async () => {
            await TestBed.configureTestingModule({
                imports: [
                    PartnerFormComponent,
                    TranslateModule.forRoot(),
                    ReactiveFormsModule,
                ],
                providers: [
                    { provide: PartnerService, useValue: mockPartnerService },
                    { provide: NotificationService, useValue: mockNotification },
                    { provide: MatDialogRef, useValue: mockDialogRef },
                    { provide: MAT_DIALOG_DATA, useValue: { partner: existingPartner } },
                ],
            }).compileComponents();

            fixture = TestBed.createComponent(PartnerFormComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should patch form with data if editing', () => {
            expect(component.partnerForm.get('alias')?.value).toBe(
                existingPartner.alias
            );
            expect(component.partnerForm.get('status')?.disabled).toBeTrue();
        });

        it('should call updatePartner and show success on edit', fakeAsync(() => {
            component.partnerForm.get('application')?.setValue('edited-app');

            mockPartnerService.updatePartner.and.returnValue(of(null));

            component.onSubmit();
            tick();

            expect(mockPartnerService.updatePartner).toHaveBeenCalledWith(
                '1',
                jasmine.any(Object)
            );
            expect(mockNotification.showSuccess).toHaveBeenCalledWith(
                'partners.updated'
            );
            expect(mockDialogRef.close).toHaveBeenCalledWith(true);
        }));

        it('should call showError on updatePartner failure', fakeAsync(() => {
            mockPartnerService.updatePartner.and.returnValue(
                throwError(() => new Error('error'))
            );

            component.onSubmit();
            tick();

            expect(mockNotification.showError).toHaveBeenCalledWith(
                'partners.update_error'
            );
            expect(mockDialogRef.close).not.toHaveBeenCalled();
        }));

        it('should set availableHostingTypes to MQ, DIRECTORY for queueName MQ_FROM_PAP_MSG', () => {
            component.updateAvailableHostingTypes('MQ_FROM_PAP_MSG');
            expect(component.availableHostingTypes).toEqual(['MQ', 'DIRECTORY']);
        });

        it('should set availableHostingTypes to S3 for queueName MQ_FROM_KEMM_WWIL_MSG', () => {
            component.updateAvailableHostingTypes('MQ_FROM_KEMM_WWIL_MSG');
            expect(component.availableHostingTypes).toEqual(['S3']);
        });

        it('should reset hostingType if not in availableHostingTypes', () => {
            component.partnerForm.get('hostingType')?.setValue('S3');
            component.updateAvailableHostingTypes('MQ_FROM_PAP_MSG');
            expect(component.partnerForm.get('hostingType')?.value).toBe('');
        });
    });
});
