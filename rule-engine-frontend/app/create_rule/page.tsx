"use client"
import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Input, Button, Box, FormControl, FormLabel, Text } from '@chakra-ui/react';

const CreateRule = () => {
  const [ruleString, setRuleString] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

interface ErrorResponse {
    error: string; 
}


const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/create_rule`, {
            rule: ruleString,
        });
        setMessage(`Rule created successfully with ID: ${response.data.ruleId}`);
        setError(null);
    } catch (err) {
        const error = err as AxiosError<ErrorResponse>; // Type assertion to AxiosError
        setError(error.response?.data.error || 'An error occurred');
        setMessage(null);
    }
};


  return (
    <Box p={5}>
      <Text fontSize="2xl" mb={5}>Create a New Rule</Text>
      <Text fontSize="md" mb={5}>Operators like &apos;AND&apos; and &apos;OR&apos; must be capital</Text>
      <Text fontSize="md" mb={5}>Adequate spacing between each word and operator is necessary</Text>
      <Text fontSize="md" mb={5}>Example of a good rule format is : ((age &gt; 30 AND department = &apos;Marketing&apos;)) AND (salary &gt; 20000 OR experience &gt; 5)</Text>
      <Text fontSize="md" mb={5}>Use only one comparison symbol in conditions, such as &gt; or &lt;, but not combined symbols like &gt;= or &lt;=.</Text>
      <form onSubmit={handleSubmit}>
        <FormControl mb={3}>
          <FormLabel>Rule String</FormLabel>
          <Input
            type="text"
            value={ruleString}
            onChange={(e) => setRuleString(e.target.value)}
            placeholder="Enter rule e.g., age > 30 AND department = 'Sales'"
            required
          />
        </FormControl>
        <Button type="submit" colorScheme="teal">Create Rule</Button>
      </form>

      {message && <Text mt={5} color="green.500">{message}</Text>}
      {error && <Text mt={5} color="red.500">Error: {error}</Text>}
    </Box>
  );
};

export default CreateRule;
