import {inject, Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class RoomService {
  private readonly baseUrl = 'http://209.250.233.190:80';
  private http = inject(HttpClient);

  public checkIsAuto$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public checkShowOver: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  public getBalance(): Observable<any> {
    return this.http.get(`${this.baseUrl}/v1/bets/balance`);
  }

  public setBalance(body: {amount: number}): Observable<any> {
    return this.http.post(`${this.baseUrl}/v1/bets/set-balance`, body);
  }

  public getIsCheckedAuto() {
    return this.checkIsAuto$.asObservable();
  }

  public setIsCheckedAuto(value: any): void {
    this.checkIsAuto$.next(value);
  }

  public setCoeff(value: any) {
    this.checkShowOver.next(value);
  }

  public getCoeff() {
    return this.checkShowOver.asObservable();
  }

  public getRoomsList(): Observable<any> {
    return this.http.get(`${this.baseUrl}/v1/rooms`);
  }

  public getRoomById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/v1/rooms/${id}`);
  }

  public makeBet(body: { amount: number }): Observable<any> {
    return this.http.post(`${this.baseUrl}/v1/bets`, body);
  }

  public getBetsList(): Observable<any> {
    return this.http.get(`${this.baseUrl}/v1/bets`);
  }

  public withdraw(): Observable<any> {
    return this.http.get(`${this.baseUrl}/v1/bets/withdraw`);
  }

  public cancelBet(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/v1/bets/cancels/${id}`, {})
  }

  public addCoefficient(body: {coefficient: number[]}): Observable<any> {
    return this.http.post(`${this.baseUrl}/v1/bets/add-coefficients`, body);
  }

}
