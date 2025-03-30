const API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aG1pY3J2bmVzZ3NwYmd3em5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NDIwODYsImV4cCI6MjA1ODIxODA4Nn0.wZYVqZXzIGGgXFWlKuwrEgFKaJk5nFqyQDeI_71DGDk"
const URL="https://nvhmicrvnesgspbgwznp.supabase.co/graphql/v1"

import { GET_TRANSACTION_BY_USER_ID } from "./queries";

export const fetcher = async (query:any,variables?:any) => {
    // console.log(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const response = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apiKey: API_KEY, // Add your auth token if required
      },
      body: JSON.stringify({
        query,
        variables
      }),
    });
  
    console.log(response)
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
  
    const result = await response.json();
    // console.log(result)
    return result.data;
  };