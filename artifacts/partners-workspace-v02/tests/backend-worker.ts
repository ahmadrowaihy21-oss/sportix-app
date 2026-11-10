import worker from '../worker/index';

// Only this isolated harness simulates trusted ingress with a test header.
export default {
  fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext) {
    const owner = request.headers.get('x-test-ingress-owner');
    return worker.fetch(request, env, {
      ...ctx,
      props: owner ? { SPORTIX_SANDBOX_OWNER: owner } : {},
    });
  },
};
