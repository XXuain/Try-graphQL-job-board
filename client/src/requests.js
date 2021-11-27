const endpointURL = 'http://localhost:9001/graphql';

const graphqlRequest = async (query, variables = {}) => {
  const response = await fetch(endpointURL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const { errors, data } = await response.json();
  if (errors) {
    const msgStr = errors.map((er) => er.message).join('\n');
    throw new Error(msgStr);
  }
  return data;
};

export const createJob = async (input) => {
  const mutation = `mutation CreateJob($input: CreateJobInput) {
    job: createJob(input: $input){
      id
      title
      company {
        id
        name
      }
    }
  }
`;
  const { job = [] } = await graphqlRequest(mutation, { input });
  return job;
};

export const loadJobs = async () => {
  const query = `{
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
`;
  const { jobs = [] } = await graphqlRequest(query);
  return jobs;
};

export const loadJob = async (id) => {
  const query = `query jobs($id: ID!){
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
`;
  const { job = null } = await graphqlRequest(query, { id });
  return job;
};

export const loadCompany = async (id) => {
  const query = ` query company($id: ID!){
    company(id: $id) {
      id
      name
      description
      jobs{
        id
        title
      }
    }
  }`;
  const { company = null } = await graphqlRequest(query, { id });
  return company;
};
