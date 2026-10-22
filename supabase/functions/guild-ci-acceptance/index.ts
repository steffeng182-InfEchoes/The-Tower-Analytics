// Acceptance fixture provisioning has been disabled after successful hosted tests.
// Deploy the audited fixture-template.ts temporarily for a future acceptance run.
Deno.serve(() => new Response('Acceptance fixture service disabled', { status: 410 }));
