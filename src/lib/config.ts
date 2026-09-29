// CAMBIA ESTA IP cuando te reconectes a la red
export const BASE_URL = "http://10.112.56.79:3000";

// Configuracion de rutas de aprobacion (actualizar cuando tengas la info del ingeniero)
// type: "MOLD" o "DIVERSE", department: nombre del depto, email: correo del aprobador
export const APPROVAL_ROUTES: { type: string; department: string; email: string }[] = [
  // Ejemplos (descomenta y edita cuando tengas los datos):
  // { type: "MOLD", department: "Inyeccion", email: "ingeniero@kostal.com" },
  // { type: "DIVERSE", department: "Inyeccion", email: "ingeniero@kostal.com" },
];

// Correo de respaldo si no hay ruta configurada
export const DEFAULT_APPROVER = "mic.morales@kostal.com";

// Correos de seguridad (actualizar cuando tengas la info)
export const SECURITY_EMAILS: string[] = [
  // Ejemplos:
  // "seguridad@kostal.com",
];

export const DEFAULT_SECURITY = "mic.morales@kostal.com";
