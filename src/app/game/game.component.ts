import {Component, inject} from '@angular/core';
import {RoomService} from "../service/room.service";
import {AnimationOptions, LottieComponent} from "ngx-lottie";
import {AnimationItem} from "lottie-web";
import {ReplaySubject, Subject, takeUntil} from "rxjs";
import {v4 as uuidv4} from "uuid";
import {Router, RouterOutlet} from "@angular/router";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [RouterOutlet, LottieComponent, CommonModule, FormsModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent {

  private roomService = inject(RoomService);
  private router = inject(Router);

  public options: AnimationOptions = {
    path: '/assets/images/plane.json',
    loop: true,
    autoplay: false
  };
  public coefficientList: any[] = []

  public showLoading: boolean = false;
  private _amount: number = 1.0;

  get amount(): number {
    return this._amount;
  }

  set amount(value: number) {
    this._amount = parseFloat(value.toFixed(2));
  }
  public isBet: boolean = false;
  public isFlewAway: boolean = false;
  public startCoefficient: number = 1.01;
  private endCoefficient: number = 2;
  private steps: number = 100;
  private intervalTime: number = 60000; // Time interval in milliseconds
  private currentIndex: number = 0;
  private betId: number = 0;
  private currentStatus: string = '';
  public inputCoeff: number = 1.1;

  public tabsList: any[] = [
    {
      name: 'Bet',
      type: 'bet',
      isActive: true
    },
    {
      name: 'Auto',
      type: 'auto',
      isActive: false
    },
  ]

  public myBetsList: any[] = [];

  public showAuto: boolean = false;
  public showLogin = false;
  private animationItem: AnimationItem | undefined;
  private firstLoading: boolean = true;

  private obs: Subject<boolean> = new Subject<boolean>();
  #destroyed$: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  ngOnInit(): void {
    this.showLogin = !localStorage.getItem('token');
    if (!localStorage.getItem('token')) {
      this.login();
    }
    this.obs.asObservable().subscribe(res => {
      if (!this.firstLoading && res) {
        this.restart();
      }
    });
    this.getBets();
  }

  private getBets(): void {
    this.roomService.getBetsList()
      .pipe(takeUntil(this.#destroyed$))
      .subscribe(res => {
        const transformedData = res.map((item: any) => ({
          ...item,
          user: item.user.substring(0, 4)
        }));
        this.myBetsList = transformedData;
      })
  }

  private getRooms(): void {
    this.roomService.getRoomsList()
      .pipe(takeUntil(this.#destroyed$))
      .subscribe(res => {
        this.coefficientList = res;
        this.coefficientList = this.coefficientList.slice(1);
        this.betId = res[0].id;
        this.currentStatus = res[0].status;
        this.endCoefficient = res[0].coefficient;
      })
  }

  public changeCoefficientAutomatically(): void {
    const stepSize = (this.endCoefficient - this.startCoefficient) / this.steps;
    const totalDuration = 15000;
    const intervalTime = totalDuration / this.steps;

    const interval = setInterval(() => {
      if (this.currentIndex >= this.steps) {
        this.stop();
        this.firstLoading = false;
        this.obs.next(true);
        clearInterval(interval);
      } else {
        this.startCoefficient += stepSize;
        this.currentIndex++;
      }
    }, intervalTime);
  }

  public animationCreated(animationItem: AnimationItem): void {
    this.animationItem = animationItem;
    this.play();
    setTimeout(() => {
      this.changeCoefficientAutomatically();
    }, 100);
  }

  public play(): void {
    if (this.animationItem) {
      this.isFlewAway = false;
      this.animationItem.play();
      this.getRooms();
    }
  }

  public pause(): void {
    if (this.animationItem) {
      this.animationItem.pause();
    }
  }

  public stop(): void {
    if (this.animationItem) {
      this.isFlewAway = true;
      this.animationItem.stop();
    }
  }

  public restart(): void {
    this.showLoading = true;
    setTimeout(() => {
      this.showLoading = false;
      if (this.animationItem) {
        this.stop();
        this.resetCoefficients();
        this.animationItem.goToAndPlay(0, true);
        this.play();
        setTimeout(() => {
          this.changeCoefficientAutomatically();
        }, 100);
      }
    }, 5000);
  }

  private resetCoefficients(): void {
    this.startCoefficient = 1.0;
    this.currentIndex = 0;
  }

  public login(): void {
    const uuid = uuidv4();
    localStorage.setItem('token', uuid);
  }

  public admin(): void {
    this.router.navigate(['/admin']);
  }

  public handleTab(event: string): void {
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
          takeUntil(this.#destroyed$)
        )
        .subscribe(res => {
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

  ngOnDestroy(): void {
    this.#destroyed$.next(true);
    this.#destroyed$.complete();
  }
}
