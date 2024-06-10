import {inject, Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class RoomService {
  private readonly baseUrl = 'https://d551-217-11-73-237.ngrok-free.app';
  private http = inject(HttpClient);
  checkIsAuto$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

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

  public getBalance(): Observable<any> {
    return this.http.get(`${this.baseUrl}/v1/bets/balance`);
  }

  public getIsCheckedAuto() {
    return this.checkIsAuto$.asObservable();
  }

  public setIsCheckedAuto(value: any): void {
    this.checkIsAuto$.next(value);
  }

}
