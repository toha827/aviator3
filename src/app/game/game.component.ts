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

  public currentTabType: string = '1';
  public isClickedHistory: boolean = false;

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
      user: 'mn**6',
      coeff: 1.01
    },
    {
      date: '13:30',
      amount: 23,
      user: 'po**6',
      coeff: 1.01
    },
    {
      date: '09:30',
      amount: 33,
      user: 'me**6',
      coeff: 1.01
    },
    {
      date: '04:30',
      amount: 1,
      user: 'pe**6',
      coeff: 1.01
    },
    {
      date: '18:30',
      amount: 99,
      user: 'pa**6',
      coeff: 1.01
    },
    {
      date: '13:30',
      amount: 23,
      user: 'po**6',
      coeff: 1.01
    },
    {
      date: '09:30',
      amount: 33,
      user: 'me**6',
      coeff: 1.01
    },
    {
      date: '04:30',
      amount: 1,
      user: 'pe**6',
      coeff: 1.01
    },
    {
      date: '18:30',
      amount: 99,
      user: 'pa**6',
      coeff: 1.01
    },
    {
      date: '13:30',
      amount: 23,
      user: 'po**6',
      coeff: 1.01
    },
    {
      date: '09:30',
      amount: 33,
      user: 'me**6',
      coeff: 1.01
    },
    {
      date: '04:30',
      amount: 1,
      user: 'pe**6',
      coeff: 1.01
    },
    {
      date: '18:30',
      amount: 99,
      user: 'pa**6',
      coeff: 1.01
    },
    {
      date: '18:30',
      amount: 99,
      user: 'pa**6',
      coeff: 1.01
    },
  ];

  startCoefficients: number[] = this.userList.map(() => 1.01);

  public options: AnimationOptions = {
    path: '/assets/images/plane.json',
    loop: true,
    autoplay: false,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
      className: "lottie-svg-class1",
    }
  };
  public optionBg: AnimationOptions = {
    path: '/assets/images/bg.json',
    loop: true,
    autoplay: false,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
      className: "lottie-svg-class",
    }
  }

  public isGameStarting: boolean = false;

  public coefficientList: any[] = []
  public coeffRow: any[] = [];

  public showLoading: boolean = true;

  public isBet: boolean = false;
  public isBet2: boolean = false;
  public isFlewAway: boolean = false;
  public startCoefficient: number = 1;
  private endCoefficient: number = 2;
  private steps: number = 100;
  private intervalTime: number = 60000; // Time interval in milliseconds
  private currentIndex: number = 0;
  public betId: number = 0;
  firstStatus: string = '';
  currentStatus: string = '';

  public myBetsList: any[] = [];

  public showLogin = false;
  private animationItem: AnimationItem | undefined;
  private animationBgItem: AnimationItem | undefined;
  private animationLoadingItem: AnimationItem | undefined;
  private firstLoading: boolean = true;
  public balance: number = 0;

  public isChecked: boolean = false;
  public inputCoeff: number = 0;

  public windCoeff: number = 0;
  public winSum: number = 0;

  intervalId: any;

  isGameStarted: boolean = false;
  highlightedRows: number[] = [];
  intervalIds: any[] = [];
  mainIntervalId: any;

  public isShowAlert: boolean = false;
  public isAutoReached: boolean = false;

  // new Code
  public currentGame: any;
  public nextGame: any;
  //
  public currentBtnType: string = 'bet';

  isBetExit: boolean = false;

  public hasAlertBeenShown: boolean = true;
  interRoom: any;
  public gameStatus: string = 'waiting';
  private obs: Subject<boolean> = new Subject<boolean>();
  #destroyed$: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  ngOnInit(): void {
    this.roomService.getBalance()
      .pipe(takeUntil(this.#destroyed$))
      .subscribe(res => {
        this.balance = res.balance;
        }
      )
    this.interRoom = setInterval(() => {
      this.getRooms();
    }, 1500);
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

  showAlert: boolean = true;
  private getRooms(): void {

    this.roomService.getRoomsList()
      .pipe(takeUntil(this.#destroyed$))
      .subscribe(res => {
        /// NEW CODE
        this.endCoefficient = res[1].coefficient;
        if (res[1].status === 'PLAYING'){
          this.nextGame = res[0];
          this.currentGame = res[1];
          this.play();
          this.showLoading = false;
          this.isGameStarted = true;
          this.hasAlertBeenShown = false;
          this.showAlert = false;
        } else if (res[1].status === "FINISHED") {
          if (!this.showAlert) {
            this.isFlewAway = true;
            setTimeout(() => {
              this.isFlewAway = false;
              this.showLoading = true;
              this.clearAllIntervals()
              this.clearHighlightedRows()
            },5000);
          }
          this.showAlert = true;
          this.nextGame = res[0];
          this.currentGame = res[1];
          this.isGameStarted = false;
          this.stop();
          this.stopBg();
        }
        /// OLD CODE
        this.coefficientList = [...res.slice(1), ...res];
        this.betId = res[0].id;
        this.currentStatus = res[1].status;
        this.firstStatus = res[0].status;
        this.isBet = false;
        if (res[1].status === 'PLAYING') {
          this.gameStatus = 'playing';
          this.isGameStarting = true;
          this.isBet = this.currentBtnType === 'cancel';
        } else if (res[1].status === 'FINISHED') {
          this.gameStatus = 'waiting';
          this.isBet = this.currentBtnType === 'cancel';// Retry every second
        }
      })
  }

  public changeCoefficientAutomatically(): void {
    // const stepSize = (this.endCoefficient - this.startCoefficient) / this.steps;
    console.log(this.currentGame.coefficient, (this.currentGame.coefficient - this.startCoefficient) , (this.currentGame.coefficient - this.startCoefficient) / this.steps)
    const startDate = new Date(this.currentGame.playing_from);
    const endDate = new Date(this.currentGame.playing_until);
    const totalSteps = Math.ceil((this.currentGame.coefficient - this.startCoefficient) / 0.1); // Total number of steps
    const totalDuration = endDate.getTime() - startDate.getTime() - 1000; // Total duration in milliseconds
    const intervalTime = totalDuration / totalSteps; // Time per step

    const intervalDuration = totalDuration / totalSteps; // Interval duration per step
    const stepSize = (this.currentGame.coefficient - this.startCoefficient) / totalSteps; // Step increment


    // Ensure interval ID is cleared in case of multiple calls
    // if (this.intervalId) {
    //   console.log('DDDDDD');
    //   clearInterval(this.intervalId);
    //   this.stop();
    // }

    // Reset currentIndex to ensure proper counting from the start
    this.currentIndex = 0;

    this.intervalId = setInterval(() => {
      // Check if the current index has reached the total steps
      if (this.currentIndex >= this.steps + 20) {
        // this.isFlewAway = true;
        // this.stop(); // Stop the main animation
        // this.stopBg(); // Stop the background animation
        this.firstLoading = false;
        this.startCoefficient = 1;
        // setTimeout(() => {
        //   this.isFlewAway = false
        // }, 2000);
        // Emit the observer event
        clearInterval(this.intervalId); // Clear the interval to stop execution
      } else {
        // Increment the startCoefficient by the step size
        this.startCoefficient += 0.1;
        console.log(this.startCoefficient, stepSize);
        this.roomService.setCoeff(this.startCoefficient);
        this.currentIndex++;

        // if (this.isChecked) {
        //   // Check if auto coefficient is reached and update the flag
        //   if (this.startCoefficient.toFixed(1) === this.inputCoeff.toFixed(1)) {
        //     this.isAutoReached = true;
        //   }
        // }``
      }
    }, intervalTime);

  }

  public animationCreated(animationItem: AnimationItem): void {
    this.animationItem = animationItem;
    // this.play();
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
    if (this.animationItem && !this.isGameStarted) {
      // this.isFlewAway = false;
      this.animationItem.play();
      this.playBg();
      this.changeCoefficientAutomatically();
      this.startHighlightingSequence();
    }
  }

  public pause(): void {
    if (this.animationItem) {
      this.animationItem.pause();
    }
  }

  public stop(): void {
    clearInterval(this.intervalId)
    if (this.animationItem) {
      this.animationItem.stop();
    }
  }

  public restart(): void {
    this.isFlewAway = true;
    if (this.animationItem) {
      this.isBet = false;
      this.stop();
      clearInterval(this.mainIntervalId);
      this.startCoefficient = 1;
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

  startHighlightingSequence() {
    this.startHighlighting();
    // this.mainIntervalId = setInterval(() => {
    //   // this.clearAllIntervals(); // Clear any existing intervals
    //   this.highlightedRows = []; // Reset highlighted rows
    //   this.startHighlighting();
    // }, 15500); // Repeat every 10 seconds
  }

  startHighlighting() {
    const indices = this.generateRandomIndices();
    this.highlightRow(indices[0], 1000); // Highlight first row after 3 seconds
    this.highlightRow(indices[1], 2000); // Highlight third row after 5 seconds
    this.highlightRow(indices[2], 3000); // Highlight third row after 5 seconds
    this.highlightRow(indices[3], 4000); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[4], 4500); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[5], 5000); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[6], 5000); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[7], 7000); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[8], 9000); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[9], 9000); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[10], 10000); // Highlight fifth row after 7 seconds
  }

  generateRandomIndices(): number[] {
    const indices = [];
    const usedIndices = new Set<number>();

    while (indices.length < 10) {
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

  public onIsBetExist(event: boolean): void {
    this.currentBtnType = 'cancel';
  }

  public handleClickHistory(): void {
    this.isClickedHistory = !this.isClickedHistory;
  }

  public handleTab(event: any): void {
    // event.isActive = !event.isActive;
    this.currentTabType = event;
  }

  ngOnDestroy(): void {
    clearInterval(this.interRoom);
    this.startCoefficient = 1;
    this.clearAllIntervals();
    this.#destroyed$.next(true);
    this.#destroyed$.complete();
  }
}
