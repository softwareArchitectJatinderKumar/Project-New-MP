import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlannerScoreRankingComponent } from './planner-score-ranking.component';

describe('PlannerScoreRankingComponent', () => {
  let component: PlannerScoreRankingComponent;
  let fixture: ComponentFixture<PlannerScoreRankingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlannerScoreRankingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlannerScoreRankingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
