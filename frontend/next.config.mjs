// En-têtes de sécurité posés par Next lui-même : aucun reverse proxy devant l'app
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'no-referrer' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

// CSP seulement en production : `next dev` a besoin d'eval pour le rechargement à chaud
if (process.env.NODE_ENV === 'production') {
  securityHeaders.push({
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
  });
}

const nextConfig = {
  poweredByHeader: false,
  // Revenir sur une page visitée dans les 30 s est instantané ; les server actions vident ce cache, donc pas de données périmées
  experimental: { staleTimes: { dynamic: 30 } },
  // next dev bloque le rechargement à chaud ouvert depuis une autre IP que localhost : on autorise le LAN privé
  allowedDevOrigins: ['192.168.*.*'],
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
