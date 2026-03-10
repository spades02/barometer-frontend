const fs = require('fs');
const path = require('path');

const dir = 'C:\\vet skills n8n';
const files = ['WF1.json', 'WF2.json', 'WF3.json'];

files.forEach(file => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  console.log(`\n\n--- Analyzing ${file} ---`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let nodes = data.nodes;
  if (!nodes && Array.isArray(data)) {
    nodes = data;
  }
  
  if (!Array.isArray(nodes)) {
    console.log('nodes is not an array.');
    return;
  }
  
  nodes.forEach(node => {
     let hardcoded = [];
     
     // Look for specific hardcoded DB operations
     if (node.type === 'n8n-nodes-base.postgres') {
        if (node.parameters.operation) {
           hardcoded.push(`Operation: ${node.parameters.operation}`);
        }
        if (node.parameters.query) {
           hardcoded.push(`Query: ${node.parameters.query.replace(/\\n/g, ' ').substring(0, 100)}...`);
        }
     }
     
     // HTTP Requests
     if (node.type === 'n8n-nodes-base.httpRequest') {
        if (node.parameters.url) {
           hardcoded.push(`URL: ${node.parameters.url}`);
        }
     }
     
     // Set Nodes (often used to inject variables or hardcode constants)
     if (node.type === 'n8n-nodes-base.set') {
        const valuesString = JSON.stringify(node.parameters.values || node.parameters.assignments);
        if (valuesString && !valuesString.includes('={')) { 
           // if it doesn't contain expression, it's hardcoded
           hardcoded.push(`Set Values: ${valuesString}`);
        }
     }

     // Code nodes - these might contain hardcoded values like domain names, arrays of skills, etc.
     if (node.type === 'n8n-nodes-base.code') {
        if (node.parameters.jsCode) {
           const code = node.parameters.jsCode;
           // look for api keys or urls in code
           if (code.includes('http://') || code.includes('https://') || code.includes('apiKey')) {
               hardcoded.push(`Code contains URLs or APi keys.`);
           }
        }
     }
     
     // Generic search in parameters
     if (node.parameters) {
       for (const [key, value] of Object.entries(node.parameters)) {
         if (typeof value === 'string') {
             if (value.startsWith('http')) {
               if (node.type !== 'n8n-nodes-base.httpRequest') {
                 hardcoded.push(`Found URL in ${key}: ${value}`);
               }
             }
             if (key.toLowerCase().includes('key') || key.toLowerCase().includes('token')) {
                 hardcoded.push(`Potential secret in ${key}: ${value}`);
             }
         }
       }
     }
     
     // Identify if a node connects to a specific external system with hardcoded credentials id
     if (node.credentials) {
       for (const [key, val] of Object.entries(node.credentials)) {
           hardcoded.push(`Credential: ${key} -> ${val.id}`);
       }
     }
     
     if (hardcoded.length > 0) {
        console.log(`Node: "${node.name}" (${node.type})`);
        hardcoded.forEach(h => console.log(`  - ${h}`));
     }
  });
});
