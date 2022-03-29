import { Button } from '@chakra-ui/react';
import React from 'react';
import { useConnect } from 'wagmi';

export default function ConnectWalletButton() {
  const [{ data }, connect] = useConnect();
  return (
    <Button onClick={() => connect(data.connectors[0])}>
      {data.connected ? 'Connected' : 'Connect Wallet'}
    </Button>
  );
}
