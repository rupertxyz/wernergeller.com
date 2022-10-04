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

export const Head = () => (
  <>
    <title>Collection Werner Geller</title>
    <meta
      name="description"
      content="Eine Website mit allen Bildern von Werner Geller (1928 - 2017)"
    ></meta>
  </>
);
