import { ReactNode } from 'react';
import { Box, Flex, Link, Text } from '@chakra-ui/react';

interface LayoutProps {
  children: ReactNode;
}

const Menu = ({ children }: LayoutProps) => {
  return (
    <Box>
      <Flex
        as="nav"
        bg="teal.500"
        color="white"
        padding="1rem"
        justifyContent="space-between"
        alignItems="center"
        mb={8}
      >
        <Text fontSize="xl" fontWeight="bold">
          Rule Engine
        </Text>

        <Flex gap={4}>
            <Link href="/" fontSize="lg" fontWeight="medium" _hover={{ textDecoration: 'none', color: 'teal.200' }}>
              Home
            </Link>

            <Link href="/create_rule" fontSize="lg" fontWeight="medium" _hover={{ textDecoration: 'none', color: 'teal.200' }}>
              Create Rule
            </Link>

            <Link href="/combine_rule" fontSize="lg" fontWeight="medium" _hover={{ textDecoration: 'none', color: 'teal.200' }}>
              Combine Rules
            </Link>
          
            <Link href="/evaluate_rule" fontSize="lg" fontWeight="medium" _hover={{ textDecoration: 'none', color: 'teal.200' }}>
              Evaluate Rule
            </Link>
        </Flex>
      </Flex>

      <Box className='px-14'>{children}</Box>
    </Box>
  );
};

export default Menu;
