"use client"
import { useEffect, useState } from 'react';
import { Box, Text, UnorderedList, ListItem } from '@chakra-ui/react';
import axios from 'axios';

interface Rule {
  id: string;
  ruleString: string;
}

const HomePage = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/rules`);
        setRules(response.data.rules);
      } catch (error) { // No longer use 'err', just use 'error'
        if (axios.isAxiosError(error)) {
          setError(error.response?.data.error || 'Error fetching rules');
        } else {
          setError('Error fetching rules');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, []);
  

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text color="red.500">Error: {error}</Text>;
  }

  return (
    <Box p={5}>
      <Text fontSize="2xl" mb={5}>List of Rules</Text>
      <UnorderedList>
        {rules.map((rule) => (
          <ListItem className='py-4' key={rule.id}>
            <Text>
              Rule ID: <strong>{rule.id}</strong>
              <br />
              Description: <em>{rule.ruleString}</em>
            </Text>
          </ListItem>
        ))}
      </UnorderedList>
    </Box>
  );
};

export default HomePage;
