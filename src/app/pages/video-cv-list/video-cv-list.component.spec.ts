import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoCvListComponent } from './video-cv-list.component';

describe('VideoCvListComponent', () => {
  let component: VideoCvListComponent;
  let fixture: ComponentFixture<VideoCvListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoCvListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoCvListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
