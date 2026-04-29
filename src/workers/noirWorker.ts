import { noirService } from '../services/privacy/NoirService';

type RequestMsg =
  | { id: string; type: 'init' }
  | { id: string; type: 'generateValidationProofs'; payload: any };

type ResponseMsg =
  | { id: string; ok: true; result: any }
  | { id: string; ok: false; error: string };

async function handle(msg: RequestMsg): Promise<any> {
  if (msg.type === 'init') {
    await noirService.initialize();
    return true;
  }
  if (msg.type === 'generateValidationProofs') {
    await noirService.initialize();
    return noirService.generateValidationProofs(msg.payload);
  }
  throw new Error('Unknown request');
}

self.onmessage = async (ev: MessageEvent<RequestMsg>) => {
  const msg = ev.data;
  try {
    const result = await handle(msg);
    const res: ResponseMsg = { id: msg.id, ok: true, result };
    (self as any).postMessage(res);
  } catch (e) {
    const res: ResponseMsg = {
      id: msg.id,
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
    (self as any).postMessage(res);
  }
};

