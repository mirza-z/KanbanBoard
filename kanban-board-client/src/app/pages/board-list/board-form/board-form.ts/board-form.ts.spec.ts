import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardFormTs } from './board-form.ts';

describe('BoardFormTs', () => {
  let component: BoardFormTs;
  let fixture: ComponentFixture<BoardFormTs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardFormTs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardFormTs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
