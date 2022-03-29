import {
  Flex,
  HStack,
  HTMLChakraProps,
  chakra,
  useColorModeValue,
  useDisclosure,
  useUpdateEffect,
  Text,
  Container,
} from '@chakra-ui/react';
import { useViewportScroll } from 'framer-motion';
import NextLink from 'next/link';
import { useEffect, useRef, useState } from 'react';
import ConnectWalletButton from './ConnectWalletButton';

function HeaderContent() {
  const mobileNav = useDisclosure();

  const mobileNavBtnRef = useRef<HTMLButtonElement>();

  useUpdateEffect(() => {
    mobileNavBtnRef.current?.focus();
  }, [mobileNav.isOpen]);

  return (
    <Flex w="100%" h="100%" px="6" align="center" justify="space-between">
      <Flex align="center">
        <NextLink href="/" passHref>
          <chakra.a display="block" aria-label="Chakra UI, Back to homepage">
            <Text>POWP</Text>
          </chakra.a>
        </NextLink>
      </Flex>

      <Flex
        justify="flex-end"
        w="100%"
        align="center"
        color="gray.400"
        maxW="1100px"
      >
        <HStack spacing="5">
          <ConnectWalletButton />
        </HStack>
      </Flex>
    </Flex>
  );
}

function Header(props: HTMLChakraProps<'header'>) {
  const bg = useColorModeValue('white', 'gray.800');
  const ref = useRef<HTMLHeadingElement>();
  const [y, setY] = useState(0);
  const { height = 0 } = ref.current?.getBoundingClientRect() ?? {};

  const { scrollY } = useViewportScroll();
  useEffect(() => scrollY.onChange(() => setY(scrollY.get())), [scrollY]);

  return (
    <chakra.header
      ref={ref}
      shadow={y > height ? 'sm' : undefined}
      transition="box-shadow 0.2s, background-color 0.2s"
      // pos="sticky"
      // top="0"
      // zIndex="3"
      bg={bg}
      // left="0"
      // right="0"
      width="full"
      {...props}
    >
      <chakra.div height="4.5rem" mx="auto">
        <Container maxW="container.lg" height="100%">
          <HeaderContent />
        </Container>
      </chakra.div>
    </chakra.header>
  );
}

export default Header;
