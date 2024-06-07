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

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [RouterOutlet, LottieComponent, CommonModule, FormsModule, BetComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})


export class GameComponent implements OnInit, OnDestroy {

  private roomService = inject(RoomService);
  private router = inject(Router);

  public userList = [
    {
      date: '22:30',
      amount: 12,
      user: 'td**3',
      coeff: 1.01
    },
    {
      date: '15:45',
      amount: 25,
      user: 'ab**1',
      coeff: 1.01
    },
    {
      date: '09:00',
      amount: 8,
      user: 'xy**7',
      coeff: 1.01
    },
    {
      date: '11:15',
      amount: 15,
      user: 'mn**5',
      coeff: 1.01
    },
    {
      date: '19:50',
      amount: 20,
      user: 'jk**2',
      coeff: 1.01
    },
    {
      date: '08:30',
      amount: 10,
      user: 'pq**6',
      coeff: 1.01
    },
  ];

  startCoefficients: number[] = this.userList.map(() => 1.01);

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

  public isGameStarting: boolean = false;

  public coefficientList: any[] = []
  public coeffRow: any[] = [];

  public showLoading: boolean = false;

  public isBet: boolean = false;
  public isBet2: boolean = false;
  public isFlewAway: boolean = false;
  public startCoefficient: number = 1.01;
  private endCoefficient: number = 2;
  private steps: number = 100;
  private intervalTime: number = 60000; // Time interval in milliseconds
  private currentIndex: number = 0;
  private betId: number = 0;
  firstStatus: string = '';
  currentStatus: string = '';

  public myBetsList: any[] = [];

  public showLogin = false;
  private animationItem: AnimationItem | undefined;
  private animationBgItem: AnimationItem | undefined;
  private firstLoading: boolean = true;
  public balance: number = 0;

  public isChecked: boolean = false;
  public inputCoeff: number = 0;

  intervalId: any;

  highlightedRows: number[] = [];
  intervalIds: any[] = [];
  mainIntervalId: any;

  public isAutoReached: boolean = false;

  private obs: Subject<boolean> = new Subject<boolean>();
  #destroyed$: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  ngOnInit(): void {
    this.roomService.getBalance()
      .pipe(takeUntil(this.#destroyed$))
      .subscribe(res => {
        this.balance = res.balance;
        }
      )
    this.getRooms();
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
        this.currentStatus = res[1].status;
        this.firstStatus = res[0].status;
        this.endCoefficient = res[1].coefficient;
        this.showLoading = true;
        this.isBet = false;
        if (res[1].status === 'PLAYING') {
          this.showLoading = false;
          this.isGameStarting = true;
          this.play();
        } else if (res[1].status === 'FINISHED') {
          this.isBet = false;
          setTimeout(() => {
            this.getRooms();
          }, 2000); // Retry every second
        }
      })
  }

  public changeCoefficientAutomatically(): void {
    const stepSize = (this.endCoefficient - this.startCoefficient) / this.steps;
    const totalDuration = 15000; // Total duration in milliseconds
    const intervalTime = totalDuration / this.steps; // Time per step
    const tolerance = 0.001; // Define a small tolerance value

    // Ensure interval ID is cleared in case of multiple calls
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Reset currentIndex to ensure proper counting from the start
    this.currentIndex = 0;

    this.intervalId = setInterval(() => {
      // Check if the current index has reached the total steps
      if (this.currentIndex >= this.steps) {
        this.stop(); // Stop the main animation
        this.stopBg(); // Stop the background animation
        this.firstLoading = false;
        this.obs.next(true); // Emit the observer event
        clearInterval(this.intervalId); // Clear the interval to stop execution
      } else {
        // Increment the startCoefficient by the step size
        this.startCoefficient += stepSize;
        this.currentIndex++;

        if (this.isChecked) {
          // Check if auto coefficient is reached and update the flag
          if (this.startCoefficient.toFixed(1) === this.inputCoeff.toFixed(1)) {
            this.isAutoReached = true;
          }
        }
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
      this.startHighlightingSequence();
      this.isFlewAway = false;
      this.animationItem.play();
      this.playBg();
      this.changeCoefficientAutomatically();
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
    if (this.animationItem) {
      this.isBet = false;
      this.stop();
      clearInterval(this.mainIntervalId);
      this.isGameStarting = false;
      this.clearAllIntervals();
      this.resetCoefficients();
      this.coeffRow = [];
      this.clearHighlightedRows();
      this.getRooms();
    }
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

  public onGetIsChecked(event: any): void {
    this.isChecked = event.isChecked;
    this.inputCoeff = event.startCoeff;
  }


  startHighlightingSequence() {
    this.mainIntervalId = setInterval(() => {
      this.clearAllIntervals(); // Clear any existing intervals
      this.highlightedRows = []; // Reset highlighted rows
      this.startHighlighting();
    }, 10000); // Repeat every 10 seconds
  }

  startHighlighting() {
    const indices = this.generateRandomIndices();
    this.highlightRow(indices[0], 1000); // Highlight first row after 3 seconds
    this.highlightRow(indices[1], 2000); // Highlight third row after 5 seconds
    this.highlightRow(indices[2], 4000); // Highlight fifth row after 7 seconds
  }

  generateRandomIndices(): number[] {
    const indices = [];
    const usedIndices = new Set<number>();

    while (indices.length < 3) {
      const randomIndex = Math.floor(Math.random() * this.userList.length);
      if (!usedIndices.has(randomIndex)) {
        indices.push(randomIndex);
        usedIndices.add(randomIndex);
      }
    }

    return indices;
  }

  highlightRow(rowIndex: number, timeout: number) {
    const intervalId = setTimeout(() => {
      if (this.highlightedRows.includes(rowIndex)) {
        this.highlightedRows = this.highlightedRows.filter(row => row !== rowIndex);
        this.startCoefficients[rowIndex] = 1.01;
      } else {
        this.highlightedRows.push(rowIndex);
        this.startCoefficients[rowIndex] = this.startCoefficient;
      }
    }, timeout);
    this.intervalIds.push(intervalId);
  }

  clearAllIntervals() {
    this.intervalIds.forEach(id => clearTimeout(id));
    this.intervalIds = [];
  }

  private clearHighlightedRows(): void {
    this.highlightedRows = [];
  }

  ngOnDestroy(): void {
    this.clearAllIntervals();
    this.#destroyed$.next(true);
    this.#destroyed$.complete();
  }
}
