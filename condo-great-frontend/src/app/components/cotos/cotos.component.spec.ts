import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CotosComponent } from './cotos.component';

describe('CotosComponent', () => {
  let component: CotosComponent;
  let fixture: ComponentFixture<CotosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CotosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CotosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
