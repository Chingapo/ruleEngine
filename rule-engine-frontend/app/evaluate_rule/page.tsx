"use client";
import { useEffect, useState } from 'react';
import { Button, Input, FormControl, FormLabel, Box, Text, UnorderedList, ListItem } from '@chakra-ui/react';
import axios, { AxiosError } from 'axios';

interface Rule {
    id: string;
    ruleString: string;
}

const Home = () => {
  const [ruleId, setRuleId] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [salary, setSalary] = useState<string>('');
  const [experience, setExperience] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);
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

  interface ErrorResponse {
    error: string; 
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
        // Convert values to the expected types if necessary
        const userData = {
            age: parseInt(age, 10) || 0, // Default to 0 if age is not a number
            department: department || '', // Default to an empty string if department is not provided
            salary: parseFloat(salary) || 0, // Default to 0 if salary is not a number
            experience: parseInt(experience, 10) || 0 // Default to 0 if experience is not a number
        };
        console.log('Rule ID:', ruleId);
        console.log('User Data:', userData);

        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/evaluate_rule`, {
            ruleId,
            data: userData
        });
        console.log(response.data);
        setResult(response.data.result ? 'Eligible' : 'Not Eligible');
        setError(null);
    } catch (err) {
        const error = err as AxiosError<ErrorResponse>; // Type assertion to AxiosError
        setError(error.response?.data.error || 'An error occurred');
        setResult(null);
    }
};


  return (
    <>   
    <Box p={5}>
    <Text fontSize="2xl" mb={5}>Rule Engine Evaluation</Text>
    <Text fontSize="md" className='font-thin' mb={5}>Use Rule ID&apos;s from the list below and find out if someone is eligible according to the rule by entering their information above</Text>
    <form onSubmit={handleSubmit}>
        <FormControl mb={3}>
        <FormLabel>Rule ID</FormLabel>
        <Input value={ruleId} onChange={(e) => setRuleId(e.target.value)} required />
        </FormControl>
        <FormControl mb={3}>
        <FormLabel>Age</FormLabel>
        <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
        </FormControl>
        <FormControl mb={3}>
        <FormLabel>Department</FormLabel>
        <Input value={department} onChange={(e) => setDepartment(e.target.value)} required />
        </FormControl>
        <FormControl mb={3}>
        <FormLabel>Salary</FormLabel>
        <Input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} required />
        </FormControl>
        <FormControl mb={3}>
        <FormLabel>Experience</FormLabel>
        <Input type="number" value={experience} onChange={(e) => setExperience(e.target.value)} required />
        </FormControl>
        <Button type="submit" colorScheme="teal">Evaluate Rule</Button>
    </form>

    {result && <Text mt={5}>Result: {result}</Text>}
    {error && <Text color="red.500" mt={5}>Error: {error}</Text>}
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

export default Home;
