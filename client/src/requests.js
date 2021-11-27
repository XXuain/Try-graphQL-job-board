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

export const createJob = async (input) => {
  const mutation = gql`
    mutation CreateJob($input: CreateJobInput) {
      job: createJob(input: $input) {
        id
        title
        company {
          id
          name
        }
      }
    }
  `;
  const { data } = await client.mutate({ mutation, variables: { input } });
  return data.job;
};

export const loadJobs = async () => {
  const query = gql`
    {
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
  const { data } = await client.query({ query, fetchPolicy: 'no-cache' });
  return data.jobs;
};

export const loadJob = async (id) => {
  const query = gql`
    query jobs($id: ID!) {
      job(id: $id) {
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
  const { data } = await client.query({ query, variables: { id } });
  return data.job;
};

export const loadCompany = async (id) => {
  const query = gql`
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
  const { data } = await client.query({ query, variables: { id } });
  return data.company;
};
