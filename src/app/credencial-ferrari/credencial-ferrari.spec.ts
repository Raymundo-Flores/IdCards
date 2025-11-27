import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CredencialFerrari } from './credencial-ferrari';

describe('CredencialFerrari', () => {
  let component: CredencialFerrari;
  let fixture: ComponentFixture<CredencialFerrari>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CredencialFerrari]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CredencialFerrari);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
