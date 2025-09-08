import { Injectable, inject } from '@angular/core';
import { SUPABASE } from '../core/supabase.token';
import * as bcrypt from 'bcryptjs';

@Injectable({ providedIn: 'root' })
export class AdminProvisionService {
  private sb = inject(SUPABASE);

  /**
   * Crea un admin llamando a la RPC que recibe el hash ya calculado.
   * Ejecuta esto una sola vez (por ejemplo, desde un botón escondido o un script temporal).
   */
  async createAdminOnce(params: {
    email: string;
    password: string;       // en claro SOLO en el cliente; se hashea aquí
    displayName: string;
    role?: 'owner'|'admin'|'editor'|'viewer';
    setupCode: string;      // el código que configuraste en la DB (no lo subas al repo)
  }) {
    const { email, password, displayName, setupCode } = params;
    const role = params.role ?? 'owner';

    // 1) Hash en cliente
    const hash = await bcrypt.hash(password, 12); // costo 12

    // 2) Llama a la RPC (en el esquema dental)
    const { data, error } = await this.sb
      .schema('dental')
      .rpc('create_admin_hashed', {
        p_email: email,
        p_password_hash: hash,
        p_display_name: displayName,
        p_role: role,
        p_setup_code: setupCode,
      });

    if (error) throw error;
    return data as string; // id del nuevo admin
  }
}
