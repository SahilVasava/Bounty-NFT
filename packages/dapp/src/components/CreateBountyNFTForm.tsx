import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
} from '@chakra-ui/react';
import React from 'react';

export default function CreateBountyNFTForm() {
  return (
    <Flex width="full" align="center" justifyContent="center">
      <Box p={2}>
        <Box textAlign="center">
          <Heading>Create a Bounty NFT</Heading>
        </Box>
        <Box my={4} textAlign="left">
          <form>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input type="text" placeholder="Create an MEV bot in Solidity" />
            </FormControl>
            <FormControl mt={6}>
              <FormLabel>Text</FormLabel>
              <Input type="password" placeholder="*******" />
            </FormControl>
            <Button width="full" mt={4} type="submit">
              Sign In
            </Button>
          </form>
        </Box>
      </Box>
    </Flex>
  );
}
