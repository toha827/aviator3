import {Component, EventEmitter, inject, Input, OnInit, Output, SimpleChange} from '@angular/core';
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
  @Input() className: string = '';

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
  // public isBet: boolean = false;
  private _gameStatus: string = '';

  @Input()
  set isBet(value) {
    if (value && this.gameStatus === 'waiting') {
      this.currentBtnType = 'cancel';
    } else if (value && this.gameStatus === 'playing') {
      this.currentBtnType = 'withdraw';
    }
    this._isBet = value;
  }

  get isBet() {
    return this._isBet;
  }

  public isShowAlert: boolean = false;

  private _isAutoReached: boolean = false;

  @Input() finalCoeff: number = 1.01;
  private _startCoefficient: number = 1.01;
  @Input() startCoefficient: number = 1.01;
  // set startCoefficient(value) {
  //   this._startCoefficient = value;
  //   if (this.isChecked && this.inputCoeff == +value.toFixed(1)) {
  //     this.isShowAlert = true;
  //     setTimeout(() => {
  //       this.isShowAlert = false;
  //     }, 2000);
  //     this.withDraw();
  //   }
  // }
  //
  // get startCoefficient() {
  //   return this._startCoefficient;
  // }
  @Input() gameId: number = 0;
  betId: number = 0;

  @Input()
  set gameStatus(value) {
    if (value === 'waiting') {
      this.currentBtnType = 'bet';
    } else if (this.isBet && value === 'playing') {
      this.currentBtnType = 'withdraw';
    }
    this._gameStatus = value;
  }

  get gameStatus(): string {
    return this._gameStatus;
  }

  public currentBtnType: string = 'bet';

  @Input()
  set isAutoReached(value) {
    this._isAutoReached = value;
    if (value) {
      // this.withDraw();
      // this.makeBet('withdraw');
    }
  }

  get isAutoReached() {
    return this._isAutoReached;
  }

  public isChecked: boolean = false;
  autoId: string = '';
  apuestaId: string = '';
  gliderId: string = '';

  //new Code
  _nextGame: any;
  _currentGame: any;
  currentBet: any;

  private withdrawAudio = new Audio('/assets/sounds/withdraw.mp3');

  @Input()
  set currentGame(value) {
    this._currentGame = value;
    if (this.currentBet != null){

    }
    if (this.currentBet != null && this.currentBet.aviator_room_id === this._currentGame?.id && this._currentGame?.status === "FINISHED") {
      this.currentBet = null;
    }
  }



  get currentGame() {
    return this._currentGame;
  }

  @Input()
  set nextGame(value) {
    this._nextGame = value;
  }

  get nextGame() {
    return this._nextGame;
  }


  @Output() passBalance: EventEmitter<any> = new EventEmitter<any>();
  @Output() passIsChecked: EventEmitter<any> = new EventEmitter<any>();
  @Output() isBetExist: EventEmitter<any> = new EventEmitter<any>()
  @Output() showAlert: EventEmitter<any> = new EventEmitter<any>();

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

  winCoefficient: number = 0;
  winSum: number = 0;

  #destroyed$: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  ngOnInit(): void {
    this.withdrawAudio.load()
    this.roomService.getCoeff().subscribe(res => {
      if (this.isChecked && this.inputCoeff == +this.startCoefficient.toFixed(1)) {
            this.isShowAlert = true;
            setTimeout(() => {
              this.isShowAlert = false;
            }, 2000);
            this.withDraw();
      }
    })
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

  public withDraw() {
    if (this.currentGame.status === 'PLAYING') {
      this.currentBtnType = 'bet';
      this.roomService.withdraw()
        .pipe(
          tap(res => {
            ///response withdraw bet;
            this.winCoefficient = this.startCoefficient;
            this.winSum = this.amount * this.winCoefficient;
            this.isShowAlert = true;
            setTimeout(() => {
              this.isShowAlert = false;
            }, 2000);
            this.currentBet = null;
            this.withdrawAudio.play()
            this.showAlert.emit({
              coeff: this.winCoefficient,
              sum: this.winSum
            });
          }),
          takeUntil(this.#destroyed$),
          exhaustMap(res => this.roomService.getBalance().pipe(tap(res => this.passBalance.emit(res.balance))))
        )
        .subscribe(res => {
          this.isBet = false;
        });
    }
  }

  public cancel() {
    this.isBet = false;
    if (!this.currentBet) {
      return;
    }
    this.roomService.cancelBet(this.betId)
      .pipe(
        tap(res => {
          ///response withdraw bet;
          this.currentBet = null;

        }),
        exhaustMap(res => this.roomService.getBalance().pipe(tap(res => this.passBalance.emit(res.balance)))),
        takeUntil(this.#destroyed$)
      )
      .subscribe(res => {
        this.isBet = false;
      });
  }

  // "id": 20,
  // "amount": 1,
  // "status": "ACTIVE",
  // "user": "bda1411f-b5df-437c-9b10-77a092b3be5a",
  // "aviator_room_id": 527,
  // "aviator_user_id": 2
  public makeBet() {
    this.roomService.makeBet({amount: this.amount})
      .pipe(
        tap(res => {
          ///response make bet;
          this.betId = res.id
          this.currentBet = res;
        }),
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
    });
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
