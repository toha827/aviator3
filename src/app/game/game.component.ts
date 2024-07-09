import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {RoomService} from "../service/room.service";
import {AnimationOptions, LottieComponent} from "ngx-lottie";
import {AnimationItem} from "lottie-web";
import {filter, map, ReplaySubject, Subject, takeUntil} from "rxjs";
import {v4 as uuidv4} from "uuid";
import {Router, RouterOutlet} from "@angular/router";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {BetComponent} from "../bet/bet.component";
import {MatProgressBarModule} from '@angular/material/progress-bar';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [RouterOutlet, LottieComponent, CommonModule, FormsModule, BetComponent, MatProgressBarModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})


export class GameComponent implements OnInit, OnDestroy {

  styles = {
    maxHeight: '800px',
  }
  color: any = 'warn';
  mode: any = 'determinate';
  bufferValue = 75;

  value: number = 100;
  decrementValue: number = 1;
  totalDuration: number = 0;
  numberOfDecrements: number = 100;
  intervalDuration: number = 0;

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
    }
  ];
  private bgAudio = new Audio('/assets/sounds/bg_music.mp3');
  private flyAwayAudio = new Audio('/assets/sounds/flyaway.mp3');
  private flyReadyAudio = new Audio('/assets/sounds/fly_ready.mp3');

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
  public isFlewAway: boolean = false;
  public startCoefficient: number = 1;
  private endCoefficient: number = 2;
  private currentIndex: number = 0;
  public betId: number = 0;
  firstStatus: string = '';
  currentStatus: string = '';

  public myBetsList: any[] = [];

  public showLogin = false;
  private animationItem: AnimationItem | undefined;
  private animationBgItem: AnimationItem | undefined;
  private firstLoading: boolean = true;
  public balance: number = 0;

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

  public hasAlertBeenShown: boolean = true;
  interRoom: any;
  public gameStatus: string = 'waiting';
  private obs: Subject<boolean> = new Subject<boolean>();
  #destroyed$: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  ngOnInit(): void {
    this.roomService.connect();
    this.bgAudio.load()
    this.flyReadyAudio.load()
    this.flyAwayAudio.load()
    this.roomService.getBalance()
      .pipe(takeUntil(this.#destroyed$))
      .subscribe(res => {
          this.balance = res.balance;
        }
      )

    this.bgAudio.addEventListener("canplaythrough", (event) => {
      /* аудио может быть воспроизведено; проиграть, если позволяют разрешения */
      this.bgAudio.play();
    });

    this.bgAudio.addEventListener("onended", (event) => {
      /* аудио может быть воспроизведено; проиграть, если позволяют разрешения */
      this.bgAudio.load();
      this.bgAudio.play();
      console.log('BG AUDIO ENDED')
    });

    this.getRooms();
    this.showLogin = !localStorage.getItem('token');
    if (!localStorage.getItem('token')) {
      this.login();
    }
    this.obs.asObservable().subscribe(res => {
      if (!this.firstLoading && res) {
        // console.log('FUCK OFF')
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
  nextGameTimeout: any;

  private getRooms(): void {

    this.roomService.getRoomsWS()
      .pipe(
        map(res => JSON.parse(res))
      )
      .subscribe(res => {
        this.endCoefficient = res[1].coefficient;

        if (res[1].status === 'PLAYING') {
          this.nextGame = res[0];
          this.currentGame = res[1];
          // console.log(`PLAYING GAME ${this.currentGame.id} ${this.currentGame.coefficient}`)
          this.isGameStarted = true;
          this.hasAlertBeenShown = false;
          this.showAlert = false;
          this.value = 100;
          if (!this.isGameStarted) {
            this.showLoading = true;
          }
        } else if (res[1].status === "FINISHED") {

          this.showAlert = true;
          this.nextGame = res[0];
          this.currentGame = res[1];
          this.isGameStarted = false;

          if (this.nextGameTimeout == null) {
            const initialDate = new Date(this.nextGame.playing_from);
            const initialTime = initialDate.getTime();
            const addedTime = 5 * 60 * 60 * 1000;
            const newTime = initialTime + addedTime;

            const newDate = new Date(newTime);
            const diff = newDate.getTime() - new Date().getTime();
            // console.log("Current diff " + diff);
            this.totalDuration = diff;
            this.intervalDuration = this.totalDuration / this.numberOfDecrements;
            let decrementsLeft = this.numberOfDecrements;
            const intervalId = setInterval(() => {
              if (decrementsLeft > 0) {
                this.value -= this.decrementValue;
                decrementsLeft--;
              } else {
                clearInterval(intervalId);
              }
            }, this.intervalDuration);
            this.nextGameTimeout = setTimeout(() => {
              this.play();
              this.showLoading = false;
            }, diff);
          }
        }

        // console.log(newDate.getTime());
        // console.log(new Date().getTime());
        // if (newDate.getTime() === new Date().getTime()) {
        //   this.play();
        // }
        /// OLD CODE
        if (res.some((e: any) => e.status === 'PLAYING')) {
          this.coefficientList = [...res.slice(2), ...res];
        } else {
          this.coefficientList = [...res.slice(1), ...res];
        }

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

  gameRuntimeCalculator(endCoef: number) {
    // Initial parameters
    let initialCoef = 1.0;
    let currentCoef = initialCoef;

    let initialDuration = 1000.0;  // initial duration in milliseconds
    let increment = 0.1;  // coefficient increment
    let stepDecrement = 25.0;  // duration decrement per 2s step in milliseconds
    let stepThreshold = 1000.0;  // threshold for applying step decrement in milliseconds

    let totalDuration = 0.0;
    let currentDuration = initialDuration;

    // Calculation loop
    while (currentCoef < endCoef) {
      totalDuration += currentDuration;
      currentCoef += increment;

      // Check if we have passed a 2s threshold and adjust duration
      if (totalDuration >= stepThreshold) {
        if (currentDuration - stepDecrement <= 1) {
          currentDuration = 1;
          stepThreshold += 1000.0;  // update the next threshold
          continue;
        } else {
          currentDuration -= stepDecrement;
          stepThreshold += 1000.0;  // update the next threshold
        }
      }
    }

    // console.log(`Total duration: ${totalDuration} milliseconds`);
    return totalDuration;
  }

  generateIntervals(totalDuration: number) {
    // console.log(`Total Duration ${totalDuration}`)
    let initialDuration = 100.0;  // initial duration in milliseconds
    let stepDecrement = 2.5;  // duration decrement every 10 steps in milliseconds
    let steps = 10;  // steps to apply the decrement

    let intervals = [];
    let currentDuration = initialDuration;
    let stepCounter = 0;
    let remainingDuration = totalDuration;

    while (remainingDuration > 0) {
      intervals.push(currentDuration);
      remainingDuration -= currentDuration;
      stepCounter++;

      // Check if we need to decrement the duration
      if (stepCounter === steps) {
        stepCounter = 0;  // reset step counter
        if (currentDuration - stepDecrement <= 1) {
          currentDuration = 1;
        } else {
          currentDuration -= stepDecrement;
        }
      }

      // Ensure we don't add more duration than remaining
      if (remainingDuration < currentDuration) {
        intervals.push(remainingDuration);
        break;
      }
    }

    // console.log(`Intervals: ${intervals.length}`);
    return intervals;
  }

  public async changeCoefficientAutomatically(): Promise<void> {
    const currentGamePlayingUntil = new Date(this.currentGame.playing_until);
    var useNextGame = false;
    if (currentGamePlayingUntil.getTime() < (new Date()).getTime()) {
      useNextGame = true;
    }
    const startDate = new Date();
    // console.log(`STARTED GAME ${this.currentGame.id} ${this.currentGame.coefficient} ${startDate}`)
    const addedTime = 5 * 60 * 60 * 1000;
    const endDate = new Date(useNextGame ? this.nextGame.playing_until : this.currentGame.playing_until);
    // const totalDuration = (endDate.getTime() + addedTime) - startDate.getTime();
    const totalDuration = this.gameRuntimeCalculator(useNextGame ? this.currentGame.coefficient : this.nextGame.coefficient);
    const intervals = this.generateIntervals(totalDuration);
    let startCoefficient = 1.0;
    const endCoefficient = useNextGame ? this.nextGame.coefficient : this.currentGame.coefficient;
    const increment = 0.01;

    // Calculate the number of steps required to reach the end coefficient
    const steps = Math.ceil((endCoefficient - startCoefficient) / increment);

    // Calculate the interval for each step
    const interval = totalDuration / steps;

    /*console.log('Total Duration:', totalDuration);
    console.log('Steps:', steps);
    console.log('Interval per step:', interval);*/

    let currentStep = 0;

    // console.log(intervals);
    while (this.startCoefficient < endCoefficient) {
      await this.delay(intervals[currentStep]);
      this.startCoefficient += increment;
      // console.log('Current Coefficient:', this.startCoefficient, currentStep, endCoefficient);
      currentStep++;
    }

    this.currentGame = {
      ...this.currentGame,
      'status': 'FINISHED',
    };
    this.flyawayAnimation();

    if (!this.showAlert) {
      this.isFlewAway = true;

      setTimeout(() => {
        this.isFlewAway = false;
        this.showLoading = true;
        this.clearAllIntervals()
        this.clearHighlightedRows();
        this.toggleHidePlane(false)
        // console.log('FUCCCSAKCSCKAS OFFO ASOF KASF')
      }, 5000);
    }
    this.showAlert = true;
    this.isGameStarted = false;
    this.stop();
    this.stopBg();
    // console.log('Final Coefficient:', this.startCoefficient, this.currentGame.coefficient);
    this.startCoefficient = 1.0
  }

  private toggleHidePlane(hide: Boolean) {
    var lottieSvg = document.getElementsByClassName('lottie-svg-class1')[0].getElementsByTagName('g')[0].getElementsByTagName('g')

    var plane: SVGGElement[] = [];

    for (var i = 0; i < lottieSvg.length; i++) {
      lottieSvg[i].style.display = hide ? 'none' : 'block'
      var paths = lottieSvg[i].getElementsByTagName('path')
      if (paths.length > 0) {
        paths[0].style.display = hide ? 'none' : 'block'
      }
    }
  }

  private flyawayAnimation() {
    var lottieSvg = document.getElementsByClassName('lottie-svg-class1')[0].getElementsByTagName('g')[0].getElementsByTagName('g')
    var ngLottie = document.getElementsByTagName('ng-lottie')[0] as HTMLElement
    var ngLottieSvg = document.getElementsByTagName('ng-lottie')[0].getElementsByTagName('svg')[0]
    var LottieNewContainer = document.getElementsByClassName('lottie-new-container')[0] as HTMLElement

    var plane: SVGGElement[] = [];

    for (var i = 0; i < lottieSvg.length; i++) {
      if (lottieSvg[i].classList.contains('ai')) {
        plane.push(lottieSvg[i])
      } else {
        lottieSvg[i].style.display = 'none'
      }
    }

    const svgMatrix1 = plane[0].transform.animVal[0].matrix
    const initialTransform1 = getComputedStyle(plane[0]).transform;
    const initialTransform2 = getComputedStyle(plane[1]).transform;
    const initialTransform3 = getComputedStyle(plane[2]).transform;


    const keyframes1 = [
      {transform: initialTransform1},
      {transform: 'translateX(700vw) translateY(20px)'}
    ];

    const keyframes2 = [
      {transform: initialTransform2},
      {transform: 'translateX(700vw) translateY(20px)'}];

    const keyframes3 = [
      {transform: initialTransform3},
      {transform: 'translateX(700vw) translateY(20px)'}];

    // Define the animation options
    const options = {
      duration: 900, // Animation duration in milliseconds
      easing: 'linear' // Easing function
    };
    ngLottieSvg.classList.add('flyaway')

    console.log(ngLottieSvg)
    this.flyAwayAudio.play()
    // Start the animation
    var planeAnimation = plane[0].animate(keyframes1, options);
    plane[1].animate(keyframes2, options);
    plane[2].animate(keyframes3, options);
    planeAnimation.onfinish = (event) => {
      this.toggleHidePlane(true)
      this.flyawayAnimationRevert();
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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
    this.flyawayAnimationRevert()
    this.toggleHidePlane(false)
    if (this.bgAudio.paused) {
      this.bgAudio.play()
    }

    if (this.animationItem && !this.isGameStarted) {
      // console.log(123)
      // this.isFlewAway = false;
      this.animationItem.play();
      this.playBg();
      this.flyReadyAudio.play();
      this.flyawayAnimationRevert()
      this.changeCoefficientAutomatically();
      console.log('play');
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
    this.nextGameTimeout = null;
  }

  public restart(): void {
    this.isFlewAway = true;
    // console.log('FUCKKKKK OFFFF')
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
    this.highlightRow(indices[0], 500); // Highlight first row after 3 seconds
    this.highlightRow(indices[1], 1000); // Highlight third row after 5 seconds
    this.highlightRow(indices[2], 1500); // Highlight third row after 5 seconds
    this.highlightRow(indices[3], 1500); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[4], 1900); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[5], 2000); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[6], 2100); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[7], 2500); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[8], 2500); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[9], 3050); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[10], 3100); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[11], 3100); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[12], 3500); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[13], 3550); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[14], 3950); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[15], 4150); // Highlight fifth row after 7 seconds
    this.highlightRow(indices[16], 4250); // Highlight fifth row after 7 seconds
  }

  generateRandomIndices(): number[] {
    const indices = [];
    const usedIndices = new Set<number>();

    while (indices.length < 17) {
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
    this.roomService.close();
  }

  private flyawayAnimationRevert() {
    try {
      var lottieSvg = document.getElementsByClassName('lottie-svg-class1')[0].getElementsByTagName('g')[0].getElementsByTagName('g')
      var ngLottie = document.getElementsByTagName('ng-lottie')[0] as HTMLElement
      var ngLottieSvg = document.getElementsByTagName('ng-lottie')[0].getElementsByTagName('svg')[0]
      var LottieNewContainer = document.getElementsByClassName('lottie-new-container')[0] as HTMLElement

      var plane: SVGGElement[] = [];


      ngLottieSvg.classList.remove('flyaway')

      // LottieNewContainer.style.removeProperty('width')
      // ngLottie.style.removeProperty('max-width')
      // ngLottieSvg.style.removeProperty('max-width')
      for (var i = 0; i < lottieSvg.length; i++) {
        if (lottieSvg[i].classList.contains('ai')) {
          plane.push(lottieSvg[i])
        } else {
          lottieSvg[i].style.display = 'block'
        }
      }
    } catch (e) {

    }
  }
}
