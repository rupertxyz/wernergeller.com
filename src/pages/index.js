import React from 'react';
import Gallery from '../components/gallery';

const IndexPage = () => {
  return (
    <main>
      <Gallery></Gallery>
    </main>
  );
};

export default IndexPage;

export const Head = () => <title>Home Page</title>;
