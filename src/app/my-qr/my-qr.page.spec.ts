import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyQRPage } from './my-qr.page';

describe('MyQRPage', () => {
  let component: MyQRPage;
  let fixture: ComponentFixture<MyQRPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyQRPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MyQRPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
