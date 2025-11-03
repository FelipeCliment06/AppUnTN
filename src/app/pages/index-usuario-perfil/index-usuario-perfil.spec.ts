import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexUsuarioPerfil } from './index-usuario-perfil';

describe('IndexUsuarioPerfil', () => {
  let component: IndexUsuarioPerfil;
  let fixture: ComponentFixture<IndexUsuarioPerfil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndexUsuarioPerfil]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndexUsuarioPerfil);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
