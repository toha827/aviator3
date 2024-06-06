import {Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {exhaustMap, ReplaySubject, takeUntil, tap} from "rxjs";
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
export class BetComponent implements OnInit{

  @Input() id: string = '';
  @Input() id2: string = '';
  @Input() isBet: boolean = false;
  @Input() startCoefficient: number = 1.01;

  autoId: string = '';
  apuestaId: string = '';
  gliderId: string = '';


  @Output() passBalance: EventEmitter<any> = new EventEmitter<any>();

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
  }

  public handleTab(event: any): void {
    // event.isActive = !event.isActive;
    this.showAuto = event === 'auto';
  }

  public subtractAmount(): void {
    this.amount -= 0.1;
  }

  public addAmount(num?: number): void {
    !num ? this.amount += 0.1 : this.amount += num;
  }

  public makeBet(): void {
    this.isBet = !this.isBet;
    if (this.isBet) {
      this.roomService.makeBet({amount: this.amount})
        .pipe(
          exhaustMap((res: any) => this.roomService.getBalance().pipe(tap(res => this.passBalance.emit(res.balance)))),
          takeUntil(this.#destroyed$)
        ).subscribe(res => {
          this.isBet = true;
        })
    } else {
      this.roomService.withdraw()
        .pipe(
          takeUntil(this.#destroyed$)
        )
        .subscribe(res => {
          this.isBet = false;
        })
      // this.roomService.cancelBet(this.betId)
      //   .pipe(
      //     takeUntil(this.#destroyed$)
      //   )
      //   .subscribe(res => {
      //     this.isBet = false;
      //   });
      //
    }
  }
}
