import { BadRequestException, Injectable } from "@nestjs/common";
import {
  firstValueFrom,
  toArray,
  from,
  map,
  mergeAll,
  take,
  Observable,
} from "rxjs";
import axios from "axios";

@Injectable()
export class RxjsService {
  private readonly githubURL = "https://api.github.com/search/repositories?q=";
  private readonly gitlabURL = "https://gitlab.com/api/v4/projects?search=";

  private getGithub(text: string, count: number): Observable<any> {
    return from(axios.get(`${this.githubURL}${text}`))
      .pipe(
        map((res: any) => res.data.items),
        mergeAll(),
      )
      .pipe(take(count));
  }

  private getGitLab(text: string, count: number): Observable<any> {
    return from(axios.get(`${this.gitlabURL}${text}`))
      .pipe(
        map((res: any) => res.data),
        mergeAll(),
      )
      .pipe(take(count));
  }

  async searchRepositories(text: string, hub: string): Promise<any> {
    let data$: Observable<any>;
    console.log("hub = ", hub);

    if (hub === "gitlab") {
      data$ = this.getGitLab(text, 10).pipe(toArray());
    } else if (hub === "github") {
      data$ = this.getGithub(text, 10).pipe(toArray());
    } else {
      throw new BadRequestException(`Unknown hub: ${hub}`);
    }
    
    data$.subscribe(() => {});
    return await firstValueFrom(data$);
  }
}
