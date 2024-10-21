"use client"
import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Input, Button, Box, FormControl, FormLabel, Text, UnorderedList, ListItem } from '@chakra-ui/react';

interface Rule {
    id: string;
    ruleString: string;
}

interface ErrorResponse {
    error: string; 
}


const CombineRules = () => {
  const [ruleIds, setRuleIds] = useState<string[]>(['']);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const handleRuleIdChange = (index: number, value: string) => {
    const newRuleIds = [...ruleIds];
    newRuleIds[index] = value;
    setRuleIds(newRuleIds);
  };

  const addRuleInput = () => {
    setRuleIds([...ruleIds, '']);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/combine_rules`, {
        ruleIds,
      });
      setMessage(`Combined rule created successfully with ID: ${response.data.ruleId}`);
      setError(null);
    } catch (err) {
        const error = err as AxiosError<ErrorResponse>; // Type assertion to AxiosError
        setError(error.response?.data.error || 'An error occurred');
        setMessage(null);
    }
  };

  return (
    <>
    <Box p={5}>
      <Text fontSize="2xl" mb={5}>Combine Rules</Text>
      <Text fontSize="md" className='font-thin' mb={5}>Use the Rule ID&apos;s from below and combine rules in the section above</Text>
      <Text fontSize="md" className='font-thin' mb={5}>The combined rule basically is the use of logical operator &apos;AND&apos; between the 2 rules.</Text>
      <form onSubmit={handleSubmit}>
        {ruleIds.map((ruleId, index) => (
          <FormControl key={index} mb={3}>
            <FormLabel>Rule ID {index + 1}</FormLabel>
            <Input
              type="text"
              value={ruleId}
              onChange={(e) => handleRuleIdChange(index, e.target.value)}
              required
            />
          </FormControl>
        ))}
        <Box mt={5}>
            <Button className='mr-5' onClick={addRuleInput} colorScheme="teal">
            Add Another Rule
            </Button>
            <Button type="submit" colorScheme="teal">
                Combine Rules
            </Button>
        </Box>
      </form>

      {message && <Text mt={5} color="green.500">{message}</Text>}
      {error && <Text mt={5} color="red.500">Error: {error}</Text>}
    </Box>
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
    </>
  );
};

export default CombineRules;
