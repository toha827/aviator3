import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {RoomService} from "../service/room.service";
import {AnimationOptions, LottieComponent} from "ngx-lottie";
import {AnimationItem} from "lottie-web";
import {ReplaySubject, Subject, takeUntil} from "rxjs";
import {v4 as uuidv4} from "uuid";
import {Router, RouterOutlet} from "@angular/router";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {BetComponent} from "../bet/bet.component";
import {Bet2Component} from "../bet-2/bet-2.component";

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [RouterOutlet, LottieComponent, CommonModule, FormsModule, BetComponent, Bet2Component],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})


export class GameComponent implements OnInit, OnDestroy {

  private roomService = inject(RoomService);
  private router = inject(Router);

  public options: AnimationOptions = {
    path: '/assets/images/plane.json',
    loop: true,
    autoplay: false
  };
  public optionBg: AnimationOptions = {
    path: '/assets/images/bg.json',
    loop: true,
    autoplay: false
  }

  public coefficientList: any[] = []

  public showLoading: boolean = false;

  public isBet: boolean = false;
  public isFlewAway: boolean = false;
  public startCoefficient: number = 1.01;
  private endCoefficient: number = 2;
  private steps: number = 100;
  private intervalTime: number = 60000; // Time interval in milliseconds
  private currentIndex: number = 0;
  private betId: number = 0;
  private currentStatus: string = '';

  public myBetsList: any[] = [];

  public showLogin = false;
  private animationItem: AnimationItem | undefined;
  private animationBgItem: AnimationItem | undefined;
  private firstLoading: boolean = true;
  public balance: number = 0;

  highlightedRows: number[] = [];
  intervalIds: any[] = [];
  mainIntervalId: any;

  private obs: Subject<boolean> = new Subject<boolean>();
  #destroyed$: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  ngOnInit(): void {
    this.roomService.getBalance()
      .pipe(takeUntil(this.#destroyed$))
      .subscribe(res => {
        this.balance = res.balance;
        }
      )
    // this.getRooms();
    this.showLogin = !localStorage.getItem('token');
    if (!localStorage.getItem('token')) {
      this.login();
    }
    this.obs.asObservable().subscribe(res => {
      if (!this.firstLoading && res) {
        // this.startHighlightingSequence();
        this.restart();
      }
    });
    this.getBets();
    // this.startHighlightingSequence();
  }

  startHighlightingSequence() {
    this.mainIntervalId = setInterval(() => {
      this.clearAllIntervals(); // Clear any existing intervals
      this.highlightedRows = []; // Reset highlighted rows
      this.startHighlighting();
    }, 15000); // Repeat every 15 seconds
  }

  startHighlighting() {
    this.highlightRow(0, 3000); // Highlight first row after 3 seconds
    this.highlightRow(2, 5000); // Highlight third row after 5 seconds
    this.highlightRow(4, 7000); // Highlight fifth row after 7 seconds
    this.highlightRow(6, 10000); // Highlight seventh row after 10 seconds
  }

  highlightRow(rowIndex: number, timeout: number) {
    const intervalId = setTimeout(() => {
      if (this.highlightedRows.includes(rowIndex)) {
        this.highlightedRows = this.highlightedRows.filter(row => row !== rowIndex);
      } else {
        this.highlightedRows.push(rowIndex);
      }
    }, timeout);
    this.intervalIds.push(intervalId);
  }

  clearAllIntervals() {
    this.intervalIds.forEach(id => clearTimeout(id));
    this.intervalIds = [];
  }

  private getBets(): void {
    this.roomService.getBetsList()
      .pipe(takeUntil(this.#destroyed$))
      .subscribe(res => {
        this.myBetsList = res.map((item: any) => ({
          ...item,
          user: item.user.substring(0, 4)
        }));
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
        this.endCoefficient = res[1].coefficient;
        this.showLoading = true;
        if (res[1].status === 'PLAYING') {
          this.showLoading = false;
          this.play();
        } else if (res[1].status === 'FINISHED') {
          setTimeout(() => {
            this.getRooms();
          }, 2000); // Retry every second
        }
      })
  }

  public changeCoefficientAutomatically(): void {
    const stepSize = (this.endCoefficient - this.startCoefficient) / this.steps;
    const totalDuration = 15000;
    const intervalTime = totalDuration / this.steps;

    const interval = setInterval(() => {
      if (this.currentIndex >= this.steps) {
        this.stop();
        this.stopBg();
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
    setTimeout(() => {
      // this.changeCoefficientAutomatically();
    }, 100);
  }

  public animationBgCreated(animationItem: AnimationItem): void {
    this.animationBgItem = animationItem;
    // this.playBg();
  }

  public playBg(): void {
    if (this.animationBgItem) {
      this.animationBgItem.play();
    }
  }

  public stopBg(): void {
    if (this.animationBgItem) {
      this.animationBgItem.stop();
    }
  }

  public play(): void {
    if (this.animationItem) {
      this.isFlewAway = false;
      this.animationItem.play();
      this.playBg();
      this.changeCoefficientAutomatically();
      // this.getRooms();
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
    // this.getRooms();
    // setTimeout(() => {
      this.showLoading = false;
      if (this.animationItem) {
        this.stop();
        this.clearAllIntervals();
        this.resetCoefficients();
        this.getRooms();
        // this.animationItem.goToAndPlay(0, true);
        // this.play();
        // setTimeout(() => {
        //   this.changeCoefficientAutomatically();
        // }, 100);
      }
    // }, 5000);
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

  public onGetBalance(event: any): void {
    this.balance = event;
  }

  ngOnDestroy(): void {
    this.clearAllIntervals();
    this.#destroyed$.next(true);
    this.#destroyed$.complete();
  }
}
