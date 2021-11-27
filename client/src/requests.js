const endpointURL = 'http://localhost:9001/graphql';

export const loadJobs = async () => {
  const response = await fetch(endpointURL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      query: `{
          jobs{
            id
            title
            description
            company {
              id
              name
              description
            }
          }
        }
      `,
    }),
  });
  const responseBody = await response.json();
  return responseBody.data?.jobs || [];
};

export const loadJob = async (id) => {
  const response = await fetch(endpointURL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      query: `query jobs($id: ID!){
          job(id: $id){
            id
            title
            description
            company {
              id
              name
              description
            }
          }
        }
      `,
      variables: { id },
    }),
  });
  const responseBody = await response.json();
  return responseBody.data?.job || {};
};
