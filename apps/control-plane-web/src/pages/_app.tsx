import type { AppProps } from 'next/app';

export default function ControlPlanePagesApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
