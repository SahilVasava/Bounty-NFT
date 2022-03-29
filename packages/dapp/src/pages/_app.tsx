import { ChakraProvider } from '@chakra-ui/react';
import { Provider } from 'wagmi';

import { AppProps } from 'next/app';
import theme from '../theme';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider>
      <ChakraProvider resetCSS theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </Provider>
  );
}

export default MyApp;
