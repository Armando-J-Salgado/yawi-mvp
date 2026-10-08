import type { AuthResponse, CustomerRegistrationData, LoginCredentials } from '../types/auth';

/**
 * Llama al endpoint de login del backend.
 * TODO [M4]: Reemplazar con llamada real a Supabase o API REST.
 *
 * @param credentials - Email y password del usuario
 * @returns AuthResponse con usuario autenticado o error
 */
export async function loginApi(credentials: LoginCredentials): Promise<AuthResponse> {
  // TODO [M4]: Implementar llamada real
  // Ejemplo con Supabase:
  // const { data, error } = await supabase.auth.signInWithPassword({
  //   email: credentials.email,
  //   password: credentials.password,
  // });
  // if (error) return { success: false, error: error.message };
  // return { success: true, user: mapToAuthUser(data.user) };

  // Mock: simula delay de red y retorna éxito
  await new Promise((resolve) => setTimeout(resolve, 800));
  return {
    success: true,
    user: {
      id: 'mock-user-id',
      email: credentials.email,
      name: 'Usuario',
      lastname: 'Demo',
      country: 'SV',
      address: 'Dirección de prueba, San Salvador',
    },
  };
}

/**
 * Llama al endpoint de registro del backend.
 * TODO [M4]: Reemplazar con llamada real a Supabase o API REST.
 *
 * @param data - Datos del formulario de registro (sin confirmPassword)
 * @returns AuthResponse con resultado de la operación
 */
export async function registerApi(
  data: Omit<CustomerRegistrationData, 'confirmPassword'>,
): Promise<AuthResponse> {
  // TODO [M4]: Implementar llamada real
  // Ejemplo con Supabase:
  // const { data: authData, error } = await supabase.auth.signUp({
  //   email: data.email,
  //   password: data.password,
  // });
  // if (error) return { success: false, error: error.message };
  // // Guardar perfil en tabla customers
  // await supabase.from('customers').insert({ ... });
  // return { success: true };

  // Mock: simula delay de red y retorna éxito
  //!M4: DELETE WHEN MOCK IS CHANGED TO THE OFFICIAL VERSION 
  console.log(data);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true };
}
