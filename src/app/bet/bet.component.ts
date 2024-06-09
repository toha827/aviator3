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

  private _isAutoReached: boolean = false;
  @Input() startCoefficient: number = 1.01;
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
    console.log(value);
    if (value) {
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

  @Input()
  set currentGame(value) {
    this._currentGame = value;
    if (this.currentBet != null){
      console.log(this._currentGame.status, this.currentBet.aviator_room_id, this._currentGame.id);
      console.log(this.currentBet != null && this.currentBet.aviator_room_id === this._currentGame.id && this._currentGame.status === "FINISHED");
    }
    if (this.currentBet != null && this.currentBet.aviator_room_id === this._currentGame.id && this._currentGame.status === "FINISHED") {
      this.currentBet = null;
      console.log(this._currentGame.status);
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

  public withDraw() {
    if (this.currentGame.status === 'PLAYING') {
      this.currentBtnType = 'bet';
      this.roomService.withdraw()
        .pipe(
          tap(res => {
            ///response withdraw bet;
            this.currentBet = null;
            console.log(this.currentBet, this.currentGame);
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
          console.log(this.currentBet, this.currentGame);
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
          console.log(res);
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


  public makeBet2(type: string) {
    if (!this.isGameStarting && this.currentBtnType === 'bet') {
      //make bet
      // show orange widthdraw
    } else if (this.isGameStarting && this.currentBtnType === 'bet') {
      // make bet next round show cancel
    } else if (this.isGameStarting) {

    }
    this.currentBtnType = type;
    // if (!this.isGameStarting && this.currentBtnType === 'bet') {
    //   this.currentBtnType = 'withdraw'
    //   //make width
    // } else if (this.isGameStarting && this.currentBtnType === 'cancel') {
    //   this.currentBtnType = 'bet';
    //     // this.roomService.cancelBet(this.betId)
    //     //   .pipe(
    //     //     takeUntil(this.#destroyed$)
    //     //   )
    //     //   .subscribe(res => {
    //     //     this.isBet = false;
    //     //   });
    // } else if (this.isGameStarting) {
    //   this.currentBtnType = 'cancel';
    // }

    // this.isBet = !this.isBet;
    //
    // if (!this.isGameStarting && this.currentStatus === 'FINISHED' && this.isBet) {
    //   this.roomService.makeBet({ amount: this.amount })
    //     .pipe(
    //       exhaustMap((response: any) => this.roomService
    //         .getBalance()
    //         .pipe(
    //           tap(res => this.passBalance.emit(res.balance)),
    //           tap(res => this.roomService.setIsCheckedAuto({ isChecked: this.isChecked, coeff: this.inputCoeff }))
    //         )
    //       ),
    //       takeUntil(this.#destroyed$)
    //     ).subscribe(res => {
    //     this.isBet = true;
    //   });
    // } else if (this.isGameStarting && this.currentStatus === 'PLAYING' && !this.isBet) {
    //   this.roomService.withdraw()
    //     .pipe(
    //       takeUntil(this.#destroyed$),
    //       exhaustMap(res => this.roomService.getBalance().pipe(tap(res => this.passBalance.emit(res.balance))))
    //     )
    //     .subscribe(res => {
    //       this.isBet = false;
    //     });
    // } else if (!this.isGameStarting && this.currentStatus === 'FINISHED') {
    //   this.roomService.cancelBet(this.betId)
    //     .pipe(
    //       takeUntil(this.#destroyed$)
    //     )
    //     .subscribe(res => {
    //       this.isBet = false;
    //     });
    // }
    //
    // if (this.isGameStarting && this.currentStatus === 'PLAYING') {
    //   this.showCancel = true;
    // } else if (!this.isGameStarting && this.currentStatus === 'FINISHED') {
    //   this.showCancel = true;
    // } else if (!this.isGameStarting) {
    //   this.showCancel = false;
    // }
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
