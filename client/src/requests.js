import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from 'apollo-boost';
import { gql } from 'graphql-tag';
import { isLoggedIn, getAccessToken } from './auth';
const endpointURL = 'http://localhost:9001/graphql';

/**
 * fetchPolicy
 * - cache-first: default
 * - no-cache: never use cache, always fetch date from server
 */

const authLink = new ApolloLink((operation, forward) => {
  if (isLoggedIn()) {
    const token = getAccessToken();
    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : null,
      },
    });
  }
  return forward(operation); // forward allows us to chain multiple steps together, and pass to next chain
});
const client = new ApolloClient({
  link: ApolloLink.from([authLink, new HttpLink({ uri: endpointURL })]), // array means executed process
  cache: new InMemoryCache(),
});

const jobDetailFragment = gql`
  fragment JobDetail on Job {
    id
    title
    description
    company {
      id
      name
    }
  }
`;

const createJobMutation = gql`
  mutation CreateJob($input: CreateJobInput) {
    job: createJob(input: $input) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;

const jobQuery = gql`
  query Job($id: ID!) {
    job(id: $id) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;

const jobsQuery = gql`
  query JobQuery {
    jobs {
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

const companyQuery = gql`
  query company($id: ID!) {
    company(id: $id) {
      id
      name
      description
      jobs {
        id
        title
      }
    }
  }
`;

export const createJob = async (input) => {
  const { data } = await client.mutate({
    mutation: createJobMutation,
    variables: { input },
    update: (cache, { data }) => {
      cache.writeQuery({
        query: jobQuery,
        variables: { id: data.job.id },
        data,
      });
    },
  });
  return data.job;
};

export const loadJobs = async () => {
  const { data } = await client.query({
    query: jobsQuery,
    fetchPolicy: 'no-cache',
  });
  return data.jobs;
};

export const loadJob = async (id) => {
  const { data } = await client.query({
    query: jobQuery,
    variables: { id },
  });
  return data.job;
};

export const loadCompany = async (id) => {
  const { data } = await client.query({
    query: companyQuery,
    variables: { id },
  });
  return data.company;
};
