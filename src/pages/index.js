import React from 'react';
import Gallery from '../components/gallery';

const pageStyles = {
  color: '#232129',
  padding: 96,
  fontFamily: '-apple-system, Roboto, sans-serif, serif',
};

const links = [
  {
    text: 'Tutorial',
    url: 'https://www.gatsbyjs.com/docs/tutorial/',
    description:
      "A great place to get started if you're new to web development. Designed to guide you through setting up your first Gatsby site.",
    color: '#E95800',
  },
];

const IndexPage = () => {
  return (
    <main>
      <Gallery></Gallery>
    </main>
  );
};

export default IndexPage;

export const Head = () => <title>Home Page</title>;
