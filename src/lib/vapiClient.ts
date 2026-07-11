import Vapi from "@vapi-ai/web";

// Public Key намеренно предназначен Vapi для клиентской/браузерной части (в отличие от
// Private/Secret key, который используется только сервером в edge function vapi-call для
// настоящих телефонных звонков). Класть Public Key в код сайта безопасно.
export const VAPI_PUBLIC_KEY = "e7a200de-d81d-4806-b498-54e6dff7cde9";
export const VAPI_ASSISTANT_ID = "70285460-014d-462f-aedf-891d20bbeb55";

let vapiInstance: Vapi | null = null;

// Один и тот же экземпляр Vapi переиспользуется на всё время жизни страницы.
export function getVapi(): Vapi {
  if (!vapiInstance) {
    vapiInstance = new Vapi(VAPI_PUBLIC_KEY);
  }
  return vapiInstance;
}
