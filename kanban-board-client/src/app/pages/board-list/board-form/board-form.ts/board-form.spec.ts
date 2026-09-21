import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BoardForm } from './board-form';



describe('BoardFormTs', () => {
  let component: BoardForm;
  let fixture: ComponentFixture<BoardForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
