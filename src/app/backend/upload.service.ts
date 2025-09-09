import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private http = inject(HttpClient);
  get api(){ return environment.apiBase; }

  async upload(file: File, dir: 'posts'|'services'|'gallery'|'misc' = 'misc'): Promise<{ url: string }> {
    const form = new FormData();
    form.append('file', file);
    const params = new HttpParams().set('dir', dir);
    const res = await this.http.post<{ ok: boolean; url: string }>(`${this.api}/upload.php`, form, { params }).toPromise();
    if (!res?.ok) throw new Error('Fallo subiendo archivo');
    return { url: res.url };
  }
}
