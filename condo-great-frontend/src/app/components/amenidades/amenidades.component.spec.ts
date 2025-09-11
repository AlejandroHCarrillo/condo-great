import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmenidadesComponent } from './amenidades.component';

describe('AmenidadesComponent', () => {
  let component: AmenidadesComponent;
  let fixture: ComponentFixture<AmenidadesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmenidadesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmenidadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
