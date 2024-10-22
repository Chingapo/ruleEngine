const admin = require('firebase-admin');
const serviceAccount = require("./serviceAccountKey.json"); //add path to your own database service account key downloaded from firebase

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());


app.use(cors({
    origin: 'http://localhost:3001', // Allow requests from frontend
    methods: ['GET', 'POST'], // Allowed methods
  }));



app.get('/', (req, res) => {
  res.send('Rule Engine Backend');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

function combineRules(asts) {
    if (asts.length === 0) return null;
    if (asts.length === 1) return asts[0];
  
    // Combine rules with AND operator
    return asts.reduce((combinedAST, currentAST) => {
      return {
        type: 'operator',
        operator: 'AND',
        left: combinedAST,
        right: currentAST
      };
    });
}

function parseRuleStringToAST(ruleString) {
    const stack = [];
    let currentNode = null;
    const usedAttributes = new Set(); // Set to hold unique attributes

    const conditionRegex = /(\w+)\s*(>|<|=)\s*([\'\w]+)/; // Modified to accept strings in quotes
    const openParen = '(';
    const closeParen = ')';

    if (!ruleString || typeof ruleString !== 'string') {
        throw new Error('Rule string must be a valid non-empty string');
    }

    const tokens = ruleString.split(/(\(|\)|\bAND\b|\bOR\b)/).map(token => token.trim()).filter(token => token);

    if (tokens.length === 0) {
        throw new Error('Rule string must contain at least one condition');
    }

    tokens.forEach(token => {
        if (token === openParen) {
            if (currentNode) {
                stack.push(currentNode); // Push current node before starting a new group
            }
            currentNode = null;
        } else if (token === closeParen) {
            if (!currentNode) {
                throw new Error('Invalid rule: missing subexpression inside parentheses');
            }

            const lastNode = stack.pop();
            if (lastNode) {
                if (!lastNode.right) {
                    lastNode.right = currentNode; // Attach the current group to the last node
                    currentNode = lastNode;
                } else {
                    throw new Error('Invalid rule: multiple conditions without an operator');
                }
            }
        } else if (token === 'AND' || token === 'OR') {
            if (!currentNode) {
                throw new Error('Invalid rule: operator without a preceding condition');
            }

            // Create a new operator node with currentNode as left operand
            const operatorNode = {
                type: 'operator',
                operator: token,
                left: currentNode,
                right: null
            };
            currentNode = operatorNode;
        } else {
            const match = token.match(conditionRegex);

            if (!match) {
                throw new Error(`Invalid condition format: "${token}"`);
            }

            const [_, field, operator, value] = match;
            if (!field || !operator || !value) {
                throw new Error(`Incomplete condition: "${token}"`);
            }

            // Collect the used attribute
            usedAttributes.add(field);

            const operandNode = {
                type: 'operand',
                value: { field, operator, value: value.replace(/'/g, '') }
            };

            if (currentNode && currentNode.type === 'operator' && !currentNode.right) {
                // Attach operand to the right side of the current operator
                currentNode.right = operandNode;
            } else {
                currentNode = operandNode; // This is the start of a new expression
            }
        }
    });

    // Ensure the AST is valid
    if (!currentNode) {
        throw new Error('Invalid rule: rule string did not result in a valid AST');
    }

    // Return both the current node (AST) and the used attributes
    return { ast: currentNode, usedAttributes: Array.from(usedAttributes) };
}




  
function evaluateAST(node, data) {
    if (!node) return false;

    if (node.type === 'operand') {
        const { field, operator, value } = node.value;
        const fieldValue = data[field];

        // Handle both string and number comparisons
        if (typeof fieldValue === 'string' && typeof value === 'string') {
            switch (operator) {
                case '=': return fieldValue === value;
                default: return false; // Only equality checks for strings
            }
        } else if (typeof fieldValue === 'number' && !isNaN(Number(value))) {
            const numericValue = Number(value);
            switch (operator) {
                case '>': return fieldValue > numericValue;
                case '<': return fieldValue < numericValue;
                case '=': return fieldValue === numericValue;
                default: return false;
            }
        } else {
            return false; // Mismatched types (e.g., comparing string to number)
        }
    } else if (node.type === 'operator') {
        const leftEval = evaluateAST(node.left, data);
        const rightEval = evaluateAST(node.right, data);

        switch (node.operator) {
            case 'AND': return leftEval && rightEval;
            case 'OR': return leftEval || rightEval;
            default: return false;
        }
    }
}



function validateAttributes(data, usedAttributes) {
    for (const attr of usedAttributes) {
        if (!(attr in data)) {
            throw new Error(`Missing required attribute: ${attr}`);
        }
    }
}


  
  

app.post('/create_rule', async (req, res) => {
    const ruleString = req.body.rule;

    if (!ruleString) {
        return res.status(400).json({ error: 'Rule string is required' });
    }

    try {
        const { ast, usedAttributes } = parseRuleStringToAST(ruleString);
        const ruleDoc = await db.collection('rules').add({ ast, ruleString, usedAttributes });

        res.json({ message: 'Rule created', ruleId: ruleDoc.id, ast });
    } catch (error) {
        res.status(400).json({ error: 'Invalid rule format' });
    }
});



  app.post('/update_rule', async (req, res) => {
    const { ruleId, updatedRuleString } = req.body;
  
    if (!ruleId || !updatedRuleString) {
      return res.status(400).json({ error: 'Rule ID and updated rule string are required' });
    }
  
    try {
      const ast = parseRuleStringToAST(updatedRuleString);
      await db.collection('rules').doc(ruleId).update({ ast, ruleString: updatedRuleString });
  
      res.json({ message: 'Rule updated successfully', ruleId });
    } catch (error) {
      res.status(400).json({ error: 'Error updating rule' });
    }
  });
  
  

  app.post('/combine_rules', async (req, res) => {
    const ruleIds = req.body.ruleIds;

    try {
        // Step 1: Retrieve all rules from Firestore
        const rules = [];
        const descriptions = []; // Array to hold descriptions (ruleString)
        const usedAttributes = new Set(); // Set to hold unique attributes

        for (const ruleId of ruleIds) {
            const ruleDoc = await db.collection('rules').doc(ruleId).get();
            if (ruleDoc.exists) {
                const ruleData = ruleDoc.data();
                rules.push(ruleData.ast);
                descriptions.push(ruleData.ruleString); // Retrieve the ruleString instead of description

                // Collect the used attributes from the current rule's AST
                ruleData.usedAttributes.forEach(attr => usedAttributes.add(attr));
            } else {
                return res.status(404).json({ error: `Rule with ID ${ruleId} not found` });
            }
        }

        // Step 2: Combine the rules using the combineRules function
        const combinedAST = combineRules(rules);

        // Step 3: Create a combined rule string, indicating it is a combined rule
        const combinedRuleString = `Combined Rule: ${descriptions.join(' + ')}`; // Prepend "Combined Rule:"

        // Step 4: Save the combined rule back to Firestore
        const combinedRuleDoc = await db.collection('rules').add({
            ast: combinedAST,
            ruleString: combinedRuleString, // Save the combined ruleString
            usedAttributes: Array.from(usedAttributes), // Save the unique usedAttributes
            createdAt: admin.firestore.FieldValue.serverTimestamp() // Add metadata (optional)
        });

        // Step 5: Return the new rule ID and combined AST
        res.json({ message: 'Rules combined successfully', ruleId: combinedRuleDoc.id, combinedAST });

    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(400).json({ error: 'Error combining rules' });
    }
});

  
  
  

  app.post('/evaluate_rule', async (req, res) => {
    const { ruleId, data } = req.body;

    try {
        const ruleDoc = await db.collection('rules').doc(ruleId).get();
        if (!ruleDoc.exists) {
            return res.status(404).json({ error: `Rule with ID ${ruleId} not found` });
        }

        const ast = ruleDoc.data().ast;
        const usedAttributes = ruleDoc.data().usedAttributes;

        console.log('Evaluating AST:', ast); // Log the AST for debugging
        console.log('Data received for evaluation:', data); // Log incoming data

        

        // Validate that only attributes present in the rule are in the data
        validateAttributes(data, usedAttributes);

        const result = evaluateAST(ast, data);
        console.log('Evaluation result:', result); // Log the evaluation result
        res.json({ result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


  // Fetch all rules
app.get('/rules', async (req, res) => {
    try {
      const rulesSnapshot = await db.collection('rules').get();
      const rules = rulesSnapshot.docs.map(doc => ({
        id: doc.id,
        ruleString: doc.data().ruleString
      }));
      res.json({ rules });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching rules' });
    }
  });
  
  
  
  
  
  