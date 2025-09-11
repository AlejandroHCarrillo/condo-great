import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpresasAdminComponent } from './empresas-admin.component';

describe('EmpresasAdminComponent', () => {
  let component: EmpresasAdminComponent;
  let fixture: ComponentFixture<EmpresasAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpresasAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpresasAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
