import {Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {BehaviorSubject, exhaustMap, ReplaySubject, takeUntil, tap} from "rxjs";
import {RoomService} from "../service/room.service";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-bet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bet.component.html',
  styleUrl: './bet.component.scss'
})
export class BetComponent implements OnInit {

  private _currentStatus = '';
  private _isBet = false;
  @Input() isGameStarting: boolean = false;
  @Input() firstStatus: string = '';

  @Input()
  set currentStatus(value) {
    this._currentStatus = value;
    if (this.isBet) {
      this.showCancel = false;
    }
    if (value === 'FINISHED') {
      this.isBet = false;
    }
  }

  get currentStatus() {
    return this._currentStatus;
  }

  @Input() id: string = '';
  @Input() id2: string = '';
  public isBet: boolean = false;
  // @Input()
  // set isBet(value) {
  //   this._isBet = value;
  //   console.log(value);
  //   if (!this.isGameStarting) {
  //     // this._isBet = false;
  //   }
  // }
  //
  // get isBet() {
  //   return this._isBet;
  // }
  private _isAutoReached: boolean = false;
  @Input() startCoefficient: number = 1.01;
  @Input() betId: number = 0;
  @Input()
  set isAutoReached(value) {
    this._isAutoReached = value;
    console.log(value);
    if (value) {
      this.makeBet();
    }
  }

  get isAutoReached() {
    return this._isAutoReached;
  }

  public isChecked: boolean = false;
  autoId: string = '';
  apuestaId: string = '';
  gliderId: string = '';


  @Output() passBalance: EventEmitter<any> = new EventEmitter<any>();
  @Output() passIsChecked: EventEmitter<any> = new EventEmitter<any>();

  public tabsList: any[] = [
    {
      name: 'Apuesta',
      type: 'apuesta',
      isActive: true
    },
    {
      name: 'Auto',
      type: 'auto',
      isActive: false
    },
  ]
  public showAuto: boolean = false;
  private _amount: number = 1.0;
  public inputCoeff: number = 1.1;
  public currentType: string = 'bet';
  public showCancel: boolean = false;

  get amount(): number {
    return this._amount;
  }

  set amount(value: number) {
    this._amount = parseFloat(value.toFixed(2));
  }

  private roomService = inject(RoomService);

  #destroyed$: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  ngOnInit(): void {
    this.autoId = `${this.id}-auto`;
    this.apuestaId = `${this.id2}-apuesta`;
    this.gliderId = `${this.id}-glider`;
    // this.roomService.getIsCheckedAuto().subscribe(res => {
    //   if (res?.isChecked) {
    //     if (res?.coeff < this.startCoefficient) {
    //       console.log(123);
    //       this.makeBet();
    //     }
    //   }
    // })
  }

  public handleTab(event: any): void {
    // event.isActive = !event.isActive;
    this.showAuto = event === 'auto';
    this.currentType = event;
  }

  public subtractAmount(): void {
    this.amount -= 0.1;
  }

  public addAmount(num?: number): void {
    if (this.amount < 100) {
      !num ? this.amount += 0.1 : this.amount += num;
    } else if (this.amount > 100) {
      this.amount = 100;
    } else {
      return;
    }
  }

  public makeBet(): void {
    this.isBet = !this.isBet;
    if (this.isGameStarting && this.currentStatus === 'FINISHED') {
      this.showCancel = true;
    } else if (!this.isGameStarting) {
      this.showCancel = true;
    }
    if (this.isBet) {
      this.roomService.makeBet({amount: this.amount})
        .pipe(
          exhaustMap((response: any) => this.roomService
            .getBalance()
            .pipe(
              tap(res => this.passBalance.emit(res.balance)),
              tap(res => this.roomService.setIsCheckedAuto({isChecked: this.isChecked, coeff: this.inputCoeff}))
            )
          ),
          takeUntil(this.#destroyed$)
        ).subscribe(res => {
          this.isBet = true;
        })
    } else if (!this.isBet && !this.showCancel && this.isGameStarting) {
      this.roomService.withdraw()
        .pipe(
          takeUntil(this.#destroyed$),
          exhaustMap(res => this.roomService.getBalance().pipe(tap(res => this.passBalance.emit(res.balance))))
        )
        .subscribe(res => {
          this.isBet = false;
        })
    } else if (this.showCancel && this.isGameStarting) {
      this.isBet = false;
        // this.roomService.cancelBet(this.betId)
        //   .pipe(
        //     takeUntil(this.#destroyed$)
        //   )
        //   .subscribe(res => {
        //     this.isBet = false;
        //   });
      } else {
      return;
    }
  }

  public handleCheckbox(event: any): void {
    this.isChecked = event.target.checked;
    this.passIsChecked.emit({isChecked: this.isChecked, startCoeff: this.inputCoeff});
  }

  public handleInputCoeff(event: any): void {
    if (this.isChecked) {
      this.passIsChecked.emit({isChecked: this.isChecked, startCoeff: this.inputCoeff});
    }
  }
}
